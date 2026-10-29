import React, { useState } from 'react';
import { ExternalLink, X, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { mockRegulations } from '../../data/mockRegulations';

interface TopAnnouncementProps {
  slim?: boolean;
}

export const TopAnnouncement: React.FC<TopAnnouncementProps> = ({ slim = false }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const activeReg = mockRegulations[0];

  return (
    <>
      <div
        className={`w-full bg-[#14513A] text-white px-3 sm:px-6 transition-all z-30 ${
          slim ? 'py-1.5 text-xs' : 'py-2.5 text-xs sm:text-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left pill + message */}
          <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
            <span className="inline-flex items-center justify-center bg-[#F5B335] text-[#14233F] text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 shadow-sm">
              IMPORTANT
            </span>
            <span className="font-normal text-slate-100 truncate text-[12px] sm:text-[13px]">
              {activeReg.title}
            </span>
          </div>

          {/* Right action link */}
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 hidden sm:inline opacity-60">|</span>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-slate-200 hover:text-white underline decoration-emerald-400 underline-offset-4 text-xs font-medium cursor-pointer transition-colors"
            >
              <span>View Regulation Order</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Regulation Order Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E3EAE6] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#14513A] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#F5B335]">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-emerald-300 font-semibold tracking-wider uppercase block">
                    Official AICTE Notification
                  </span>
                  <h3 className="text-base sm:text-lg font-bold leading-tight">
                    Regulatory Mandate & Compliance Notice
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-[#4B5563] text-sm leading-relaxed">
              <div className="flex items-center justify-between bg-[#F4F8F6] p-3.5 rounded-xl border border-[#E3EAE6]">
                <div>
                  <span className="text-xs text-[#8A94A0] block">Order Reference No.</span>
                  <span className="font-semibold text-[#14233F]">{activeReg.orderNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#8A94A0] block">Gazette Date</span>
                  <span className="font-semibold text-[#14233F]">{activeReg.date}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#14233F] mb-1.5">{activeReg.title}</h4>
                <p className="text-xs sm:text-sm text-[#4B5563]">{activeReg.summary}</p>
              </div>

              <div className="border-t border-[#E3EAE6] pt-4 space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider text-[#14233F]">Key Directives for Institutions</h5>
                <div className="flex items-start gap-2.5 text-xs text-[#4B5563]">
                  <CheckCircle2 className="w-4 h-4 text-[#1E9E5A] flex-shrink-0 mt-0.5" />
                  <span>All admissions must carry valid 12-digit APAAR identity verified through MeriPehchaan DigiLocker.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#4B5563]">
                  <CheckCircle2 className="w-4 h-4 text-[#1E9E5A] flex-shrink-0 mt-0.5" />
                  <span>Mandatory electronic verification of joint Lien FDRs with AICTE must be updated before renewal deadline.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#4B5563]">
                  <ShieldAlert className="w-4 h-4 text-[#F5B335] flex-shrink-0 mt-0.5" />
                  <span>Non-compliant institutions will be flagged for automated quota audit and regulatory review.</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#F4F8F6] border-t border-[#E3EAE6] flex items-center justify-between gap-3">
              <span className="text-xs text-[#8A94A0]">Signed by Member Secretary, AICTE New Delhi</span>
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-[#14513A] hover:bg-[#0E3B2A] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

