import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api, formatCurrency } from '../lib/api';
import { OwnerBeat, OwnerContract, OwnerOrder, OwnerOverview, OwnerUser } from '../types/api';
import { SectionHeader } from '../components/SectionHeader';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
  onAuthStateChange: (user: OwnerUser | null) => void;
}

const initialBeatForm = {
  title: '',
  description: '',
  bpm: '',
  key: '',
  tags: '',
  exclusivePriceCents: '',
  nonExclusivePriceCents: ''
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onAuthStateChange }) => {
  const [user, setUser] = useState<OwnerUser | null>(null);
  const [overview, setOverview] = useState<OwnerOverview | null>(null);
  const [beats, setBeats] = useState<OwnerBeat[]>([]);
  const [orders, setOrders] = useState<OwnerOrder[]>([]);
  const [contracts, setContracts] = useState<OwnerContract[]>([]);
  const [includeUnpaidContracts, setIncludeUnpaidContracts] = useState(false);
  const [syncingStripe, setSyncingStripe] = useState(false);
  const [beatForm, setBeatForm] = useState(initialBeatForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<Record<string, { preview?: File; full?: File }>>({});
  const skipFirstContractsReload = useRef(true);

  const isAuthError = (message: string) =>
    [
      'Authentication required',
      'Invalid authentication token',
      'Forbidden',
      'User not found'
    ].includes(message);

  const loadData = async ({ sync = true, showLoader = true }: { sync?: boolean; showLoader?: boolean } = {}) => {
    try {
      if (showLoader && !initialized) setLoading(true);
      if (sync) setSyncingStripe(true);
      setError(null);

      const me = await api.getOwnerMe();
      setUser(me.user);
      onAuthStateChange(me.user);

      const [overviewRes, beatsRes, ordersRes, contractsRes] = await Promise.all([
        api.getOwnerOverview({ sync }),
        api.getOwnerBeats(),
        api.getOwnerOrders({ sync, limit: 250 }),
        api.getOwnerContracts({ sync, includeUnpaid: includeUnpaidContracts, limit: 250 })
      ]);

      setOverview(overviewRes.overview);
      setBeats(beatsRes.beats);
      setOrders(ordersRes.orders);
      setContracts(contractsRes.contracts);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load dashboard';
      if (isAuthError(message)) {
        setUser(null);
        onAuthStateChange(null);
      }
      setError(message);
    } finally {
      if (showLoader && !initialized) setLoading(false);
      if (sync) setSyncingStripe(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    loadData({ sync: true, showLoader: true });
  }, []);

  useEffect(() => {
    if (skipFirstContractsReload.current) {
      skipFirstContractsReload.current = false;
      return;
    }
    loadData({ sync: true, showLoader: false });
  }, [includeUnpaidContracts]);

  const revenue = useMemo(() => formatCurrency(overview?.grossRevenueCents || 0), [overview]);

  const shortId = (value?: string | null) => {
    if (!value) return 'N/A';
    if (value.length <= 18) return value;
    return `${value.slice(0, 10)}...${value.slice(-6)}`;
  };

  const stateBadgeClass = (state = '') => {
    if (['paid', 'partially_refunded', 'chargeback_won'].includes(state)) {
      return 'border-emerald-300 bg-emerald-50 text-emerald-800';
    }
    if (['failed', 'refunded', 'canceled', 'chargeback_lost'].includes(state)) {
      return 'border-red-300 bg-red-50 text-red-700';
    }
    if (state === 'disputed') {
      return 'border-amber-300 bg-amber-50 text-amber-800';
    }
    return 'border-slate-300 bg-slate-50 text-slate-700';
  };

  const createBeat = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await api.createOwnerBeat({
        title: beatForm.title,
        description: beatForm.description,
        bpm: beatForm.bpm ? Number(beatForm.bpm) : null,
        key: beatForm.key,
        tags: beatForm.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        exclusivePriceCents: Number(beatForm.exclusivePriceCents),
        nonExclusivePriceCents: Number(beatForm.nonExclusivePriceCents),
        isAvailable: true,
        isActive: true
      });

      setBeatForm(initialBeatForm);
      await loadData({ sync: false, showLoader: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create beat');
    }
  };

  const patchBeat = async (beatId: string, payload: Partial<OwnerBeat>) => {
    try {
      await api.updateOwnerBeat(beatId, payload);
      await loadData({ sync: false, showLoader: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update beat');
    }
  };

  const submitUpload = async (beatId: string) => {
    const files = uploadFiles[beatId] || {};

    try {
      await api.uploadBeatFiles(beatId, files);
      setUploadFiles((current) => ({ ...current, [beatId]: {} }));
      await loadData({ sync: false, showLoader: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  if (loading && !initialized) {
    return <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">Loading dashboard...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <SectionHeader eyebrow="Unauthorized" title="Producer Dashboard" description="Login is required to manage this account." />
        <button onClick={() => onNavigate('/login')} className="rounded-full border border-slate-400 bg-lime-300 px-5 py-2 text-slate-900">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 md:px-6">
      <SectionHeader eyebrow="Producer" title="Dashboard" description="Manage beats, uploads, pricing, signed agreements, and orders." />

      <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-300 bg-white p-3 text-sm">
        <p className="text-slate-700">
          Stripe Sync: {syncingStripe ? <span className="text-violet-700">Refreshing...</span> : <span className="text-emerald-700">Up to date</span>}
        </p>
        <button
          onClick={() => loadData({ sync: true, showLoader: false })}
          disabled={syncingStripe}
          className="rounded-full border border-slate-400 bg-lime-300 px-4 py-1.5 text-slate-900 hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {syncingStripe ? 'Syncing Stripe...' : 'Sync from Stripe now'}
        </button>
      </div>

      {error ? <p className="rounded border border-red-300 bg-red-50 p-3 text-red-700">{error}</p> : null}

      <section className="grid gap-4 md:grid-cols-4">
        <article className="border border-slate-400 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-600">Total Beats</p>
          <p className="mt-2 text-3xl text-slate-900">{overview?.totalBeats || 0}</p>
        </article>
        <article className="border border-slate-400 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-600">Active Beats</p>
          <p className="mt-2 text-3xl text-slate-900">{overview?.activeBeats || 0}</p>
        </article>
        <article className="border border-slate-400 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-600">Paid Orders</p>
          <p className="mt-2 text-3xl text-slate-900">{overview?.totalOrders || 0}</p>
        </article>
        <article className="border border-slate-400 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-600">Gross Revenue</p>
          <p className="mt-2 text-3xl text-slate-900">{revenue}</p>
        </article>
      </section>

      <section className="border border-slate-500 bg-white p-5">
        <h3 className="font-mono text-3xl text-slate-900">Add Beat</h3>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={createBeat}>
          <input
            required
            placeholder="Title"
            className="border border-slate-400 px-3 py-2"
            value={beatForm.title}
            onChange={(e) => setBeatForm((current) => ({ ...current, title: e.target.value }))}
          />
          <input
            placeholder="Key"
            className="border border-slate-400 px-3 py-2"
            value={beatForm.key}
            onChange={(e) => setBeatForm((current) => ({ ...current, key: e.target.value }))}
          />
          <input
            placeholder="BPM"
            className="border border-slate-400 px-3 py-2"
            value={beatForm.bpm}
            onChange={(e) => setBeatForm((current) => ({ ...current, bpm: e.target.value }))}
          />
          <input
            placeholder="Tags (comma-separated)"
            className="border border-slate-400 px-3 py-2"
            value={beatForm.tags}
            onChange={(e) => setBeatForm((current) => ({ ...current, tags: e.target.value }))}
          />
          <input
            type="number"
            placeholder="Non-exclusive price (cents)"
            className="border border-slate-400 px-3 py-2"
            value={beatForm.nonExclusivePriceCents}
            onChange={(e) =>
              setBeatForm((current) => ({ ...current, nonExclusivePriceCents: e.target.value }))
            }
          />
          <input
            type="number"
            placeholder="Exclusive price (cents)"
            className="border border-slate-400 px-3 py-2"
            value={beatForm.exclusivePriceCents}
            onChange={(e) => setBeatForm((current) => ({ ...current, exclusivePriceCents: e.target.value }))}
          />
          <textarea
            placeholder="Description"
            className="border border-slate-400 px-3 py-2 md:col-span-2"
            value={beatForm.description}
            onChange={(e) => setBeatForm((current) => ({ ...current, description: e.target.value }))}
          />
          <button type="submit" className="md:col-span-2 rounded-full bg-lime-300 px-5 py-2 text-slate-900 hover:bg-lime-200">
            Create Beat
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h3 className="font-mono text-3xl text-slate-900">Beat Inventory</h3>
        {beats.map((beat) => (
          <article key={beat._id} className="border border-slate-400 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-2xl text-slate-900">{beat.title}</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => patchBeat(beat._id, { isAvailable: !beat.isAvailable })}
                  className="border border-slate-400 px-3 py-1 text-sm hover:bg-slate-100"
                >
                  {beat.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                </button>
                <button
                  onClick={() => patchBeat(beat._id, { isActive: !beat.isActive })}
                  className="border border-slate-400 px-3 py-1 text-sm hover:bg-slate-100"
                >
                  {beat.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
            <p className="mt-2 text-slate-700">{beat.description}</p>
            <p className="mt-2 text-sm text-slate-600">
              Non-exclusive {formatCurrency(beat.nonExclusivePriceCents)} | Exclusive {formatCurrency(beat.exclusivePriceCents)}
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block uppercase tracking-[0.2em] text-slate-600">Preview File</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) =>
                    setUploadFiles((current) => ({
                      ...current,
                      [beat._id]: { ...current[beat._id], preview: e.target.files?.[0] }
                    }))
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block uppercase tracking-[0.2em] text-slate-600">Full WAVE File</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) =>
                    setUploadFiles((current) => ({
                      ...current,
                      [beat._id]: { ...current[beat._id], full: e.target.files?.[0] }
                    }))
                  }
                />
              </label>
            </div>

            <button
              onClick={() => submitUpload(beat._id)}
              className="mt-3 rounded-full border border-slate-400 bg-lime-300 px-4 py-2 text-slate-900 hover:bg-lime-200"
            >
              Upload Files
            </button>
          </article>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="border border-slate-500 bg-white p-4">
          <h3 className="font-mono text-2xl text-slate-900">Recent Orders</h3>
          <div className="mt-3 space-y-2">
            {orders.slice(0, 12).map((order) => (
              <div key={order._id} className="border border-slate-200 p-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-slate-900">{order.type.toUpperCase()} - {formatCurrency(order.amountTotal)}</p>
                  <span className={`rounded border px-2 py-0.5 text-xs ${stateBadgeClass(order.stripePaymentState || order.paymentStatus)}`}>
                    {(order.stripePaymentState || order.paymentStatus || 'pending').replaceAll('_', ' ')}
                  </span>
                </div>
                <p className="mt-1 text-slate-600">
                  {order.buyerEmail} | Payment {order.paymentStatus} | Order {order.fulfillmentStatus}
                </p>
                <p className="text-slate-600">
                  Refund {formatCurrency(order.amountRefunded || 0)} | Dispute {order.stripeDisputeStatus || 'none'}
                  {order.needsManualReview ? ' | Manual review required' : ''}
                </p>
                <p className="font-mono text-xs text-slate-500">
                  _id {shortId(order._id)} | Session {shortId(order.stripeCheckoutSessionId)}<br/>PI {shortId(order.stripePaymentIntentId)} | Ch {shortId(order.stripeChargeId)}
                </p>
                <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="border border-slate-500 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-mono text-2xl text-slate-900">Signed Contracts</h3>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={includeUnpaidContracts}
                onChange={(e) => setIncludeUnpaidContracts(e.target.checked)}
              />
              <span>Include unpaid signatures</span>
            </label>
          </div>
          <div className="mt-3 space-y-2">
            {contracts.slice(0, 12).map((contract) => (
              <div key={contract._id} className="border border-slate-200 p-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-slate-900">{contract.templateType.toUpperCase()} with {contract.buyerName}</p>
                  <span className={`rounded border px-2 py-0.5 text-xs ${stateBadgeClass(contract.paymentState)}`}>
                    {(contract.paymentState || 'pending').replaceAll('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-700">Beat: {contract.beatTitle || 'Unknown Beat'}</p>
                <p className="font-mono text-xs text-slate-500">
                  Session {shortId(contract.stripeCheckoutSessionId)} | PI {shortId(contract.stripePaymentIntentId)}
                </p>
                <p className="text-slate-600">
                  {contract.needsManualReview ? 'Manual review required | ' : ''}
                  {contract.orderId ? `Order linked ${shortId(contract.orderId)}` : 'No paid order linked'}
                </p>
                <p className="text-slate-600">{contract.buyerEmail} | {new Date(contract.signedAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};
