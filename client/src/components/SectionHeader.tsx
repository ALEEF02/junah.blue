import React from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  titleClassName?: string;
  eyebrowClassName?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  titleClassName = 'text-brand-ink',
  eyebrowClassName = 'text-brand-ink'
}) => {
  return (
    <div className="mb-6">
      {eyebrow ? <p className={`mb-2 text-xs uppercase ${eyebrowClassName}`}>{eyebrow}</p> : null}
      <h1 className={`font-mono text-5xl font-bold leading-none md:text-7xl ${titleClassName}`}>{title}</h1>
      {description ? <p className="mt-2 max-w-3xl text-brand-ink">{description}</p> : null}
    </div>
  );
};
