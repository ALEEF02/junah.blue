import React, { useEffect, useMemo, useState } from 'react';
import { api, formatCurrency } from '../lib/api';
import { ApparelProduct } from '../types/api';
import { SectionHeader } from '../components/SectionHeader';

interface CartItem {
  productId: string;
  variantId: string | number;
  quantity: number;
  label: string;
  amountCents: number;
}

const stripeColors = ['#111827', '#2563eb', '#22d3ee', '#f43f5e', '#f59e0b', '#84cc16'];

export const ApparelPage: React.FC = () => {
  const [products, setProducts] = useState<ApparelProduct[]>([]);
  const [variantSelection, setVariantSelection] = useState<Record<string, string | number>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [buyerEmail, setBuyerEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.getApparelProducts();
        setProducts(response.products);
        setVariantSelection(
          response.products.reduce<Record<string, string | number>>((acc, product) => {
            if (product.variants[0]) {
              acc[product.id] = product.variants[0].id;
            }
            return acc;
          }, {})
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load apparel products');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.amountCents * item.quantity, 0),
    [cart]
  );

  const addToCart = (product: ApparelProduct) => {
    const variantId = variantSelection[product.id];
    const variant = product.variants.find((entry) => String(entry.id) === String(variantId));
    if (!variant) return;

    setCart((current) => {
      const existing = current.find(
        (item) => item.productId === product.id && String(item.variantId) === String(variant.id)
      );

      if (existing) {
        return current.map((item) =>
          item === existing
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, 10)
              }
            : item
        );
      }

      return [
        ...current,
        {
          productId: product.id,
          variantId: variant.id,
          quantity: 1,
          label: `${product.title} - ${variant.title}`,
          amountCents: variant.priceCents
        }
      ];
    });
  };

  const checkout = async () => {
    try {
      setError(null);

      if (cart.length === 0) {
        setError('Add at least one apparel item to continue.');
        return;
      }

      const response = await api.createApparelCheckoutSession({
        buyerEmail: buyerEmail || undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity
        }))
      });

      window.location.assign(response.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start apparel checkout');
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">Loading apparel...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 md:px-6">
      <SectionHeader
        eyebrow="Merch"
        title="Apparel"
        description="Browse live Printify inventory and complete checkout directly on Junah.blue."
      />

      {error ? <p className="rounded border border-red-300 bg-red-50 p-3 text-red-700">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product, index) => {
            const selectedVariant =
              product.variants.find((entry) => String(entry.id) === String(variantSelection[product.id])) ||
              product.variants[0];

            return (
              <article key={product.id} className="border border-slate-400 bg-stone-100">
                <div className="border-b border-slate-300 p-3">
                  <p className="font-semibold text-slate-900">{selectedVariant?.title || 'Variant'}</p>
                  <div className="mt-2 flex gap-1">
                    {stripeColors.map((color) => (
                      <div key={`${product.id}-${color}`} style={{ backgroundColor: color }} className="h-1 w-full" />
                    ))}
                  </div>
                </div>

                <div className="aspect-square bg-slate-100">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" /> : null}
                </div>

                <div className="space-y-3 p-3">
                  <h3 className="font-mono text-2xl leading-tight text-slate-900">{product.title}</h3>

                  <label className="block text-sm">
                    <span className="mb-1 block uppercase tracking-[0.2em] text-slate-600">Variant</span>
                    <select
                      value={String(variantSelection[product.id] || '')}
                      onChange={(e) =>
                        setVariantSelection((current) => ({
                          ...current,
                          [product.id]: e.target.value
                        }))
                      }
                      className="w-full border border-slate-400 bg-white px-2 py-2"
                    >
                      {product.variants.map((variant) => (
                        <option key={variant.id} value={String(variant.id)}>
                          {variant.title} - {formatCurrency(variant.priceCents)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400"
                  >
                    Add To Cart {selectedVariant ? `- ${formatCurrency(selectedVariant.priceCents)}` : ''}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="h-fit border border-slate-500 bg-white p-4">
          <h3 className="font-mono text-3xl text-slate-900">Cart</h3>
          <div className="mt-3 space-y-3">
            {cart.length === 0 ? <p className="text-slate-600">No items yet.</p> : null}
            {cart.map((item, idx) => (
              <div key={`${item.productId}-${item.variantId}-${idx}`} className="border border-slate-300 p-2">
                <p className="text-sm text-slate-900">{item.label}</p>
                <p className="text-sm text-slate-600">
                  Qty {item.quantity} - {formatCurrency(item.amountCents)} each
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-slate-200 pt-3">
            <label className="block text-sm">
              <span className="mb-1 block uppercase tracking-[0.2em] text-slate-600">Receipt Email (optional)</span>
              <input
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                className="w-full border border-slate-400 px-2 py-2"
                placeholder="you@example.com"
              />
            </label>

            <p className="mt-3 text-lg text-slate-800">Total: {formatCurrency(cartTotal)}</p>
            <button
              onClick={checkout}
              className="mt-3 w-full rounded-full border border-slate-400 bg-lime-300 px-4 py-2 text-slate-900 hover:bg-lime-200"
            >
              Checkout Apparel
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
