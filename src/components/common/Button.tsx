import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, icon, iconPosition = 'left', fullWidth, children, disabled, type = 'button', ...props }, ref) => {
    const isDisabled = disabled || isLoading;

    const base = 'relative inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-55 disabled:cursor-not-allowed disabled:pointer-events-none';

    const variants = {
      primary: 'bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white shadow-lg shadow-[#6b5fff]/25 hover:shadow-xl hover:shadow-[#6b5fff]/35 hover:-translate-y-px active:translate-y-0 focus-visible:ring-[#6b5fff]',
      secondary: 'bg-white dark:bg-[#0e0e20] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#1c1c35] hover:bg-gray-50 dark:hover:bg-white/6 hover:border-gray-300 dark:hover:border-[#2a2a4a] shadow-sm focus-visible:ring-gray-400',
      outline: 'bg-transparent text-[#6b5fff] dark:text-[#a89fff] border-2 border-[#6b5fff]/50 hover:bg-[#6b5fff]/6 hover:border-[#6b5fff] focus-visible:ring-[#6b5fff]',
      ghost: 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/8 hover:text-gray-900 dark:hover:text-white focus-visible:ring-gray-400',
      danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-px focus-visible:ring-red-500',
      success: 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-px focus-visible:ring-emerald-500',
    };

    const sizes = {
      xs: 'h-7 px-2.5 text-xs',
      sm: 'h-8 px-3.5 text-sm',
      md: 'h-10 px-5 text-sm',
      lg: 'h-12 px-6 text-base',
      xl: 'h-14 px-8 text-lg',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
        {icon && iconPosition === 'left' && !isLoading && <span className="flex-shrink-0">{icon}</span>}
        {children && <span className={cn(isLoading && 'opacity-0')}>{children}</span>}
        {icon && iconPosition === 'right' && !isLoading && <span className="flex-shrink-0">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
