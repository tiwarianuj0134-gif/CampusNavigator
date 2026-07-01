import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.7, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 16 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-6 z-40 w-10 h-10 rounded-xl bg-white dark:bg-[#0e0e20] border border-gray-200 dark:border-[#1c1c35] text-gray-500 dark:text-gray-400 flex items-center justify-center shadow-lg hover:text-[#6b5fff] hover:border-[#6b5fff]/30 hover:-translate-y-0.5 transition-all"
          aria-label="Back to top"
        >
          <ArrowUp size={17} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
