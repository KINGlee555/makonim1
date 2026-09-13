import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { CHAINS, pricesForBarcodes } from "../../shared/priceTransparency.ts";

// Real shelf prices per chain for a basket of barcodes, straight from the official
// price-transparency feeds. Every resolved (chain, barcode, day) is stored, so the
// heavy file read happens at most once per chain per day — later baskets are DB reads.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const barcodes = [...new Set((Array.isArray(body?.barcodes) ? body.barcodes : [])
      .map((code: any) => String(code || "").trim()).filter(Boolean))].slice(0, 60);
    if (!barcodes.length) return Response.json({ chains: [], barcodes: [] });

    const day = new Date().toISOString().slice(0, 10);
    const cached = await base44.asServiceRole.entities.ChainPrice.filter(
      { barcode: { $in: barcodes }, day }, "-created_date", barcodes.length * CHAINS.length
    );

    const known = new Map<string, Map<string, number>>();
    for (const chain of CHAINS) known.set(chain.id, new Map());
    for (const row of cached) known.get(row.chain)?.set(row.barcode, row.price || 0);

    // Only chains missing at least one barcode need their daily file read.
    const stale = CHAINS.filter((chain) => barcodes.some((code) => !known.get(chain.id)!.has(code)));
    const fresh: any[] = [];
    for (let i = 0; i < stale.length; i += 4) {
      await Promise.all(stale.slice(i, i + 4).map(async (chain) => {
        const missing = barcodes.filter((code) => !known.get(chain.id)!.has(code));
        try {
          const { prices } = await pricesForBarcodes(chain, new Set(missing));
          for (const code of missing) {
            const price = prices.get(code) || 0;
            known.get(chain.id)!.set(code, price);
            fresh.push({ chain: chain.id, barcode: code, price, day });
          }
        } catch (error) {
          console.error("chain price read failed", chain.id, error instanceof Error ? error.message : error);
        }
      }));
    }
    if (fresh.length) await base44.asServiceRole.entities.ChainPrice.bulkCreate(fresh);

    const chains = CHAINS.map((chain) => {
      const prices: Record<string, number> = {};
      for (const [code, price] of known.get(chain.id)!) if (price > 0) prices[code] = price;
      return { id: chain.id, name: chain.name, prices, found: Object.keys(prices).length };
    }).filter((chain) => chain.found > 0);

    return Response.json({ day, barcodes, chains });
  } catch (error) {
    console.error("chainPrices", error);
    return Response.json({ error: error instanceof Error ? error.message : "Chain price lookup failed" }, { status: 500 });
  }
}