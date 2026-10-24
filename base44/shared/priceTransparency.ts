// Official price-transparency feeds (חוק שקיפות המחירים) for every major chain.
// Shufersal publishes on its own portal; the rest publish through the shared
// publishedprices.co.il (Cerberus) portal with a per-chain username and no password.
//
// Memory & speed discipline: a chain's daily file can be tens of MB of XML. We stream
// it, pull out only the barcodes (and names) we were asked about, and throw the rest
// away — the whole file is never held in memory and the answer is one pass.

import { normalizeText } from "./shufersalPrices.ts";

const UA = { "User-Agent": "MaKonim/1.0 (price transparency)" };
const CERBERUS = "https://url.publishedprices.co.il";

export type Chain = { id: string; name: string; source: "shufersal" | "cerberus"; user?: string; store?: string };

export const CHAINS: Chain[] = [
  { id: "shufersal", name: "שופרסל", source: "shufersal", store: "413" },
  { id: "rami_levy", name: "רמי לוי", source: "cerberus", user: "RamiLevi" },
  { id: "yohananof", name: "יוחננוף", source: "cerberus", user: "yohananof" },
  { id: "osher_ad", name: "אושר עד", source: "cerberus", user: "osherad" },
  { id: "tiv_taam", name: "טיב טעם", source: "cerberus", user: "TivTaam" },
  { id: "keshet", name: "קשת טעמים", source: "cerberus", user: "Keshet" },
  { id: "fresh_market", name: "פרש מרקט", source: "cerberus", user: "freshmarket" },
  { id: "stop_market", name: "סטופ מרקט", source: "cerberus", user: "Stop_Market" },
  { id: "politzer", name: "פוליצר", source: "cerberus", user: "politzer" },
  { id: "salach_dabach", name: "סאלח דבאח", source: "cerberus", user: "SalachD" }
];

export function chainById(id: string) {
  return CHAINS.find((chain) => chain.id === id) || null;
}

const csrfToken = (html: string) => (html.match(/name="csrftoken"\s+(?:value|content)="([^"]+)"/) || [])[1] || "";

// Cerberus sessions are short-lived; cache per chain for a few minutes.
const sessions = new Map<string, { cookie: string; csrf: string; at: number }>();

async function cerberusSession(user: string) {
  const cached = sessions.get(user);
  if (cached && Date.now() - cached.at < 5 * 60 * 1000) return cached;
  const loginPage = await fetch(`${CERBERUS}/login`, { headers: UA });
  const html = await loginPage.text();
  let cookie = (loginPage.headers.get("set-cookie") || "").split(";")[0];
  const login = await fetch(`${CERBERUS}/login/user`, {
    method: "POST", redirect: "manual",
    headers: { ...UA, "Content-Type": "application/x-www-form-urlencoded", Cookie: cookie },
    body: new URLSearchParams({ username: user, password: "", csrftoken: csrfToken(html) })
  });
  const set = login.headers.get("set-cookie");
  if (set) cookie = set.split(";")[0];
  const home = await fetch(`${CERBERUS}/file`, { headers: { ...UA, Cookie: cookie } });
  const session = { cookie, csrf: csrfToken(await home.text()), at: Date.now() };
  sessions.set(user, session);
  return session;
}

export type FileKind = "price" | "promo";
const FILE_KIND: Record<FileKind, { search: string; name: string }> = {
  price: { search: "PriceFull", name: "pricefull" },
  promo: { search: "PromoFull", name: "promofull" }
};
// Shufersal publishes each file type under its own category id.
const SHUFERSAL_CAT: Record<FileKind, number> = { price: 2, promo: 4 };

// Newest full file of one branch: filename carries the date (…-YYYYMMDD-HHMMSS.gz).
async function cerberusFile(chain: Chain, kind: FileKind) {
  const session = await cerberusSession(chain.user as string);
  const dir = await fetch(`${CERBERUS}/file/json/dir`, {
    method: "POST",
    headers: { ...UA, "Content-Type": "application/x-www-form-urlencoded", Cookie: session.cookie },
    body: new URLSearchParams({ csrftoken: session.csrf, sEcho: "1", iDisplayLength: "200", sSearch: FILE_KIND[kind].search })
  });
  const text = await dir.text();
  if (!text.startsWith("{")) {
    sessions.delete(chain.user as string);
    throw new Error(`${chain.id}: price file listing unavailable`);
  }
  const names: string[] = (JSON.parse(text).aaData || []).map((row: any) => row.fname).filter(Boolean);
  const dated = names.map((name) => ({ name, day: (name.match(/-(\d{8})-\d{4,6}\.gz$/) || [])[1] || "" }))
    .filter((entry) => entry.day).sort((a, b) => (a.day < b.day ? 1 : -1));
  if (!dated.length) throw new Error(`${chain.id}: no price file found`);
  const newest = dated[0];
  return {
    url: `${CERBERUS}/file/d/${newest.name}`,
    headers: { ...UA, Cookie: session.cookie },
    day: `${newest.day.slice(0, 4)}-${newest.day.slice(4, 6)}-${newest.day.slice(6, 8)}`
  };
}

async function shufersalFile(chain: Chain, kind: FileKind) {
  const listing = await fetch(`https://prices.shufersal.co.il/FileObject/UpdateCategory?catID=${SHUFERSAL_CAT[kind]}&storeId=${chain.store}`, { headers: UA });
  const html = await listing.text();
  const link = html.match(new RegExp(`href="(https:\\/\\/pricesprodpublic[^"]+${FILE_KIND[kind].name}[^"]+)"`, "i"));
  if (!link) throw new Error(`shufersal: ${kind} file link not found`);
  const url = link[1].replace(/&amp;/g, "&");
  const day = (url.match(/(\d{8})\d{4}\.gz/) || [])[1] || "";
  return {
    url, headers: UA,
    day: day ? `${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6, 8)}` : new Date().toISOString().slice(0, 10)
  };
}

// Newest daily file of one chain: the shelf-price file or the promotions file.
export async function chainDataFile(chain: Chain, kind: FileKind) {
  return chain.source === "shufersal" ? shufersalFile(chain, kind) : cerberusFile(chain, kind);
}

export async function chainPriceFile(chain: Chain) {
  return chainDataFile(chain, "price");
}

const tag = (block: string, name: string) => (block.match(new RegExp(`<${name}>([^<]*)</${name}>`)) || [])[1]?.trim() || "";

const SIZE_WORDS = new Set(["גרם", "גר", "גרמים", "קג", "קילו", "קילוגרם", "מל", "ליטר", "ל", "יח", "יחידה", "מינון", "אריזה", "משקל"]);

// A product name becomes: the words that identify it, the biggest number (usually the
// pack size) and the normalized form used to compare against the file.
type NameQuery = {
  key: string;
  terms: string[];
  longest: string;
  number: string;
  score: number;
  length: number;
  match: { code: string; price: number } | null;
};

function nameQuery(key: string): NameQuery {
  const tokens = normalizeText(key).split(" ").filter(Boolean);
  const terms: string[] = [];
  let number = "";
  for (const token of tokens) {
    if (/^\d+$/.test(token)) {
      if (token.length >= 3) number = token;
      else terms.push(token);
      continue;
    }
    if (SIZE_WORDS.has(token)) continue;
    terms.push(token);
  }
  const kept = terms.length ? terms : tokens;
  return {
    key, terms: kept, number, score: 0, length: Number.MAX_SAFE_INTEGER, match: null,
    longest: kept.reduce((longest, term) => (term.length > longest.length ? term : longest), kept[0] || "")
  };
}

// One pass over the chain's daily file. `barcodes` are matched exactly, `names` are
// matched inside the same pass, so no second copy of any catalog is loaded.
export async function pricesForItems(chain: Chain, barcodes: Set<string>, names: string[]) {
  const file = await chainPriceFile(chain);
  const response = await fetch(file.url, { headers: file.headers });
  if (!response.ok || !response.body) throw new Error(`${chain.id}: price file ${response.status}`);

  const found = new Map<string, { price: number; code: string }>();
  const queries = names.map(nameQuery).filter((query) => query.longest);
  const wanted = barcodes.size + queries.length;

  const consume = (block: string) => {
    const code = tag(block, "ItemCode");
    if (!code) return;
    const price = Number(tag(block, "ItemPrice"));
    if (!(price > 0)) return;
    if (barcodes.has(code)) {
      if (!found.has(code)) found.set(code, { price, code });
      return;
    }
    if (!queries.length) return;
    const product = tag(block, "ItemName");
    if (!product) return;
    const brand = tag(block, "ManufacturerName");
    const lower = `${product} ${brand}`.toLowerCase();
    for (const query of queries) {
      if (query.match && query.score >= 3) continue;
      if (!lower.includes(query.longest)) continue;
      const normalized = normalizeText(`${product} ${brand}`);
      if (!query.terms.every((term) => normalized.includes(term))) continue;
      const quantity = Number(tag(block, "Quantity"));
      const score = query.number ? (quantity === Number(query.number) ? 3 : 2) : 1;
      if (score > query.score || (score === query.score && normalized.length < query.length)) {
        query.score = score;
        query.length = normalized.length;
        query.match = { code, price };
      }
    }
  };

  const reader = response.body.pipeThrough(new DecompressionStream("gzip")).getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let searching = true;
  while (searching) {
    const chunk = await reader.read();
    if (chunk.done) {
      if (buffer) consume(buffer.slice(buffer.indexOf("<Item>") + 6));
      break;
    }
    buffer += decoder.decode(chunk.value, { stream: true });
    let end = buffer.indexOf("</Item>");
    while (end !== -1) {
      const block = buffer.slice(buffer.indexOf("<Item>"), end);
      buffer = buffer.slice(end + 7);
      consume(block);
      end = buffer.indexOf("</Item>");
    }
    // Everything asked for was resolved — no reason to keep reading the file.
    if (found.size + queries.filter((query) => query.match).length >= wanted) searching = false;
  }
  reader.cancel().catch(() => {});

  for (const query of queries) if (query.match) found.set(query.key, query.match);
  return { prices: found, day: file.day };
}