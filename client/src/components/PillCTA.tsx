import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface PillCTAProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export const PillCTA: React.FC<PillCTAProps> = ({ label, onClick, className = '' }) => {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group inline-flex items-center gap-3 rounded-full border border-slate-400 bg-lime-300 px-7 py-3 text-xl text-slate-900 shadow-[0_3px_0_0_rgba(15,23,42,0.25)] transition hover:bg-lime-200 ${className}`}
    >
      <span>{label}</span>
      <motion.span initial={{ x: 0 }} whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
        <ArrowRight className="h-5 w-5" />
      </motion.span>
    </motion.button>
  );
};
