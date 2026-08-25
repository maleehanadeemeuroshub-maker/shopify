// Thin client for the backend API. Every call is fire-and-forget-safe:
// it never throws, so a slow/broken endpoint can never block or fail the
// actual signup / login / cart / checkout action that triggered it.
// `credentials: 'include'` is required so the httpOnly session cookie set by
// /api/auth/* is sent on every request and stored from every response.
async function request(method, path, body, extraHeaders) {
  try {
    const res = await fetch(path, {
      method,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...extraHeaders },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
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

const postJSON = (path, body) => request('POST', path, body);
const putJSON = (path, body) => request('PUT', path, body);
const patchJSON = (path, body) => request('PATCH', path, body);
const deleteJSON = (path) => request('DELETE', path);
const getJSON = (path, extraHeaders) => request('GET', path, undefined, extraHeaders);

// Guest orders have no account to list them under, so the one-time access
// token returned at checkout is stashed here (never in the URL) and replayed
// as a header to re-fetch that single order — e.g. on a confirmation-page
// refresh. Logged-in orders don't need this; the session cookie is enough.
const orderTokenKey = (orderNumber) => `gz_order_token_${orderNumber}`;
export function saveOrderAccessToken(orderNumber, token) {
  try {
    sessionStorage.setItem(orderTokenKey(orderNumber), token);
  } catch {
    /* sessionStorage unavailable — guest refresh just won't recover the order */
  }
}
function getOrderAccessToken(orderNumber) {
  try {
    return sessionStorage.getItem(orderTokenKey(orderNumber));
  } catch {
    return null;
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

export const authApi = {
  signup: (payload) => postJSON('/api/auth/signup', payload),
  login: (payload) => postJSON('/api/auth/login', payload),
  logout: () => postJSON('/api/auth/logout'),
  me: () => getJSON('/api/auth/me'),
  forgotPassword: (payload) => postJSON('/api/auth/forgot-password', payload),
  resetPassword: (payload) => postJSON('/api/auth/reset-password', payload),
  becomeSeller: () => postJSON('/api/auth/become-seller'),
};

export const productsApi = {
  list: () => getJSON('/api/products'),
  get: (id) => getJSON(`/api/products/${encodeURIComponent(id)}`),
  mine: () => getJSON('/api/products/mine'),
  create: (payload) => postJSON('/api/products', payload),
  update: (id, payload) => putJSON(`/api/products/${encodeURIComponent(id)}`, payload),
  remove: (id) => deleteJSON(`/api/products/${encodeURIComponent(id)}`),
};

export const ordersApi = {
  create: (payload) => postJSON('/api/orders', payload),
  list: () => getJSON('/api/orders'),
  forSeller: () => getJSON('/api/orders/for-seller'),
  get: (orderNumber) => {
    const token = getOrderAccessToken(orderNumber);
    return getJSON(`/api/orders/${encodeURIComponent(orderNumber)}`, token ? { 'X-Order-Token': token } : undefined);
  },
  updateStatus: (orderNumber, payload) => patchJSON(`/api/orders/${encodeURIComponent(orderNumber)}/status`, payload),
};

function withQuery(path, params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') qs.set(key, value);
  });
  const query = qs.toString();
  return query ? `${path}?${query}` : path;
}

export const adminApi = {
  stats: () => getJSON('/api/admin/stats'),
  categories: () => getJSON('/api/admin/categories'),
  users: (params) => getJSON(withQuery('/api/admin/users', params)),
  setUserRole: (id, role) => patchJSON(`/api/admin/users/${id}/role`, { role }),
  products: (params) => getJSON(withQuery('/api/admin/products', params)),
  setProductActive: (id, active) => patchJSON(`/api/admin/products/${encodeURIComponent(id)}/active`, { active }),
  orders: (params) => getJSON(withQuery('/api/admin/orders', params)),
};
