import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightElement, wrapperClassName = '', className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`w-full flex flex-col gap-1.5 ${wrapperClassName}`}>
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold text-[#14233F] uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#8A94A0] pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-xl border bg-white text-[#14233F] text-sm transition-all outline-none placeholder:text-[#8A94A0] ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${rightElement ? 'pr-11' : 'pr-3.5'} py-2.5 ${
              error
                ? 'border-[#D64545] focus:border-[#D64545] focus:ring-2 focus:ring-[#D64545]/20'
                : 'border-[#D1DCD6] focus:border-[#14513A] focus:ring-2 focus:ring-[#14513A]/20 hover:border-[#A8C2B6]'
            } ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && <span className="text-xs text-[#D64545] font-medium">{error}</span>}
        {hint && !error && <span className="text-xs text-[#8A94A0]">{hint}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

