// Official price-transparency feeds (חוק שקיפות המחירים) for every major chain.
// Shufersal publishes on its own portal; the rest publish through the shared
// publishedprices.co.il (Cerberus) portal with a per-chain username and no password.
//
// Memory discipline: a chain's daily price file is ~10MB of XML. We never keep a
// full catalog in memory — we stream it once, pull out only the barcodes we were
// asked about, and throw the rest away.

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

// Newest full price file of one branch: filename carries the date (…-YYYYMMDD-HHMMSS.gz).
async function cerberusFile(chain: Chain) {
  const session = await cerberusSession(chain.user as string);
  const dir = await fetch(`${CERBERUS}/file/json/dir`, {
    method: "POST",
    headers: { ...UA, "Content-Type": "application/x-www-form-urlencoded", Cookie: session.cookie },
    body: new URLSearchParams({ csrftoken: session.csrf, sEcho: "1", iDisplayLength: "200", sSearch: "PriceFull" })
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

async function shufersalFile(chain: Chain) {
  const listing = await fetch(`https://prices.shufersal.co.il/FileObject/UpdateCategory?catID=2&storeId=${chain.store}`, { headers: UA });
  const html = await listing.text();
  const link = html.match(/href="(https:\/\/pricesprodpublic[^"]+pricefull[^"]+)"/i);
  if (!link) throw new Error("shufersal: price file link not found");
  const url = link[1].replace(/&amp;/g, "&");
  const day = (url.match(/(\d{8})\d{4}\.gz/) || [])[1] || "";
  return {
    url, headers: UA,
    day: day ? `${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6, 8)}` : new Date().toISOString().slice(0, 10)
  };
}

export async function chainPriceFile(chain: Chain) {
  return chain.source === "shufersal" ? shufersalFile(chain) : cerberusFile(chain);
}

const tag = (block: string, name: string) => (block.match(new RegExp(`<${name}>([^<]*)</${name}>`)) || [])[1]?.trim() || "";

// One pass over the chain's daily file, keeping only the requested barcodes.
export async function pricesForBarcodes(chain: Chain, barcodes: Set<string>) {
  const file = await chainPriceFile(chain);
  const response = await fetch(file.url, { headers: file.headers });
  if (!response.ok || !response.body) throw new Error(`${chain.id}: price file ${response.status}`);
  const xml = await new Response(response.body.pipeThrough(new DecompressionStream("gzip"))).text();
  const prices = new Map<string, number>();
  for (const block of xml.split("<Item>")) {
    if (prices.size === barcodes.size) break;
    const code = tag(block, "ItemCode");
    if (!code || !barcodes.has(code) || prices.has(code)) continue;
    const price = Number(tag(block, "ItemPrice"));
    if (price > 0) prices.set(code, price);
  }
  return { prices, day: file.day };
}