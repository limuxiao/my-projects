---
name: study-word-audio
description: 为 todoSystem 背单词项目生成试听音频。当用户说“测试试听”时，使用 macOS say 生成一段测试音频供试听，并根据反馈调整音色、语速与停顿；当用户说“开始生成”时，从后端数据库 study_words 读取单词和例句，批量生成音频到 todoSystem/doc/audios，并将音频二进制写入 study_words.audio 列、在每个单词目录写入数据库写入结果日志。仅在上述明确触发语下执行。
---

# 背单词试听音频生成

## 概览

该 skill 用 macOS 内置 `say` 把 `study_words` 表中的单词和例句读成音频：中间插入 800ms 停顿，音频以 AAC/m4a 二进制存入数据库的 `audio` 列，同时在 `todoSystem/doc/audios/<id>_<word>/` 留一份声音文件和写入日志。

## 触发规则（必须先判断）

- 仅当用户说“测试试听”时进入测试模式。
- 仅当用户说“开始生成”时进入正式生成模式。
- 不得因为上下文推断、建议或询问而提前执行正式生成；用户未说“开始生成”前，禁止运行带 `--confirmed` 的脚本，禁止连接数据库、禁止写入 BLOB。
- 测试模式与正式模式共用 `config.json` 中的音色、语速、停顿、码率参数。

## 测试模式（“测试试听”）

1. 读取 `config.json` 当前参数。
2. 运行 `node scripts/generate_audio.js test`。
3. 将脚本输出的 `TEST_AUDIO` 绝对路径告知用户，请用户试听。
4. 根据用户反馈修改 `config.json`：
   - `voice`：音色，如 `Samantha`（美式女声）、`Alex`（美式男声）、`Daniel`（英式男声）、`Victoria`（美式女声）。
   - `rate`：语速，词/分钟，学习材料建议 140–160。
   - `pauseMs`：单词与例句之间的停顿毫秒数，默认 800。
   - `bitrate`：AAC 码率，默认 64000。
5. 重复第 2–4 步，直到用户说“开始生成”。测试模式绝不写数据库。

## 正式生成模式（“开始生成”）

1. 检查依赖：脚本需要 `mysql2`，从 `todoSystem/backend` 解析。若缺失，先在 `todoSystem/backend` 执行 `npm install`（需要用户批准）。
2. 运行 `node scripts/generate_audio.js all --confirmed`，不得省略 `--confirmed`。
3. 脚本自动完成：
   - 从 `todoSystem/backend/.env.prd` 读取 `DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASSWORD`、`DB_NAME`。
   - 若 `study_words.audio` 列不存在，自动 `ALTER TABLE ... ADD COLUMN audio LONGBLOB NULL AFTER exampleZh`。
   - 若 `study-word.entity.ts` 缺少 `audio` 字段，自动补上，避免后端 `synchronize: true` 把该列删掉。
   - 按 id 顺序遍历所有行，逐条用 `say` 读出 `${word}[[slnc ${pauseMs}]]${exampleEn}`。
   - 生成的声音文件放到 `todoSystem/doc/audios/<id>_<word>/<id>_<word>.m4a`。
   - 把文件字节流写入 `study_words.audio`。
   - 在每个单词目录的 `write.log` 追加时间戳、阶段与成功/失败结果。
4. 向用户汇总总数、成功数、失败数；若有失败，列出失败单词。

## 资源

- `config.json`：可调整的语音参数与路径配置。
- `scripts/generate_audio.js`：测试与批量生成的全部逻辑，直接执行即可。
- `references/details.md`：环境变量键名、表结构、`say` 参数、目录与日志格式等细节，需要排查问题时再读取。
