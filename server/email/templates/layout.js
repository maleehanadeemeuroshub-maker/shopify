// Shared building blocks for every email template — email-safe HTML only:
// table-based layout, inline styles, no external stylesheets or webfonts.
// Keeps welcomeEmail.js / orderConfirmationEmail.js / etc. focused on content.

export const STORE_NAME = process.env.STORE_NAME || 'GENZ-WEARS';
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@genzwears.example';
export const SITE_URL = process.env.SITE_URL || 'http://localhost:5173';

const FONT = 'Helvetica, Arial, sans-serif';

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export function wrapEmail({ preheader = '', bodyHtml }) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="dark light" />
<meta name="supported-color-schemes" content="dark light" />
<title>${STORE_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#07090a;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#07090a;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#0f1512;border:1px solid #232823;border-radius:18px;">
<tr><td style="padding:28px 32px;text-align:center;border-bottom:1px solid #1c211e;">
<span style="font-family:${FONT};font-size:20px;font-weight:800;letter-spacing:1px;color:#f3f5f2;">${STORE_NAME}</span>
</td></tr>
<tr><td style="padding:36px 32px;">
${bodyHtml}
</td></tr>
<tr><td style="padding:24px 32px;border-top:1px solid #1c211e;text-align:center;">
<p style="margin:0 0 6px;font-family:${FONT};font-size:12px;color:#8b948d;">Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#95ff8a;text-decoration:none;">${SUPPORT_EMAIL}</a></p>
<p style="margin:0;font-family:${FONT};font-size:11px;color:#565f59;">&copy; ${year} ${STORE_NAME}. Practice storefront &mdash; this is a demo email.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function button(label, href) {
  return `<a href="${href}" target="_blank" style="display:inline-block;padding:14px 30px;background-color:#95ff8a;color:#0a0d0b;border-radius:999px;font-family:${FONT};font-size:14px;font-weight:700;text-decoration:none;">${escapeHtml(label)}</a>`;
}

export function ghostButton(label, href) {
  return `<a href="${href}" target="_blank" style="display:inline-block;padding:12.5px 26px;background-color:transparent;color:#f3f5f2;border:1.4px solid #3a423c;border-radius:999px;font-family:${FONT};font-size:14px;font-weight:700;text-decoration:none;">${escapeHtml(label)}</a>`;
}

export function heading(text) {
  return `<h1 style="margin:0 0 16px;font-family:${FONT};font-size:23px;font-weight:700;color:#f3f5f2;letter-spacing:-0.3px;">${escapeHtml(text)}</h1>`;
}

export function paragraph(text) {
  return `<p style="margin:0 0 20px;font-family:${FONT};font-size:14.5px;line-height:1.6;color:#c7cec9;">${text}</p>`;
}

export function smallLabel(text) {
  return `<p style="margin:0 0 10px;font-family:${FONT};font-size:11.5px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#7ee08a;">${escapeHtml(text)}</p>`;
}

export function divider() {
  return `<hr style="border:none;border-top:1px solid #1c211e;margin:24px 0;" />`;
}

export function infoCard(rows) {
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<div style="margin-bottom:8px;font-size:13px;"><strong style="color:#f3f5f2;">${escapeHtml(label)}:</strong> <span style="color:#c7cec9;">${escapeHtml(value)}</span></div>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#161b18;border:1px solid #232823;border-radius:12px;margin-bottom:22px;">
<tr><td style="padding:18px 20px;font-family:${FONT};">
${rowsHtml}
</td></tr>
</table>`;
}

export function productRow({ image, name, meta, price }) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
<tr>
<td width="60" style="padding-right:14px;vertical-align:top;">
<img src="${image || ''}" width="60" height="72" alt="${escapeHtml(name)}" style="border-radius:8px;display:block;object-fit:cover;background-color:#161b18;" />
</td>
<td style="font-family:${FONT};vertical-align:top;">
<div style="font-size:14px;font-weight:700;color:#f3f5f2;">${escapeHtml(name)}</div>
${meta ? `<div style="font-size:12px;color:#9aa39c;margin-top:3px;">${escapeHtml(meta)}</div>` : ''}
</td>
<td align="right" style="font-family:${FONT};font-size:14px;font-weight:700;color:#f3f5f2;white-space:nowrap;vertical-align:top;">${escapeHtml(price)}</td>
</tr>
</table>`;
}

export function totalsTable(rows) {
  const line = ([label, value, emphasize]) => `
<tr>
<td style="padding:5px 0;font-family:${FONT};font-size:${emphasize ? '15px' : '13.5px'};font-weight:${emphasize ? '700' : '400'};color:${emphasize ? '#f3f5f2' : '#9aa39c'};">${escapeHtml(label)}</td>
<td align="right" style="padding:5px 0;font-family:${FONT};font-size:${emphasize ? '16px' : '13.5px'};font-weight:${emphasize ? '700' : '400'};color:${emphasize ? '#f3f5f2' : '#c7cec9'};">${escapeHtml(value)}</td>
</tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
${rows.map(line).join('')}
</table>`;
}

export function statusBadge(label, color = '#95ff8a') {
  return `<span style="display:inline-block;padding:5px 12px;border-radius:999px;background-color:${color}1a;border:1px solid ${color}55;color:${color};font-family:${FONT};font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">${escapeHtml(label)}</span>`;
}

export function formatCurrency(n) {
  const num = typeof n === 'number' ? n : Number(n) || 0;
  return `$${num.toFixed(2)}`;
}
