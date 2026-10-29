import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitCompare, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, UserX, Building2, Calendar, Briefcase } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { CrossDuplicate } from '../../types';

export const DuplicateDetector: React.FC = () => {
  const navigate = useNavigate();
  const { crossDuplicates, resolveCrossDuplicate } = useData();
  const toast = useToast();

  const [selectedConflict, setSelectedConflict] = useState<CrossDuplicate | null>(null);

  const handleResolve = (apaarId: string, resolution: 'Flag Both' | 'Verify Primary' | 'Revoke Secondary') => {
    resolveCrossDuplicate(apaarId, resolution);
    toast.success('Resolution Applied', `Action [${resolution}] applied to APAAR ${apaarId}.`);
    setSelectedConflict(null);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#D64545] tracking-wider uppercase flex items-center gap-1.5">
            <GitCompare className="w-4 h-4" />
            <span>Cross-Institution Integrity Detector</span>
          </span>
          <h1 className="text-2xl font-bold text-[#14233F] tracking-tight">
            Dual Concurrent Enrolment Detector
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5">
            Automated correlation engine identifies duplicate student admissions across separate AICTE approved institutions sharing the same APAAR ID.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/aicte/cases')}
            className="flex items-center gap-1.5"
          >
            <Briefcase className="w-4 h-4 text-[#14513A]" />
            <span>Open in Case Manager</span>
          </Button>
          <Badge variant="error" size="md">
            {crossDuplicates.filter((c) => c.status === 'Unresolved').length} Unresolved Conflicts
          </Badge>
        </div>
      </div>

      {/* Advisory Card */}
      <Card className="p-5 bg-amber-50/50 border-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#F5B335] flex-shrink-0 mt-0.5" />
          <div className="text-xs text-[#4B5563] space-y-1">
            <strong className="text-[#14233F] block font-bold">
              Statutory Single Enrolment Principle (AICTE Act Section 10)
            </strong>
            <p>
              Under AICTE and National Academic Identity norms, a student cannot hold concurrent active enrolments across two approved full-time degree programmes. The detector identifies identity overlaps upon CSV ingestion or ERP sync.
            </p>
          </div>
        </div>
      </Card>

      {/* Conflicts List */}
      <div className="space-y-6">
        {crossDuplicates.map((conflict) => (
          <Card key={conflict.apaarId} className="p-6 border-l-4 border-l-[#D64545] space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3EAE6]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#14233F]">{conflict.studentName}</span>
                  <Badge variant={conflict.status === 'Unresolved' ? 'error' : 'success'} size="sm">
                    {conflict.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono font-bold text-[#14513A] bg-[#EBF3EF] px-2 py-0.5 rounded">
                    APAAR: {conflict.apaarId}
                  </span>
                  <span className="text-xs text-[#8A94A0]">&bull; Detected: {conflict.detectedOn}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResolve(conflict.apaarId, 'Flag Both')}
                >
                  Flag Both for Hearing
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleResolve(conflict.apaarId, 'Verify Primary')}
                >
                  Confirm Primary Enrolment
                </Button>
              </div>
            </div>

            {/* Side-by-Side Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Institution 1 */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#1E9E5A] uppercase tracking-wider">
                    Institution 1 (Primary / First Registered)
                  </span>
                  <span className="text-[10px] bg-white text-[#14513A] font-semibold px-2 py-0.5 rounded border border-emerald-200">
                    Earlier Admission
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#14233F]">
                  {conflict.firstInstitution.name}
                </h4>

                <div className="text-xs space-y-1 text-[#4B5563] pt-1">
                  <p>Programme: <strong>{conflict.firstInstitution.programme}</strong></p>
                  <p>Roll Number: <span className="font-mono">{conflict.firstInstitution.studentId}</span></p>
                  <p>Admission Date: <strong>{conflict.firstInstitution.admissionDate}</strong></p>
                </div>
              </div>

              {/* Institution 2 */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#D64545] uppercase tracking-wider">
                    Institution 2 (Concurrent Claim)
                  </span>
                  <span className="text-[10px] bg-white text-rose-800 font-semibold px-2 py-0.5 rounded border border-rose-200">
                    Conflicting Admission
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#14233F]">
                  {conflict.secondInstitution.name}
                </h4>

                <div className="text-xs space-y-1 text-[#4B5563] pt-1">
                  <p>Programme: <strong>{conflict.secondInstitution.programme}</strong></p>
                  <p>Roll Number: <span className="font-mono">{conflict.secondInstitution.studentId}</span></p>
                  <p>Admission Date: <strong>{conflict.secondInstitution.admissionDate}</strong></p>
                </div>
              </div>

            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

