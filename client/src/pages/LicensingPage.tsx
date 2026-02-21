import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ContractTemplate } from '../types/api';
import { SectionHeader } from '../components/SectionHeader';

export const LicensingPage: React.FC = () => {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.getContracts();
        setTemplates(response.templates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load contract templates');
      }
    };

    load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 md:px-6">
      <SectionHeader
        eyebrow="Legal Resource Center"
        title="Licensing Hub"
        description="Read the complete terms and practical summaries before signing and purchase."
      />

      <section className="border border-violet-400 bg-violet-50 p-4 text-slate-800">
        <h3 className="font-semibold">Split Contract Summary (Fixed 15%)</h3>
        <p className="mt-2">The split contract applies a fixed 15% participation model. This percentage is global and does not vary per beat in this release.</p>
      </section>

      {error ? <p className="rounded border border-red-300 bg-red-50 p-3 text-red-700">{error}</p> : null}

      <div className="space-y-6">
        {templates.map((template) => (
          <article key={template.id} className="border border-slate-500 bg-stone-100">
            <header className="border-b border-slate-400 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-violet-600">{template.type}</p>
              <h3 className="mt-2 font-mono text-3xl text-slate-900">{template.title}</h3>
              <p className="mt-2 text-slate-700">Version: {template.version}</p>
            </header>
            <div className="grid gap-4 p-4 md:grid-cols-2">
              <section className="border border-slate-300 bg-white p-3">
                <h4 className="font-semibold text-slate-900">Summary / TLDR</h4>
                <p className="mt-2 whitespace-pre-wrap text-slate-700">{template.summaryText}</p>
              </section>
              <section className="border border-slate-300 bg-white p-3">
                <h4 className="font-semibold text-slate-900">Full Agreement</h4>
                <p className="mt-2 max-h-72 overflow-y-auto whitespace-pre-wrap text-sm text-slate-700">{template.fullText}</p>
              </section>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
