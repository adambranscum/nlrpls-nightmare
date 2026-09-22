const SEARXNG_URL = process.env.SEARXNG_URL || 'http://localhost:8888';

// Returns a short list of { title, url, snippet } for the model to reference.
export async function webSearch(query) {
  const res = await fetch(
    `${SEARXNG_URL}/search?q=${encodeURIComponent(query)}&format=json`
  );

  if (!res.ok) {
    return { error: `Search failed (${res.status})` };
  }

  const data = await res.json();

  const results = (data.results || []).slice(0, 5).map((r) => ({
    title: stripHtml(r.title),
    url: r.url,
    snippet: stripHtml(r.content || '').slice(0, 400),
  }));

  return { results };
}

function stripHtml(str = '') {
  return str.replace(/<[^>]*>/g, '');
}
