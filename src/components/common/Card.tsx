import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverable = false, ...props }) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#E3EAE6] shadow-[0_2px_12px_rgba(20,81,58,0.04)] ${
        hoverable ? 'hover:shadow-[0_8px_24px_rgba(20,81,58,0.08)] hover:border-[#CFDCD5] transition-all duration-200' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

