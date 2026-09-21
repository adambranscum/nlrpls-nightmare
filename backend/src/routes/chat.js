import { Router } from 'express';
import { retrieveContext } from '../lib/search.js';
import { askModel } from '../lib/lmstudio.js';

const router = Router();

const SYSTEM_PROMPT = `You are the IT reference assistant for NLRPLS (North Little Rock Public Library System).
Answer using ONLY the provided config/reference excerpts when they're relevant.
If the excerpts don't cover the question, say so plainly instead of guessing.
Keep answers short and direct — this is for IT staff, not end users.`;

// POST /api/chat  { question }
router.post('/', async (req, res) => {
  const { question } = req.body || {};
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'question is required' });
  }

  try {
    const contextChunks = await retrieveContext(question);

    const contextBlock = contextChunks
      .map((c, i) => `[${i + 1}] (${c.source_file}) ${c.content}`)
      .join('\n\n');

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Reference excerpts:\n${contextBlock || '(none found)'}\n\nQuestion: ${question}`,
      },
    ];

    const answer = await askModel(messages);

    res.json({
      answer,
      sources: contextChunks.map((c) => ({
        file: c.source_file,
        chunk: c.chunk_index,
        score: Number(c.score.toFixed(3)),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong answering that.' });
  }
});

export default router;
