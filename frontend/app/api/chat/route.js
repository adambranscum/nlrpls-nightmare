const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function POST(req) {
  const body = await req.json();
  const cookie = req.headers.get('cookie') || '';

  const backendRes = await fetch(`${BACKEND_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie,
    },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();

  return new Response(JSON.stringify(data), {
    status: backendRes.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
