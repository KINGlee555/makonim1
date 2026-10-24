import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { CHAINS, Chain } from "../../shared/priceTransparency.ts";
import { dealsForBarcodes } from "../../shared/promotions.ts";
import { searchPriceCatalog } from "../../shared/shufersalPrices.ts";

// Real promotions per chain, straight from the official price-transparency feeds.
// Each promotion is stored for the day, so a chain's heavy promotion file is read at most
// once a day — later calls (and every app open) are plain DB reads.
//
// The app asks for a few chains at a time: a promotion file is large, and reading many of
// them in one call exhausts the worker's CPU budget.
const CHAIN_TIMEOUT_MS = 15000;
const MAX_CHAINS_PER_CALL = 4;
const CHAINS_PER_READ = MAX_CHAINS_PER_CALL;

// Staples most households buy — the base of the ready-made deals list.
const POPULAR = [
  "חלב 3%", "לחם אחיד", "ביצים L", "קוטג׳ 5%", "גבינה צהובה", "יוגורט",
  "שמן זית", "אורז", "פסטה", "טונה", "נייר טואלט", "אבקת כביסה"
];

const withTimeout = <T,>(promise: Promise<T>, chainId: string) => Promise.race([
  promise,
  new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`${chainId}: promotion file timed out`)), CHAIN_TIMEOUT_MS))
]);

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const started = Date.now();
    const body = await req.json().catch(() => ({}));
    const mode = String(body?.mode || "items");
    const day = new Date().toISOString().slice(0, 10);
    const wantedChains: string[] = Array.isArray(body?.chains) ? body.chains : [];

    let asked: { name: string; barcode: string }[] = [];
    if (mode === "popular") {
      asked = POPULAR.map((name) => ({ name, barcode: "" }));
    } else if (mode === "search") {
      const query = String(body?.query || "").trim().slice(0, 40);
      if (query.length < 2) return Response.json({ day, deals: [] });
      asked = [{ name: query, barcode: "" }];
    } else {
      asked = (Array.isArray(body?.items) ? body.items : []).slice(0, 40)
        .map((item: any) => ({ name: String(item?.name || "").trim().slice(0, 64), barcode: String(item?.barcode || "").trim() }))
        .filter((item: { name: string; barcode: string }) => item.name || item.barcode);
    }
    if (!asked.length) return Response.json({ day, deals: [] });

    // 1. Barcodes the app already has, then the ones earlier price lookups resolved by name.
    const byBarcode = new Map<string, string>();
    const names: string[] = [];
    for (const item of asked) {
      if (item.barcode) { if (!byBarcode.has(item.barcode)) byBarcode.set(item.barcode, item.name); }
      else if (item.name) names.push(item.name);
    }
    if (names.length) {
      const resolved = await base44.asServiceRole.entities.ChainPrice.filter(
        { day, name: { $in: names } }, "-created_date", names.length * CHAINS.length
      );
      for (const row of resolved) if (row.barcode && row.name && !byBarcode.has(row.barcode)) byBarcode.set(row.barcode, row.name);
    }
    // 2. The rest are looked up in the price catalog, which also yields the barcode. Each
    //    resolved barcode is kept as a name mapping for the day, so the next run is a plain
    //    DB read and never pays for the catalog again.
    const resolveCap = mode === "popular" ? 6 : 2;
    const unknown = names.filter((name) => ![...byBarcode.values()].includes(name)).slice(0, resolveCap);
    if (unknown.length) {
      const mappings: any[] = [];
      for (const name of unknown) {
        try {
          const [match] = await searchPriceCatalog(name, 1);
          if (match?.code && !byBarcode.has(match.code)) {
            const code = String(match.code);
            byBarcode.set(code, name);
            mappings.push({ chain: "shufersal", barcode: code, name, price: 0, day });
          }
        } catch (error) {
          console.error("chainDeals barcode resolve failed", error instanceof Error ? error.message : error);
        }
      }
      if (mappings.length) {
        try {
          await base44.asServiceRole.entities.ChainPrice.bulkCreate(mappings);
        } catch (error) {
          console.error("chainDeals mapping store skipped", error instanceof Error ? error.message : error);
        }
      }
    }
    const codes = [...byBarcode.keys()];
    if (!codes.length) return Response.json({ day, deals: [], unresolved: asked.length });

    const pool = (wantedChains.length ? CHAINS.filter((chain) => wantedChains.includes(chain.id)) : CHAINS)
      .slice(0, MAX_CHAINS_PER_CALL);

    // 3. Everything already checked today needs no file read. A stored row with deal_price 0
    //    means "checked today, no promotion", so a chain is read at most once a day.
    const cached = await base44.asServiceRole.entities.ChainDeal.filter(
      { day, barcode: { $in: codes } }, "-created_date", codes.length * pool.length
    );
    const known = new Map<string, Map<string, any>>();
    for (const chain of pool) known.set(chain.id, new Map());
    for (const row of cached) {
      const perChain = known.get(row.chain);
      if (perChain && row.barcode && codes.includes(row.barcode)) perChain.set(row.barcode, row);
    }

    const stale = pool.filter((chain) => codes.some((code) => !known.get(chain.id)!.has(code))).slice(0, CHAINS_PER_READ);
    const fresh: any[] = [];
    await Promise.all(stale.map(async (chain: Chain) => {
      const perChain = known.get(chain.id)!;
      const missing = codes.filter((code) => !perChain.has(code));
      try {
        const { deals } = await withTimeout(dealsForBarcodes(chain, new Set(missing)), chain.id);
        for (const code of missing) {
          const deal = deals.get(code);
          const row = {
            chain: chain.id, barcode: code, name: byBarcode.get(code) || "", price: 0,
            deal_price: deal?.deal_price || 0, discount_rate: deal?.discount_rate || 0,
            description: deal?.description || "", ends_on: deal?.ends_on || "", day
          };
          perChain.set(code, row);
          fresh.push(row);
        }
      } catch (error) {
        console.error("chain deal read failed", chain.id, error instanceof Error ? error.message : error);
      }
    }));
    if (fresh.length) {
      try {
        await base44.asServiceRole.entities.ChainDeal.bulkCreate(fresh);
        const cutoff = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        await base44.asServiceRole.entities.ChainDeal.deleteMany({ day: { $lt: cutoff } });
      } catch (error) {
        console.error("chain deal store skipped", error instanceof Error ? error.message : error);
      }
    }

    // 4. Today's shelf price turns a promotion into a visible saving.
    const prices = await base44.asServiceRole.entities.ChainPrice.filter(
      { day, barcode: { $in: codes } }, "-created_date", codes.length * pool.length
    );
    const regular = new Map<string, number>();
    for (const row of prices) if (row.barcode && row.price > 0) regular.set(`${row.chain}|${row.barcode}`, row.price);

    const deals: any[] = [];
    for (const chain of pool) {
      for (const [code, row] of known.get(chain.id)!) {
        const price = regular.get(`${chain.id}|${code}`) || 0;
        const fromRate = price > 0 && row.discount_rate > 0 ? Math.round(price * (1 - row.discount_rate / 100) * 100) / 100 : 0;
        const dealPrice = row.deal_price > 0 ? row.deal_price : fromRate;
        if (!(dealPrice > 0)) continue;
        if (price > 0 && dealPrice >= price) continue;
        deals.push({
          chain: chain.id, chain_name: chain.name, barcode: code,
          name: row.name || byBarcode.get(code) || "",
          price, deal_price: dealPrice, description: row.description || "", ends_on: row.ends_on || "",
          discount: price > 0 ? Math.round((1 - dealPrice / price) * 100) : 0
        });
      }
    }
    deals.sort((a, b) => (b.discount - a.discount) || (a.deal_price - b.deal_price));
    console.log("timing ms", { total: Date.now() - started, mode, codes: codes.length, read: stale.length, deals: deals.length });
    return Response.json({ day, deals: deals.slice(0, 120), matched: deals.length, read: stale.length, chains: pool.length });
  } catch (error) {
    console.error("chainDeals", error);
    return Response.json({ error: error instanceof Error ? error.message : "Deals lookup failed" }, { status: 500 });
  }
}