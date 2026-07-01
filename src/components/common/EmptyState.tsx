import { motion } from 'framer-motion';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12 flex items-center justify-center mb-5 border border-[#6b5fff]/12">
        <span className="text-[#6b5fff] dark:text-[#a89fff]">
          {icon || <SearchX className="w-9 h-9" />}
        </span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white text-sm font-semibold shadow-lg shadow-[#6b5fff]/20 hover:shadow-xl hover:shadow-[#6b5fff]/30 hover:-translate-y-px transition-all"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
