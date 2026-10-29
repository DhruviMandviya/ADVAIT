import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'dark';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = ''
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; dotColor: string }> = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-[#14513A]',
      dotColor: 'bg-[#1E9E5A]'
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800',
      dotColor: 'bg-[#F5B335]'
    },
    error: {
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-[#D64545]',
      dotColor: 'bg-[#D64545]'
    },
    info: {
      bg: 'bg-sky-50 border-sky-200',
      text: 'text-[#2F6FDB]',
      dotColor: 'bg-[#2F6FDB]'
    },
    neutral: {
      bg: 'bg-slate-50 border-slate-200',
      text: 'text-[#4B5563]',
      dotColor: 'bg-slate-400'
    },
    dark: {
      bg: 'bg-[#14513A] border-[#0E3B2A]',
      text: 'text-white',
      dotColor: 'bg-[#1E9E5A]'
    }
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1'
  };

  const style = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${style.bg} ${style.text} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor} flex-shrink-0`} />}
      <span>{children}</span>
    </span>
  );
};

