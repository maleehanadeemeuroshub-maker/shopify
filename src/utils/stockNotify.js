const STORAGE_KEY = 'genzwears_stock_notify';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function isSubscribed(productId, email) {
  const all = readAll();
  return (all[productId] ?? []).includes(email.trim().toLowerCase());
}

export function subscribeToRestock(productId, email) {
  const all = readAll();
  const list = all[productId] ?? [];
  const normalized = email.trim().toLowerCase();
  if (!list.includes(normalized)) {
    all[productId] = [...list, normalized];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
}
