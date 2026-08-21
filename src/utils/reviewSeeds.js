// Deterministic demo review generator — every product gets the same seeded
// set of reviews on every load (no backend), derived from its id so ratings
// stay consistent with the product's existing rating/reviews count.

const NAMES = [
  'Jordan M.', 'Alex K.', 'Sam R.', 'Taylor B.', 'Morgan L.', 'Casey P.',
  'Riley S.', 'Jamie T.', 'Avery D.', 'Quinn W.', 'Reese C.', 'Dakota H.',
];

const TEMPLATES = {
  5: [
    { title: 'Exceeded expectations', body: 'The fit is perfect and the fabric feels way more premium than the price suggests. Already ordered a second color.' },
    { title: 'Instant favorite', body: 'This is on constant rotation now. Held up great after a few washes and the stitching still looks new.' },
    { title: 'Exactly as pictured', body: "True to size, great material, fast shipping. Honestly can't ask for more from an online order." },
  ],
  4: [
    { title: 'Really solid piece', body: "Great quality overall — only reason it's not 5 stars is the color runs slightly darker than the photos." },
    { title: 'Good buy', body: 'Comfortable and well made. Sizing runs a touch big so consider sizing down if you like a slimmer fit.' },
  ],
  3: [
    { title: 'Decent, not amazing', body: "It's fine for the price. Fabric is a little thinner than I expected but it wears okay." },
  ],
};

function seededRandom(seed) {
  let t = seed;
  return function next() {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}

function shuffled(arr, rng) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getSeedReviews(product) {
  const rng = seededRandom(hashString(String(product.id)));
  const total = product.reviews ?? 0;
  const count = Math.min(6, Math.max(2, Math.round(total / 35)));
  const names = shuffled(NAMES, rng).slice(0, count);

  return names.map((name, i) => {
    const wobble = (rng() - 0.5) * 1.2;
    const rating = Math.max(3, Math.min(5, Math.round(product.rating + wobble)));
    const pool = TEMPLATES[rating] ?? TEMPLATES[4];
    const template = pool[Math.floor(rng() * pool.length)];
    const daysAgo = Math.floor(rng() * 220) + 3;
    const date = new Date(Date.now() - daysAgo * 86400000).toISOString();

    return {
      id: `seed_${product.id}_${i}`,
      name,
      rating,
      title: template.title,
      body: template.body,
      date,
      verified: rng() > 0.3,
    };
  });
}
