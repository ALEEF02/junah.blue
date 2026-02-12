import React from 'react';

interface EditorialCardProps {
  category: string;
  title: string;
  description?: string;
  imageUrl?: string;
  accent?: string;
  actions?: React.ReactNode;
}

export const EditorialCard: React.FC<EditorialCardProps> = ({
  category,
  title,
  description,
  imageUrl,
  accent = 'text-violet-600',
  actions
}) => {
  return (
    <article className="border border-slate-600 bg-stone-100">
      <div className="p-4">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-600">{category}</p>
        <h3 className="mt-2 font-mono text-3xl leading-tight text-slate-800">{title}</h3>
        {description ? <p className="mt-3 text-slate-700">{description}</p> : null}
        <div className={`mt-4 text-2xl ${accent}`}>→</div>
      </div>
      {imageUrl ? (
        <div className="h-48 overflow-hidden border-y border-slate-300">
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        </div>
      ) : null}
      {actions ? <div className="p-4">{actions}</div> : null}
    </article>
  );
};
