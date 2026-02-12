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
import { OwnerUser } from './types/api';

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

  useEffect(() => {
    api
      .getOwnerMe()
      .then((response) => setOwnerUser(response.user))
      .catch(() => setOwnerUser(null));
  }, []);

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

  return (
    <div className="min-h-screen bg-stone-100 text-slate-900">
      <Navbar path={path} onNavigate={navigate} isOwnerAuthed={Boolean(ownerUser)} onLogout={logout} />
      <main>{content}</main>
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default App;
