// Thin client for the backend email API. Every call is fire-and-forget-safe:
// it never throws, so a slow/broken email endpoint can never block or fail
// the actual signup / login / cart / checkout action that triggered it.
async function postJSON(path, body) {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error(`[api] ${path} responded ${res.status}:`, data.error || res.statusText);
      return { ok: false, error: data.error || res.statusText };
    }
    return data;
  } catch (err) {
    console.error(`[api] ${path} failed:`, err.message);
    return { ok: false, error: err.message };
  }
}

export const emailApi = {
  welcome: (payload) => postJSON('/api/email/welcome', payload),
  login: (payload) => postJSON('/api/email/login', payload),
  cart: (payload) => postJSON('/api/email/cart', payload),
  order: (payload) => postJSON('/api/email/order', payload),
  orderStatus: (payload) => postJSON('/api/email/order-status', payload),
  abandonedCart: (payload) => postJSON('/api/email/abandoned-cart', payload),
};
