import { printifyClient } from '../config/printify.js';
import { env, hasPrintifyConfigured } from '../config/env.js';
import ApparelCatalogCache from '../models/ApparelCatalogCache.js';

const assertPrintify = () => {
  if (!hasPrintifyConfigured || !printifyClient) {
    throw new Error('Printify is not configured. Set PRINTIFY_API_TOKEN and PRINTIFY_SHOP_ID.');
  }
};

const mapPrintifyProduct = (product) => {
  const imageUrl = product.images?.[0]?.src || '';

  return {
    id: product.id,
    title: product.title,
    description: product.description || '',
    imageUrl,
    variants: (product.variants || [])
      .filter((variant) => variant.is_enabled)
      .map((variant) => ({
        id: variant.id,
        title: variant.title,
        priceCents: variant.price,
        sku: variant.sku || '',
        isAvailable: variant.is_available
      }))
  };
};

export const syncPrintifyCatalog = async (force = false) => {
  assertPrintify();

  const cache = await ApparelCatalogCache.findOne({ source: 'printify' }).lean();
  const now = Date.now();

  if (!force && cache?.syncedAt) {
    const ageSeconds = (now - new Date(cache.syncedAt).getTime()) / 1000;
    if (ageSeconds < env.APPAREL_SYNC_TTL_SECONDS) {
      return cache.products;
    }
  }

  const { data } = await printifyClient.get(`/shops/${env.PRINTIFY_SHOP_ID}/products.json`);
  const products = (data?.data || []).map(mapPrintifyProduct).filter((item) => item.variants.length > 0);

  await ApparelCatalogCache.findOneAndUpdate(
    { source: 'printify' },
    {
      source: 'printify',
      products,
      syncedAt: new Date()
    },
    { upsert: true, new: true }
  );

  return products;
};

export const createPrintifyOrder = async ({ sessionId, customer, items }) => {
  assertPrintify();

  const [firstName, ...lastParts] = (customer.name || 'Buyer').split(' ');
  const lastName = lastParts.join(' ') || 'Customer';

  const payload = {
    external_id: sessionId,
    line_items: items.map((item) => ({
      product_id: item.productId,
      variant_id: Number(item.variantId),
      quantity: Number(item.quantity)
    })),
    shipping_method: 1,
    send_shipping_notification: true,
    address_to: {
      first_name: firstName,
      last_name: lastName,
      email: customer.email || '',
      country: customer.address?.country || 'US',
      region: customer.address?.state || customer.address?.province || '',
      city: customer.address?.city || '',
      address1: customer.address?.line1 || '',
      address2: customer.address?.line2 || '',
      zip: customer.address?.postal_code || ''
    }
  };

  const { data } = await printifyClient.post(`/shops/${env.PRINTIFY_SHOP_ID}/orders.json`, payload);
  return data;
};
