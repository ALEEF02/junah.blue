import React, { useEffect, useMemo, useState } from 'react';
import { colornames } from 'color-name-list';
import { api, formatCurrency } from '../lib/api';
import { savePendingCheckout } from '../lib/checkoutFeedback';
import { ApparelProduct } from '../types/api';
import { SectionHeader } from '../components/SectionHeader';

interface CartItem {
  productId: string;
  variantId: string | number;
  quantity: number;
  label: string;
  amountCents: number;
}

interface ProductOptionSelection {
  color: string;
  size: string;
}

interface ParsedVariant {
  variant: ApparelProduct['variants'][number];
  color: string;
  size: string;
}

const stripeColors = ['#111827', '#2563eb', '#22d3ee', '#f43f5e', '#f59e0b', '#84cc16'];
const MAX_STRIPE_SEGMENTS = 10;
const fallbackSelection: ProductOptionSelection = { color: '', size: '' };
const sizeLabelPattern =
  /^(xxxs|xxs|xs|s|m|l|xl|xxl|xxxl|2xl|3xl|4xl|5xl|6xl|7xl|one size|onesize|os|osfa|osfm|youth (xxs|xs|s|m|l|xl)|toddler .+|infant .+)$/i;

const normalizeColorText = (value: string) =>
  value
    .toLowerCase()
    .replace(/\/.*/g, ' ')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const namedColorEntries = (colornames as Array<{ name: string; hex: string }>)
  .map((entry) => ({
    normalizedName: normalizeColorText(entry.name),
    hex: entry.hex.toLowerCase()
  }))
  .filter((entry): entry is { normalizedName: string; hex: string } => Boolean(entry.normalizedName && entry.hex));

const uniqueValues = (values: string[]) => Array.from(new Set(values.filter(Boolean)));
const isSizeLabel = (value: string) => sizeLabelPattern.test(value.trim());

const parseVariantDimensions = (title: string): ProductOptionSelection => {
  const parts = title
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { color: 'Default', size: 'One Size' };
  }

  let sizeIndex = parts.findIndex((part) => isSizeLabel(part));
  if (sizeIndex === -1 && parts.length > 1) {
    sizeIndex = parts.length - 1;
  }

  const size = sizeIndex >= 0 ? parts[sizeIndex] : 'One Size';
  const colorCandidate = parts.find((part, index) => index !== sizeIndex && !isSizeLabel(part));
  const color = colorCandidate || parts[0] || 'Default';

  return {
    color,
    size
  };
};

const isWholeWordMatch = (title: string, match: string, startIndex: number) => {
  const before = startIndex === 0 || title[startIndex - 1] === ' ';
  const endIndex = startIndex + match.length;
  const after = endIndex === title.length || title[endIndex] === ' ';
  return before && after;
};

const pickBestColorMatch = (
  normalizedTitle: string,
  options: Array<{ normalizedName: string; hex: string; index: number; wholeWord: boolean }>
) => {
  if (options.length === 0) return null;

  // 1) Exact match
  const exactMatch = options.find((option) => option.normalizedName === normalizedTitle);
  if (exactMatch) return exactMatch;

  // 2) First whole-word match
  const firstWholeWord = options.find((option) => option.wholeWord);
  if (firstWholeWord) return firstWholeWord;

  // 3) Most letters
  return options.reduce((best, current) =>
    current.normalizedName.length > best.normalizedName.length ? current : best
  );
};

const extractStripeColors = (product: ApparelProduct) => {
  const foundColors: string[] = [];

  console.log("Colors for " + product.title);

  product.variants.forEach((variant) => {
    const normalizedTitle = normalizeColorText(variant.title);
    console.log("\t" + variant.title + " --> " + normalizedTitle);

    const options = namedColorEntries
      .map((entry) => {
        const index = normalizedTitle.indexOf(entry.normalizedName);
        if (index === -1) return null;

        return {
          ...entry,
          index,
          wholeWord: isWholeWordMatch(normalizedTitle, entry.normalizedName, index)
        };
      })
      .filter(
        (
          entry
        ): entry is {
          normalizedName: string;
          hex: string;
          index: number;
          wholeWord: boolean;
        } => Boolean(entry)
      );

    const selected = pickBestColorMatch(normalizedTitle, options);
    if (selected && !foundColors.includes(selected.hex)) {
      console.log("\t" + selected.normalizedName);
      foundColors.push(selected.hex);
    }
  });

  const palette = foundColors.length > 0 ? foundColors : stripeColors;
  const expanded: string[] = [];

  while (expanded.length < MAX_STRIPE_SEGMENTS && expanded.length < palette.length) {
    expanded.push(palette[expanded.length]);
  }

  return expanded;
};

export const ApparelPage: React.FC = () => {
  const [products, setProducts] = useState<ApparelProduct[]>([]);
  const [optionSelection, setOptionSelection] = useState<Record<string, ProductOptionSelection>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [buyerEmail, setBuyerEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.getApparelProducts();
        setProducts(response.products);
        setOptionSelection(
          response.products.reduce<Record<string, ProductOptionSelection>>((acc, product) => {
            if (product.variants[0]) {
              acc[product.id] = parseVariantDimensions(product.variants[0].title);
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
  const productStripeColors = useMemo(
    () =>
      products.reduce<Record<string, string[]>>((acc, product) => {
        acc[product.id] = extractStripeColors(product);
        return acc;
      }, {}),
    [products]
  );
  const productVariantMatrix = useMemo(
    () =>
      products.reduce<Record<string, ParsedVariant[]>>((acc, product) => {
        acc[product.id] = product.variants.map((variant) => {
          const parsed = parseVariantDimensions(variant.title);
          return {
            variant,
            color: parsed.color,
            size: parsed.size
          };
        });
        return acc;
      }, {}),
    [products]
  );

  const addToCart = (product: ApparelProduct, variant: ApparelProduct['variants'][number]) => {
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
  const onColorChange = (productId: string, color: string) => {
    const parsedVariants = productVariantMatrix[productId] || [];

    setOptionSelection((current) => {
      const currentSelection = current[productId] || fallbackSelection;
      const nextSizes = uniqueValues(
        parsedVariants.filter((entry) => entry.color === color).map((entry) => entry.size)
      );
      const nextSize = nextSizes.includes(currentSelection.size) ? currentSelection.size : nextSizes[0] || '';

      return {
        ...current,
        [productId]: {
          color,
          size: nextSize
        }
      };
    });
  };
  const onSizeChange = (productId: string, size: string) => {
    const parsedVariants = productVariantMatrix[productId] || [];

    setOptionSelection((current) => {
      const currentSelection = current[productId] || fallbackSelection;
      const nextColors = uniqueValues(
        parsedVariants.filter((entry) => entry.size === size).map((entry) => entry.color)
      );
      const nextColor = nextColors.includes(currentSelection.color) ? currentSelection.color : nextColors[0] || '';

      return {
        ...current,
        [productId]: {
          color: nextColor,
          size
        }
      };
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

      savePendingCheckout({
        sessionId: response.sessionId,
        type: 'apparel',
        createdAt: new Date().toISOString(),
        currency: 'USD',
        buyerEmail: buyerEmail || undefined,
        amountTotalCents: cartTotal,
        lineItems: cart.map((item) => ({
          label: item.label,
          quantity: item.quantity,
          amountCents: item.amountCents
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
        description="Browse live apparel inventory and complete checkout directly on Junah.blue."
      />

      {error ? <p className="rounded border border-red-300 bg-red-50 p-3 text-red-700">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const parsedVariants = productVariantMatrix[product.id] || [];
            const currentSelection = optionSelection[product.id] || fallbackSelection;
            const selectedVariantEntry =
              parsedVariants.find(
                (entry) => entry.color === currentSelection.color && entry.size === currentSelection.size
              ) ||
              parsedVariants.find((entry) => entry.color === currentSelection.color) ||
              parsedVariants.find((entry) => entry.size === currentSelection.size) ||
              parsedVariants[0];
            const selectedVariant = selectedVariantEntry?.variant;
            const selectedColor = selectedVariantEntry?.color || currentSelection.color;
            const selectedSize = selectedVariantEntry?.size || currentSelection.size;
            const availableColors = uniqueValues(
              parsedVariants
                .filter((entry) => !selectedSize || entry.size === selectedSize)
                .map((entry) => entry.color)
            );
            const availableSizes = uniqueValues(
              parsedVariants
                .filter((entry) => !selectedColor || entry.color === selectedColor)
                .map((entry) => entry.size)
            );

            return (
              <article key={product.id} className="border border-brand-mid bg-brand-cream">
                <div className="border-b border-brand-mid p-3">
                  <p className="font-semibold text-brand-dark">{selectedVariant?.title || 'Variant'}</p>
                  <div className="mt-2 flex gap-1">
                    {(productStripeColors[product.id] || stripeColors).map((color, stripeIndex) => (
                      <div
                        key={`${product.id}-${color}-${stripeIndex}`}
                        style={{ backgroundColor: color }}
                        className="h-1 w-full"
                      />
                    ))}
                  </div>
                </div>

                <div className="aspect-square bg-brand-light/10">
                  {(selectedVariant?.imageUrl || product.imageUrl) ? (
                    <img
                      src={selectedVariant?.imageUrl || product.imageUrl}
                      alt={`${product.title} - ${selectedVariant?.title || 'Variant'}`}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <div className="space-y-3 p-3">
                  <h3 className="font-mono text-2xl leading-tight text-brand-dark">{product.title}</h3>

                  <label className="block text-sm">
                    <span className="mb-1 block uppercase tracking-[0.2em] text-brand-mid">Color</span>
                    <select
                      value={selectedColor}
                      onChange={(e) => onColorChange(product.id, e.target.value)}
                      className="w-full border border-brand-mid bg-brand-light/10 px-2 py-2"
                    >
                      {availableColors.map((color) => (
                        <option key={`${product.id}-color-${color}`} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block uppercase tracking-[0.2em] text-brand-mid">Size</span>
                    <select
                      value={selectedSize}
                      onChange={(e) => onSizeChange(product.id, e.target.value)}
                      className="w-full border border-brand-mid bg-brand-light/10 px-2 py-2"
                    >
                      {availableSizes.map((size) => (
                        <option key={`${product.id}-size-${size}`} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    onClick={() => selectedVariant && addToCart(product, selectedVariant)}
                    disabled={!selectedVariant}
                    className="w-full bg-brand-mid px-4 py-2 font-semibold text-brand-cream transition hover:bg-brand-dark"
                  >
                    Add To Cart {selectedVariant ? `- ${formatCurrency(selectedVariant.priceCents)}` : ''}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="h-fit border border-brand-mid bg-brand-light/10 p-4">
          <h3 className="font-mono text-3xl text-brand-dark">Cart</h3>
          <div className="mt-3 space-y-3">
            {cart.length === 0 ? <p className="text-brand-mid">No items yet.</p> : null}
            {cart.map((item, idx) => (
              <div key={`${item.productId}-${item.variantId}-${idx}`} className="border border-brand-mid p-2">
                <p className="text-sm text-brand-dark">{item.label}</p>
                <p className="text-sm text-brand-mid">
                  Qty {item.quantity} - {formatCurrency(item.amountCents)} each
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-brand-mid pt-3">
            <label className="block text-sm">
              <span className="mb-1 block uppercase tracking-[0.2em] text-brand-mid">Receipt Email (optional)</span>
              <input
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                className="w-full border border-brand-mid px-2 py-2"
                placeholder="you@example.com"
              />
            </label>

            <p className="mt-3 text-lg text-brand-dark">Total: {formatCurrency(cartTotal)}</p>
            <button
              onClick={checkout}
              className="mt-3 w-full rounded-full border border-brand-mid bg-brand-mid px-4 py-2 text-brand-cream hover:bg-brand-dark"
            >
              Checkout Apparel
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
