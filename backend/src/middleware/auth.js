import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const token = req.cookies?.nightmare_session;
  if (!token) return res.status(401).json({ error: 'Not logged in' });

  try {
    jwt.verify(token, process.env.SESSION_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Session expired, log in again' });
  }
}
