import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variantClasses = {
    primary:
      'bg-[#14513A] hover:bg-[#0E3B2A] text-white shadow-sm focus:ring-[#14513A] active:scale-[0.99]',
    secondary:
      'bg-[#EBF3EF] hover:bg-[#DCEAE4] text-[#14513A] focus:ring-[#1E9E5A]',
    outline:
      'bg-white border border-[#D1DCD6] text-[#14233F] hover:bg-[#F4F8F6] hover:border-[#14513A] focus:ring-[#14513A]',
    danger:
      'bg-[#D64545] hover:bg-[#B91C1C] text-white shadow-sm focus:ring-[#D64545]',
    ghost:
      'bg-transparent hover:bg-[#F4F8F6] text-[#4B5563] hover:text-[#14233F] focus:ring-gray-200'
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};

