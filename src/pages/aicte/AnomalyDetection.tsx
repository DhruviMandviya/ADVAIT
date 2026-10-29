import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  Send,
  CheckCircle2,
  Filter,
  BarChart2,
  TrendingUp,
  Zap,
  Building2,
  FileText,
  Briefcase,
  Calendar,
  User,
  Check,
  Eye,
  X
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { AnomalyItem, ComplianceNotice } from '../../types';

export const AnomalyDetection: React.FC = () => {
  const navigate = useNavigate();
  const { anomalies, institutions, cases, raiseNotice, raiseCaseNotice, markAnomalyReviewed } = useData();
  const toast = useToast();

  const [severityFilter, setSeverityFilter] = useState<'all' | 'Critical' | 'High' | 'Medium'>('all');
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyItem | null>(null);
  const [noticeText, setNoticeText] = useState('');
  const [supportingEvidence, setSupportingEvidence] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('Submit documentary justification and verified seat allotment gazette within statutory deadline.');
  const [assignedOfficer, setAssignedOfficer] = useState('Dr. R. K. Srivastav');
  const [deadlineDate, setDeadlineDate] = useState('2026-11-20');
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [issuedNoticeDetails, setIssuedNoticeDetails] = useState<ComplianceNotice | null>(null);

  const filteredAnomalies = anomalies.filter(
    (a) => severityFilter === 'all' || a.severity === severityFilter
  );

  const handleOpenNotice = (anom: AnomalyItem) => {
    setSelectedAnomaly(anom);
    setNoticeText(
      `Notice of Compliance Audit: AICTE Anomaly Detection flagged [${anom.type}] at ${anom.institutionName}. Discrepancy metric: ${anom.metric}. Formal institutional explanation required.`
    );
    setSupportingEvidence(`Algorithm flagged metric "${anom.metric}". Detected at: ${anom.detectedAt}. Reference logs confirmed discrepancy against sanctioned limits.`);
    setCorrectiveAction('Submit documentary justification, verified enrollment roster, and state quota approval gazette.');
    setAssignedOfficer(anom.assignedOfficial || 'Dr. R. K. Srivastav');
    setDeadlineDate('2026-11-20');
    setShowNoticeModal(true);
  };

  const handleSendNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnomaly) return;

    // Find linked case
    const linkedCase = cases.find(
      (c) => c.linkedAnomalyId === selectedAnomaly.id || c.primaryInstitutionId === selectedAnomaly.institutionId
    );

    if (linkedCase) {
      const res = raiseCaseNotice(
        linkedCase.id,
        {
          institutionId: selectedAnomaly.institutionId,
          description: noticeText,
          correctiveAction,
          deadlineDate,
          assignedOfficer
        },
        {
          name: assignedOfficer,
          role: 'Senior Director, Approval & APAAR Bureau'
        }
      );

      if (res.success && res.notice) {
        toast.success('Notice Issued Successfully', res.message);
        setIssuedNoticeDetails(res.notice);
        setShowNoticeModal(false);
      } else {
        toast.error('Notice Issuance Blocked', res.message);
      }
    } else {
      raiseNotice(selectedAnomaly.institutionId, noticeText);
      const fallbackNotice: ComplianceNotice = {
        id: `NOT-2026-${Math.floor(100 + Math.random() * 900)}`,
        caseId: `CASE-ANOM-${selectedAnomaly.id}`,
        institutionId: selectedAnomaly.institutionId,
        institutionName: selectedAnomaly.institutionName,
        orderNumber: `F.No. AICTE/AB/${selectedAnomaly.institutionId}/2026/NOT-01`,
        issueDate: new Date().toISOString().split('T')[0],
        responseDeadline: deadlineDate,
        assignedOfficer,
        officerRole: 'Senior Director, Approval Bureau',
        noticeDescription: noticeText,
        supportingEvidence,
        correctiveAction,
        status: 'Active'
      };
      setIssuedNoticeDetails(fallbackNotice);
      toast.success('Notice Issued', `Formal notice issued for ${selectedAnomaly.institutionName}.`);
      setShowNoticeModal(false);
    }
  };

  const handleMarkReviewed = (id: string) => {
    // Keep 'Mark Reviewed' separate from 'Mark as Resolved'. Reviewing an anomaly must not automatically resolve it.
    markAnomalyReviewed(id);
    toast.info('Anomaly Under Review', 'Official scrutiny logged in audit trail. Record is under review and NOT resolved.');
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Header (Part 1 Fix: Symmetric Alignment & Responsive Flow) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1 border-b border-[#E3EAE6]/60">
        {/* Left Heading & Description Block */}
        <div className="max-w-3xl space-y-1">
          <span className="text-xs font-bold text-[#D64545] tracking-wider uppercase flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#F5B335]" />
            <span>AICTE Innovation Engine</span>
          </span>
          <h1 className="text-2xl font-bold text-[#14233F] tracking-tight">
            Intelligent Anomaly Detection &amp; Risk Scoring
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
            Rule-based algorithmic heuristics detecting abnormal enrolment spikes, cross-institution identity reuse, and supernumerary ratio breaches.
          </p>
        </div>

        {/* Right Action Group: Case Manager Button + Flagged Indicator */}
        <div className="flex items-center gap-3 self-start lg:self-center flex-wrap sm:flex-nowrap flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/aicte/cases')}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold min-w-[190px] shadow-xs border-[#D1DCD6] hover:border-[#14513A] bg-white hover:bg-[#F4F8F6] text-[#14233F] transition-all"
            title="Open Centralized Compliance Case Manager"
          >
            <Briefcase className="w-4 h-4 text-[#14513A] flex-shrink-0" />
            <span className="leading-tight text-center">Compliance Case Manager</span>
          </Button>

          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#14233F] text-white shadow-xs whitespace-nowrap">
            <ShieldAlert className="w-4 h-4 text-[#F5B335] flex-shrink-0" />
            <span>{anomalies.length} Flagged Anomalies</span>
          </div>
        </div>
      </div>

      {/* Persistent Show-Cause Directive Issued Confirmation (Displayed only after successful creation) */}
      {issuedNoticeDetails && (
        <Card className="p-4 bg-emerald-50/80 border-2 border-emerald-300 relative shadow-xs animate-in fade-in">
          <button
            onClick={() => setIssuedNoticeDetails(null)}
            className="absolute top-3 right-3 text-[#14513A] hover:opacity-70 p-1"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#1E9E5A] flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1 pr-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#14513A]">
                  AICTE Show-Cause Notice Dispatched Successfully
                </span>
                <span className="font-mono text-xs font-bold bg-white text-[#14513A] px-2 py-0.5 rounded border border-emerald-300">
                  {issuedNoticeDetails.id}
                </span>
                <Badge variant="error" size="sm">Notice Issued</Badge>
              </div>

              <p className="text-xs text-[#14233F]">
                Order: <strong>{issuedNoticeDetails.orderNumber}</strong> &bull; Target Institution: <strong>{issuedNoticeDetails.institutionName}</strong>
              </p>

              <div className="p-2.5 bg-white/90 rounded-lg border border-emerald-200 text-xs text-[#4B5563] space-y-1">
                <p>
                  <strong>Notice Mandate:</strong> {issuedNoticeDetails.noticeDescription}
                </p>
                <p>
                  <strong>Mandated Corrective Action:</strong> {issuedNoticeDetails.correctiveAction}
                </p>
                <div className="flex flex-wrap gap-4 pt-1 font-semibold text-[11px] text-[#14513A]">
                  <span>Response Deadline: {issuedNoticeDetails.responseDeadline}</span>
                  <span>Assigned Officer: {issuedNoticeDetails.assignedOfficer}</span>
                  <span>Status: Dispatched to Institution Portal</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Innovation Architecture Explainer Card */}
      <Card className="p-6 bg-gradient-to-r from-[#14513A]/5 via-white to-amber-50/50 border-[#E3EAE6]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-sm font-bold text-[#14233F] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#14513A]" />
              <span>Multi-Factor Institutional Risk Scoring Formula</span>
            </h3>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              Every approved institution is evaluated against four real-time heuristic metrics:
              <br />
              &bull; <strong>Over-Intake Breach:</strong> Intake Score = (Actual Enrolment / Sanctioned Quota) &times; 40
              <br />
              &bull; <strong>Supernumerary Ceiling (&gt;15%):</strong> Adds +25 risk penalty
              <br />
              &bull; <strong>Cross-Institution APAAR Conflicts:</strong> Adds +30 risk penalty per instance
              <br />
              &bull; <strong>Sudden Intake Spikes (&gt;25% YoY):</strong> Adds +20 risk penalty
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center p-3 bg-white rounded-xl border border-[#D1DCD6] shadow-2xs">
              <span className="text-[10px] font-bold text-[#8A94A0] uppercase block">Critical Risk</span>
              <span className="text-xl font-black text-[#D64545]">
                {anomalies.filter((a) => a.severity === 'Critical').length}
              </span>
            </div>
            <div className="text-center p-3 bg-white rounded-xl border border-[#D1DCD6] shadow-2xs">
              <span className="text-[10px] font-bold text-[#8A94A0] uppercase block">High Risk</span>
              <span className="text-xl font-black text-amber-800">
                {anomalies.filter((a) => a.severity === 'High').length}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'Critical', 'High', 'Medium'] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              severityFilter === sev
                ? 'bg-[#14513A] text-white shadow-xs'
                : 'bg-white border border-[#D1DCD6] text-[#4B5563] hover:bg-[#F4F8F6]'
            }`}
          >
            {sev === 'all' ? `All Anomalies (${anomalies.length})` : `${sev} (${anomalies.filter((a) => a.severity === sev).length})`}
          </button>
        ))}
      </div>

      {/* Anomaly Cards List */}
      <div className="space-y-4">
        {filteredAnomalies.map((anom) => (
          <Card key={anom.id} className="p-5 border-l-4 border-l-[#D64545] hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-sm font-bold text-[#14233F]">{anom.type}</span>
                  <Badge
                    variant={
                      anom.severity === 'Critical'
                        ? 'error'
                        : anom.severity === 'High'
                        ? 'warning'
                        : 'info'
                    }
                    size="sm"
                  >
                    {anom.severity} Severity
                  </Badge>
                  <span className="text-xs font-bold text-[#14513A] bg-[#EBF3EF] px-2.5 py-0.5 rounded-full">
                    {anom.metric}
                  </span>
                  <Badge
                    variant={
                      anom.status === 'Resolved'
                        ? 'success'
                        : anom.status === 'Notice Issued'
                        ? 'error'
                        : anom.status === 'Under Review'
                        ? 'warning'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {anom.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-[#14233F]">
                  <Building2 className="w-4 h-4 text-[#8A94A0]" />
                  <span>{anom.institutionName} ({anom.institutionId})</span>
                </div>

                <p className="text-xs text-[#4B5563] leading-relaxed">{anom.description}</p>

                <div className="text-[10px] text-[#8A94A0] flex items-center gap-3">
                  <span>Detected: {anom.detectedAt}</span>
                  {anom.assignedOfficial && <span>&bull; Assigned: {anom.assignedOfficial}</span>}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex md:flex-col items-center md:items-end gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleOpenNotice(anom)}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Raise Notice
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkReviewed(anom.id)}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-[#1E9E5A]" />}
                >
                  Mark Reviewed
                </Button>
              </div>

            </div>
          </Card>
        ))}
      </div>

      {/* Show-Cause Notice Creation / Review Modal */}
      {showNoticeModal && selectedAnomaly && (
        <Modal
          isOpen={showNoticeModal}
          onClose={() => setShowNoticeModal(false)}
          title="Issue AICTE Show-Cause Notice Directive"
          description="Formulate regulatory show-cause directive under Section 10(1) of AICTE Act"
          maxWidth="2xl"
        >
          <form onSubmit={handleSendNotice} className="space-y-4 text-xs text-[#4B5563]">
            {/* Header summary of anomaly */}
            <div className="p-3 bg-[#F4F8F6] rounded-xl border border-[#D1DCD6] space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#14513A]" />
                  <span className="font-bold text-[#14233F]">{selectedAnomaly.institutionName}</span>
                  <span className="font-mono text-[11px] bg-white text-[#14513A] px-2 py-0.5 rounded border border-[#D1DCD6]">
                    {selectedAnomaly.institutionId}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    {selectedAnomaly.severity} Severity
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                    {selectedAnomaly.type}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[#14233F]">
                <strong>Detected Violation Metric: </strong>
                <span className="font-semibold text-[#D64545]">{selectedAnomaly.metric}</span> — {selectedAnomaly.description}
              </p>
            </div>

            {/* Directive content */}
            <div>
              <label className="text-xs font-bold text-[#14233F] block mb-1">
                Notice Directive Description *
              </label>
              <textarea
                rows={3}
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                className="w-full rounded-xl border border-[#D1DCD6] p-2.5 text-xs text-[#14233F] focus:border-[#14513A] outline-none"
                required
              />
            </div>

            {/* Supporting Evidence */}
            <div>
              <label className="text-xs font-bold text-[#14233F] block mb-1">
                Supporting Evidence Summary on Record *
              </label>
              <textarea
                rows={2}
                value={supportingEvidence}
                onChange={(e) => setSupportingEvidence(e.target.value)}
                className="w-full rounded-xl border border-[#D1DCD6] p-2.5 text-xs text-[#14233F] focus:border-[#14513A] outline-none"
                required
              />
            </div>

            {/* Corrective Action */}
            <div>
              <label className="text-xs font-bold text-[#14233F] block mb-1">
                Mandated Corrective Action Required from Institution *
              </label>
              <input
                type="text"
                value={correctiveAction}
                onChange={(e) => setCorrectiveAction(e.target.value)}
                className="w-full rounded-xl border border-[#D1DCD6] p-2.5 text-xs text-[#14233F] focus:border-[#14513A] outline-none"
                required
              />
            </div>

            {/* Assigned Officer & Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#14233F] block mb-1">
                  Assigned AICTE Bureau Officer *
                </label>
                <input
                  type="text"
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  className="w-full rounded-xl border border-[#D1DCD6] p-2 text-xs text-[#14233F] focus:border-[#14513A] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#14233F] block mb-1">
                  Institutional Response Deadline *
                </label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full rounded-xl border border-[#D1DCD6] p-2 text-xs font-mono text-[#14233F] focus:border-[#14513A] outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E3EAE6]">
              <Button type="button" variant="ghost" onClick={() => setShowNoticeModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" leftIcon={<Send className="w-3.5 h-3.5" />}>
                Dispatch Formal Notice
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
