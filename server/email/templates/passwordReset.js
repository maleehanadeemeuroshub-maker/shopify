import { wrapEmail, button, heading, paragraph, escapeHtml, STORE_NAME, SUPPORT_EMAIL } from './layout.js';

export function passwordResetEmail({ name, resetUrl }) {
  const subject = `Reset your ${STORE_NAME} password`;

  const bodyHtml = `
${heading(`Hi ${escapeHtml(name)},`)}
${paragraph('We received a request to reset your password. This link expires in 1 hour and can only be used once.')}
<div style="text-align:center;margin:30px 0 6px;">
${button('Reset Password', resetUrl)}
</div>
${paragraph("If you didn't request this, you can safely ignore this email — your password won't be changed.")}
<p style="margin:26px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:12.5px;color:#7a847d;text-align:center;">Need a hand? Reach us anytime at ${SUPPORT_EMAIL}</p>
`;

  return {
    subject,
    html: wrapEmail({ preheader: `Reset your ${STORE_NAME} password — link expires in 1 hour.`, bodyHtml }),
  };
}
