// Deterministic, believable-looking "activity" numbers — stable within a
// given day per product (no backend/analytics exist to back real numbers).

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getViewerCount(productId) {
  return 4 + (hashString(`viewers_${productId}_${dayKey()}`) % 24);
}

export function getSoldTodayCount(productId) {
  return 6 + (hashString(`sold_${productId}_${dayKey()}`) % 34);
}
