import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Beat, ContractTemplate, LicenseType } from '../types/api';

interface ContractModalProps {
  isOpen: boolean;
  beat: Beat | null;
  licenseType: LicenseType;
  templates: ContractTemplate[];
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    beatId: string;
    licenseType: LicenseType;
    templateId: string;
    buyerName: string;
    buyerEmail: string;
    typedSignature: string;
  }) => Promise<void>;
}

export const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  beat,
  licenseType,
  templates,
  isSubmitting,
  onClose,
  onConfirm
}) => {
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [typedSignature, setTypedSignature] = useState('');
  const [acceptSummary, setAcceptSummary] = useState(false);
  const [acceptFullTerms, setAcceptFullTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const template = useMemo(
    () => templates.find((entry) => entry.type === licenseType) || null,
    [templates, licenseType]
  );

  if (!isOpen || !beat) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!template) {
      setError('No active contract template was found for this license type.');
      return;
    }

    if (!acceptSummary || !acceptFullTerms) {
      setError('You must accept both contract sections before purchase.');
      return;
    }

    setError(null);

    await onConfirm({
      beatId: beat.id,
      licenseType,
      templateId: template.id,
      buyerName,
      buyerEmail,
      typedSignature
    });
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-brand-dark/50 px-4 py-8">
      <div className="mx-auto max-w-3xl border border-brand-mid bg-brand-cream p-5 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-brand-mid">Contract Required</p>
            <h3 className="mt-1 font-mono text-3xl text-brand-dark">{beat.title}</h3>
            <p className="mt-1 text-brand-mid">License type: {licenseType}</p>
          </div>
          <button onClick={onClose} className="border border-brand-mid p-2 text-brand-mid hover:text-brand-dark" aria-label="Close contract dialog">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm uppercase tracking-[0.2em] text-brand-mid">Full Name</span>
              <input
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full border border-brand-mid bg-brand-light/10 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm uppercase tracking-[0.2em] text-brand-mid">Email</span>
              <input
                required
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                className="w-full border border-brand-mid bg-brand-light/10 px-3 py-2"
              />
            </label>
          </div>

          <section className="border border-brand-mid p-4">
            <h4 className="font-semibold text-brand-dark">Summary / TLDR</h4>
            <p className="mt-2 text-brand-mid">{template?.summaryText || 'No summary available.'}</p>
            <label className="mt-3 flex items-start gap-2 text-sm text-brand-mid">
              <input type="checkbox" checked={acceptSummary} onChange={(e) => setAcceptSummary(e.target.checked)} className="mt-1" />
              <span>I have read and accepted the summary.</span>
            </label>
          </section>

          <section className="border border-brand-mid p-4">
            <h4 className="font-semibold text-brand-dark">Full Contract</h4>
            <div className="mt-2 max-h-52 overflow-y-auto whitespace-pre-wrap border border-brand-mid bg-brand-light/10 p-3 text-sm text-brand-mid">
              {template?.fullText || 'No contract text available.'}
            </div>
            <label className="mt-3 flex items-start gap-2 text-sm text-brand-mid">
              <input type="checkbox" checked={acceptFullTerms} onChange={(e) => setAcceptFullTerms(e.target.checked)} className="mt-1" />
              <span>I have read and accepted the full contract terms.</span>
            </label>
          </section>

          <label className="block">
            <span className="mb-1 block text-sm uppercase tracking-[0.2em] text-brand-mid">Typed Signature</span>
            <input
              required
              value={typedSignature}
              onChange={(e) => setTypedSignature(e.target.value)}
              placeholder="Type your full legal name"
              className="w-full border border-brand-mid bg-brand-light/10 px-3 py-2"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full border border-brand-mid bg-brand-mid px-5 py-3 text-lg text-brand-cream transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Preparing Checkout...' : 'Sign Contract and Continue to Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};
