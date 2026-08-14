import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const BATCH_SIZE = 20;
const STALE_THRESHOLD_HOURS = 20;

/**
 * Daily price sync — runs on app load.
 * Checks if any product prices are stale (older than ~20 hours).
 * If so, updates the stalest batch via InvokeLLM with web search.
 * This provides daily price refresh without a backend workflow.
 */
export function usePriceSync() {
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAndSync = async () => {
      try {
        // Get the stalest products (oldest last_updated first)
        const products = await base44.entities.Product.list("last_updated", BATCH_SIZE);
        if (products.length === 0) return;

        const oldest = products[0];
        const oldestDate = new Date(oldest.last_updated || oldest.created_date);
        const hoursSinceUpdate = (Date.now() - oldestDate.getTime()) / (1000 * 60 * 60);

        // Not stale enough — skip
        if (hoursSinceUpdate < STALE_THRESHOLD_HOURS) return;

        if (cancelled) return;
        setSyncing(true);

        const productNames = products.map(p => p.name);

        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Search the web for current average prices in Israeli supermarkets (Shufersal, Rami Levi, Victory, Yochananof, Osher Ad, Mega) for these grocery products. Return the average retail price in NIS (₪) for each product based on current online prices. If you cannot find an exact match, estimate based on similar products. Products: ${JSON.stringify(productNames)}`,
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

        if (updates.length > 0 && !cancelled) {
          await base44.entities.Product.bulkUpdate(updates);
        }
      } catch {
        // Silent fail — don't disrupt user experience
      } finally {
        if (!cancelled) setSyncing(false);
      }
    };

    checkAndSync();
    return () => { cancelled = true; };
  }, []);

  return { syncing };
}