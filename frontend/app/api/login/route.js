const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function POST(req) {
  const body = await req.json();

  const backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const setCookie = backendRes.headers.get('set-cookie');
  const data = await backendRes.json();

  const res = new Response(JSON.stringify(data), {
    status: backendRes.status,
    headers: { 'Content-Type': 'application/json' },
  });

  if (setCookie) res.headers.set('set-cookie', setCookie);
  return res;
}
