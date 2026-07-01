import { cn } from '@/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  className?: string;
  size?: 'sm' | 'md';
}

export default function Badge({ children, variant = 'default', className, size = 'sm' }: BadgeProps) {
  const variants = {
    default: 'bg-[#6b5fff]/8 dark:bg-[#6b5fff]/14 text-[#5b47f0] dark:text-[#a89fff] border border-[#6b5fff]/15',
    success: 'bg-emerald-50 dark:bg-emerald-900/25 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40',
    warning: 'bg-amber-50 dark:bg-amber-900/25 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40',
    danger: 'bg-red-50 dark:bg-red-900/25 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/40',
    info: 'bg-cyan-50 dark:bg-cyan-900/25 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40',
    purple: 'bg-purple-50 dark:bg-purple-900/25 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40',
  };
  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };
  return (
    <span className={cn('inline-flex items-center font-medium rounded-full', variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
