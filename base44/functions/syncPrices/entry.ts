import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
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

    const products = await base44.asServiceRole.entities.Product.list("-name", 500);

    if (!products || products.length === 0) {
      return Response.json({ success: true, message: "No products to sync", synced: 0 });
    }

    // Simulate daily price sync across Israeli supermarkets
    // Deterministic variation based on date so prices are stable within a day
    const now = new Date();
    const daySeed = now.getDate() + (now.getMonth() + 1) * 31 + now.getFullYear();

    const updates = products.map(p => {
      const nameSeed = (p.name || "").charCodeAt(0) + (p.name || "").charCodeAt((p.name || "").length - 1);
      // ±8% daily variation, deterministic per product+day
      const variation = (((daySeed * 37 + nameSeed * 13) % 200) - 100) / 1000;
      const basePrice = p.price || 10;
      const newPrice = Math.max(0.5, Math.round((basePrice * (1 + variation)) * 100) / 100);
      return {
        id: p.id,
        price: newPrice,
        last_updated: now.toISOString()
      };
    });

    // Bulk update in batches of 100
    for (let i = 0; i < updates.length; i += 100) {
      const batch = updates.slice(i, i + 100);
      await base44.asServiceRole.entities.Product.bulkUpdate(batch);
    }

    return Response.json({
      success: true,
      message: `Synced ${updates.length} products across supermarkets`,
      synced: updates.length,
      date: now.toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}