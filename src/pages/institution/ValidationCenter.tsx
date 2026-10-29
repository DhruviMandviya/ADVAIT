import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RotateCw,
  Search,
  Eye,
  Send,
  Building2,
  History,
  Info,
  Calendar,
  User,
  ExternalLink,
  ShieldCheck,
  Paperclip,
  GitCompare,
  UploadCloud,
  FileCheck2,
  FileSpreadsheet,
  Download,
  Check,
  ChevronRight,
  Filter,
  UserX,
  ArrowRight,
  MessageSquare,
  AlertOctagon,
  FileText,
  HelpCircle,
  CalendarClock,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import {
  ComplianceCase,
  ComplianceNotice,
  CaseStatus,
  ResponseDocument,
  StudentCorrectionPayload,
  Student
} from '../../types';

export const ValidationCenter: React.FC = () => {
  const { user } = useAuth();
  const currentInstId = user?.institutionId || 'INST102';
  const {
    cases,
    students,
    activeNoticesCountForInstitution,
    submitInstitutionResponse,
    requestCaseClarification,
    requestDeadlineExtension,
    fixValidationIssue,
    dismissValidationIssue,
    revalidateAll
  } = useData();
  const toast = useToast();

  // Institution-scoped cases (Requirement I: Data Isolation)
  const instCases = cases.filter((c) => c.institutionIds.includes(currentInstId));

  // Active top-level Tab (Requirement C)
  const [activeTab, setActiveTab] = useState<
    | 'All Cases'
    | 'Data Validation Issues'
    | 'Cross-Institution Conflicts'
    | 'Intake & Quota Issues'
    | 'Notices Received'
    | 'Responses Submitted'
    | 'Resolved Cases'
  >('All Cases');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Selected Case & Modal States
  const [selectedCase, setSelectedCase] = useState<ComplianceCase | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<ComplianceNotice | null>(null);
  const [caseModalTab, setCaseModalTab] = useState<'overview' | 'submissions' | 'audit'>('overview');

  // Response / Record Correction Modal State (Requirement E)
  const [responseModalCase, setResponseModalCase] = useState<ComplianceCase | null>(null);
  const [explanation, setExplanation] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<ResponseDocument[]>([]);
  const [newDocName, setNewDocName] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [studentIdToCorrect, setStudentIdToCorrect] = useState('');
  const [correctedApaar, setCorrectedApaar] = useState('');
  const [correctedName, setCorrectedName] = useState('');
  const [correctionNote, setCorrectionNote] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [submissionSuccessInfo, setSubmissionSuccessInfo] = useState<{
    caseId: string;
    timestamp: string;
    submissionNumber: number;
  } | null>(null);

  // Clarification Modal State (Requirement D)
  const [clarificationModalNotice, setClarificationModalNotice] = useState<{ caseId: string; notice: ComplianceNotice } | null>(null);
  const [clarificationQuery, setClarificationQuery] = useState('');
  const [isSubmittingClarification, setIsSubmittingClarification] = useState(false);

  // Deadline Extension Modal State (Requirement D)
  const [extensionModalNotice, setExtensionModalNotice] = useState<{ caseId: string; notice: ComplianceNotice } | null>(null);
  const [requestedExtensionDate, setRequestedExtensionDate] = useState('2026-12-10');
  const [extensionJustification, setExtensionJustification] = useState('');
  const [isSubmittingExtension, setIsSubmittingExtension] = useState(false);

  // Standalone Individual Student Flag Fix Modal (Retained from Validation Center)
  const [fixingStudent, setFixingStudent] = useState<Student | null>(null);
  const [fixedApaar, setFixedApaar] = useState('');
  const [fixedName, setFixedName] = useState('');

  // Standalone Flag Dismiss Modal
  const [dismissingStudent, setDismissingStudent] = useState<Student | null>(null);
  const [dismissReason, setDismissReason] = useState('');

  // Flagged students for this institution (Retained from Validation Center)
  const institutionFlaggedStudents = students.filter(
    (s) => s.status === 'Flagged' && s.institutionId === currentInstId
  );

  // ================= DYNAMIC SUMMARY KPI CARDS (Requirement B) =================
  const totalOpenCases = instCases.filter((c) => c.status !== 'Resolved').length;
  const noticesRequiringResponse = instCases.filter(
    (c) => c.status === 'Notice Issued' || c.status === 'Action Required' || (c.notices.some((n) => n.status === 'Active' && n.institutionId === currentInstId) && c.status !== 'Resolved')
  ).length;
  const responsesUnderAicteReview = instCases.filter(
    (c) => c.status === 'Response Submitted' || c.status === 'Under AICTE Review'
  ).length;
  const furtherActionRequired = instCases.filter((c) => c.status === 'Further Action Required').length;
  const resolvedCases = instCases.filter((c) => c.status === 'Resolved').length;

  // Filter cases based on active tab and search
  const filteredCases = instCases.filter((c) => {
    // Tab Filter
    if (activeTab === 'Data Validation Issues') {
      if (c.issueType !== 'Invalid APAAR ID' && c.issueType !== 'Internal Duplicate' && c.issueType !== 'Data Inconsistency') {
        return false;
      }
    } else if (activeTab === 'Cross-Institution Conflicts') {
      if (c.issueType !== 'Cross-Institution Conflict') return false;
    } else if (activeTab === 'Intake & Quota Issues') {
      if (c.issueType !== 'Intake/Quota Violation' && c.issueType !== 'Supernumerary Breach' && c.issueType !== 'Sudden Intake Spike') {
        return false;
      }
    } else if (activeTab === 'Notices Received') {
      if (!c.notices || c.notices.length === 0 || !c.notices.some((n) => n.institutionId === currentInstId)) {
        return false;
      }
    } else if (activeTab === 'Responses Submitted') {
      if (c.status !== 'Response Submitted' && c.status !== 'Under AICTE Review') {
        return false;
      }
    } else if (activeTab === 'Resolved Cases') {
      if (c.status !== 'Resolved') return false;
    }

    // Severity Filter
    if (severityFilter !== 'all' && c.severity !== severityFilter) return false;

    // Search Filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchId = c.id.toLowerCase().includes(term);
      const matchTitle = c.title.toLowerCase().includes(term);
      const matchType = c.issueType.toLowerCase().includes(term);
      const matchApaar = c.linkedApaarId?.toLowerCase().includes(term);
      const matchNotice = c.notices.some((n) => n.id.toLowerCase().includes(term) || n.orderNumber.toLowerCase().includes(term));
      const matchDesc = c.description.toLowerCase().includes(term);
      return matchId || matchTitle || matchType || matchApaar || matchNotice || matchDesc;
    }

    return true;
  });

  // Helper for status badge rendering (Requirement G)
  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case 'Notice Issued':
      case 'Action Required':
        return <Badge variant="error">{status}</Badge>;
      case 'Further Action Required':
        return <Badge variant="warning">Further Action Required</Badge>;
      case 'Response Submitted':
        return <Badge variant="info">Response Submitted</Badge>;
      case 'Under AICTE Review':
        return <Badge variant="info">Under AICTE Review</Badge>;
      case 'Resolved':
        return <Badge variant="success">Resolved</Badge>;
      case 'Escalated':
        return <Badge variant="error">Escalated</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  // Open Response & Correction Modal
  const handleOpenResponseModal = (c: ComplianceCase) => {
    setResponseModalCase(c);
    setExplanation('');
    setActionTaken('');
    setSelectedDocs([]);
    setNewDocName('');
    setNewDocDesc('');
    setCorrectionNote('');
    setStudentIdToCorrect(c.linkedStudentIds[0] || '');
    setCorrectedApaar(c.linkedApaarId || '');
    setCorrectedName('');
  };

  // Add sample document preset
  const handleAddSampleDoc = (preset: { name: string; size: string; type: string; desc: string }) => {
    const doc: ResponseDocument = {
      id: `DOC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      fileName: preset.name,
      fileSize: preset.size,
      fileType: preset.type,
      uploadedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      description: preset.desc
    };
    setSelectedDocs((prev) => [...prev, doc]);
  };

  // Add custom document
  const handleAddCustomDoc = () => {
    if (!newDocName.trim()) {
      toast.error('Document Name Required', 'Please enter a valid document name or file title.');
      return;
    }
    const doc: ResponseDocument = {
      id: `DOC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      fileName: newDocName.trim().endsWith('.pdf') ? newDocName.trim() : `${newDocName.trim()}.pdf`,
      fileSize: '1.4 MB',
      fileType: 'application/pdf',
      uploadedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      description: newDocDesc.trim() || 'Institutional authenticated verification evidence'
    };
    setSelectedDocs((prev) => [...prev, doc]);
    setNewDocName('');
    setNewDocDesc('');
  };

  const handleRemoveDoc = (id: string) => {
    setSelectedDocs((prev) => prev.filter((d) => d.id !== id));
  };

  // Submit Response Form (Requirement E)
  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseModalCase) return;

    if (!explanation.trim() || explanation.trim().length < 15) {
      toast.error('Detailed Explanation Required', 'Please provide an institutional explanation of at least 15 characters.');
      return;
    }

    setIsSubmittingResponse(true);

    const corrections: StudentCorrectionPayload[] = [];
    if (studentIdToCorrect || correctedApaar || correctedName) {
      corrections.push({
        studentId: studentIdToCorrect || responseModalCase.linkedStudentIds[0] || 'STU-REF',
        apaarId: correctedApaar.trim() || undefined,
        name: correctedName.trim() || undefined,
        statusNote: correctionNote.trim() || 'Institutional record update submitted for AICTE verification.'
      });
    }

    const res = submitInstitutionResponse(responseModalCase.id, currentInstId, {
      explanation: explanation.trim(),
      actionTaken: actionTaken.trim() || 'Submitted institutional explanation, documentary evidence, and student updates.',
      documents: selectedDocs,
      studentCorrections: corrections.length > 0 ? corrections : undefined,
      submittedBy: user?.name ? `${user.name} (${user.designation || 'Registrar'})` : 'Dr. Sunil Bhirud (Director, COEP)'
    });

    setIsSubmittingResponse(false);

    if (res.success && res.response) {
      toast.success('Response Submitted Successfully', res.message);
      setSubmissionSuccessInfo({
        caseId: responseModalCase.id,
        timestamp: res.response.submittedAt,
        submissionNumber: res.response.submissionNumber
      });
      setResponseModalCase(null);
    } else {
      toast.error('Submission Blocked', res.message);
    }
  };

  // Submit Clarification Query (Requirement D)
  const handleSubmitClarification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarificationModalNotice || !clarificationQuery.trim()) return;

    setIsSubmittingClarification(true);
    const res = requestCaseClarification(
      clarificationModalNotice.caseId,
      clarificationModalNotice.notice.id,
      clarificationQuery.trim(),
      user?.name || 'Institution Nodal Officer'
    );
    setIsSubmittingClarification(false);

    if (res.success) {
      toast.success('Clarification Request Dispatched', res.message);
      setClarificationModalNotice(null);
      setClarificationQuery('');
    } else {
      toast.error('Action Failed', res.message);
    }
  };

  // Submit Deadline Extension Request (Requirement D)
  const handleSubmitExtension = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extensionModalNotice || !extensionJustification.trim()) return;

    setIsSubmittingExtension(true);
    const res = requestDeadlineExtension(
      extensionModalNotice.caseId,
      extensionModalNotice.notice.id,
      requestedExtensionDate,
      extensionJustification.trim(),
      user?.name || 'Institution Nodal Officer'
    );
    setIsSubmittingExtension(false);

    if (res.success) {
      toast.success('Extension Request Submitted', res.message);
      setExtensionModalNotice(null);
      setExtensionJustification('');
    } else {
      toast.error('Action Failed', res.message);
    }
  };

  // Handle standalone fix of flagged student record (Retained from Validation Center)
  const handleApplyStudentFix = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fixingStudent) return;

    const raw = fixedApaar.replace(/\D/g, '');
    if (raw.length !== 12) {
      toast.error('Format Error', 'Valid APAAR ID must contain exactly 12 numeric digits.');
      return;
    }

    fixValidationIssue(fixingStudent.id, {
      apaarId: fixedApaar,
      name: fixedName
    });

    toast.success('Validation Resolved', `Record for ${fixedName} corrected and marked as Validated.`);
    setFixingStudent(null);
  };

  const handleApplyStudentDismiss = () => {
    if (!dismissingStudent) return;
    dismissValidationIssue(dismissingStudent.id, dismissReason);
    toast.info('Issue Dismissed', 'Flag overridden under institutional nodal officer audit authorization.');
    setDismissingStudent(null);
  };

  const handleRevalidate = () => {
    const res = revalidateAll();
    toast.success('Re-Validation Complete', `Re-evaluated ${res.total} records across institutional registry (${res.flagged} flagged).`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header (Requirement A) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#14233F]">Compliance &amp; Resolution Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EBF3EF] text-[#14513A] border border-[#D1DCD6]">
              Section 10(1) AICTE Act &amp; APAAR Registry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1">
            Review flagged student records, respond to AICTE notices, submit corrections, and track compliance case resolution.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevalidate}
            leftIcon={<RotateCw className="w-4 h-4 text-[#14513A]" />}
          >
            Re-Validate Registry Records
          </Button>
          <div className="px-3 py-1.5 bg-[#F4F8F6] border border-[#E3EAE6] rounded-xl text-xs font-semibold text-[#14513A] flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#1E9E5A]" />
            <span>{user?.institutionName || 'COEP Technological University'}</span>
          </div>
        </div>
      </div>

      {/* Submission Success Alert Banner (Requirement E) */}
      {submissionSuccessInfo && (
        <Card className="p-4 bg-emerald-50 border-2 border-emerald-300 relative shadow-xs animate-in fade-in">
          <button
            onClick={() => setSubmissionSuccessInfo(null)}
            className="absolute top-3 right-3 text-[#14513A] hover:opacity-70 p-1"
            title="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#1E9E5A] flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-[#14513A]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">
                  Institutional Response #{submissionSuccessInfo.submissionNumber} Submitted Successfully
                </span>
                <span className="font-mono text-xs bg-white text-[#14513A] px-2 py-0.5 rounded border border-emerald-300">
                  {submissionSuccessInfo.caseId}
                </span>
                <Badge variant="info" size="sm">Response Submitted</Badge>
              </div>
              <p className="text-[#4B5563]">
                Your response and attached documentary evidence were cryptographically timestamped at <strong>{submissionSuccessInfo.timestamp}</strong> and routed to the assigned AICTE Approval Bureau Officer.
              </p>
              <p className="italic text-[#8A94A0]">
                * Regulatory Notice: In compliance with council rules, resubmitted records enter "Response Submitted / Under AICTE Review" and do not automatically become verified until approved by AICTE.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* AICTE Active Show-Cause Directive Banner */}
      {noticesRequiringResponse > 0 && !submissionSuccessInfo && (
        <div className="bg-[#FFF8EB] border-l-4 border-[#F5B335] p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-[#78350F]">
                {noticesRequiringResponse} AICTE Show-Cause Notice(s) Requiring Institutional Action
              </h4>
              <p className="text-xs text-[#92400E] mt-0.5">
                Statutory council directives mandate documented factual explanation, authenticating evidence upload, and student data correction before response deadlines.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setActiveTab('Notices Received')}
            className="flex-shrink-0 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>View &amp; Respond to Notices ({noticesRequiringResponse})</span>
          </Button>
        </div>
      )}

      {/* Data-Driven Summary KPI Cards (5 Mandatory Cards - Requirement B) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="p-3.5 border-l-4 border-l-[#14513A]">
          <span className="text-[10px] font-bold text-[#8A94A0] uppercase tracking-wider block">
            Total Open Cases
          </span>
          <div className="text-2xl font-black text-[#14233F] mt-1">{totalOpenCases}</div>
          <span className="text-[11px] text-[#4B5563]">Active Inquiries</span>
        </Card>

        <Card className="p-3.5 border-l-4 border-l-[#D64545]">
          <span className="text-[10px] font-bold text-[#8A94A0] uppercase tracking-wider block">
            Notices Requiring Response
          </span>
          <div className="text-2xl font-black text-[#D64545] mt-1">{noticesRequiringResponse}</div>
          <span className="text-[11px] text-[#8A94A0]">Action Required</span>
        </Card>

        <Card className="p-3.5 border-l-4 border-l-[#2563EB]">
          <span className="text-[10px] font-bold text-[#8A94A0] uppercase tracking-wider block">
            Responses Under AICTE Review
          </span>
          <div className="text-2xl font-black text-[#2563EB] mt-1">{responsesUnderAicteReview}</div>
          <span className="text-[11px] text-[#8A94A0]">Under Bureau Review</span>
        </Card>

        <Card className="p-3.5 border-l-4 border-l-[#F5B335]">
          <span className="text-[10px] font-bold text-[#8A94A0] uppercase tracking-wider block">
            Further Action Required
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">{furtherActionRequired}</div>
          <span className="text-[11px] text-[#8A94A0]">Clarification Demanded</span>
        </Card>

        <Card className="p-3.5 border-l-4 border-l-[#1E9E5A]">
          <span className="text-[10px] font-bold text-[#8A94A0] uppercase tracking-wider block">
            Resolved Cases
          </span>
          <div className="text-2xl font-black text-[#1E9E5A] mt-1">{resolvedCases}</div>
          <span className="text-[11px] text-[#8A94A0]">Formally Cleared</span>
        </Card>
      </div>

      {/* Case Management Navigation Tabs (7 Mandatory Tabs - Requirement C) */}
      <div className="flex border-b border-[#E3EAE6] text-xs font-bold gap-1 overflow-x-auto select-none">
        {(
          [
            { id: 'All Cases', count: instCases.length },
            {
              id: 'Data Validation Issues',
              count: instCases.filter(
                (c) =>
                  c.issueType === 'Invalid APAAR ID' ||
                  c.issueType === 'Internal Duplicate' ||
                  c.issueType === 'Data Inconsistency'
              ).length
            },
            {
              id: 'Cross-Institution Conflicts',
              count: instCases.filter((c) => c.issueType === 'Cross-Institution Conflict').length
            },
            {
              id: 'Intake & Quota Issues',
              count: instCases.filter(
                (c) =>
                  c.issueType === 'Intake/Quota Violation' ||
                  c.issueType === 'Supernumerary Breach' ||
                  c.issueType === 'Sudden Intake Spike'
              ).length
            },
            {
              id: 'Notices Received',
              count: instCases.filter((c) => c.notices && c.notices.some((n) => n.institutionId === currentInstId)).length
            },
            {
              id: 'Responses Submitted',
              count: instCases.filter(
                (c) =>
                  (c.responses && c.responses.some((r) => r.institutionId === currentInstId)) ||
                  c.status === 'Response Submitted' ||
                  c.status === 'Under AICTE Review'
              ).length
            },
            {
              id: 'Resolved Cases',
              count: resolvedCases
            }
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-3.5 border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'border-[#14513A] text-[#14513A] bg-emerald-50/40 rounded-t-lg'
                : 'border-transparent text-[#4B5563] hover:text-[#14233F] hover:bg-gray-50'
            }`}
          >
            <span>{tab.id}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === tab.id ? 'bg-[#14513A] text-white' : 'bg-gray-100 text-[#4B5563]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Secondary Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#8A94A0] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Case ID, student, APAAR, Notice ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E3EAE6] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#14513A] bg-white"
          />
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs text-[#8A94A0] font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Severity:
          </span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="p-1.5 border border-[#E3EAE6] rounded-lg text-xs font-semibold text-[#14233F] bg-white"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* TAB CONTENT: TAB 5 - NOTICES RECEIVED (Requirement D) */}
      {activeTab === 'Notices Received' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#F4F8F6] border border-[#D1DCD6] rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-[#14513A] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#14513A] space-y-0.5">
              <strong className="text-sm font-bold block">Official AICTE Regulatory Notices Received</strong>
              <p>
                Every show-cause directive issued by the AICTE Approval &amp; APAAR Bureau to your institution appears here. Directives carry mandatory response deadlines. You may submit responses with documentary evidence, request regulatory clarifications, or request formal deadline extensions.
              </p>
              <p className="italic text-[11px] text-[#4B5563] pt-1">
                * Note: In accordance with council regulations, institutions cannot modify or delete original AICTE notices.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {instCases
              .filter((c) => c.notices && c.notices.some((n) => n.institutionId === currentInstId))
              .map((c) => {
                const notice = c.notices.find((n) => n.institutionId === currentInstId) || c.notices[0];
                const isOverdue = new Date(notice.responseDeadline) < new Date() && notice.status === 'Active';

                return (
                  <Card key={notice.id} className="p-5 border-l-4 border-l-[#D64545] space-y-4">
                    {/* Notice Top Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E3EAE6] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#14513A] bg-[#EBF3EF] px-2 py-0.5 rounded">
                            {notice.id}
                          </span>
                          <span className="font-bold text-sm text-[#14233F]">{notice.orderNumber}</span>
                          <Badge variant={notice.status === 'Active' ? 'error' : 'neutral'} size="sm">
                            {notice.status}
                          </Badge>
                          {isOverdue && <Badge variant="error" size="sm">Overdue</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#8A94A0] mt-1">
                          <span>Case Ref: <strong>{c.id}</strong> ({c.issueType})</span>
                          <span>&bull;</span>
                          <span className="text-[#14233F]">Severity: <strong>{c.severity}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[#8A94A0] flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Issued: {notice.issueDate}
                        </span>
                        <span className="font-semibold text-[#D64545] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Deadline: {notice.responseDeadline}
                        </span>
                      </div>
                    </div>

                    {/* Notice Mandate & Evidence Summary */}
                    <div className="text-xs text-[#14233F] space-y-2">
                      <div>
                        <span className="font-bold block text-[11px] text-[#8A94A0] uppercase tracking-wider">
                          Detected Issue Description
                        </span>
                        <p className="mt-0.5 leading-relaxed">{notice.noticeDescription}</p>
                      </div>

                      <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl space-y-1">
                        <span className="font-bold block text-[10px] text-[#D64545] uppercase tracking-wider">
                          Supporting Evidence Available on Council Record
                        </span>
                        <p className="text-[#4B5563] text-[11px]">{notice.supportingEvidence}</p>
                      </div>

                      <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1">
                        <span className="font-bold block text-[10px] text-amber-800 uppercase tracking-wider">
                          Mandated Corrective Action Required
                        </span>
                        <p className="text-[#4B5563] text-[11px]">{notice.correctiveAction}</p>
                      </div>

                      <div className="text-[11px] text-[#8A94A0] flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>Assigned AICTE Official: <strong>{notice.assignedOfficer}</strong> ({notice.officerRole})</span>
                      </div>
                    </div>

                    {/* Actions Row (Requirement D: View Notice, Submit Response, Request Clarification, Request Extension, View History) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E3EAE6]">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCase(c);
                            setSelectedNotice(notice);
                            setCaseModalTab('overview');
                          }}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Notice</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleOpenResponseModal(c)}
                          className="flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Response</span>
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setClarificationModalNotice({ caseId: c.id, notice });
                            setClarificationQuery('');
                          }}
                          className="text-[#14513A] hover:bg-emerald-50 flex items-center gap-1"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Request Clarification</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setExtensionModalNotice({ caseId: c.id, notice });
                            setExtensionJustification('');
                          }}
                          className="text-amber-800 hover:bg-amber-50 flex items-center gap-1"
                        >
                          <CalendarClock className="w-3.5 h-3.5" />
                          <span>Request Extension</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedCase(c);
                            setCaseModalTab('audit');
                          }}
                          className="text-[#4B5563] hover:bg-gray-100 flex items-center gap-1"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>View History</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: TAB 3 - CROSS-INSTITUTION CONFLICTS (Requirement F) */}
      {activeTab === 'Cross-Institution Conflicts' && (
        <div className="space-y-4">
          <Card className="p-4 bg-amber-50/70 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#F5B335] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#4B5563] space-y-1">
                <strong className="text-[#14233F] block font-bold">
                  Cross-Institution Dual Full-Time Enrolment Protocol (Section 10(1) AICTE Act)
                </strong>
                <p>
                  A student cannot maintain concurrent full-time admissions in two approved institutions. This console displays conflict verification status while strictly protecting confidential student records of the other institution.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {instCases
              .filter((c) => c.issueType === 'Cross-Institution Conflict')
              .map((c) => (
                <Card key={c.id} className="p-5 border-l-4 border-l-[#D64545] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E3EAE6] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#14233F]">{c.title}</span>
                        {getStatusBadge(c.status)}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="font-mono font-bold text-[#14513A]">
                          APAAR: {c.linkedApaarId || '7721 9043 1184'}
                        </span>
                        <span className="text-[#8A94A0]">&bull; Detected: {c.detectionDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleOpenResponseModal(c)}
                      >
                        Submit Response &amp; Evidence
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCase(c);
                          setCaseModalTab('overview');
                        }}
                      >
                        View Case Dossier
                      </Button>
                    </div>
                  </div>

                  {/* Institution-Specific Conflict Actions & Data Privacy Notice */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Your Institution Status */}
                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-1.5 text-xs">
                      <span className="text-[10px] font-bold text-[#1E9E5A] uppercase tracking-wider block">
                        Your Institution Status (Active Party)
                      </span>
                      <h4 className="font-bold text-[#14233F]">{user?.institutionName || 'College of Engineering Pune'}</h4>
                      <p className="text-[#4B5563]">
                        <strong>Action Required:</strong> Submit student verified biometric attendance roster and State Entrance Examination (CAP) allotment letter.
                      </p>
                      <p className="text-[#4B5563]">
                        Status: <strong className="text-[#14513A]">{c.responses?.length ? 'Response Submitted' : 'Pending Response'}</strong>
                      </p>
                    </div>

                    {/* Conflicting Claim Status (Privacy Preserving) */}
                    <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60 space-y-1.5 text-xs">
                      <span className="text-[10px] font-bold text-[#8A94A0] uppercase tracking-wider block">
                        Conflicting Enrolment Claim
                      </span>
                      <h4 className="font-bold text-[#14233F]">Secondary Registered Institution</h4>
                      <p className="text-[#8A94A0] italic">
                        Concurrent registration claim identified by national APAAR identity correlation engine. Details under adjudication by AICTE Bureau.
                      </p>
                      <p className="text-[10px] text-[#8A94A0]">
                        * Data Privacy Protected: Confidential internal documents of the secondary institution are restricted to council officers.
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: TAB 2 - DATA VALIDATION ISSUES (Cases + Flagged Student Records) */}
      {activeTab === 'Data Validation Issues' && (
        <div className="space-y-6">
          {/* Individual Flagged Student Records (Retained from original Validation Center) */}
          <Card className="overflow-hidden">
            <div className="p-4 bg-[#F4F8F6] border-b border-[#E3EAE6] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-[#14233F] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1E9E5A]" />
                  <span>Flagged Student Records Ingestion Roster</span>
                </h3>
                <p className="text-xs text-[#4B5563] mt-0.5">
                  Single-entry and bulk uploaded student records identified with invalid 12-digit APAAR format or duplicate roll numbers.
                </p>
              </div>
              <Badge variant="error" size="sm">
                {institutionFlaggedStudents.length} Records Flagged
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white text-[#8A94A0] uppercase font-bold text-[10px] tracking-wider border-b border-[#E3EAE6]">
                  <tr>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Current APAAR</th>
                    <th className="py-2.5 px-3">Programme / Course</th>
                    <th className="py-2.5 px-3">Discrepancy Reason</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3EAE6]">
                  {institutionFlaggedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#8A94A0]">
                        No student record flags found in this category.
                      </td>
                    </tr>
                  ) : (
                    institutionFlaggedStudents.map((stu) => (
                      <tr key={stu.id} className="hover:bg-[#F9FCFA]">
                        <td className="py-3 px-3">
                          <span className="font-bold text-[#14233F] block">{stu.name}</span>
                          <span className="font-mono text-[10px] text-[#8A94A0]">{stu.studentId}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-[#D64545] bg-rose-50 px-2 py-0.5 rounded">
                            {stu.apaarId}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#4B5563]">
                          <span>{stu.programme} - {stu.course}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[11px] text-[#D64545] font-semibold block">
                            {stu.flagReason || 'Regex 12-digit validation failed'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setFixingStudent(stu);
                                setFixedApaar(stu.apaarId);
                                setFixedName(stu.name);
                              }}
                              className="text-xs py-0.5 px-2"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Fix Record
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setDismissingStudent(stu);
                                setDismissReason('Verified through hardcopy CET allotment order.');
                              }}
                              className="text-xs py-0.5 px-2 text-[#8A94A0] hover:text-[#14233F]"
                            >
                              Dismiss
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* GENERAL CASE MANAGEMENT TABLE (All Cases, Intake & Quota, Responses Submitted, Resolved) */}
      {activeTab !== 'Notices Received' && activeTab !== 'Cross-Institution Conflicts' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto min-w-full">
            <table className="w-full text-left text-xs min-w-[1020px] table-fixed">
              <colgroup>
                <col className="w-[125px]" />
                <col className="w-[145px]" />
                <col className="w-[100px]" />
                <col className="w-[180px]" />
                <col className="w-[170px]" />
                <col className="w-[95px]" />
                <col className="w-[115px]" />
                <col className="w-[190px]" />
              </colgroup>
              <thead className="bg-[#F4F8F6] text-[#8A94A0] uppercase font-bold text-[10px] tracking-wider border-b border-[#E3EAE6]">
                <tr>
                  <th className="py-3 px-3">Case ID &amp; Issue</th>
                  <th className="py-3 px-3">Related Student / APAAR</th>
                  <th className="py-3 px-2">Notice ID</th>
                  <th className="py-3 px-3">Issue Description</th>
                  <th className="py-3 px-3">Required Corrective Action</th>
                  <th className="py-3 px-2">Deadline</th>
                  <th className="py-3 px-2.5">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EAE6]">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-[#8A94A0]">
                      No compliance cases found in this category.
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((c) => {
                    const notice = c.notices[0];
                    const student = students.find((s) => c.linkedStudentIds.includes(s.id) || c.linkedStudentIds.includes(s.studentId));
                    const latestResponse = c.responses?.[0];

                    return (
                      <tr key={c.id} className="hover:bg-[#F9FCFA] transition-colors">
                        {/* Case ID & Issue */}
                        <td className="py-3.5 px-3 align-top">
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-[#14513A] bg-[#EBF3EF] px-1.5 py-0.5 rounded text-[10px]">
                              {c.id}
                            </span>
                            <p className="font-bold text-[#14233F] truncate max-w-[130px] mt-0.5" title={c.title}>{c.title}</p>
                            <span className="text-[10px] text-[#8A94A0] block">
                              {c.detectionDate}
                            </span>
                          </div>
                        </td>

                        {/* Student / APAAR */}
                        <td className="py-3.5 px-3 align-top">
                          {student || c.linkedApaarId ? (
                            <div className="space-y-0.5 max-w-[150px]">
                              <span className="font-semibold text-[#14233F] block truncate" title={student?.name || 'Student Record'}>
                                {student?.name || 'Multiple Students'}
                              </span>
                              <span className="font-mono text-[10px] text-[#14513A] bg-[#EBF3EF] px-1.5 py-0.5 rounded block max-w-fit truncate">
                                {student?.apaarId || c.linkedApaarId || 'APAAR Pending'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#8A94A0] italic">Institutional Quota</span>
                          )}
                        </td>

                        {/* Notice ID */}
                        <td className="py-3.5 px-2 align-top">
                          {notice ? (
                            <div className="space-y-0.5">
                              <span className="font-mono font-semibold text-[#14233F] text-[11px] block truncate" title={notice.id}>
                                {notice.id}
                              </span>
                              <span className="text-[9px] text-[#8A94A0] block">{notice.issueDate}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#8A94A0] italic">No Notice</span>
                          )}
                        </td>

                        {/* Issue Description */}
                        <td className="py-3.5 px-3 text-[#4B5563] align-top">
                          <p className="line-clamp-2 text-[11px] leading-relaxed" title={c.description}>{c.description}</p>
                          <span className="text-[10px] font-semibold text-[#D64545] mt-0.5 block truncate">{c.metric}</span>
                        </td>

                        {/* Required Corrective Action */}
                        <td className="py-3.5 px-3 text-[#14233F] align-top">
                          {notice ? (
                            <p className="line-clamp-2 text-[11px] leading-relaxed" title={notice.correctiveAction}>{notice.correctiveAction}</p>
                          ) : (
                            <p className="line-clamp-2 text-[11px] text-[#8A94A0] leading-relaxed">
                              Under preliminary review by AICTE bureau.
                            </p>
                          )}
                        </td>

                        {/* Response Deadline */}
                        <td className="py-3.5 px-2 text-[11px] align-top">
                          {notice ? (
                            <span className="font-semibold text-[#D64545] block font-mono">
                              {notice.responseDeadline}
                            </span>
                          ) : (
                            <span className="text-[#8A94A0] italic">Grace Period</span>
                          )}
                        </td>

                        {/* Status (Requirement G) */}
                        <td className="py-3.5 px-2.5 align-top">
                          {getStatusBadge(c.status)}
                        </td>

                        {/* Actions (Phase 1 Fix: Strictly aligned within column boundary) */}
                        <td className="py-3.5 px-3 text-right align-top">
                          <div className="flex flex-col gap-1.5 items-end justify-start w-full">
                            <div className="flex items-center gap-1.5 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedCase(c);
                                  setCaseModalTab('overview');
                                }}
                                className="text-xs py-1 px-2 font-medium whitespace-nowrap min-w-[78px] justify-center"
                              >
                                View Details
                              </Button>

                              {c.status !== 'Resolved' ? (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => handleOpenResponseModal(c)}
                                  className="text-xs py-1 px-2 font-medium whitespace-nowrap min-w-[70px] justify-center"
                                >
                                  {latestResponse ? 'Resubmit' : 'Respond'}
                                </Button>
                              ) : (
                                <span className="inline-flex items-center text-[10px] font-semibold text-[#1E9E5A] bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                                  Resolved
                                </span>
                              )}
                            </div>

                            {/* Secondary Actions */}
                            <div className="flex items-center gap-1.5 text-[10px] text-[#4B5563] justify-end flex-wrap pt-0.5">
                              {c.status !== 'Resolved' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenResponseModal(c)}
                                    className="text-[#14513A] hover:underline font-semibold cursor-pointer"
                                  >
                                    Fix Record
                                  </button>
                                  <span className="text-[#8A94A0]">&bull;</span>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCase(c);
                                  setCaseModalTab('submissions');
                                }}
                                className="text-[#4B5563] hover:text-[#14233F] hover:underline font-medium cursor-pointer"
                              >
                                Submissions ({c.responses?.length || 0})
                              </button>
                              <span className="text-[#8A94A0]">&bull;</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCase(c);
                                  setCaseModalTab('audit');
                                }}
                                className="text-[#8A94A0] hover:text-[#14233F] hover:underline font-medium cursor-pointer"
                              >
                                History
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ================= MODAL 1: VIEW CASE DOSSIER & NOTICE DETAILS ================= */}
      {selectedCase && (
        <Modal
          isOpen={!!selectedCase}
          onClose={() => setSelectedCase(null)}
          title={`Institutional Case Dossier: ${selectedCase.id}`}
          maxWidth="3xl"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            {/* Modal Tabs */}
            <div className="flex border-b border-[#E3EAE6] text-xs font-bold gap-2">
              <button
                type="button"
                onClick={() => setCaseModalTab('overview')}
                className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  caseModalTab === 'overview'
                    ? 'border-[#14513A] text-[#14513A]'
                    : 'border-transparent text-[#8A94A0] hover:text-[#14233F]'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                Case &amp; Notice Overview
              </button>

              <button
                type="button"
                onClick={() => setCaseModalTab('submissions')}
                className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  caseModalTab === 'submissions'
                    ? 'border-[#14513A] text-[#14513A]'
                    : 'border-transparent text-[#8A94A0] hover:text-[#14233F]'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                Submissions ({selectedCase.responses?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setCaseModalTab('audit')}
                className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  caseModalTab === 'audit'
                    ? 'border-[#14513A] text-[#14513A]'
                    : 'border-transparent text-[#8A94A0] hover:text-[#14233F]'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Chronological History
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {caseModalTab === 'overview' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-[#F4F8F6] border border-[#E3EAE6] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#14513A]">{selectedCase.id}</span>
                    <h3 className="font-bold text-sm text-[#14233F] mt-0.5">{selectedCase.title}</h3>
                  </div>
                  {getStatusBadge(selectedCase.status)}
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-[#14233F] uppercase tracking-wider text-[10px]">
                    Violation Metric &amp; Narrative Description
                  </h4>
                  <p className="text-[#4B5563] leading-relaxed">{selectedCase.description}</p>
                  <p className="font-semibold text-[#D64545]">Detected Metric: {selectedCase.metric}</p>
                </div>

                {/* AICTE Notice Directive Details */}
                {selectedCase.notices.length > 0 && (
                  <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                      <span className="font-bold text-xs text-amber-950">
                        Formal AICTE Show-Cause Notice: {selectedCase.notices[0].id}
                      </span>
                      <span className="font-mono text-[11px] text-[#D64545] font-bold">
                        Due: {selectedCase.notices[0].responseDeadline}
                      </span>
                    </div>
                    <p><strong>Order Number:</strong> {selectedCase.notices[0].orderNumber}</p>
                    <p><strong>Required Corrective Action:</strong> {selectedCase.notices[0].correctiveAction}</p>
                    <p><strong>Assigned Officer:</strong> {selectedCase.notices[0].assignedOfficer} ({selectedCase.notices[0].officerRole})</p>
                    <p className="text-[10px] text-[#8A94A0] italic">
                      * Original AICTE notice is read-only. Modification or deletion by the institution is prohibited.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SUBMISSIONS */}
            {caseModalTab === 'submissions' && (
              <div className="space-y-4">
                {!selectedCase.responses || selectedCase.responses.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8A94A0]">
                    No responses filed yet. Click "Submit Response" to upload authenticated evidence and explanations.
                  </div>
                ) : (
                  selectedCase.responses.map((resp) => (
                    <div key={resp.id} className="p-4 rounded-xl border border-[#E3EAE6] bg-white space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-[#E3EAE6] pb-2">
                        <span className="font-bold text-[#14233F]">
                          Submission #{resp.submissionNumber} &bull; <span className="font-mono">{resp.id}</span>
                        </span>
                        <span className="text-[10px] text-[#8A94A0]">{resp.submittedAt}</span>
                      </div>
                      <p className="italic text-[#14233F]">"{resp.explanation}"</p>
                      <p className="text-[#4B5563]"><strong>Action Taken:</strong> {resp.actionTaken}</p>

                      {/* Supporting Documents */}
                      {resp.supportingDocuments && resp.supportingDocuments.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] font-bold text-[#8A94A0] uppercase block mb-1">
                            Uploaded Documentary Evidence
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {resp.supportingDocuments.map((doc) => (
                              <span
                                key={doc.id}
                                className="px-2.5 py-1 bg-[#F4F8F6] border border-[#D1DCD6] rounded-lg text-xs font-semibold text-[#14513A] flex items-center gap-1.5"
                              >
                                <Paperclip className="w-3.5 h-3.5 text-[#1E9E5A]" />
                                {doc.fileName} ({doc.fileSize})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Officer Feedback if present */}
                      {resp.officerReview && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1 mt-2">
                          <span className="font-bold text-[#2563EB] text-[11px] block">
                            AICTE Officer Review Feedback [{resp.officerReview.statusDecision}]
                          </span>
                          <p className="text-[#14233F]">{resp.officerReview.remarks}</p>
                          <span className="text-[10px] text-[#8A94A0] block">
                            Reviewed by {resp.officerReview.reviewedBy} at {resp.officerReview.reviewedAt}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: AUDIT HISTORY */}
            {caseModalTab === 'audit' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#EBF3EF] border border-[#D1DCD6] rounded-xl flex items-center justify-between text-xs font-semibold text-[#14513A]">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#1E9E5A]" />
                    Immutable Cryptographic Audit Ledger
                  </span>
                  <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-[#D1DCD6]">
                    SHA-256 Validated
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedCase.history.map((h) => (
                    <div key={h.id} className="p-3 bg-white border border-[#E3EAE6] rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#14233F]">{h.action}</span>
                        <span className="text-[10px] text-[#8A94A0]">{h.timestamp}</span>
                      </div>
                      <p className="text-[#4B5563]">{h.remarks}</p>
                      <div className="flex items-center justify-between text-[10px] text-[#8A94A0] pt-1 border-t border-gray-100">
                        <span>Actor: <strong>{h.actor}</strong> ({h.role})</span>
                        <span className="font-mono">Hash: {h.hash.substring(0, 16)}...</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ================= MODAL 2: SUBMIT RESPONSE & FIX RECORD (Requirement E & Phase 2 Fix) ================= */}
      {responseModalCase && (
        <Modal
          isOpen={!!responseModalCase}
          onClose={() => setResponseModalCase(null)}
          title={`Institutional Compliance Response: ${responseModalCase.id}`}
          description={`Case: ${responseModalCase.title} • Mandated Council Directive`}
          maxWidth="3xl"
          contentClassName="p-0"
        >
          <form onSubmit={handleSubmitResponse} className="flex flex-col flex-1 overflow-hidden">
            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-4 max-h-[calc(100dvh-210px)]">
              <div className="p-3 bg-[#F4F8F6] border border-[#D1DCD6] rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#14513A]">{responseModalCase.title}</span>
                  <Badge variant="error" size="sm">Action Required</Badge>
                </div>
                <p className="text-[#4B5563]">
                  Submit factual institutional explanation, rectifications, and authenticating documentation.
                </p>
              </div>

              {/* Explanation Field */}
              <div>
                <label className="block text-xs font-bold text-[#14233F] mb-1">
                  Institutional Explanation &amp; Clarification *
                </label>
                <textarea
                  rows={4}
                  required
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="State the institutional justification, state quota allocation details, or factual explanation..."
                  className="w-full p-2.5 border border-[#E3EAE6] rounded-xl text-xs focus:outline-none focus:border-[#14513A]"
                />
              </div>

              {/* Action Taken */}
              <div>
                <label className="block text-xs font-bold text-[#14233F] mb-1">
                  Corrective Action Executed by Institution (Optional)
                </label>
                <input
                  type="text"
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="e.g. Verified biometric attendance, corrected APAAR format with state admission cell"
                  className="w-full p-2.5 border border-[#E3EAE6] rounded-xl text-xs focus:outline-none focus:border-[#14513A]"
                />
              </div>

              {/* Inline Student Record Correction (Requirement E) */}
              <div className="p-3.5 bg-gray-50 border border-[#E3EAE6] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#14233F] flex items-center gap-1.5">
                    <Edit className="w-3.5 h-3.5 text-[#14513A]" />
                    Correct Linked Student Record (Optional)
                  </span>
                  <span className="text-[10px] text-[#8A94A0]">Attaches to Case {responseModalCase.id}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                      Corrected 12-Digit APAAR ID
                    </label>
                    <input
                      type="text"
                      value={correctedApaar}
                      onChange={(e) => setCorrectedApaar(e.target.value)}
                      placeholder="e.g. 7721 9043 1184"
                      className="w-full p-2 border border-[#E3EAE6] rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                      Student Name Verification
                    </label>
                    <input
                      type="text"
                      value={correctedName}
                      onChange={(e) => setCorrectedName(e.target.value)}
                      placeholder="Enter student full name"
                      className="w-full p-2 border border-[#E3EAE6] rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Supporting Document Upload (Requirement E) */}
              <div className="p-3.5 bg-[#F9FCFA] border border-[#D1DCD6] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#14513A] flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-[#1E9E5A]" />
                    Upload Authenticated Supporting Evidence (PDFs)
                  </span>
                  <span className="text-[10px] text-[#8A94A0]">Attaches to Notice</span>
                </div>

                {/* Document Preset Quick Adds */}
                <div>
                  <span className="text-[10px] text-[#8A94A0] block mb-1">Quick Select Official Templates:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleAddSampleDoc({
                          name: 'State_CET_CAP_Allotment_Order.pdf',
                          size: '1.4 MB',
                          type: 'application/pdf',
                          desc: 'Government State CET Cell Official Admission Allotment Order'
                        })
                      }
                      className="px-2 py-1 bg-white border border-[#D1DCD6] rounded text-[10px] font-semibold text-[#14513A] hover:bg-emerald-50 cursor-pointer"
                    >
                      + State Allotment Order
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAddSampleDoc({
                          name: 'Semester_Biometric_Attendance_Verification.pdf',
                          size: '840 KB',
                          type: 'application/pdf',
                          desc: 'Department Verified Biometric Student Attendance Roster'
                        })
                      }
                      className="px-2 py-1 bg-white border border-[#D1DCD6] rounded text-[10px] font-semibold text-[#14513A] hover:bg-emerald-50 cursor-pointer"
                    >
                      + Biometric Attendance
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAddSampleDoc({
                          name: 'AICTE_Intake_Sanction_EOA_Order.pdf',
                          size: '2.1 MB',
                          type: 'application/pdf',
                          desc: 'AICTE Extension of Approval (EOA) Sanction Roster'
                        })
                      }
                      className="px-2 py-1 bg-white border border-[#D1DCD6] rounded text-[10px] font-semibold text-[#14513A] hover:bg-emerald-50 cursor-pointer"
                    >
                      + Sanctioned Cap EOA
                    </button>
                  </div>
                </div>

                {/* Custom Document Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Document filename (e.g. Domicile_Certificate.pdf)"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="flex-1 p-2 border border-[#E3EAE6] rounded-lg text-xs bg-white"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={handleAddCustomDoc}>
                    Attach File
                  </Button>
                </div>

                {/* Selected Docs Chips */}
                {selectedDocs.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold text-[#8A94A0] uppercase block">
                      Attached Files ({selectedDocs.length}):
                    </span>
                    <div className="space-y-1">
                      {selectedDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 bg-white border border-[#E3EAE6] rounded-lg text-xs"
                        >
                          <span className="flex items-center gap-1.5 font-semibold text-[#14233F]">
                            <Paperclip className="w-3.5 h-3.5 text-[#1E9E5A]" />
                            {doc.fileName} ({doc.fileSize})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDoc(doc.id)}
                            className="text-[#D64545] hover:opacity-70 text-xs px-2 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Strict Regulatory Note */}
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-[11px] text-[#78350F] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
                <p>
                  <strong>AICTE Regulatory Rule:</strong> Submitting this response updates the case status to <strong>"Response Submitted"</strong> and places it under active bureau review. Resubmitted records do NOT automatically become verified until formally signed off by the council officer.
                </p>
              </div>
            </div>

            {/* Pinned & Accessible Footer Controls */}
            <div className="flex-shrink-0 border-t border-[#E3EAE6] bg-[#F4F8F6] px-5 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-[#4B5563] text-center sm:text-left">
                Nodal Officer: <strong>{user?.name || 'Dr. Sunil Bhirud'}</strong> &bull; Attaches to {responseModalCase.id}
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button type="button" variant="ghost" onClick={() => setResponseModalCase(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmittingResponse}
                  className="flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingResponse ? 'Submitting to AICTE...' : 'Submit Institutional Response to AICTE'}</span>
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= MODAL 3: REQUEST NOTICE CLARIFICATION (Requirement D) ================= */}
      {clarificationModalNotice && (
        <Modal
          isOpen={!!clarificationModalNotice}
          onClose={() => setClarificationModalNotice(null)}
          title={`Request Regulatory Clarification: ${clarificationModalNotice.notice.id}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSubmitClarification} className="space-y-4">
            <div className="p-3 bg-[#F4F8F6] border border-[#E3EAE6] rounded-xl text-xs space-y-1">
              <p><strong>Notice Order:</strong> {clarificationModalNotice.notice.orderNumber}</p>
              <p><strong>Assigned Officer:</strong> {clarificationModalNotice.notice.assignedOfficer}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14233F] mb-1">
                Institutional Clarification Query *
              </label>
              <textarea
                rows={4}
                required
                value={clarificationQuery}
                onChange={(e) => setClarificationQuery(e.target.value)}
                placeholder="Specify the specific clause or evidence requirement for which clarification from the bureau is requested..."
                className="w-full p-2.5 border border-[#E3EAE6] rounded-xl text-xs focus:outline-none focus:border-[#14513A]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3EAE6]">
              <Button type="button" variant="ghost" onClick={() => setClarificationModalNotice(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmittingClarification}>
                Submit Clarification Query
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= MODAL 4: REQUEST DEADLINE EXTENSION (Requirement D) ================= */}
      {extensionModalNotice && (
        <Modal
          isOpen={!!extensionModalNotice}
          onClose={() => setExtensionModalNotice(null)}
          title={`Request Response Deadline Extension: ${extensionModalNotice.notice.id}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSubmitExtension} className="space-y-4">
            <div className="p-3 bg-[#FFF8EB] border border-[#F5B335] rounded-xl text-xs space-y-1">
              <p><strong>Current Statutory Deadline:</strong> {extensionModalNotice.notice.responseDeadline}</p>
              <p className="text-[#92400E]">
                Extension requests are routed directly to the AICTE Regional Director for approval.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14233F] mb-1">
                Proposed Extension Deadline *
              </label>
              <input
                type="date"
                required
                value={requestedExtensionDate}
                onChange={(e) => setRequestedExtensionDate(e.target.value)}
                className="w-full p-2 border border-[#E3EAE6] rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14233F] mb-1">
                Justification for Extension Request *
              </label>
              <textarea
                rows={3}
                required
                value={extensionJustification}
                onChange={(e) => setExtensionJustification(e.target.value)}
                placeholder="State valid institutional reasons (e.g. State admission board gazette verification pending, ongoing university semester exams)..."
                className="w-full p-2.5 border border-[#E3EAE6] rounded-xl text-xs focus:outline-none focus:border-[#14513A]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3EAE6]">
              <Button type="button" variant="ghost" onClick={() => setExtensionModalNotice(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmittingExtension}>
                File Extension Request
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= MODAL 5: STANDALONE FIX STUDENT RECORD (Retained) ================= */}
      {fixingStudent && (
        <Modal
          isOpen={!!fixingStudent}
          onClose={() => setFixingStudent(null)}
          title={`Fix Student Record: ${fixingStudent.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleApplyStudentFix} className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-[#D64545] block">Flag Reason:</span>
              <p className="text-[#4B5563]">{fixingStudent.flagReason || 'Regex 12-digit format check failed'}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14233F] mb-1">
                12-Digit APAAR ID *
              </label>
              <input
                type="text"
                required
                value={fixedApaar}
                onChange={(e) => setFixedApaar(e.target.value)}
                className="w-full p-2 border border-[#E3EAE6] rounded-xl text-xs font-mono"
              />
              <span className="text-[10px] text-[#8A94A0]">Must be exactly 12 numeric digits</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14233F] mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                value={fixedName}
                onChange={(e) => setFixedName(e.target.value)}
                className="w-full p-2 border border-[#E3EAE6] rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3EAE6]">
              <Button type="button" variant="ghost" onClick={() => setFixingStudent(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save &amp; Resolve Flag
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= MODAL 6: DISMISS STUDENT FLAG (Retained) ================= */}
      {dismissingStudent && (
        <Modal
          isOpen={!!dismissingStudent}
          onClose={() => setDismissingStudent(null)}
          title={`Dismiss Flag for ${dismissingStudent.name}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <p className="text-xs text-[#4B5563]">
              Provide an official nodal officer audit justification for overriding the validation check:
            </p>
            <textarea
              rows={3}
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value)}
              className="w-full p-2 border border-[#E3EAE6] rounded-xl text-xs"
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3EAE6]">
              <Button type="button" variant="ghost" onClick={() => setDismissingStudent(null)}>
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={handleApplyStudentDismiss}>
                Confirm Dismissal
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
