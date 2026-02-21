import React, { useEffect, useMemo, useState } from 'react';
import { api, formatCurrency } from '../lib/api';
import { savePendingCheckout } from '../lib/checkoutFeedback';
import { Beat, ContractTemplate, LicenseType } from '../types/api';
import { SectionHeader } from '../components/SectionHeader';
import { AudioPreviewPlayer } from '../components/AudioPreviewPlayer';
import { ContractModal } from '../components/ContractModal';

export const BeatsPage: React.FC = () => {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [licenseByBeat, setLicenseByBeat] = useState<Record<string, LicenseType>>({});
  const [submittingCheckout, setSubmittingCheckout] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [beatsRes, contractsRes] = await Promise.all([api.getPublicBeats(), api.getContracts()]);
        setBeats(beatsRes.beats);
        setTemplates(contractsRes.templates);
        setLicenseByBeat(
          beatsRes.beats.reduce<Record<string, LicenseType>>((acc, beat) => {
            acc[beat.id] = 'non-exclusive';
            return acc;
          }, {})
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load beats');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const activeLicense = useMemo<LicenseType>(() => {
    if (!selectedBeat) return 'non-exclusive';
    return licenseByBeat[selectedBeat.id] || 'non-exclusive';
  }, [selectedBeat, licenseByBeat]);

  const openContractModal = (beat: Beat) => setSelectedBeat(beat);

  const onConfirmContract = async (payload: {
    beatId: string;
    licenseType: LicenseType;
    templateId: string;
    buyerName: string;
    buyerEmail: string;
    typedSignature: string;
  }) => {
    setSubmittingCheckout(true);
    setError(null);

    try {
      const signed = await api.signContract({
        ...payload,
        acceptedFullTerms: true,
        acceptedSummary: true
      });

      const checkout = await api.createBeatCheckoutSession({
        beatId: payload.beatId,
        licenseType: payload.licenseType,
        agreementId: signed.agreementId,
        buyerEmail: payload.buyerEmail
      });

      const beat = beats.find((entry) => entry.id === payload.beatId);
      const amountCents =
        payload.licenseType === 'exclusive'
          ? beat?.pricing.exclusivePriceCents || 0
          : beat?.pricing.nonExclusivePriceCents || 0;

      savePendingCheckout({
        sessionId: checkout.sessionId,
        type: 'beat',
        createdAt: new Date().toISOString(),
        currency: 'USD',
        buyerEmail: payload.buyerEmail,
        amountTotalCents: amountCents,
        lineItems: [
          {
            label: `${beat?.title || 'Beat'} - ${payload.licenseType}`,
            quantity: 1,
            amountCents
          }
        ]
      });

      window.location.assign(checkout.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start checkout');
    } finally {
      setSubmittingCheckout(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">Loading beats...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 md:px-6">
      <SectionHeader
        eyebrow="Marketplace"
        title="Beat Marketplace"
        description="Preview every beat, pick your license, review terms, and sign before payment."
      />

      {error ? <p className="rounded border border-red-300 bg-red-50 p-3 text-red-700">{error}</p> : null}

      <div className="grid gap-6 md:grid-cols-2">
        {beats.map((beat, idx) => {
          const selectedLicense = licenseByBeat[beat.id] || 'non-exclusive';
          return (
            <article key={beat.id} className="border border-slate-600 bg-stone-100">
              <div className="p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-600">Beat #{idx + 1}</p>
                <h3 className="mt-2 font-mono text-4xl text-slate-900">{beat.title}</h3>
                <p className="mt-2 text-slate-700">{beat.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  {beat.bpm ? <span>BPM {beat.bpm}</span> : null}
                  {beat.key ? <span>Key {beat.key}</span> : null}
                </div>
                <div className="mt-4">
                  <AudioPreviewPlayer previewUrl={beat.previewUrl} />
                </div>
              </div>

              <div className="border-t border-slate-400 bg-white p-5">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1 block uppercase tracking-[0.2em] text-slate-600">License</span>
                    <select
                      value={selectedLicense}
                      onChange={(e) =>
                        setLicenseByBeat((current) => ({
                          ...current,
                          [beat.id]: e.target.value as LicenseType
                        }))
                      }
                      className="w-full border border-slate-400 bg-stone-100 px-3 py-2"
                    >
                      <option value="non-exclusive">Non-exclusive ({formatCurrency(beat.pricing.nonExclusivePriceCents)})</option>
                      <option value="exclusive" disabled={!beat.isAvailable}>
                        Exclusive ({formatCurrency(beat.pricing.exclusivePriceCents)}) {!beat.isAvailable ? ' - unavailable' : ''}
                      </option>
                      <option value="split">Split contract (15%)</option>
                    </select>
                  </label>
                  <div className="flex items-end">
                    <button
                      onClick={() => openContractModal(beat)}
                      className="w-full rounded-full border border-slate-400 bg-lime-300 px-4 py-2 text-slate-900 transition hover:bg-lime-200"
                    >
                      Review Contract and Buy
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <ContractModal
        isOpen={Boolean(selectedBeat)}
        beat={selectedBeat}
        licenseType={activeLicense}
        templates={templates}
        isSubmitting={submittingCheckout}
        onClose={() => setSelectedBeat(null)}
        onConfirm={onConfirmContract}
      />
    </div>
  );
};
