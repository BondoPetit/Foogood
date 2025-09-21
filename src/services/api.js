/**
 * API service for Open Food Facts integration
 */

/**
 * Lookup product information from Open Food Facts
 * @param {string} barcode - Product barcode
 * @returns {Promise<Object|null>} Product information or null if not found
 */
export async function lookupOpenFoodFacts(barcode) {
  if (!barcode?.trim()) {
    return null;
  }

  const endpoints = [
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`,
    `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) continue;
      
      const data = await response.json();
      if (data.status !== 1 || !data.product) continue;

      const product = data.product;
      return {
        displayName: product.product_name || `Produkt ${barcode}`,
        imageUrl: product.image_url || product.image_front_url || null
      };
    } catch (error) {
      console.warn(`Failed to fetch from ${endpoint}:`, error);
      continue;
    }
  }

  return null;
}