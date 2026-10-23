import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { CHAINS, pricesForItems } from "../../shared/priceTransparency.ts";

// Real shelf prices per chain for a basket, straight from the official
// price-transparency feeds. Every resolved price is stored for the day, so a chain's
// heavy price file is read at most once per day — later baskets are plain DB reads.
// The app asks for a few chains at a time, so the first results arrive quickly.
const CHAIN_TIMEOUT_MS = 15000;

const withTimeout = <T>(promise: Promise<T>, chainId: string) => Promise.race([
  promise,
  new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`${chainId}: price file timed out`)), CHAIN_TIMEOUT_MS))
]);

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const started = Date.now();
    const body = await req.json();
    const rawItems: any[] = Array.isArray(body?.items) ? body.items
      : (Array.isArray(body?.barcodes) ? body.barcodes.map((code: any) => ({ barcode: code })) : []);
    const wanted: string[] = Array.isArray(body?.chains) ? body.chains : [];
    const pool = wanted.length ? CHAINS.filter((chain) => wanted.includes(chain.id)) : CHAINS;

    // A product is looked up by its barcode when we have it, otherwise by its name.
    const items = new Map<string, { name: string; barcode: string }>();
    for (const raw of rawItems.slice(0, 50)) {
      const name = String(raw?.name || "").trim().slice(0, 64);
      const barcode = String(raw?.barcode || "").trim();
      const key = barcode || name;
      if (key && !items.has(key)) items.set(key, { name, barcode });
    }
    const keys = [...items.keys()];
    if (!keys.length || !pool.length) return Response.json({ items: [], chains: [] });
    const codes = [...new Set([...items.values()].map((item) => item.barcode).filter(Boolean))];
    const names = keys.filter((key) => !items.get(key)!.barcode);

    const day = new Date().toISOString().slice(0, 10);
    const clauses: any[] = [];
    if (codes.length) clauses.push({ barcode: { $in: codes } });
    if (names.length) clauses.push({ name: { $in: names } });
    const cached = await base44.asServiceRole.entities.ChainPrice.filter(
      { day, ...(clauses.length > 1 ? { $or: clauses } : clauses[0]) }, "-created_date", keys.length * pool.length
    );

    const known = new Map<string, Map<string, number>>();
    const resolvedNames = new Map<string, string>();
    for (const chain of pool) known.set(chain.id, new Map());
    for (const row of cached) {
      const perChain = known.get(row.chain);
      if (!perChain) continue;
      const price = row.price || 0;
      if (price > 0 && row.barcode && items.has(row.barcode)) perChain.set(row.barcode, price);
      if (price > 0 && row.name && items.has(row.name)) {
        perChain.set(row.name, price);
        if (row.barcode) resolvedNames.set(row.name, row.barcode);
      }
    }

    // Only chains missing at least one product need their daily file read.
    const stale = pool.filter((chain) => keys.some((key) => !known.get(chain.id)!.has(key)));
    const fresh: any[] = [];
    await Promise.all(stale.map(async (chain) => {
      const perChain = known.get(chain.id)!;
      const missingCodes = codes.filter((code) => !perChain.has(code));
      const missingNames = names.filter((name) => !perChain.has(name));
      try {
        const { prices } = await withTimeout(pricesForItems(chain, new Set(missingCodes), missingNames), chain.id);
        for (const [key, entry] of prices) {
          perChain.set(key, entry.price);
          const item = items.get(key)!;
          if (!item.barcode && entry.code) resolvedNames.set(key, entry.code);
          fresh.push({ chain: chain.id, barcode: entry.code, name: item.name || key, price: entry.price, day });
        }
      } catch (error) {
        console.error("chain price read failed", chain.id, error instanceof Error ? error.message : error);
      }
    }));
    if (fresh.length) await base44.asServiceRole.entities.ChainPrice.bulkCreate(fresh);

    const chains = pool.map((chain) => {
      const prices: Record<string, number> = {};
      for (const key of keys) {
        const price = known.get(chain.id)!.get(key);
        if (price > 0) prices[key] = price;
      }
      return { id: chain.id, name: chain.name, prices, found: Object.keys(prices).length };
    }).filter((chain) => chain.found > 0);

    // Names we matched tell the app the product's barcode, so the next lookup is instant.
    const resolved = [...resolvedNames].filter(([key]) => chains.some((chain) => chain.prices[key]))
      .map(([name, barcode]) => ({ name, barcode }));
    console.log("timing ms", { total: Date.now() - started, keys: keys.length, read: stale.length, chains: chains.length });

    return Response.json({ day, items: resolved, chains });
  } catch (error) {
    console.error("chainPrices", error);
    return Response.json({ error: error instanceof Error ? error.message : "Chain price lookup failed" }, { status: 500 });
  }
}