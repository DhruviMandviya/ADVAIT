import React from 'react';

interface AdvaitWordmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showTagline?: boolean;
  className?: string;
}

export const AdvaitWordmark: React.FC<AdvaitWordmarkProps> = ({
  size = 'hero',
  showTagline = true,
  className = ''
}) => {
  const isHero = size === 'hero';
  const isLg = size === 'lg';
  const isMd = size === 'md';

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Wordmark row */}
      <div className="flex items-center tracking-tight">
        {/* Stylized 'A' */}
        <div className="relative inline-flex items-center justify-center">
          {/* Custom SVG Glyph for the iconic 'A' */}
          <svg
            viewBox="0 0 100 100"
            className={
              isHero
                ? 'w-12 h-12 sm:w-16 sm:h-16 mr-0.5'
                : isLg
                ? 'w-9 h-9 mr-0.5'
                : isMd
                ? 'w-7 h-7 mr-0.5'
                : 'w-6 h-6 mr-0.5'
            }
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Left green angled stroke */}
            <path
              d="M18 84L48 18"
              stroke="#1E9E5A"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Right dark-green stroke */}
            <path
              d="M48 18L82 84"
              stroke="#0E3B2A"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Remainder of wordmark: DVAIT */}
        <span
          className={`font-black tracking-tight text-[#0E3B2A] font-sans ${
            isHero
              ? 'text-4xl sm:text-5xl md:text-6xl tracking-[-0.04em]'
              : isLg
              ? 'text-2xl sm:text-3xl'
              : isMd
              ? 'text-xl sm:text-2xl'
              : 'text-lg'
          }`}
          style={{ letterSpacing: '-0.03em' }}
        >
          DVAIT
        </span>
      </div>

      {/* Taglines */}
      {showTagline && (
        <div className="mt-2.5 sm:mt-3">
          <h2 className="text-[#14233F] font-bold text-lg sm:text-xl md:text-[22px] tracking-tight leading-snug">
            <span className="block sm:inline">Trust in Every Record.&nbsp;</span>
            <span className="block sm:inline">Transparency in Every Step.</span>
          </h2>
          <p className="text-[#4B5563] text-xs sm:text-sm font-medium mt-1 tracking-normal">
            AICTE APAAR Student Registry and Verification Platform
          </p>
          {/* Subtle green underline accent */}
          <div className="w-12 h-1 bg-[#1E9E5A] rounded-full mt-3"></div>
        </div>
      )}
    </div>
  );
};

