const STORAGE_KEY = 'genzwears_recently_viewed';
const MAX_STORED = 12;

function readIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

export function recordView(productId) {
  const ids = readIds().filter((id) => id !== productId);
  ids.unshift(productId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_STORED)));
}

export function getRecentlyViewedIds(excludeId) {
  return readIds().filter((id) => id !== excludeId);
}
