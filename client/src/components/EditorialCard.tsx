import React from 'react';
import { motion } from 'framer-motion';

interface EditorialCardProps {
  category: string;
  title: string;
  description?: string;
  imageUrl?: string;
  accent?: string;
  actions?: React.ReactNode;
  onArrowClick?: () => void;
  className?: string;
}

export const EditorialCard: React.FC<EditorialCardProps> = ({
  category,
  title,
  description,
  imageUrl,
  accent = 'text-brand-mid',
  actions,
  onArrowClick,
  className = ''
}) => {
  const clickableProps: React.HTMLAttributes<HTMLElement> = onArrowClick
    ? {
        role: 'button',
        tabIndex: 0,
        onClick: onArrowClick,
        onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onArrowClick();
          }
        }
      }
    : {};

  return (
    <article
      className={`group border border-brand-mid bg-brand-paper transition ${onArrowClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_0_0_rgba(2,60,133,0.12)]' : ''} ${className}`}
      aria-label={onArrowClick ? `Open ${title}` : undefined}
      {...clickableProps}
    >
      <div className="p-4">
        <p className="text-xs uppercase tracking-[0.35em] text-brand-mid">{category}</p>
        <h3 className="mt-2 font-mono text-3xl leading-tight text-brand-dark">{title}</h3>
        {description ? <p className="mt-3 text-brand-ink">{description}</p> : null}
        {onArrowClick ? (
          <motion.button
            type="button"
            initial="rest"
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            onClick={(event) => {
              event.stopPropagation();
              onArrowClick();
            }}
            aria-label={`Open ${title}`}
            className={`mt-4 text-2xl leading-none ${accent || 'text-brand-dark'}`}
          >
            <motion.span
              className="inline-block text-brand-dark transition group-hover:text-brand-mid"
              variants={{ rest: { x: 0, y: 0 }, hover: { x: 4, y: -2 } }}
            >
              →
            </motion.span>
          </motion.button>
        ) : (
          <div className={`mt-4 text-2xl ${accent}`}>→</div>
        )}
      </div>
      {imageUrl ? (
        <div className="h-48 overflow-hidden border-y border-brand-mid">
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        </div>
      ) : null}
      {actions ? <div className="p-4">{actions}</div> : null}
    </article>
  );
};
