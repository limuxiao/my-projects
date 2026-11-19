"""从数据库导出学习计划课程数据为 seed SQL（供 Docker 部署时 MySQL 初始化用）。

只导出课程表（units/days/words/films），不含用户进度。
生成的 SQL 会写入 doc/seed-data.sql，可被 MySQL 容器的 /docker-entrypoint-initdb.d 自动执行。

用法：
    python3 scripts/export_study_seed.py
"""

import os

import pymysql

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, ".env.dev")
OUT_PATH = os.path.join(BASE_DIR, "..", "doc", "seed-data.sql")

# 要导出的表和列（顺序即插入顺序，保证外键无关表也能自洽）
TABLES = {
    "study_units": ["id", "name", "en", "theme", "intro", "introZh", "outro", "outroZh"],
    "study_days": ["id", "unitId", "dayNo", "globalDay", "theme"],
    "study_words": ["id", "dayId", "seq", "word", "pos", "meaning", "exampleEn", "exampleZh"],
    "study_films": ["id", "title", "cn", "year", "genre", "level", "reason", "synopsis", "tips", "quote", "quoteZh", "sortOrder"],
}


def esc(value):
    if value is None:
        return "NULL"
    return "'" + pymysql.converters.escape_string(str(value)) + "'"


def main():
    env = {}
    with open(ENV_PATH, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k] = v

    conn = pymysql.connect(
        host=env["DB_HOST"], port=int(env["DB_PORT"]),
        user=env["DB_USER"], password=env["DB_PASSWORD"],
        database=env["DB_NAME"], charset="utf8mb4",
    )
    cur = conn.cursor()

    lines = [
        "-- TodoSystem 学习计划课程数据种子",
        "-- 由 scripts/export_study_seed.py 从数据库导出，部署时由 MySQL 容器自动执行",
        "SET NAMES utf8mb4;",
        "",
    ]
    for table, cols in TABLES.items():
        cur.execute(f"SELECT {', '.join(cols)} FROM `{table}`")
        rows = cur.fetchall()
        lines.append(f"-- {table}: {len(rows)} rows")
        lines.append(f"INSERT INTO `{table}` ({', '.join(cols)}) VALUES")
        values = ",\n".join("(" + ", ".join(esc(v) for v in row) + ")" for row in rows)
        lines.append(values + ";")
        lines.append("")

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"导出完成：{OUT_PATH}")
    conn.close()


if __name__ == "__main__":
    main()
