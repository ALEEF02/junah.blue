import React from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../lib/api';
import { CheckoutStatusOrder } from '../types/api';

interface CheckoutFeedbackModalProps {
  isOpen: boolean;
  outcome: 'success' | 'failure';
  sessionId?: string;
  order?: CheckoutStatusOrder;
  isLoading?: boolean;
  message?: string;
  onClose: () => void;
}

export const CheckoutFeedbackModal: React.FC<CheckoutFeedbackModalProps> = ({
  isOpen,
  outcome,
  sessionId,
  order,
  isLoading = false,
  message,
  onClose
}) => {
  if (!isOpen) return null;

  const isSuccess = outcome === 'success';

  return (
    <div className="fixed inset-0 z-[120] bg-brand-dark/55 px-4 py-8">
      <div className="mx-auto max-w-2xl border border-brand-mid bg-brand-cream p-5 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-xs uppercase tracking-[0.35em] ${isSuccess ? 'text-emerald-700' : 'text-red-700'}`}>
              {isSuccess ? 'Payment Confirmed' : 'Payment Incomplete'}
            </p>
            <h3 className="mt-1 font-mono text-3xl text-brand-dark">
              {isSuccess ? 'Order Status' : 'Checkout Feedback'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="border border-brand-mid p-2 text-brand-mid hover:text-brand-dark"
            aria-label="Close checkout status dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3 text-sm text-brand-mid">
          <p>
            {isSuccess
              ? 'Thanks for your purchase. Review the details below for confirmation.'
              : 'Your payment was not completed. No charge was captured by this checkout session.'}
          </p>
          {sessionId ? <p className="font-mono text-xs text-brand-mid">Session: {sessionId}</p> : null}
          {message ? <p className="rounded border border-amber-300 bg-amber-50 p-2 text-amber-800">{message}</p> : null}
          {isLoading ? <p className="rounded border border-brand-mid bg-brand-light/10 p-2">Finalizing your order details...</p> : null}
        </div>

        {order ? (
          <section className="mt-5 space-y-4 border border-brand-mid bg-brand-light/10 p-4">
            <div className="grid gap-2 text-sm text-brand-mid md:grid-cols-2">
              <p>
                Type: <span className="font-semibold text-brand-dark">{order.type.toUpperCase()}</span>
              </p>
              <p>
                Payment: <span className="font-semibold text-brand-dark">{order.paymentStatus}</span>
              </p>
              <p>
                Fulfillment: <span className="font-semibold text-brand-dark">{order.fulfillmentStatus}</span>
              </p>
              <p>
                Receipt: <span className="font-semibold text-brand-dark">{order.buyerEmailMasked || 'N/A'}</span>
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-brand-mid">Line Items</p>
              <div className="mt-2 space-y-2">
                {order.lineItems.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="flex items-start justify-between gap-3 border border-brand-mid p-2 text-sm">
                    <p className="text-brand-dark">
                      {item.label} <span className="text-brand-mid">x{item.quantity}</span>
                    </p>
                    <p className="whitespace-nowrap text-brand-dark">{formatCurrency(item.amountCents * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-brand-mid pt-3">
              <p className="text-base text-brand-dark">
                Total: <span className="font-semibold">{formatCurrency(order.amountTotalCents)}</span>
              </p>
            </div>
          </section>
        ) : (
          <section className="mt-5 border border-brand-mid bg-brand-light/10 p-4 text-sm text-brand-mid">
            No order details were found yet. Check your email for reception of your purchase. If nothing comes within 10 minutes (including spam), please contact help@junah.blue.
          </section>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-full border border-brand-mid bg-brand-mid px-4 py-2 text-brand-cream hover:bg-brand-dark"
        >
          Close
        </button>
      </div>
    </div>
  );
};
