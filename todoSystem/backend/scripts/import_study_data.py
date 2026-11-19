"""导入英语四级学习计划课程数据。

从 doc/半年英语四级学习计划.html 中解析 DATA / FILMS 常量，
写入 study_units / study_days / study_words / study_films 四张表。
脚本可重复执行（先清空这四张表再写入），不会碰用户进度数据。

用法：
    python3 scripts/import_study_data.py
"""

import json
import os
import re
import sys

import pymysql

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_PATH = os.path.join(BASE_DIR, "..", "doc", "半年英语四级学习计划.html")
ENV_PATH = os.path.join(BASE_DIR, ".env.dev")


def load_env(path):
    config = {}
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                config[key] = value
    return config


def parse_source():
    with open(HTML_PATH, encoding="utf-8") as f:
        html = f.read()
    # 源数据是 JS 对象字面量（键无引号），不是合法 JSON，用 eval 解析本地可信文件
    units = eval(re.search(r"const DATA = (\[.*?\]);\s*\n\s*const FILMS", html, re.S).group(1))
    films = eval(re.search(r"const FILMS = (\[.*?\]);\s*\n", html, re.S).group(1))
    return units, films


def main():
    units, films = parse_source()
    env = load_env(ENV_PATH)
    conn = pymysql.connect(
        host=env["DB_HOST"],
        port=int(env["DB_PORT"]),
        user=env["DB_USER"],
        password=env["DB_PASSWORD"],
        database=env["DB_NAME"],
        charset="utf8mb4",
        autocommit=True,
    )
    cur = conn.cursor()

    # 只清空课程数据表，保留 study_progress（用户进度）
    for table in ("study_words", "study_days", "study_films", "study_units"):
        cur.execute(f"DELETE FROM `{table}`")

    day_rows = []
    word_rows = []
    for unit in units:
        cur.execute(
            "INSERT INTO study_units (id, name, en, theme, intro, introZh, outro, outroZh) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
            (
                unit["m"], unit["name"], unit["en"], unit["theme"],
                unit["intro"], unit["introZh"], unit["outro"], unit["outroZh"],
            ),
        )
        unit_id = unit["m"]
        for da in unit["days"]:
            global_day = (unit_id - 1) * 10 + da["d"]
            day_rows.append((unit_id, da["d"], global_day, da["theme"]))
        # 先插入天，拿到自增 id 后再批量插词
    cur.executemany(
        "INSERT INTO study_days (unitId, dayNo, globalDay, theme) VALUES (%s,%s,%s,%s)",
        day_rows,
    )
    cur.execute("SELECT id, globalDay FROM study_days")
    day_id_map = {g: i for i, g in cur.fetchall()}

    for unit in units:
        unit_id = unit["m"]
        for da in unit["days"]:
            global_day = (unit_id - 1) * 10 + da["d"]
            day_id = day_id_map[global_day]
            for seq, w in enumerate(da["words"], start=1):
                word_rows.append((day_id, seq, w[0], w[1], w[2], w[3], w[4]))
    cur.executemany(
        "INSERT INTO study_words (dayId, seq, word, pos, meaning, exampleEn, exampleZh) "
        "VALUES (%s,%s,%s,%s,%s,%s,%s)",
        word_rows,
    )

    for order, f in enumerate(films, start=1):
        cur.execute(
            "INSERT INTO study_films "
            "(title, cn, year, genre, level, reason, synopsis, tips, quote, quoteZh, sortOrder) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
            (
                f["title"], f["cn"], f["year"], f["genre"], f["level"],
                f["reason"], f["synopsis"], f["tips"], f["quote"], f["quoteZh"], order,
            ),
        )

    print(f"导入完成：{len(units)} 单元 / {len(day_rows)} 天 / {len(word_rows)} 词 / {len(films)} 影视")
    conn.close()


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # noqa: BLE001
        print(f"导入失败：{exc}", file=sys.stderr)
        raise
