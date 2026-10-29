import React, { useState } from 'react';

interface AicteLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLockup?: boolean;
  className?: string;
}

export const AicteLogo: React.FC<AicteLogoProps> = ({ size = 'md', showLockup = false, className = '' }) => {
  const [imgSrc, setImgSrc] = useState('/assets/aicte-official-logo.png');

  const dimensionMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const dim = dimensionMap[size];

  const handleImageError = () => {
    if (imgSrc === '/assets/aicte-official-logo.png') {
      setImgSrc('/assets/aicte-logo.png');
    } else if (imgSrc === '/assets/aicte-logo.png') {
      setImgSrc('/assets/aicte-logo.svg');
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={imgSrc}
        alt="All India Council for Technical Education (AICTE) Official Logo"
        className={`${dim} aspect-square object-contain flex-shrink-0 drop-shadow-xs`}
        loading="eager"
        decoding="async"
        onError={handleImageError}
      />

      {showLockup && (
        <div className="flex items-center gap-3 pl-1 border-l-2 border-[#D1DCD6]">
          <div className="flex flex-col">
            <span className="text-[13px] sm:text-[14px] font-bold text-[#14233F] tracking-tight leading-tight">
              All India Council for Technical Education
            </span>
            <span className="text-[11px] sm:text-[12px] font-medium text-[#4B5563] leading-tight mt-0.5">
              Ministry of Education, Government of India
            </span>
            <span className="text-[10px] sm:text-[11px] font-hindi text-[#14513A] font-semibold tracking-wide leading-tight mt-0.5">
              अखिल भारतीय तकनीकी शिक्षा परिषद
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
