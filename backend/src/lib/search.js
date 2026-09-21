import { db } from './db.js';
import { embed } from './lmstudio.js';

function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

// Returns top-K most relevant chunks for a question.
// TODO: swap this for sqlite-vec once it's installed — this brute-forces
// cosine similarity in JS, fine for a few thousand chunks, not beyond that.
export async function retrieveContext(question, topK = 5) {
  const queryVec = await embed(question);

  const rows = db.prepare(`SELECT id, source_file, chunk_index, content, embedding FROM chunks`).all();

  const scored = rows
    .filter((r) => r.embedding)
    .map((r) => ({
      ...r,
      score: cosineSim(queryVec, JSON.parse(r.embedding)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
}
