import React, { FormEvent, useState } from 'react';
import { api } from '../lib/api';

interface ActivatePageProps {
  onNavigate: (path: string) => void;
}

export const ActivatePage: React.FC<ActivatePageProps> = ({ onNavigate }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!acceptedTerms) return;
    setStatus('pending');
    setMessage('');

    try {
      const response = await api.registerActivation({
        fullName,
        email,
        phone,
        acceptedTerms: true,
        website
      });
      setStatus('success');
      setMessage(
        response.status === 'updated'
          ? 'Your registration details have been updated.'
          : "You're registered. We'll keep your details on file for future Junah updates."
      );
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Registration could not be completed.');
    }
  };

  return (
    <div className="bg-white pb-20">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-16">
        <h1 className="text-4xl font-bold leading-tight text-brand-ink md:text-6xl">
          Register to stay notified about releases, events, discounts, &amp; more
        </h1>

        <form onSubmit={submit} className="mt-10 space-y-6 bg-brand-gray p-5 md:p-8">
          <label className="block">
            <span className="mb-2 block font-semibold">Full name</span>
            <input
              required
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="min-h-12 w-full border border-brand-ink bg-white px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="mb-2 block font-semibold">Email address</span>
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-12 w-full border border-brand-ink bg-white px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="mb-2 block font-semibold">Phone number</span>
            <input
              required
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="min-h-12 w-full border border-brand-ink bg-white px-3 py-2"
            />
          </label>
          <label className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            Website
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
          </label>
          <label className="flex items-start gap-3">
            <input
              required
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="mt-1 h-5 w-5 accent-brand-ink"
            />
            <span>
              I agree to the{' '}
              <button type="button" className="font-semibold underline" onClick={() => onNavigate('/terms')}>
                Terms &amp; Conditions
              </button>
              . Registration stores my details for future Junah updates; it does not start email or text messages now.
            </span>
          </label>

          <button
            type="submit"
            disabled={status === 'pending' || !acceptedTerms}
            className="min-h-12 bg-brand-ink px-8 py-3 font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'pending' ? 'REGISTERING...' : 'REGISTER'}
          </button>

          {message ? (
            <p role="status" className={`font-semibold ${status === 'error' ? 'text-apparel-red' : 'text-music-blue'}`}>
              {message}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
};
