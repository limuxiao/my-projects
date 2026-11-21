#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SKILL_DIR = path.resolve(__dirname, '..');
const WORKSPACE = path.resolve(SKILL_DIR, '../../..');
const cfg = JSON.parse(fs.readFileSync(path.join(SKILL_DIR, 'config.json'), 'utf8'));

function workspacePath(p) {
  return path.isAbsolute(p) ? p : path.resolve(WORKSPACE, p);
}

function loadEnv(file) {
  const result = {};
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function assertIdentifier(value) {
  if (!/^[A-Za-z0-9_]+$/.test(value)) throw new Error(`非法标识符: ${value}`);
}

function sayToFile(text, outFile) {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const args = [
    '-v', cfg.voice,
    '-r', String(cfg.rate),
    '-o', outFile,
    '--data-format=aac',
    `--bit-rate=${cfg.bitrate}`,
    text,
  ];
  const result = spawnSync('say', args, { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`say 失败 (${result.status}): ${(result.stderr || '').trim()}`);
  if (!fs.existsSync(outFile) || fs.statSync(outFile).size === 0) throw new Error('say 未生成有效音频文件');
}

function runTest() {
  const outDir = workspacePath(path.join(cfg.outputDir, '_test'));
  const outFile = path.join(outDir, `test_${cfg.voice}_${cfg.rate}.m4a`);
  const text = `${cfg.testWord}[[slnc ${cfg.pauseMs}]]${cfg.testExample}`;
  sayToFile(text, outFile);
  console.log(`TEST_AUDIO=${outFile}`);
  console.log(`voice=${cfg.voice} rate=${cfg.rate} pauseMs=${cfg.pauseMs} bitrate=${cfg.bitrate}`);
  console.log('测试模式：未连接数据库，未写入 BLOB。');
}

function safeName(name) {
  return String(name).replace(/[^\w\u4e00-\u9fa5.-]+/g, '_').replace(/^_+|_+$/g, '');
}

async function ensureAudioColumn(conn, database) {
  assertIdentifier(cfg.table);
  assertIdentifier(cfg.audioColumn);
  const [rows] = await conn.execute(
    'SELECT COUNT(*) AS n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [database, cfg.table, cfg.audioColumn],
  );
  if (Number(rows[0].n) === 0) {
    await conn.execute(
      `ALTER TABLE \`${cfg.table}\` ADD COLUMN \`${cfg.audioColumn}\` LONGBLOB NULL AFTER \`exampleZh\``,
    );
    console.log(`已新增列 ${cfg.table}.${cfg.audioColumn} LONGBLOB`);
  }
}

function ensureEntityColumn() {
  const entityFile = path.join(workspacePath(cfg.backendDir), 'src/study/entities/study-word.entity.ts');
  if (!fs.existsSync(entityFile)) return;
  const source = fs.readFileSync(entityFile, 'utf8');
  if (/audio\s*\??\s*:/.test(source)) return;
  const close = source.lastIndexOf('}');
  if (close < 0) return;
  const addition = `\n  @Column({ type: 'longblob', nullable: true })\n  audio?: Buffer;\n`;
  fs.writeFileSync(entityFile, source.slice(0, close) + addition + source.slice(close));
  console.log('已在 study-word.entity.ts 中补上 audio 字段');
}

async function runAll() {
  if (!process.argv.includes('--confirmed')) {
    console.error('正式生成必须显式传入 --confirmed；仅当用户说“开始生成”时才可运行。');
    process.exit(2);
  }

  let mysql;
  try {
    mysql = require(require.resolve('mysql2/promise', { paths: [workspacePath(cfg.backendDir)] }));
  } catch (error) {
    console.error('缺少 mysql2 依赖。请在 todoSystem/backend 目录运行 npm install 后重试。');
    process.exit(2);
  }

  const env = loadEnv(workspacePath(cfg.envFile));
  for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']) {
    if (!env[key]) throw new Error(`${cfg.envFile} 缺少 ${key}`);
  }

  const conn = await mysql.createConnection({
    host: env.DB_HOST,
    port: Number(env.DB_PORT || 3306),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  });

  let success = 0;
  let failed = 0;
  try {
    await ensureAudioColumn(conn, env.DB_NAME);
    ensureEntityColumn();

    const [words] = await conn.execute(
      `SELECT id, word, exampleEn FROM \`${cfg.table}\` ORDER BY id`,
    );
    const outputRoot = workspacePath(cfg.outputDir);

    for (const row of words) {
      const folder = `${row.id}_${safeName(row.word)}`;
      const dir = path.join(outputRoot, folder);
      fs.mkdirSync(dir, { recursive: true });
      const audioFile = path.join(dir, `${folder}.m4a`);
      const logFile = path.join(dir, 'write.log');
      const log = (message) => {
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${message}\n`);
      };
      let stage = 'say';
      try {
        const text = `${row.word}[[slnc ${cfg.pauseMs}]]${row.exampleEn || ''}`;
        sayToFile(text, audioFile);
        stage = 'db';
        const buffer = fs.readFileSync(audioFile);
        await conn.execute(
          `UPDATE \`${cfg.table}\` SET \`${cfg.audioColumn}\` = ? WHERE id = ?`,
          [buffer, row.id],
        );
        log(`id=${row.id} word=${row.word} status=success stage=db audio=${path.basename(audioFile)} bytes=${buffer.length}`);
        success += 1;
      } catch (error) {
        const reason = String((error && error.message) || error).replace(/[\r\n]+/g, ' ');
        log(`id=${row.id} word=${row.word} status=failed stage=${stage} reason=${reason}`);
        failed += 1;
      }
    }
  } finally {
    await conn.end();
  }

  console.log(`TOTAL=${success + failed} SUCCESS=${success} FAILED=${failed}`);
  if (failed > 0) process.exitCode = 1;
}

async function main() {
  const mode = process.argv[2];
  if (mode === 'test') {
    runTest();
  } else if (mode === 'all') {
    await runAll();
  } else {
    console.error('用法: node generate_audio.js test | node generate_audio.js all --confirmed');
    process.exit(2);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
