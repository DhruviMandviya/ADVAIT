import React from 'react';
import { GraduationCap, BookOpen, Building2, Award } from 'lucide-react';

export const WatermarkBg: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Top Left: Graduation Cap */}
      <div className="absolute -top-12 -left-12 text-[#14513A] opacity-[0.05] transform -rotate-12">
        <GraduationCap className="w-80 h-80" strokeWidth={1.2} />
      </div>

      {/* Top Right: Open Book */}
      <div className="absolute top-12 right-1/4 text-[#14513A] opacity-[0.04] transform rotate-6">
        <BookOpen className="w-72 h-72" strokeWidth={1.2} />
      </div>

      {/* Bottom Left: Document/Award */}
      <div className="absolute bottom-6 left-8 text-[#14513A] opacity-[0.05] transform rotate-3">
        <Award className="w-64 h-64" strokeWidth={1.2} />
      </div>

      {/* Bottom Center-Right: Institution Building */}
      <div className="absolute -bottom-10 right-1/3 text-[#14513A] opacity-[0.05]">
        <Building2 className="w-96 h-96" strokeWidth={1} />
      </div>
    </div>
  );
};

