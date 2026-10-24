// סיכום חודשי מתוך היסטוריית הקניות — כמה הוצאנו החודש, מול החודש שעבר,
// וכמה חסכנו בגלל מוצרים שהמחיר שלהם ירד לעומת החודש הקודם.

const monthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const lineTotal = (row) => (row.price || 0) * (row.quantity || 1);
const sumTotal = (rows) => rows.reduce((sum, row) => sum + lineTotal(row), 0);

const inRange = (row, from, to) => {
  const date = new Date(row.created_date);
  return date >= from && date < to;
};

// המחיר הממוצע ליחידה ששולם בפועל לכל מוצר — כדי להשוות את אותו מוצר בין חודשים,
// גם כשהכמויות שונות (למשל קילו עגבניות החודש וחצי קילו בחודש שעבר)
const paidUnitPrices = (rows) => {
  const map = {};
  rows.forEach((row) => {
    const name = (row.item_name || "").trim();
    if (!name || !row.price) return;
    if (!map[name]) map[name] = { total: 0, quantity: 0 };
    map[name].total += lineTotal(row);
    map[name].quantity += row.quantity || 1;
  });
  return Object.entries(map).reduce((prices, [name, value]) => {
    prices[name] = { unit: value.total / value.quantity, quantity: value.quantity };
    return prices;
  }, {});
};

export function buildMonthlySummary(rows, now = new Date()) {
  const thisStart = monthStart(now);
  const nextStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisRows = rows.filter((row) => inRange(row, thisStart, nextStart));
  const prevRows = rows.filter((row) => inRange(row, prevStart, thisStart));

  const thisTotal = sumTotal(thisRows);
  const prevTotal = sumTotal(prevRows);

  const thisPrices = paidUnitPrices(thisRows);
  const prevPrices = paidUnitPrices(prevRows);

  // פער של פחות מ-5 אגורות נחשב אותו מחיר, כדי לא להציג "שינוי" על עיגול
  const changes = Object.entries(thisPrices)
    .filter(([name, value]) => prevPrices[name] && Math.abs(value.unit - prevPrices[name].unit) >= 0.05)
    .map(([name, value]) => ({
      name,
      before: prevPrices[name].unit,
      now: value.unit,
      quantity: value.quantity,
      diff: (value.unit - prevPrices[name].unit) * value.quantity,
    }))
    .sort((a, b) => a.diff - b.diff);

  const cheaper = changes.filter((change) => change.diff < 0);
  const dearer = changes.filter((change) => change.diff > 0).reverse();

  return {
    thisTotal,
    prevTotal,
    thisCount: thisRows.length,
    tripCount: new Set(thisRows.map((row) => new Date(row.created_date).toDateString())).size,
    deltaPct: prevTotal > 0 ? Math.round(((thisTotal - prevTotal) / prevTotal) * 100) : null,
    saved: cheaper.reduce((sum, change) => sum + Math.abs(change.diff), 0),
    extra: dearer.reduce((sum, change) => sum + change.diff, 0),
    cheaper: cheaper.slice(0, 3),
    dearer: dearer.slice(0, 3),
  };
}