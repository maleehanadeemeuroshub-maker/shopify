import { supabase } from './supabaseClient.js';

// Thin client for the handful of backend endpoints that must run server-side
// (trusted order totals/stock, privileged admin/seller writes, outbound
// email). Every call is fire-and-forget-safe: it never throws, so a
// slow/broken endpoint can never block or fail the actual signup / login /
// cart / checkout action that triggered it.
async function request(method, path, body, extraHeaders) {
  try {
    const res = await fetch(path, {
      method,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...extraHeaders },
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

const postJSON = (path, body, extraHeaders) => request('POST', path, body, extraHeaders);
const putJSON = (path, body, extraHeaders) => request('PUT', path, body, extraHeaders);
const patchJSON = (path, body, extraHeaders) => request('PATCH', path, body, extraHeaders);
const deleteJSON = (path, extraHeaders) => request('DELETE', path, undefined, extraHeaders);
const getJSON = (path, extraHeaders) => request('GET', path, undefined, extraHeaders);

// Every /api/* route that needs to know who's calling reads this bearer
// token (verified server-side via supabaseAdmin().auth.getUser()) — there's
// no session cookie anymore, Supabase Auth owns the session.
async function authHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

// Guest orders have no account to list them under, so the one-time access
// token returned at checkout is stashed here (never in the URL) and replayed
// as a header to re-fetch that single order — e.g. on a confirmation-page
// refresh. Logged-in orders don't need this; the bearer token is enough.
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

// Signup/login/logout/session are handled directly by supabase-js in
// AuthContext — this only covers the one auth-adjacent action that still
// needs a trusted server route (role changes shouldn't be client-writable).
export const authApi = {
  becomeSeller: async () => postJSON('/api/auth/become-seller', undefined, await authHeaders()),
};

// Vercel's plain (non-Next.js) /api file routing only matches a fixed
// number of literal path segments per file, with no real catch-all — so
// products/orders/admin are each a single flat function (api/products.js,
// api/orders.js, api/admin.js) dispatching on the query string instead of
// nested path segments. Query strings never affect path routing, so this
// is what actually lets many logical endpoints share one function (staying
// under the Hobby plan's 12-function cap).
function withQuery(path, params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') qs.set(key, value);
  });
  const query = qs.toString();
  return query ? `${path}?${query}` : path;
}

export const productsApi = {
  list: () => getJSON('/api/products'),
  get: (id) => getJSON(withQuery('/api/products', { id })),
  mine: async () => getJSON(withQuery('/api/products', { resource: 'mine' }), await authHeaders()),
  create: async (payload) => postJSON('/api/products', payload, await authHeaders()),
  update: async (id, payload) => putJSON(withQuery('/api/products', { id }), payload, await authHeaders()),
  remove: async (id) => deleteJSON(withQuery('/api/products', { id }), await authHeaders()),
};

export const ordersApi = {
  create: async (payload) => postJSON('/api/orders', payload, await authHeaders()),
  list: async () => getJSON('/api/orders', await authHeaders()),
  forSeller: async () => getJSON(withQuery('/api/orders', { resource: 'for-seller' }), await authHeaders()),
  get: async (orderNumber) => {
    const token = getOrderAccessToken(orderNumber);
    const headers = { ...(await authHeaders()), ...(token ? { 'X-Order-Token': token } : {}) };
    return getJSON(withQuery('/api/orders', { orderNumber }), headers);
  },
  updateStatus: async (orderNumber, payload) =>
    patchJSON(withQuery('/api/orders', { orderNumber, action: 'status' }), payload, await authHeaders()),
};

export const adminApi = {
  stats: async () => getJSON(withQuery('/api/admin', { resource: 'stats' }), await authHeaders()),
  categories: async () => getJSON(withQuery('/api/admin', { resource: 'categories' }), await authHeaders()),
  users: async (params) => getJSON(withQuery('/api/admin', { resource: 'users', ...params }), await authHeaders()),
  setUserRole: async (id, role) =>
    patchJSON(withQuery('/api/admin', { resource: 'users', id, action: 'role' }), { role }, await authHeaders()),
  products: async (params) => getJSON(withQuery('/api/admin', { resource: 'products', ...params }), await authHeaders()),
  setProductActive: async (id, active) =>
    patchJSON(withQuery('/api/admin', { resource: 'products', id, action: 'active' }), { active }, await authHeaders()),
  orders: async (params) => getJSON(withQuery('/api/admin', { resource: 'orders', ...params }), await authHeaders()),
};
