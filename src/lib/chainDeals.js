// Real deals from the chains — directly from the official transparency files, and cached for a full day on the server.
export async function fetchChainDeals(payload) {
  // TODO: Replace with your new backend cloud function or API endpoint for chain deals
  // Simulating a network request for now
  await new Promise(resolve => setTimeout(resolve, 800));
  return {};
}

// Read chains in small groups: a single request reading all chains' deals files
// exceeds the server CPU limit, and grouped results also arrive faster.
// A group of two chains is the limit the worker can handle. Deals are displayed the moment a group returns,
// so chains that are read quickly and reliably come first, and heavy files (Rami Levy and Yohananof,
// which take until the timeout limit) are left for last so they don't delay the rest.
export const DEAL_CHAIN_GROUPS = [
  ["shufersal", "osher_ad"],
  ["keshet", "fresh_market"],
  ["tiv_taam", "politzer"],
  ["stop_market", "salach_dabach"],
  ["yohananof", "rami_levy"]
];

// The badge in the list is checked against the two biggest chains — a quick and easy read.
export const DEAL_BADGE_CHAINS = ["shufersal", "rami_levy"];

export async function fetchChainDealsInGroups(payload, onProgress) {
  let all = [];
  for (const chains of DEAL_CHAIN_GROUPS) {
    try {
      const data = await fetchChainDeals({ ...payload, chains });
      all = [...all, ...(data.deals || [])];
      all.sort((a, b) => (b.discount - a.discount) || (a.deal_price - b.deal_price));
      if (onProgress) onProgress([...all]);
    } catch {
      // A chain that didn't respond doesn't stop the rest
    }
  }
  return all;
}

export function itemDeals(items, onProgress) {
  const wanted = (items || []).filter(item => item?.name)
      .map(item => ({ name: item.name, barcode: item.barcode || "" }));
  if (!wanted.length) return Promise.resolve([]);
  return fetchChainDealsInGroups({ mode: "items", items: wanted }, onProgress);
}

// Best deal for an item: first by barcode, and if not — by product name.
export function dealForItem(deals, item) {
  if (!deals?.length || !item) return null;
  return (item.barcode && deals.find(deal => deal.barcode === item.barcode))
      || deals.find(deal => deal.name === item.name) || null;
}

// "2 for 18" deals are displayed as they are written by the chain, rather than price per unit.
export function multiBuyText(deal) {
  const match = String(deal?.description || "").match(/(\d+)\s*ב\s*[־-]?\s*(\d+(?:\.\d+)?)/);
  return match ? `${match[1]} ב-${match[2]}` : "";
}

export function dealPriceText(deal) {
  if (!deal) return "";
  return multiBuyText(deal) || `₪${Number(deal.deal_price || 0).toFixed(2)}`;
}

// Discount percentage of a deal: from the chain's document, and if not reported — based on the pre-deal price.
export function dealDiscount(deal) {
  if (!deal) return 0;
  const reported = Number(deal.discount_rate ?? deal.discount ?? 0);
  if (reported > 0) return Math.round(reported);
  const full = Number(deal.price || 0);
  const now = Number(deal.deal_price || 0);
  return full > 0 && now > 0 && now < full ? Math.round((1 - now / full) * 100) : 0;
}

// ===== Deals Cache in Browser =====
// Today's deals are also saved on the device, so the window opens with deals immediately and refreshes in the background.
const CACHE_PREFIX = "makonim-deals-v1";
const cacheDay = () => new Date().toISOString().slice(0, 10);

// Stable key based on products, so one list's cache doesn't get overwritten by another list.
export function listDealsKey(items) {
  return (items || []).map(item => `${item.name}|${item.barcode || ""}`).sort().join(";");
}

export function readDealsCache(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(`${CACHE_PREFIX}:${key}`) || "null");
    return parsed?.day === cacheDay() ? parsed.deals || [] : [];
  } catch {
    return [];
  }
}

export function writeDealsCache(key, deals) {
  if (!deals?.length) return;
  try {
    localStorage.setItem(`${CACHE_PREFIX}:${key}`, JSON.stringify({ day: cacheDay(), deals: deals.slice(0, 60) }));
  } catch {
    // No space in local storage — just skip saving
  }
}