import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import emailRoutes from './routes/emailRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8787;

const app = express();

// Same-origin in production (this server also serves the built frontend).
// In dev the Vite dev server proxies /api here, but allow direct localhost
// origins too so the API can be curled/tested on its own port.
app.use(
  cors({
    origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, emailConfigured: Boolean(process.env.RESEND_API_KEY) });
});

app.use('/api/email', emailRoutes);

// Serve the production frontend build, if it exists, so `node server/index.js`
// alone can run the whole app after `npm run build` — no separate static host
// needed, and no cross-origin requests to worry about.
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[server] Unhandled error:', err);
  res.status(500).json({ ok: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[server] API listening on http://localhost:${PORT}`);
  if (!process.env.RESEND_API_KEY) {
    console.warn('[server] RESEND_API_KEY is not set — emails will be logged, not actually sent. See .env.example.');
  }
  if (!fs.existsSync(distPath)) {
    console.log('[server] No dist/ build found yet — run `npm run build` to also serve the frontend from this server.');
  }
});
