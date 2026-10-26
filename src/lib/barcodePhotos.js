// Real photo of the product by its barcode. The barcode is the exact identifier, so what returns
// from the server is the photo of the product itself — or nothing, in which case the product icon remains.
// A barcode we already queried is not sent again in the same session.
const sessionPhotos = new Map();

export async function photoByBarcode(barcode) {
  const code = String(barcode || "").trim();
  if (!code) return "";
  if (sessionPhotos.has(code)) return sessionPhotos.get(code);
  try {
    // TODO: Replace with your new backend cloud function or API endpoint to fetch product photos by barcode
    // Simulating a network request for now
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mocking an empty response
    const url = "";

    sessionPhotos.set(code, url);
    return url;
  } catch {
    return "";
  }
}