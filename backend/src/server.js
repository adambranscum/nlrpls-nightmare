import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import healthRoutes from './routes/health.js';
import { requireAuth } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
    credentials: true,
  })
);

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', requireAuth, chatRoutes);

app.listen(PORT, () => {
  console.log(`nlrpls-nightmare backend listening on :${PORT}`);
});
