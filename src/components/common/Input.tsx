/**
 * Input Component — No icon/text overlap
 * Icon uses absolute full-height wrapper so it never overlaps placeholder
 */
import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'ghost';
  isRequired?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      success,
      hint,
      icon,
      rightIcon,
      size = 'md',
      variant = 'default',
      isRequired = false,
      type = 'text',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const hasError   = !!error;
    const hasSuccess = !!success;

    /* height + base horizontal padding (no icon) */
    const sizeStyles = {
      sm: 'h-9  text-sm  px-3',
      md: 'h-11 text-sm  px-4',
      lg: 'h-12 text-base px-4',
    };

    /* padding overrides when icons are present
       icon column = w-11 (44 px), right col = w-11 */
    const iconPadding = {
      sm: { left: 'pl-9',  right: 'pr-9'  },
      md: { left: 'pl-11', right: 'pr-11' },
      lg: { left: 'pl-11', right: 'pr-11' },
    };

    const variantStyles = {
      default: cn(
        'bg-white dark:bg-[#0e0e20]',
        'border border-gray-200 dark:border-[#1c1c35]',
        'focus:border-[#6b5fff]/60 focus:ring-2 focus:ring-[#6b5fff]/20'
      ),
      filled: cn(
        'bg-gray-100 dark:bg-[#1a1a2e]',
        'border border-transparent',
        'focus:bg-white dark:focus:bg-[#0e0e20]',
        'focus:border-[#6b5fff]/60 focus:ring-2 focus:ring-[#6b5fff]/20'
      ),
      ghost: cn(
        'bg-transparent',
        'border-b border-gray-200 dark:border-[#1c1c35] rounded-none',
        'focus:border-[#6b5fff]'
      ),
    };

    const stateStyles = cn(
      hasError   && 'border-red-500   focus:border-red-500   focus:ring-red-500/20',
      hasSuccess && 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20'
    );

    const needsRight = rightIcon || isPassword || hasError || hasSuccess;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {label}
            {isRequired && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}

        {/* Wrapper */}
        <div className="relative">

          {/* Left icon — full-height column so icon NEVER overlaps text */}
          {icon && (
            <div className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              'w-full rounded-xl',
              'text-gray-900 dark:text-white',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'transition-all duration-200',
              'focus:outline-none',
              'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-[#1a1a2e]',
              sizeStyles[size],
              variantStyles[variant],
              stateStyles,
              /* override horizontal padding when icons present */
              icon        && iconPadding[size].left,
              needsRight  && iconPadding[size].right,
              className
            )}
            {...props}
          />

          {/* Right-side icons — full-height column */}
          {needsRight && (
            <div className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center gap-1">
              {hasError && !isPassword && (
                <AlertCircle className="w-4 h-4 text-red-500" aria-hidden="true" />
              )}
              {hasSuccess && !isPassword && (
                <CheckCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" />
              )}
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
              {rightIcon && !isPassword && !hasError && !hasSuccess && (
                <span className="text-gray-400">{rightIcon}</span>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
        {success && !error && (
          <p className="mt-1.5 text-xs text-emerald-500">{success}</p>
        )}
        {hint && !error && !success && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
