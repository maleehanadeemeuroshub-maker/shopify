import { wrapEmail, button, heading, paragraph, escapeHtml, STORE_NAME, SITE_URL, SUPPORT_EMAIL } from './layout.js';

export function welcomeEmail({ name }) {
  const subject = `Welcome to ${STORE_NAME} 🎉`;

  const bodyHtml = `
${heading(`Hi ${escapeHtml(name)},`)}
${paragraph(`Welcome to <strong style="color:#f3f5f2;">${STORE_NAME}</strong>! Your account has been successfully created.`)}
${paragraph('You can now explore our latest collections, save products to your wishlist, and place orders — all from one account.')}
<div style="text-align:center;margin:30px 0 6px;">
${button('Start Shopping', `${SITE_URL}/shop`)}
</div>
<p style="margin:26px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:12.5px;color:#7a847d;text-align:center;">Need a hand? Reach us anytime at ${SUPPORT_EMAIL}</p>
`;

  return {
    subject,
    html: wrapEmail({ preheader: `Your ${STORE_NAME} account is ready — start exploring.`, bodyHtml }),
  };
}
