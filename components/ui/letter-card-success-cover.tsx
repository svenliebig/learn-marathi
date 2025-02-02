'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export function LetterCardSuccessCover() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="absolute inset-0 flex items-center justify-center bg-background/75 z-10"
    >
      <div className="relative">
        <Check className="w-16 h-16 text-green-500" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-green-500 rounded-full"
        />
      </div>
    </motion.div>
  );
}
