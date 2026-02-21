import React from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ eyebrow, title, description }) => {
  return (
    <div className="mb-6">
      {eyebrow ? <p className="mb-2 text-xs uppercase tracking-[0.35em] text-violet-600">{eyebrow}</p> : null}
      <h2 className="font-mono text-3xl text-slate-800 md:text-5xl">{title}</h2>
      {description ? <p className="mt-2 max-w-3xl text-slate-700">{description}</p> : null}
    </div>
  );
};
