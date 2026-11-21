# 实现细节参考

## 工作区与配置

- 工作区根目录：`/Users/wangying/Liy/cursor_ws/my-projects`
- 环境文件：`todoSystem/backend/.env.prd`，使用 `KEY=VALUE` 纯文本格式，脚本自行解析，不依赖 dotenv。
- 数据库键名：`DB_HOST`、`DB_PORT`、`DB_USER`、`DB_PASSWORD`、`DB_NAME`。
- 脚本从 `todoSystem/backend` 解析 `mysql2/promise`。当前该目录没有 `node_modules`，正式生成前需要在该目录执行 `npm install`（`package.json` 已声明 mysql2）。

## 数据库

- 表：`study_words`，字段 `id`、`dayId`、`seq`、`word`、`pos`、`meaning`、`exampleEn`、`exampleZh`。
- 新增字段：`audio LONGBLOB NULL AFTER exampleZh`，以 Buffer 形式直接写入，不使用 base64。
- `backend/src/app.module.ts` 开启了 `synchronize: true`；因此必须同步在 `study-word.entity.ts` 加上 `audio?: Buffer` 列定义，否则后端重启可能删掉该列。
- 查询时只 `SELECT id, word, exampleEn`，不要 `SELECT *`，避免把 BLOB 拉进内存。

## say 命令

- 语法：`say -v <voice> -r <rate> -o <file> --data-format=aac --bit-rate=<bitrate> <text>`
- 800ms 停顿通过文本内嵌命令 `[[slnc 800]]` 实现，完整文本为 `${word}[[slnc 800]]${exampleEn}`。
- 本机可用英文语音：`Samantha`、`Victoria`（美式女声），`Alex`、`Fred`（美式男声），`Daniel`（英式男声），`Fiona`（苏格兰女声），`Karen`（澳式女声），`Moira`（爱尔兰女声），`Rishi`（印度男声），`Veena`（印度女声），`Tessa`（南非女声）。
- 语速单位为词/分钟，默认 155；音色、语速、停顿、码率都从 `config.json` 读取，测试模式根据反馈修改该文件。

## 输出与日志

- 目录结构：`todoSystem/doc/audios/<id>_<word>/<id>_<word>.m4a` 与同目录下的 `write.log`。
- 测试音频放在 `todoSystem/doc/audios/_test/`，不写数据库。
- `write.log` 每行格式：`[ISO 时间戳] id=... word=... status=success|failed stage=say|db reason=... bytes=...`，追加写入，保留历次运行记录。
- 单词名中的非法文件名字符会被替换成下划线。
