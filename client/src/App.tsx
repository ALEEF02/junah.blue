import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { BeatsPage } from './pages/BeatsPage';
import { ApparelPage } from './pages/ApparelPage';
import { LicensingPage } from './pages/LicensingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { usePathRouter } from './hooks/usePathRouter';
import { api } from './lib/api';
import { CheckoutStatusOrder, OwnerUser } from './types/api';
import {
  clearPendingCheckout,
  getPendingCheckout,
  pendingCheckoutToOrder
} from './lib/checkoutFeedback';
import { CheckoutFeedbackModal } from './components/CheckoutFeedbackModal';

const NotFoundPage: React.FC = () => (
  <div className="mx-auto max-w-4xl px-4 py-16 md:px-6">
    <p className="text-xs uppercase tracking-[0.35em] text-violet-600">404</p>
    <h1 className="mt-2 font-mono text-6xl text-slate-900">Page Not Found</h1>
    <p className="mt-3 text-slate-700">The route you requested does not exist on this build.</p>
  </div>
);

function App() {
  const { path, navigate } = usePathRouter();
  const [ownerUser, setOwnerUser] = useState<OwnerUser | null>(null);
  const [checkoutModal, setCheckoutModal] = useState<{
    outcome: 'success' | 'failure';
    sessionId?: string;
    order?: CheckoutStatusOrder;
    message?: string;
  } | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    api
      .getOwnerMe()
      .then((response) => setOwnerUser(response.user))
      .catch(() => setOwnerUser(null));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');

    if (!checkout) return;

    const normalized =
      checkout === 'success'
        ? 'success'
        : ['failed', 'cancelled', 'canceled', 'cancel'].includes(checkout)
          ? 'failure'
          : null;

    if (!normalized) return;

    const rawSessionId = params.get('session_id') || '';
    const sessionId =
      rawSessionId && !rawSessionId.includes('{CHECKOUT_SESSION_ID}') ? rawSessionId : undefined;
    const pending = getPendingCheckout();
    let cancelled = false;

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const resolveFeedback = async () => {
      let order: CheckoutStatusOrder | undefined;
      let message = '';

      if (sessionId) {
        if (normalized === 'success') {
          if (!cancelled) setCheckoutLoading(true);
          for (let attempt = 0; attempt < 6; attempt += 1) {
            const status = await api.getCheckoutStatus(sessionId).catch(() => null);
            if (status?.status === 'completed' && status.order) {
              order = status.order;
              break;
            }
            if (attempt < 5) {
              await sleep(1000);
            }
          }
          if (!cancelled) setCheckoutLoading(false);
          if (!order) {
            message = 'Payment succeeded. We are finalizing order details and fulfillment records.';
          }
        } else {
          const status = await api.getCheckoutStatus(sessionId).catch(() => null);
          if (status?.status === 'completed' && status.order) {
            order = status.order;
          }
        }
      }

      if (!order && pending && (!sessionId || pending.sessionId === sessionId)) {
        order = pendingCheckoutToOrder(pending);
      }

      if (!cancelled) {
        setCheckoutModal({
          outcome: normalized,
          sessionId,
          order,
          message: normalized === 'failure' ? 'You can retry checkout when ready.' : message || undefined
        });
      }

      if (sessionId) {
        clearPendingCheckout(sessionId);
      } else if (pending) {
        clearPendingCheckout();
      }
    };

    resolveFeedback();

    return () => {
      cancelled = true;
    };
  }, [path]);

  const content = useMemo(() => {
    if (path === '/') return <HomePage onNavigate={navigate} />;
    if (path === '/beats') return <BeatsPage />;
    if (path === '/apparel') return <ApparelPage />;
    if (path === '/licensing') return <LicensingPage />;
    if (path === '/login') {
      return (
        <LoginPage
          onNavigate={navigate}
          onLoggedIn={() =>
            api
              .getOwnerMe()
              .then((res) => setOwnerUser(res.user))
              .catch(() => setOwnerUser(null))
          }
        />
      );
    }
    if (path === '/dashboard') {
      return <DashboardPage onNavigate={navigate} onAuthStateChange={setOwnerUser} />;
    }

    return <NotFoundPage />;
  }, [path, navigate]);

  const logout = async () => {
    await api.logoutOwner().catch(() => undefined);
    setOwnerUser(null);
    navigate('/');
  };

  const closeCheckoutModal = () => {
    setCheckoutModal(null);
    setCheckoutLoading(false);

    const url = new URL(window.location.href);
    url.searchParams.delete('checkout');
    url.searchParams.delete('session_id');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-slate-900">
      <Navbar path={path} onNavigate={navigate} isOwnerAuthed={Boolean(ownerUser)} onLogout={logout} />
      <main>{content}</main>
      <Footer onNavigate={navigate} />
      <CheckoutFeedbackModal
        isOpen={Boolean(checkoutModal)}
        outcome={checkoutModal?.outcome || 'success'}
        sessionId={checkoutModal?.sessionId}
        order={checkoutModal?.order}
        message={checkoutModal?.message}
        isLoading={checkoutLoading}
        onClose={closeCheckoutModal}
      />
    </div>
  );
}

export default App;
