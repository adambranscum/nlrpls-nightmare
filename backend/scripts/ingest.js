import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, initSchema } from '../src/lib/db.js';
import { embed } from '../src/lib/lmstudio.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIGS_DIR = path.join(__dirname, '../data/configs');

const CHUNK_SIZE = 1200;   // characters per chunk
const CHUNK_OVERLAP = 200;

function chunkText(text) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end));
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

async function ingestFile(filePath) {
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const chunks = chunkText(content);

  db.prepare(`DELETE FROM chunks WHERE source_file = ?`).run(fileName);

  const insert = db.prepare(`
    INSERT INTO chunks (source_file, chunk_index, content, embedding)
    VALUES (?, ?, ?, ?)
  `);

  for (let i = 0; i < chunks.length; i++) {
    const vec = await embed(chunks[i]);
    insert.run(fileName, i, chunks[i], JSON.stringify(vec));
  }

  console.log(`  ${fileName}: ${chunks.length} chunk(s)`);
}

async function main() {
  initSchema();

  if (!fs.existsSync(CONFIGS_DIR)) {
    console.error(`No configs directory at ${CONFIGS_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(CONFIGS_DIR)
    .filter((f) => !f.startsWith('.'));

  if (files.length === 0) {
    console.log(`No files found in ${CONFIGS_DIR}. Drop your config files there and re-run.`);
    return;
  }

  console.log(`Ingesting ${files.length} file(s) from ${CONFIGS_DIR}...`);
  for (const file of files) {
    await ingestFile(path.join(CONFIGS_DIR, file));
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
