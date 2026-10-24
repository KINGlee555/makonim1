import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const BATCH_SIZE = 20;
const STALE_THRESHOLD_HOURS = 20;
const SYNC_HOUR = 7; // 7 AM daily price refresh

/**
 * Daily price sync — runs on app load.
 * Checks if it's past 7 AM and prices haven't been synced since last 7 AM.
 * If stale, updates the stalest batch via InvokeLLM with web search.
 * Also sets a timer to sync at the next 7 AM if the app stays open.
 */
export function usePriceSync() {
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let syncTimer = null;

    const checkAndSync = async () => {
      try {
        // Get the stalest products (oldest last_updated first)
        const products = await base44.entities.Product.list("last_updated", BATCH_SIZE);
        if (products.length === 0) return;

        const oldest = products[0];
        const oldestDate = new Date(oldest.last_updated || oldest.created_date);
        const now = new Date();

        // Calculate today's 7 AM
        const today7am = new Date(now);
        today7am.setHours(SYNC_HOUR, 0, 0, 0);

        // If we haven't passed 7 AM today, check if prices are from before yesterday's 7 AM
        // If we have passed 7 AM today, check if prices are from before today's 7 AM
        const lastSyncBoundary = now >= today7am ? today7am : new Date(today7am.getTime() - 24 * 60 * 60 * 1000);

        // If prices were updated after the last sync boundary, they're fresh
        if (oldestDate >= lastSyncBoundary) return;

        if (cancelled) return;
        setSyncing(true);

        const productNames = products.map(p => p.name);

        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Search the web for current average prices in Israeli supermarkets (Shufersal, Rami Levi, Victory, Yochananof, Osher Ad, Mega, Tiv Taam, Yenot Bitan, Coop, Osher Ad) for these grocery products. Return the average retail price in NIS (₪) for each product based on current online prices. If you cannot find an exact match, estimate based on similar products. Products: ${JSON.stringify(productNames)}`,
          add_context_from_internet: true,
          model: "gemini_3_flash",
          response_json_schema: {
            type: "object",
            properties: {
              prices: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    price: { type: "number" }
                  },
                  required: ["name", "price"]
                }
              }
            },
            required: ["prices"]
          }
        });

        if (cancelled) return;

        const updatedPrices = result.prices || [];
        const updates = [];
        for (const item of updatedPrices) {
          const product = products.find(p =>
            p.name === item.name ||
            p.name.includes(item.name) ||
            item.name.includes(p.name)
          );
          if (product && item.price > 0) {
            updates.push({
              id: product.id,
              price: Math.round(item.price * 100) / 100,
              last_updated: new Date().toISOString()
            });
          }
        }

        // אותו מוצר יכול להימצא פעמיים באותו סבב — מאחדים לפי מזהה כדי לא לשלוח כפילות
        const uniqueUpdates = [...new Map(updates.map(u => [u.id, u])).values()];
        if (uniqueUpdates.length > 0 && !cancelled) {
          await base44.entities.Product.bulkUpdate(uniqueUpdates);
        }
      } catch {
        // Silent fail — don't disrupt user experience
      } finally {
        if (!cancelled) setSyncing(false);
      }
    };

    // Schedule next 7 AM sync
    const scheduleNextSync = () => {
      const now = new Date();
      const next7am = new Date(now);
      next7am.setHours(SYNC_HOUR, 0, 0, 0);
      if (next7am <= now) next7am.setDate(next7am.getDate() + 1);
      const msUntil7am = next7am - now;
      syncTimer = setTimeout(() => {
        checkAndSync();
        scheduleNextSync(); // Schedule the next one
      }, msUntil7am);
    };

    checkAndSync();
    scheduleNextSync();

    return () => {
      cancelled = true;
      if (syncTimer) clearTimeout(syncTimer);
    };
  }, []);

  return { syncing };
}