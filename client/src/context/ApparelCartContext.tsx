import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ApparelCartItem } from '../types/api';

const CART_STORAGE_KEY = 'junah-apparel-cart';

interface ApparelCartContextValue {
  cart: ApparelCartItem[];
  cartItemCount: number;
  cartTotal: number;
  addItem: (item: Omit<ApparelCartItem, 'quantity'>) => void;
  removeItem: (productId: string, variantId: string | number) => void;
  clearCart: () => void;
}

const ApparelCartContext = createContext<ApparelCartContextValue | null>(null);

const readStoredCart = (): ApparelCartItem[] => {
  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
};

export const ApparelCartProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [cart, setCart] = useState<ApparelCartItem[]>(readStoredCart);

  const commitCart = useCallback((nextCart: ApparelCartItem[]) => {
    setCart(nextCart);
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
    } catch (_error) {
      // The cart remains available in memory when storage is unavailable.
    }
  }, []);

  const addItem = useCallback(
    (item: Omit<ApparelCartItem, 'quantity'>) => {
      setCart((current) => {
        const existing = current.find(
          (entry) =>
            entry.productId === item.productId && String(entry.variantId) === String(item.variantId)
        );
        const nextCart = existing
          ? current.map((entry) =>
              entry === existing ? { ...entry, quantity: Math.min(entry.quantity + 1, 10) } : entry
            )
          : [...current, { ...item, quantity: 1 }];

        try {
          window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
        } catch (_error) {
          // The cart remains available in memory when storage is unavailable.
        }
        return nextCart;
      });
    },
    []
  );

  const removeItem = useCallback((productId: string, variantId: string | number) => {
    setCart((current) => {
      const nextCart = current.filter(
        (entry) => entry.productId !== productId || String(entry.variantId) !== String(variantId)
      );
      try {
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
      } catch (_error) {
        // The cart remains available in memory when storage is unavailable.
      }
      return nextCart;
    });
  }, []);

  const clearCart = useCallback(() => commitCart([]), [commitCart]);
  const cartItemCount = useMemo(
    () => cart.reduce((count, item) => count + item.quantity, 0),
    [cart]
  );
  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.amountCents * item.quantity, 0),
    [cart]
  );

  const value = useMemo(
    () => ({ cart, cartItemCount, cartTotal, addItem, removeItem, clearCart }),
    [cart, cartItemCount, cartTotal, addItem, removeItem, clearCart]
  );

  return <ApparelCartContext.Provider value={value}>{children}</ApparelCartContext.Provider>;
};

export const useApparelCart = () => {
  const context = useContext(ApparelCartContext);
  if (!context) {
    throw new Error('useApparelCart must be used inside ApparelCartProvider');
  }
  return context;
};
