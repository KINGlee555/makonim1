import { useEffect, useState } from "react";

const BATCH_SIZE = 20;
const STALE_THRESHOLD_HOURS = 20;
const SYNC_HOUR = 7; // 7 AM daily price refresh

/**
 * Daily price sync — runs on app load.
 * Checks if it's past 7 AM and prices haven't been synced since last 7 AM.
 * If stale, updates the stalest batch via backend with web search.
 * Also sets a timer to sync at the next 7 AM if the app stays open.
 */
export function usePriceSync() {
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let syncTimer = null;

    const checkAndSync = async () => {
      try {
        // TODO: Get the stalest products (oldest last_updated first) from your new backend
        // Mocking an empty array for now
        const products = [];

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

        // TODO: Call your new backend endpoint that triggers the LLM/price scraping logic
        // Simulating a network request for now
        await new Promise(resolve => setTimeout(resolve, 1000));

        const result = { prices: [] }; // Mock empty response

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

        // The same product might be found twice in the same batch — unify by ID to avoid sending duplicates
        const uniqueUpdates = [...new Map(updates.map(u => [u.id, u])).values()];
        if (uniqueUpdates.length > 0 && !cancelled) {
          // TODO: Bulk update the products in your new backend database
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