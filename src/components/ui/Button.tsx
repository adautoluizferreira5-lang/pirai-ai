import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
};

const variantStyles = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm shadow-primary-600/20',
  secondary:
    'bg-dark-100 text-dark-700 hover:bg-dark-200 active:bg-dark-300',
  ghost: 'text-dark-600 hover:bg-dark-100 active:bg-dark-200',
  danger:
    'bg-error-500 text-white hover:bg-error-600 active:bg-error-700 shadow-sm shadow-error-500/20',
  outline:
    'border border-dark-300 text-dark-700 hover:bg-dark-50 hover:border-dark-400 active:bg-dark-100',
  success:
    'bg-success-600 text-white hover:bg-success-700 active:bg-success-700 shadow-sm shadow-success-600/20',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
