import { CheckoutStatusOrder } from '../types/api';

export interface PendingCheckoutLineItem {
  label: string;
  quantity: number;
  amountCents: number;
}

export interface PendingCheckout {
  sessionId: string;
  type: 'beat' | 'apparel';
  createdAt: string;
  currency: string;
  buyerEmail?: string;
  amountTotalCents: number;
  lineItems: PendingCheckoutLineItem[];
}

const STORAGE_KEY = 'junah_checkout_pending';

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const maskEmail = (email = '') => {
  const [local = '', domain = ''] = String(email).split('@');
  if (!local || !domain) return '';
  if (local.length <= 2) return `${local[0] || '*'}*@${domain}`;
  return `${local.slice(0, 2)}${'*'.repeat(Math.max(1, local.length - 2))}@${domain}`;
};

export const savePendingCheckout = (payload: PendingCheckout) => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (_err) {
    // Best effort only.
  }
};

export const getPendingCheckout = (): PendingCheckout | null => {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.sessionId || !parsed.type || !Array.isArray(parsed.lineItems)) return null;
    return parsed as PendingCheckout;
  } catch (_err) {
    return null;
  }
};

export const clearPendingCheckout = (sessionId?: string) => {
  if (!canUseStorage()) return;
  if (!sessionId) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const current = getPendingCheckout();
  if (current?.sessionId === sessionId) {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};

export const pendingCheckoutToOrder = (pending: PendingCheckout): CheckoutStatusOrder => ({
  type: pending.type,
  amountTotalCents: pending.amountTotalCents,
  amountTaxCents: 0,
  currency: String(pending.currency || 'USD').toUpperCase(),
  paymentStatus: 'pending',
  fulfillmentStatus: 'pending',
  buyerEmailMasked: maskEmail(pending.buyerEmail || ''),
  createdAt: pending.createdAt,
  lineItems: pending.lineItems
});
