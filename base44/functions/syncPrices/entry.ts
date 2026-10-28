import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// אין כאן המצאת מחירים.
// המחירים היחידים שמוצגים באפליקציה מגיעים מקבצי שקיפות המחירים הרשמיים של הרשתות
// (buildCatalog ו-chainPrices), ולכן הפונקציה הזו לא כותבת מחירים משוערים לשום מקום.
// היא בודקת מה נאסף היום בפועל ומחזירה דוח אמת — כדי שנדע מיד אם הסנכרון האמיתי נתקע.
const rowsOf = (result: any): any[] => (Array.isArray(result) ? result : result?.items || []);

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    // If a user is calling directly, require admin
    try {
      const user = await base44.auth.me();
      if (user && user.role !== 'admin') {
        return Response.json({ error: 'Admin access required' }, { status: 403 });
      }
    } catch {
      // No user (called from workflow) — proceed with service role
    }

    const day = new Date().toISOString().slice(0, 10);

    let shelfPricesToday = 0;
    let catalogToday = 0;
    try {
      shelfPricesToday = rowsOf(await base44.asServiceRole.entities.ChainPrice.filter({ day }, '-created_date', 1)).length;
    } catch (error) {
      console.error('chain price check failed', error instanceof Error ? error.message : error);
    }
    try {
      catalogToday = rowsOf(await base44.asServiceRole.entities.CatalogProduct.filter({ day }, '-created_date', 1)).length;
    } catch (error) {
      console.error('catalog check failed', error instanceof Error ? error.message : error);
    }

    const upToDate = shelfPricesToday > 0 || catalogToday > 0;
    console.log('real price check', { day, shelfPricesToday, catalogToday });

    return Response.json({
      success: true,
      message: upToDate
        ? 'המחירים של היום נאספו מקבצי השקיפות הרשמיים'
        : 'לא נאספו מחירים להיום — יש להריץ את איסוף הקטלוג',
      day,
      realPricesForToday: upToDate,
      synced: 0
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Price check failed' }, { status: 500 });
  }
}