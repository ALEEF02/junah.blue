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
    <div className="fixed inset-0 z-[120] bg-slate-950/55 px-4 py-8">
      <div className="mx-auto max-w-2xl border border-slate-500 bg-stone-100 p-5 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-xs uppercase tracking-[0.35em] ${isSuccess ? 'text-emerald-700' : 'text-red-700'}`}>
              {isSuccess ? 'Payment Confirmed' : 'Payment Incomplete'}
            </p>
            <h3 className="mt-1 font-mono text-3xl text-slate-900">
              {isSuccess ? 'Order Status' : 'Checkout Feedback'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="border border-slate-400 p-2 text-slate-700 hover:text-slate-950"
            aria-label="Close checkout status dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3 text-sm text-slate-700">
          <p>
            {isSuccess
              ? 'Thanks for your purchase. Review the details below for confirmation.'
              : 'Your payment was not completed. No charge was captured by this checkout session.'}
          </p>
          {sessionId ? <p className="font-mono text-xs text-slate-600">Session: {sessionId}</p> : null}
          {message ? <p className="rounded border border-amber-300 bg-amber-50 p-2 text-amber-800">{message}</p> : null}
          {isLoading ? <p className="rounded border border-slate-300 bg-white p-2">Finalizing your order details...</p> : null}
        </div>

        {order ? (
          <section className="mt-5 space-y-4 border border-slate-400 bg-white p-4">
            <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-2">
              <p>
                Type: <span className="font-semibold text-slate-900">{order.type.toUpperCase()}</span>
              </p>
              <p>
                Payment: <span className="font-semibold text-slate-900">{order.paymentStatus}</span>
              </p>
              <p>
                Fulfillment: <span className="font-semibold text-slate-900">{order.fulfillmentStatus}</span>
              </p>
              <p>
                Receipt: <span className="font-semibold text-slate-900">{order.buyerEmailMasked || 'N/A'}</span>
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-600">Line Items</p>
              <div className="mt-2 space-y-2">
                {order.lineItems.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="flex items-start justify-between gap-3 border border-slate-200 p-2 text-sm">
                    <p className="text-slate-900">
                      {item.label} <span className="text-slate-600">x{item.quantity}</span>
                    </p>
                    <p className="whitespace-nowrap text-slate-800">{formatCurrency(item.amountCents * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <p className="text-base text-slate-900">
                Total: <span className="font-semibold">{formatCurrency(order.amountTotalCents)}</span>
              </p>
            </div>
          </section>
        ) : (
          <section className="mt-5 border border-slate-300 bg-white p-4 text-sm text-slate-700">
            No order details were found yet. Check your email for reception of your purchase. If nothing comes within 10 minutes (including spam), please contact help@junah.blue.
          </section>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-full border border-slate-400 bg-lime-300 px-4 py-2 text-slate-900 hover:bg-lime-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};
