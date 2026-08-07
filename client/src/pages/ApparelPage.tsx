import React, { useEffect, useMemo, useRef, useState } from 'react';
import { colornames } from 'color-name-list';
import { api, formatCurrency } from '../lib/api';
import { savePendingCheckout } from '../lib/checkoutFeedback';
import { ApparelProduct } from '../types/api';
import { SectionHeader } from '../components/SectionHeader';
import { RotateCcw, X } from 'lucide-react';
import { useApparelCart } from '../context/ApparelCartContext';

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

colornames.push({ name: 'chili', hex: '#ac1e3a' });
const namedColorEntries = (colornames as Array<{ name: string; hex: string }>)
  .map((entry) => ({
    normalizedName: normalizeColorText(entry.name),
    hex: entry.hex.toLowerCase()
  }))
  .filter((entry): entry is { normalizedName: string; hex: string } => Boolean(entry.normalizedName && entry.hex));

const uniqueValues = (values: string[]) => Array.from(new Set(values.filter(Boolean)));
const isSizeLabel = (value: string) => sizeLabelPattern.test(value.trim());

const parseVariantTitleDimensions = (title: string): ProductOptionSelection => {
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

const getVariantDimensions = (
  variant: ApparelProduct['variants'][number],
  product?: ApparelProduct
): ProductOptionSelection => {
  const parsed = parseVariantTitleDimensions(variant.title);
  const productHasColor = product?.hasColorOption ?? product?.variants.some((entry) => Boolean(entry.color));
  const productHasSize = product?.hasSizeOption ?? product?.variants.some((entry) => Boolean(entry.size));

  return {
    color: productHasColor === false ? '' : variant.color || parsed.color,
    size: productHasSize === false ? '' : variant.size || parsed.size
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

  const exactMatch = options.find((option) => option.normalizedName === normalizedTitle);
  if (exactMatch) return exactMatch;

  const firstWholeWord = options.find((option) => option.wholeWord);
  if (firstWholeWord) return firstWholeWord;

  return options.reduce((best, current) =>
    current.normalizedName.length > best.normalizedName.length ? current : best
  );
};

const getNamedColorHex = (color: string) => {
  const normalizedTitle = normalizeColorText(color);
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

  return pickBestColorMatch(normalizedTitle, options)?.hex;
};

const extractStripeColors = (product: ApparelProduct) => {
  const hasColorOption = product.hasColorOption ?? product.variants.some((variant) => Boolean(variant.color));
  if (!hasColorOption) return [];

  const foundColors: string[] = [];

  product.variants.forEach((variant) => {
    if (variant.colorHexes?.length) {
      variant.colorHexes.forEach((colorHex) => {
        const normalizedHex = colorHex.toLowerCase();
        if (!foundColors.includes(normalizedHex)) {
          foundColors.push(normalizedHex);
        }
      });
      return;
    }

    const fallbackColor = variant.color || getVariantDimensions(variant, product).color;
    const fallbackHex = getNamedColorHex(fallbackColor);
    if (fallbackHex && !foundColors.includes(fallbackHex)) {
      foundColors.push(fallbackHex);
    }
  });

  const palette = foundColors.length > 0 ? foundColors : stripeColors;
  const expanded: string[] = [];

  while (expanded.length < MAX_STRIPE_SEGMENTS && expanded.length < palette.length) {
    expanded.push(palette[expanded.length]);
  }

  return expanded;
};

const ThreeDotLoader = () => (
  <div className="flex items-center gap-1" aria-hidden="true">
    {[0, 1, 2].map((dot) => (
      <span
        key={dot}
          className="h-2 w-2 animate-bounce rounded-full bg-apparel-red"
        style={{ animationDelay: `${dot * 120}ms` }}
      />
    ))}
  </div>
);

interface ApparelImageProps {
  imageUrl?: string;
  images?: ApparelProduct['images'];
  alt: string;
}

const getPositionedImageUrl = (images: NonNullable<ApparelProduct['images']> = [], position: 'front' | 'back') =>
  images.find((image) => image.position === position)?.src;

const ApparelImage: React.FC<ApparelImageProps> = ({ imageUrl, images = [], alt }) => {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [side, setSide] = useState<'front' | 'back'>('front');
  const frontImageUrl = getPositionedImageUrl(images, 'front') || imageUrl;
  const backImageUrl = getPositionedImageUrl(images, 'back');
  const activeImageUrl = side === 'back' && backImageUrl ? backImageUrl : frontImageUrl;
  const hasBackImage = Boolean(backImageUrl);

  useEffect(() => {
    if (!hasBackImage) {
      setSide('front');
    }
  }, [hasBackImage, images]);

  useEffect(() => {
    if (!activeImageUrl) {
      setImageLoading(false);
      return;
    }

    const image = imageRef.current;
    setImageLoading(!image?.complete);
  }, [activeImageUrl]);

  return (
    <div className="relative aspect-square bg-brand-light/10">
      {activeImageUrl ? (
        <img
          ref={imageRef}
          src={activeImageUrl}
          alt={alt}
          onLoad={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
          className={`h-full w-full object-cover transition-opacity duration-200 ${
            imageLoading ? 'opacity-40' : 'opacity-100'
          }`}
        />
      ) : null}
      {hasBackImage ? (
        <button
          type="button"
          onClick={() => setSide((current) => (current === 'front' ? 'back' : 'front'))}
          className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center bg-apparel-red text-white shadow-sm transition hover:bg-apparel-red-dark"
          aria-label={`Show ${side === 'front' ? 'back' : 'front'} side`}
          title={`Show ${side === 'front' ? 'back' : 'front'} side`}
        >
          <RotateCcw className={`h-5 w-5 transition-transform ${side === 'back' ? 'rotate-180' : ''}`} />
        </button>
      ) : null}
      {imageLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
          <ThreeDotLoader />
        </div>
      ) : null}
    </div>
  );
};

export const ApparelPage: React.FC = () => {
  const [products, setProducts] = useState<ApparelProduct[]>([]);
  const [optionSelection, setOptionSelection] = useState<Record<string, ProductOptionSelection>>({});
  const { cart, cartTotal, addItem, removeItem } = useApparelCart();
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
              acc[product.id] = getVariantDimensions(product.variants[0], product);
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
          const parsed = getVariantDimensions(variant, product);
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

  const addToCart = (product: ApparelProduct, variant: ApparelProduct['variants'][number], variantLabel = variant.title) => {
    addItem({
      productId: product.id,
      variantId: variant.id,
      label: `${product.title}${variantLabel ? ` - ${variantLabel}` : ''}`,
      amountCents: variant.priceCents
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
    return <div className="mx-auto max-w-6xl px-4 py-10 text-apparel-red md:px-6">Loading apparel...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 md:px-6">
      <SectionHeader
        title="APPAREL"
        description="Browse Junah merch."
        titleClassName="text-apparel-red"
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
            const selectedVariantLabel =
              [selectedColor, selectedSize].filter(Boolean).join(' / ') || selectedVariant?.title || 'Variant';
            const hasColorOption =
              product.hasColorOption ?? parsedVariants.some((entry) => Boolean(entry.color));
            const hasSizeOption =
              product.hasSizeOption ?? parsedVariants.some((entry) => Boolean(entry.size));
            const showColorSelect = hasColorOption && uniqueValues(parsedVariants.map((entry) => entry.color)).length > 1;
            const showSizeSelect = hasSizeOption && uniqueValues(parsedVariants.map((entry) => entry.size)).length > 1;

            return (
              <article key={product.id} className="border border-apparel-red bg-white">
                <div className="border-b border-apparel-red p-3">
                  <p className="font-semibold text-brand-ink">{selectedVariantLabel}</p>
                  {(productStripeColors[product.id] || []).length ? <div className="mt-2 flex gap-1">
                    {(productStripeColors[product.id] || stripeColors).map((color, stripeIndex) => (
                      <div
                        key={`${product.id}-${color}-${stripeIndex}`}
                        style={{ backgroundColor: color }}
                        className="h-1 w-full"
                      />
                    ))}
                  </div> : null}
                </div>

                <ApparelImage
                  imageUrl={selectedVariant?.imageUrl || product.imageUrl}
                  images={selectedVariant?.images?.length ? selectedVariant.images : product.images}
                  alt={`${product.title} - ${selectedVariantLabel}`}
                />

                <div className="space-y-3 p-3">
                  <h3 className="font-mono text-2xl leading-tight text-brand-ink">{product.title}</h3>

                  {showColorSelect ? <label className="block text-sm">
                    <span className="mb-1 block uppercase text-apparel-red">Color</span>
                    <select
                      value={selectedColor}
                      onChange={(e) => onColorChange(product.id, e.target.value)}
                      className="w-full border border-apparel-red bg-white px-2 py-2 focus:border-apparel-red-dark"
                    >
                      {availableColors.map((color) => (
                        <option key={`${product.id}-color-${color}`} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </label> : null}

                  {showSizeSelect ? <label className="block text-sm">
                    <span className="mb-1 block uppercase text-apparel-red">Size</span>
                    <select
                      value={selectedSize}
                      onChange={(e) => onSizeChange(product.id, e.target.value)}
                      className="w-full border border-apparel-red bg-white px-2 py-2 focus:border-apparel-red-dark"
                    >
                      {availableSizes.map((size) => (
                        <option key={`${product.id}-size-${size}`} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </label> : null}

                  <button
                    onClick={() => selectedVariant && addToCart(product, selectedVariant, selectedVariantLabel)}
                    disabled={!selectedVariant}
                    className="w-full bg-apparel-red px-4 py-3 font-semibold text-white transition hover:bg-apparel-red-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add To Cart {selectedVariant ? `- ${formatCurrency(selectedVariant.priceCents)}` : ''}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <aside id="cart" className="h-fit border border-apparel-red bg-brand-gray p-4">
          <h3 className="font-mono text-3xl text-apparel-red">Cart</h3>
          <div className="mt-3 space-y-3">
            {cart.length === 0 ? <p className="text-brand-ink">No items yet.</p> : null}
            {cart.map((item, idx) => (
              <div key={`${item.productId}-${item.variantId}-${idx}`} className="flex gap-2 border border-apparel-red bg-white p-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-brand-ink">{item.label}</p>
                  <p className="text-sm text-brand-ink/70">
                    Qty {item.quantity} - {formatCurrency(item.amountCents)} each
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId, item.variantId)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center text-apparel-red transition hover:bg-apparel-red hover:text-white"
                  aria-label={`Remove ${item.label} from cart`}
                  title="Remove item"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-apparel-red pt-3">
            <label className="block text-sm">
              <span className="mb-1 block uppercase text-apparel-red">Receipt Email (optional)</span>
              <input
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                className="w-full border border-apparel-red px-2 py-2"
                placeholder="you@example.com"
              />
            </label>

            <p className="mt-3 text-lg text-brand-ink">Total: {formatCurrency(cartTotal)}</p>
            <button
              onClick={checkout}
              className="mt-3 w-full bg-apparel-red px-4 py-3 text-white transition hover:bg-apparel-red-dark disabled:opacity-50"
            >
              Checkout Apparel
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
