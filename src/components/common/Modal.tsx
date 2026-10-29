import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  contentClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'lg',
  contentClassName = 'p-6'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow || 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl'
  };

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      {/* Backdrop click dismiss */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative bg-white rounded-2xl border border-[#E3EAE6] shadow-2xl w-full ${widthClasses[maxWidth]} flex flex-col max-h-[calc(100dvh-32px)] sm:max-h-[calc(100vh-48px)] overflow-hidden z-10 animate-in zoom-in-95`}
      >
        {/* Header - Fixed & Pinned */}
        {(title || description) && (
          <div className="flex-shrink-0 px-6 py-4 border-b border-[#E3EAE6] flex items-start justify-between bg-[#F4F8F6]">
            <div className="pr-4">
              {title && <h3 className="text-base sm:text-lg font-bold text-[#14233F] leading-tight">{title}</h3>}
              {description && <p className="text-xs text-[#4B5563] mt-0.5 leading-normal">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-[#8A94A0] hover:text-[#14233F] p-1.5 rounded-lg hover:bg-black/5 transition-colors flex-shrink-0 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content body - Independently Scrollable */}
        <div className={`flex-1 overflow-y-auto overscroll-contain ${contentClassName}`}>
          {children}
        </div>

        {/* Footer - Pinned & Accessible */}
        {footer && (
          <div className="flex-shrink-0 border-t border-[#E3EAE6] bg-[#F4F8F6] px-6 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
};
