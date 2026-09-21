import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

// POST /api/auth/login  { password }
router.post('/login', (req, res) => {
  const { password } = req.body || {};

  if (!password || password !== process.env.SITE_PASSWORD) {
    return res.status(401).json({ error: 'Wrong password' });
  }

  const token = jwt.sign({ ok: true }, process.env.SESSION_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('nightmare_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    // secure: true, // enable once served over HTTPS
  });

  res.json({ ok: true });
});

router.post('/logout', (req, res) => {
  res.clearCookie('nightmare_session');
  res.json({ ok: true });
});

export default router;
