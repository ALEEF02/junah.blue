import React from 'react';
import { easeOut, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface PillCTAProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export const PillCTA: React.FC<PillCTAProps> = ({ label, onClick, className = '' }) => {
  return (
    <motion.button
      initial="rest"
      animate="rest"
      whileHover="hover"
      variants={{
        rest: { y: 0 },
        hover: { y: 0 }
      }}
      transition={{ duration: 0.1, ease: "easeOut" }}
      whileTap={{ y: 3, boxShadow: 'none' }}
      onClick={onClick}
      className={`group inline-flex items-center gap-3 rounded-full border border-brand-mid bg-brand-mid px-7 py-3 text-xl text-brand-cream shadow-[0_3px_0_0_rgba(15,23,42,0.25)] hover:bg-brand-dark ${className}`}
    >
      <span>{label}</span>
      <motion.span
        variants={{
          rest: { rotate: 0 },
          hover: { rotate: -45 }
        }}
        transition={{ duration: 0.2 }}
      >
        <ArrowRight className="h-5 w-5" />
      </motion.span>
    </motion.button>
  );
};
