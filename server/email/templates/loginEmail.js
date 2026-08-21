import { wrapEmail, heading, paragraph, divider, infoCard, escapeHtml, STORE_NAME } from './layout.js';

export function loginEmail({ name, userAgent, timestamp }) {
  const subject = 'New Login to Your Account';
  const when = new Date(timestamp ?? Date.now());
  const dateStr = when.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = when.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const rows = [
    ['Date', dateStr],
    ['Time', timeStr],
    ['Device', userAgent ? summarizeUserAgent(userAgent) : 'Not available'],
  ];

  const bodyHtml = `
${heading(`Hi ${escapeHtml(name)},`)}
${paragraph('You successfully logged into your account.')}
${infoCard(rows)}
${divider()}
${paragraph("If this wasn't you, please secure your account immediately by changing your password.")}
`;

  return {
    subject,
    html: wrapEmail({ preheader: `New login to your ${STORE_NAME} account on ${dateStr}.`, bodyHtml }),
  };
}

// Reduce a raw User-Agent string to something a customer can actually read,
// without shipping the full UA string (which can look alarming/unfamiliar).
function summarizeUserAgent(ua) {
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /Chrome\//.test(ua)
      ? 'Chrome'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Safari\//.test(ua) && !/Chrome/.test(ua)
          ? 'Safari'
          : 'a browser';

  // iPhone/iPad and Android must be checked before the generic "Mac OS X" /
  // "Linux" tests — mobile UA strings embed those as compatibility tokens
  // (e.g. iOS Safari's UA always contains "like Mac OS X"), so checking OS
  // in the wrong order would misreport every iPhone/iPad as a Mac.
  const os = /iPhone|iPad/.test(ua)
    ? 'iOS'
    : /Android/.test(ua)
      ? 'Android'
      : /Windows/.test(ua)
        ? 'Windows'
        : /Mac OS X/.test(ua)
          ? 'macOS'
          : /Linux/.test(ua)
            ? 'Linux'
            : 'an unknown device';

  return `${browser} on ${os}`;
}
