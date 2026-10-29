import React from 'react';
import { Building2, UploadCloud, CheckCircle, ShieldCheck, Database, BarChart3, Award } from 'lucide-react';

interface PipelineStepperProps {
  currentStep?: number;
  className?: string;
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({ currentStep = 3, className = '' }) => {
  const steps = [
    { title: 'Institution', desc: 'Approved AICTE Institute', icon: Building2 },
    { title: 'Data Upload', desc: 'Single / Bulk / API', icon: UploadCloud },
    { title: 'APAAR Validation', desc: '12-Digit & Dupe Checks', icon: CheckCircle },
    { title: 'Data Verification', desc: 'Anomaly & Supernumerary', icon: ShieldCheck },
    { title: 'Central Repository', desc: 'Unified Student Vault', icon: Database },
    { title: 'Analytics & Monitoring', desc: 'Quota & Compliance', icon: BarChart3 },
    { title: 'Authorized Verification', desc: 'Employers & Regulators', icon: Award }
  ];

  return (
    <div className={`w-full bg-white p-4 sm:p-5 rounded-2xl border border-[#E3EAE6] shadow-xs ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-bold text-[#1E9E5A] tracking-wider uppercase">
            AICTE End-to-End Pipeline
          </span>
          <h4 className="text-sm sm:text-base font-bold text-[#14233F]">
            APAAR Academic Identity Lifecycle
          </h4>
        </div>
        <span className="text-xs bg-[#EBF3EF] text-[#14513A] font-semibold px-2.5 py-1 rounded-full">
          Live Architecture
        </span>
      </div>

      {/* Stepper horizontal flow */}
      <div className="relative overflow-x-auto pb-2">
        <div className="flex items-center min-w-[760px] justify-between relative">
          {/* Connector Line */}
          <div className="absolute top-5 left-6 right-6 h-0.5 bg-[#E3EAE6] -z-0" />

          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            const Icon = step.icon;

            return (
              <div key={step.title} className="flex flex-col items-center text-center relative z-10 px-2 group">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-[#1E9E5A] text-white shadow-sm'
                      : isCurrent
                      ? 'bg-[#14513A] text-white ring-4 ring-[#1E9E5A]/20 shadow-md scale-105'
                      : 'bg-white border-2 border-[#D1DCD6] text-[#8A94A0]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs font-bold mt-2 truncate max-w-[100px] ${
                    isCurrent ? 'text-[#14513A]' : isCompleted ? 'text-[#14233F]' : 'text-[#8A94A0]'
                  }`}
                >
                  {step.title}
                </span>
                <span className="text-[10px] text-[#8A94A0] truncate max-w-[110px] mt-0.5">
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

