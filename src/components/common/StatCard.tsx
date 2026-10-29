import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon,
  trend,
  variant = 'default',
  className = ''
}) => {
  const iconBgMap = {
    default: 'bg-[#EBF3EF] text-[#14513A]',
    success: 'bg-emerald-50 text-[#1E9E5A]',
    warning: 'bg-amber-50 text-[#F5B335]',
    danger: 'bg-rose-50 text-[#D64545]'
  };

  return (
    <Card hoverable className={`p-5 flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold text-[#8A94A0] uppercase tracking-wider">
          {label}
        </span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgMap[variant]}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-[#14233F] tracking-tight">
          {value}
        </div>
        {(subValue || trend) && (
          <div className="flex items-center gap-2 mt-1.5 text-xs">
            {trend && (
              <span
                className={`font-semibold ${
                  trend.isPositive ? 'text-[#1E9E5A]' : 'text-[#D64545]'
                }`}
              >
                {trend.value}
              </span>
            )}
            {subValue && <span className="text-[#8A94A0]">{subValue}</span>}
          </div>
        )}
      </div>
    </Card>
  );
};

