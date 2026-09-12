import { base44 } from "@/api/base44Client";

const schema = {
  type: "object",
  properties: {
    deals: {
      type: "array",
      items: {
        type: "object",
        properties: {
          product_name: { type: "string" },
          supermarket: { type: "string" },
          address: { type: "string" },
          sale_price: { type: "number" },
          regular_price: { type: "number" },
          distance_km: { type: "number" },
          open_on_saturday: { type: "boolean" },
          saturday_hours: { type: "string" },
          google_business_url: { type: "string" },
          offer_source_url: { type: "string" },
          verified: { type: "boolean" }
        }
      }
    }
  },
  required: ["deals"]
};

export async function getNearbyDeals(latitude, longitude) {
  const result = await base44.integrations.Core.InvokeLLM({
    model: "gemini_3_flash",
    add_context_from_internet: true,
    response_json_schema: schema,
    prompt: `Find up to 5 current sale offers for common essential grocery products near coordinates ${latitude}, ${longitude} in Israel. Use only offers currently published by the retailer, and independently verify each store's name, address and Saturday opening status against its public Google Business/Google Maps listing. Return verified=false if either the current offer source or Google business information cannot be confirmed. Include direct source URLs and exact Saturday hours. Prefer milk, bread, eggs, vegetables, rice, oil and cleaning essentials. Do not estimate or invent prices, hours, addresses or distance.`
  });

  return (result.deals || []).filter(deal =>
    deal.verified === true &&
    /^https?:\/\//.test(deal.offer_source_url || "") &&
    /^https?:\/\/(www\.)?(google\.[^/]+\/maps|maps\.google\.|maps\.app\.goo\.gl)/.test(deal.google_business_url || "")
  ).slice(0, 5);
}