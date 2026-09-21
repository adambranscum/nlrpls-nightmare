const BASE_URL = process.env.LMSTUDIO_URL || 'http://localhost:1234/v1';
const MODEL = process.env.LMSTUDIO_MODEL || 'qwen3-30b-a3b';

// Chat completion against LM Studio's OpenAI-compatible endpoint.
export async function askModel(messages) {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.2,
      stream: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`LM Studio error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// Embeddings against LM Studio's OpenAI-compatible embeddings endpoint.
export async function embed(text) {
  const res = await fetch(`${BASE_URL}/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, input: text }),
  });

  if (!res.ok) {
    throw new Error(`LM Studio embeddings error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.data?.[0]?.embedding ?? [];
}
