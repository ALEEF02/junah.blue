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
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/50 px-4 py-8">
      <div className="mx-auto max-w-3xl border border-slate-500 bg-stone-100 p-5 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-violet-600">Contract Required</p>
            <h3 className="mt-1 font-mono text-3xl text-slate-900">{beat.title}</h3>
            <p className="mt-1 text-slate-700">License type: {licenseType}</p>
          </div>
          <button onClick={onClose} className="border border-slate-400 p-2 text-slate-700 hover:text-slate-950" aria-label="Close contract dialog">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm uppercase tracking-[0.2em] text-slate-600">Full Name</span>
              <input
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full border border-slate-400 bg-white px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm uppercase tracking-[0.2em] text-slate-600">Email</span>
              <input
                required
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                className="w-full border border-slate-400 bg-white px-3 py-2"
              />
            </label>
          </div>

          <section className="border border-slate-400 p-4">
            <h4 className="font-semibold text-slate-900">Summary / TLDR</h4>
            <p className="mt-2 text-slate-700">{template?.summaryText || 'No summary available.'}</p>
            <label className="mt-3 flex items-start gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={acceptSummary} onChange={(e) => setAcceptSummary(e.target.checked)} className="mt-1" />
              <span>I have read and accepted the summary.</span>
            </label>
          </section>

          <section className="border border-slate-400 p-4">
            <h4 className="font-semibold text-slate-900">Full Contract</h4>
            <div className="mt-2 max-h-52 overflow-y-auto whitespace-pre-wrap border border-slate-300 bg-white p-3 text-sm text-slate-700">
              {template?.fullText || 'No contract text available.'}
            </div>
            <label className="mt-3 flex items-start gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={acceptFullTerms} onChange={(e) => setAcceptFullTerms(e.target.checked)} className="mt-1" />
              <span>I have read and accepted the full contract terms.</span>
            </label>
          </section>

          <label className="block">
            <span className="mb-1 block text-sm uppercase tracking-[0.2em] text-slate-600">Typed Signature</span>
            <input
              required
              value={typedSignature}
              onChange={(e) => setTypedSignature(e.target.value)}
              placeholder="Type your full legal name"
              className="w-full border border-slate-400 bg-white px-3 py-2"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full border border-slate-400 bg-lime-300 px-5 py-3 text-lg text-slate-900 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Preparing Checkout...' : 'Sign Contract and Continue to Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};
