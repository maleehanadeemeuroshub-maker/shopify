export const PAGE_SIZE = 15;

export function pageParams(req) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  return { page, from: (page - 1) * PAGE_SIZE, to: page * PAGE_SIZE - 1 };
}

// Escapes characters that are meaningful in PostgREST's ilike/or() filter
// syntax, so free-text search input can't corrupt or bypass the filter.
export function sanitizeLike(term) {
  return term.replace(/[\\%_,()]/g, '\\$&');
}
