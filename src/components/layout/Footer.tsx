import React from 'react';
import { AicteLogo } from '../common/AicteLogo';
import { useToast } from '../../context/ToastContext';

export const Footer: React.FC = () => {
  const toast = useToast();

  return (
    <footer className="w-full bg-white border-t border-[#E3EAE6] py-6 px-4 sm:px-8 mt-auto z-10">
      <div className="max-w-[1480px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: AICTE emblem + Tagline */}
        <div className="flex items-center gap-3">
          <AicteLogo size="sm" showLockup={false} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-[#14233F]">ADVAIT</span>
              <span className="text-xs text-[#8A94A0]">&bull;</span>
              <span className="text-xs font-semibold text-[#14513A]">
                Trust in Every Record. Transparency in Every Step.
              </span>
            </div>
            <p className="text-[11px] text-[#4B5563] mt-0.5">
              Integrated National Academic Identity Registry &bull; All India Council for Technical Education
            </p>
          </div>
        </div>

        {/* Right: Policy links & Copyright */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#4B5563]">
          <button
            onClick={() => toast.info('Privacy Notice', 'Digital Personal Data Protection (DPDP) Act 2023 compliant.')}
            className="hover:text-[#14513A] transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
          <span>&bull;</span>
          <button
            onClick={() => toast.info('Terms & Regulatory Framework', 'Governed by AICTE Approval Process Handbook (APH 2026-27).')}
            className="hover:text-[#14513A] transition-colors cursor-pointer"
          >
            Terms of Use
          </button>
          <span>&bull;</span>
          <button
            onClick={() => toast.info('Helpdesk', 'Technical Support: 1800-11-2026 | helpdesk@aicte-india.org')}
            className="hover:text-[#14513A] transition-colors cursor-pointer"
          >
            Help Desk
          </button>
          <span>&bull;</span>
          <span className="text-[#8A94A0] font-medium">
            &copy; 2026 AICTE, Ministry of Education, Government of India
          </span>
        </div>

      </div>
    </footer>
  );
};

