const BASE_URL = process.env.LMSTUDIO_URL || 'http://localhost:1234/v1';
const CHAT_MODEL = process.env.LMSTUDIO_MODEL || 'qwen3-30b-a3b';
const EMBED_MODEL = process.env.LMSTUDIO_EMBED_MODEL || CHAT_MODEL;

// Chat completion against LM Studio's OpenAI-compatible endpoint.
// Pass `tools` (OpenAI tool-schema array) to enable tool calling.
// Returns the full message object (may include tool_calls) instead of just text,
// since callers need to check for tool_calls before treating it as a final answer.
export async function askModel(messages, tools = null) {
  const body = {
    model: CHAT_MODEL,
    messages,
    temperature: 0.2,
    stream: false,
  };
  if (tools) body.tools = tools;

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`LM Studio error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message ?? { content: '' };
}

// Embeddings against LM Studio's OpenAI-compatible embeddings endpoint.
// Uses LMSTUDIO_EMBED_MODEL if set, otherwise falls back to the chat model.
export async function embed(text) {
  const res = await fetch(`${BASE_URL}/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBED_MODEL, input: text }),
  });

  if (!res.ok) {
    throw new Error(`LM Studio embeddings error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.data?.[0]?.embedding ?? [];
}
