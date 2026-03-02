import React, { useState } from 'react';
import { api } from '../lib/api';
import { SectionHeader } from '../components/SectionHeader';

interface LoginPageProps {
  onNavigate: (path: string) => void;
  onLoggedIn: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);
      await api.loginOwner(email, password);
      onLoggedIn();
      onNavigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <SectionHeader eyebrow="Owner Access" title="Producer Login" description="Authenticate to manage beats, contracts, and orders." />

      <form className="space-y-4 border border-brand-mid bg-brand-light/10 p-5" onSubmit={submit}>
        <label className="block">
          <span className="mb-1 block text-sm uppercase tracking-[0.2em] text-brand-mid">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-brand-mid px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm uppercase tracking-[0.2em] text-brand-mid">Password</span>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-brand-mid px-3 py-2"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full border border-brand-mid bg-brand-mid px-6 py-2 text-brand-cream hover:bg-brand-dark disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};
