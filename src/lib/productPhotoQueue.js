import { base44 } from "@/api/base44Client";

// One lookup for a group of visible products, shared by every photo surface.
const pending = new Map();
const cache = new Map();
let timer;
let running = false;
const keyOf = (item) => String(item.barcode || item.name || "");
async function flush() {
  if (running || !pending.size) return;
  running = true;
  const batch = [...pending.entries()].slice(0, 40);
  batch.forEach(([key]) => pending.delete(key));
  try {
    const response = await base44.functions.invoke("productPhotos", { items: batch.map(([, value]) => value.item) });
    batch.forEach(([key, value]) => {
      const candidates = response.data?.candidates?.[key] || [];
      cache.set(key, { candidates, at: Date.now() });
      value.resolve(candidates);
    });
  } catch {
    batch.forEach(([, value]) => value.resolve([]));
  } finally {
    running = false;
    if (pending.size) timer = setTimeout(flush, 24);
  }
}
export function productPhotoCandidates(item) {
  const key = keyOf(item);
  if (!key) return Promise.resolve([]);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < (hit.candidates.length ? 900000 : 60000)) return Promise.resolve(hit.candidates);
  if (pending.has(key)) return pending.get(key).promise;
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  pending.set(key, { item: { barcode: item.barcode || "", name: item.name || "" }, promise, resolve });
  clearTimeout(timer);
  timer = setTimeout(flush, 24);
  return promise;
}