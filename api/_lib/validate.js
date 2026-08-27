export function missingFields(body, fields) {
  return fields.filter((f) => body?.[f] === undefined || body?.[f] === null || body?.[f] === '');
}

// Writes a 400 and returns false if any field is missing; otherwise true.
export function requireFields(req, res, fields) {
  const missing = missingFields(req.body, fields);
  if (missing.length) {
    res.status(400).json({ ok: false, error: `Missing required field(s): ${missing.join(', ')}` });
    return false;
  }
  return true;
}

export function methodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed.join(', '));
  res.status(405).json({ ok: false, error: 'Method not allowed.' });
}
