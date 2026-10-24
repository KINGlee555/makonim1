// Official promotions feed (חוק שקיפות המחירים): every chain publishes its full promotion
// file each night next to the price file. A promotion is published per barcode only, so a
// product is matched by its barcode — the app resolves barcodes from the price file first.
//
// Cost discipline: these files are big, so the reader keeps ONE position in the buffer
// instead of re-slicing it, compiles its patterns once, and reads only the code of each
// promotion before deciding whether the rest of the block is worth parsing.
import { Chain, chainDataFile } from "./priceTransparency.ts";

const RE = {
  code: /<ItemCode>([^<]*)<\/ItemCode>/,
  ends: /<PromotionEndDateTime>([^<]*)<\/PromotionEndDateTime>/,
  price: /<DiscountedPrice>([^<]*)<\/DiscountedPrice>/,
  rate: /<DiscountRate>([^<]*)<\/DiscountRate>/,
  min: /<MinQty>([^<]*)<\/MinQty>/,
  desc: /<PromotionDescription>([^<]*)<\/PromotionDescription>/
};

export type ChainDealRow = {
  chain: string;
  barcode: string;
  deal_price: number;
  discount_rate: number;
  description: string;
  ends_on: string;
};

// A very large file is abandoned part-way rather than burning the worker's CPU on it.
const MAX_CHARS = 12 * 1024 * 1024;

export async function dealsForBarcodes(chain: Chain, barcodes: Set<string>) {
  const file = await chainDataFile(chain, "promo");
  const response = await fetch(file.url, { headers: file.headers });
  if (!response.ok || !response.body) throw new Error(`${chain.id}: promotion file ${response.status}`);

  const found = new Map<string, ChainDealRow>();
  const today = new Date().toISOString().slice(0, 10);

  const consume = (block: string) => {
    const codeMatch = RE.code.exec(block);
    if (!codeMatch) return;
    const code = codeMatch[1].trim();
    if (!barcodes.has(code)) return;
    const ends = (RE.ends.exec(block)?.[1] || "").slice(0, 10);
    if (ends && ends < today) return; // the promotion is already over
    // A real price cut is a sale price. A straight percentage is kept only when it applies
    // to a single item, so "buy 10 get one" style club offers never show as a price cut.
    const price = Number(RE.price.exec(block)?.[1]) || 0;
    const rate = Number(RE.rate.exec(block)?.[1]) || 0;
    const minQty = Number(RE.min.exec(block)?.[1]) || 1;
    if (!(price > 0 || (rate > 0 && rate < 100 && minQty <= 1))) return;
    const previous = found.get(code);
    if (previous && previous.deal_price > 0 && price > 0 && previous.deal_price <= price) return;
    found.set(code, {
      chain: chain.id, barcode: code, deal_price: price,
      discount_rate: price > 0 ? 0 : rate,
      description: (RE.desc.exec(block)?.[1] || "").slice(0, 80), ends_on: ends
    });
  };

  const reader = response.body.pipeThrough(new DecompressionStream("gzip")).getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let position = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    buffer += decoder.decode(chunk.value, { stream: true });
    let end = buffer.indexOf("</Promotion>", position);
    while (end !== -1) {
      const start = buffer.lastIndexOf("<Promotion>", end);
      consume(buffer.slice(start === -1 ? position : start, end));
      position = end + 12;
      end = buffer.indexOf("</Promotion>", position);
    }
    // Trim what was already read so the buffer never grows without bound.
    if (position > 200000) { buffer = buffer.slice(position); position = 0; }
    if (buffer.length > MAX_CHARS) break;
  }
  reader.cancel().catch(() => {});
  return { deals: found, day: file.day };
}