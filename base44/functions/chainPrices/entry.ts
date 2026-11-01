import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { CHAINS, pricesForItems } from "../../shared/priceTransparency.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(error => error?.status === 401 ? null : Promise.reject(error));
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    if (body.persist === false && user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });
    const raw = Array.isArray(body.items) ? body.items : (body.barcodes || []).map(barcode => ({ barcode }));
    if (raw.length > 200) return Response.json({ error: "Maximum 200 products per request" }, { status: 400 });
    const items = new Map();
    for (const item of raw) {
      const name = String(item.name || "").trim().slice(0, 64);
      const barcode = String(item.barcode || "").trim().slice(0, 32);
      if (barcode || name) items.set(barcode || name, { barcode, name });
    }
    const keys = [...items.keys()];
    const pool = CHAINS.filter(chain => !body.chains?.length || body.chains.includes(chain.id));
    if (!keys.length || !pool.length) return Response.json({ success: false, chains: [], items: [], statuses: [] });
    const codes = [...items.values()].map(item => item.barcode).filter(Boolean);
    const names = [...items.values()].filter(item => !item.barcode).map(item => item.name);
    const day = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
    const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const clauses = [...(codes.length ? [{ barcode: { $in: codes } }] : []), ...(names.length ? [{ name: { $in: names } }] : [])];
    const known = new Map(pool.map(chain => [chain.id, new Map()]));
    const existing = new Map();
    let cursor;
    do {
      const page = await base44.asServiceRole.entities.ChainPrice.filter({ chain: { $in: pool.map(chain => chain.id) }, day: { $gte: cutoff }, $or: clauses }, { sort: "-day", limit: 500, cursor });
      for (const row of page.items) {
        const key = items.has(row.barcode) ? row.barcode : (!items.get(row.name)?.barcode ? row.name : "");
        if (!key || !items.has(key) || !(row.price > 0)) continue;
        const map = known.get(row.chain);
        const current = map.get(key);
        if (!current || row.day > current.day || (row.day === current.day && row.updated_date > current.updated_date)) map.set(key, row);
        existing.set(`${row.chain}:${row.barcode}:${row.day}`, row.id);
      }
      cursor = page.has_more ? page.next_cursor : undefined;
    } while (cursor);
    const statuses = [];
    const creates = [];
    const patches = [];
    const resolved = new Map();
    let liveMatched = 0;
    for (let offset = 0; offset < pool.length; offset += 4) {
      await Promise.all(pool.slice(offset, offset + 4).map(async chain => {
        const map = known.get(chain.id);
        if (body.cacheOnly || (!body.refresh && keys.every(key => map.get(key)?.day === day))) {
          statuses.push({ id: chain.id, status: map.size ? "cached" : "unavailable", found: map.size });
          return;
        }
        try {
          const result = await pricesForItems(chain, new Set(codes), names);
          let found = 0;
          for (const [key, entry] of result.prices) {
            const item = items.get(key);
            if (!item || !(entry.price > 0)) continue;
            const row = { chain: chain.id, barcode: entry.code, name: item.name || key, price: entry.price, day: result.day };
            map.set(key, row);
            if (!item.barcode) resolved.set(key, entry.code);
            const id = existing.get(`${chain.id}:${entry.code}:${result.day}`);
            if (id) patches.push({ id, ...row }); else creates.push(row);
            found++;
          }
          liveMatched += found;
          statuses.push({ id: chain.id, status: found ? "fresh" : "no_match", found, day: result.day, keys: [...result.prices.keys()] });
        } catch (error) {
          console.warn("price feed unavailable", chain.id, error.message);
          statuses.push({ id: chain.id, status: "unavailable", found: map.size, reason: error.message });
        }
      }));
    }
    if (body.persist !== false) {
      for (let i = 0; i < creates.length; i += 500) await base44.asServiceRole.entities.ChainPrice.bulkCreate(creates.slice(i, i + 500));
      for (let i = 0; i < patches.length; i += 500) await base44.asServiceRole.entities.ChainPrice.bulkUpdate(patches.slice(i, i + 500));
    }
    const chains = pool.map(chain => {
      const prices = {}, dates = {};
      for (const [key, row] of known.get(chain.id)) { prices[key] = row.price; dates[key] = row.day; }
      return { id: chain.id, name: chain.name, prices, dates, found: Object.keys(prices).length };
    }).filter(chain => chain.found);
    const matched = keys.filter(key => chains.some(chain => chain.prices[key] > 0)).length;
    return Response.json({ success: body.cacheOnly ? matched > 0 : liveMatched > 0 || statuses.some(status => status.status === "cached" && status.found > 0), day: chains.flatMap(chain => Object.values(chain.dates)).sort().at(-1) || "", checkedAt: new Date().toISOString(), matched, requested: keys.length, liveMatched, statuses, chains, items: [...resolved].map(([name, barcode]) => ({ name, barcode })) });
  } catch (error) {
    console.error("chainPrices", error);
    return Response.json({ error: error.message || "Chain price lookup failed" }, { status: 500 });
  }
}