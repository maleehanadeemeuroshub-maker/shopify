export default function handler(req, res) {
  res.json({ ok: true, emailConfigured: Boolean(process.env.RESEND_API_KEY) });
}
