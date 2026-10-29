import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
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
  PlusCircle,
  FileSpreadsheet,
  Download,
  Check,
  ChevronRight,
  Filter,
  UserX,
  ArrowRight,
  MessageSquare,
  AlertOctagon,
  RefreshCw,
  FileCheck2,
  Scale,
  Briefcase
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { ComplianceCase, CaseStatus, CaseIssueType, ResponseDocument, CrossDuplicate } from '../../types';

export const ComplianceCaseManager: React.FC = () => {
  const { user } = useAuth();
  const {
    cases,
    crossDuplicates,
    resolveCrossDuplicate,
    raiseCaseNotice,
    reviewCaseByOfficer,
    addOfficerRemarks,
    escalateCase,
    students,
    institutions
  } = useData();
  const toast = useToast();

  // Active top-level Tab (Requirement B)
  const [activeTab, setActiveTab] = useState<
    | 'All Cases'
    | 'Cross-Institution Conflicts'
    | 'Internal Duplicates'
    | 'Invalid APAAR IDs'
    | 'Intake & Quota Violations'
    | 'Notices & Responses'
    | 'Pending Review'
    | 'Resolved Cases'
  >('All Cases');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Selected Case Modal
  const [selectedCase, setSelectedCase] = useState<ComplianceCase | null>(null);
  const [modalTab, setModalTab] = useState<'overview' | 'responses' | 'review' | 'notice' | 'remarks' | 'audit'>('overview');

  // Quick Action Modals
  const [remarksModalCase, setRemarksModalCase] = useState<ComplianceCase | null>(null);
  const [officerRemarksText, setOfficerRemarksText] = useState('');
  const [escalateModalCase, setEscalateModalCase] = useState<ComplianceCase | null>(null);
  const [escalationReason, setEscalationReason] = useState('');

  // Officer Review Form State (Modal)
  const [reviewDecision, setReviewDecision] = useState<'Under AICTE Review' | 'Further Action Required' | 'Resolved' | 'Escalated'>('Under AICTE Review');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [newDeadlineDate, setNewDeadlineDate] = useState('2026-11-25');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Notice Issuance Form State
  const [noticeTargetInstId, setNoticeTargetInstId] = useState('');
  const [noticeDescription, setNoticeDescription] = useState('');
  const [noticeCorrectiveAction, setNoticeCorrectiveAction] = useState('');
  const [noticeDeadline, setNoticeDeadline] = useState('2026-11-20');
  const [isIssuingNotice, setIsIssuingNotice] = useState(false);

  // Dynamic Summary Metrics (Requirement B)
  const totalOpenCases = cases.filter((c) => c.status !== 'Resolved').length;
  const noticesRequiringResponse = cases.filter((c) => c.status === 'Notice Issued' || c.status === 'Further Action Required').length;
  const responsesPendingReview = cases.filter((c) => c.status === 'Response Submitted' || c.status === 'Under AICTE Review').length;
  const escalatedCasesCount = cases.filter((c) => c.status === 'Escalated').length;
  const resolvedCasesCount = cases.filter((c) => c.status === 'Resolved').length;

  // Filtered cases by Tab and Search
  const getFilteredCases = () => {
    return cases.filter((c) => {
      // Tab Filtering
      if (activeTab === 'Internal Duplicates' && c.issueType !== 'Internal Duplicate') return false;
      if (activeTab === 'Invalid APAAR IDs' && c.issueType !== 'Invalid APAAR ID') return false;
      if (
        activeTab === 'Intake & Quota Violations' &&
        c.issueType !== 'Intake/Quota Violation' &&
        c.issueType !== 'Supernumerary Breach' &&
        c.issueType !== 'Sudden Intake Spike'
      )
        return false;
      if (activeTab === 'Cross-Institution Conflicts' && c.issueType !== 'Cross-Institution Conflict') return false;
      if (activeTab === 'Pending Review' && c.status !== 'Response Submitted' && c.status !== 'Under AICTE Review') return false;
      if (activeTab === 'Resolved Cases' && c.status !== 'Resolved') return false;

      // Severity Filter
      if (severityFilter !== 'all' && c.severity !== severityFilter) return false;

      // Search Filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchId = c.id.toLowerCase().includes(term);
        const matchTitle = c.title.toLowerCase().includes(term);
        const matchInst = Object.values(c.institutionNames).some((name) => name.toLowerCase().includes(term));
        const matchApaar = c.linkedApaarId?.toLowerCase().includes(term);
        const matchOfficer = c.assignedOfficer?.name.toLowerCase().includes(term);
        const matchStudent = c.linkedStudentIds.some((sId) => {
          const stu = students.find((s) => s.id === sId || s.studentId === sId);
          return stu?.name.toLowerCase().includes(term) || stu?.apaarId.includes(term);
        });
        return matchId || matchTitle || matchInst || matchApaar || matchOfficer || matchStudent;
      }
      return true;
    });
  };

  const currentTabCases = getFilteredCases();

  // Helper to open case modal on specific tab
  const handleOpenCaseModal = (
    c: ComplianceCase,
    tab: 'overview' | 'responses' | 'review' | 'notice' | 'remarks' | 'audit' = 'overview',
    initialDecision?: 'Under AICTE Review' | 'Further Action Required' | 'Resolved' | 'Escalated'
  ) => {
    setSelectedCase(c);
    setModalTab(tab);
    setReviewRemarks('');
    setReviewDecision(initialDecision || (c.status === 'Response Submitted' ? 'Under AICTE Review' : 'Resolved'));
    setNoticeTargetInstId(c.primaryInstitutionId);
    setNoticeDescription(`Show-Cause Directive regarding ${c.issueType}: ${c.description}`);
    setNoticeCorrectiveAction('Submit factual explanation and authenticated verification documents.');
  };

  const handleOfficerReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    if (!reviewRemarks.trim() || reviewRemarks.trim().length < 15) {
      toast.error('Remarks Required', 'Please enter official review remarks of at least 15 characters.');
      return;
    }

    setIsSubmittingReview(true);

    const result = reviewCaseByOfficer(
      selectedCase.id,
      {
        decision: reviewDecision,
        remarks: reviewRemarks.trim(),
        newDeadlineDate: reviewDecision === 'Further Action Required' ? newDeadlineDate : undefined
      },
      {
        name: user?.name || 'Dr. R. K. Srivastav',
        role: user?.role === 'aicte' ? 'Senior Director, Approval Bureau' : 'AICTE Officer'
      }
    );

    setIsSubmittingReview(false);

    if (result.success) {
      toast.success(`Case Updated to ${reviewDecision}`, result.message);
      if (result.case) {
        setSelectedCase(result.case);
      } else {
        const updated = cases.find((c) => c.id === selectedCase.id);
        setSelectedCase(updated || null);
      }
    } else {
      toast.error('Action Failed', result.message);
    }
  };

  const handleIssueNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    if (!noticeDescription.trim() || !noticeCorrectiveAction.trim()) {
      toast.error('Missing Details', 'Please complete the notice description and corrective action.');
      return;
    }

    setIsIssuingNotice(true);

    const result = raiseCaseNotice(
      selectedCase.id,
      {
        institutionId: noticeTargetInstId || selectedCase.primaryInstitutionId,
        description: noticeDescription.trim(),
        correctiveAction: noticeCorrectiveAction.trim(),
        deadlineDate: noticeDeadline,
        assignedOfficer: user?.name || 'Dr. R. K. Srivastav',
        officerRole: 'Senior Director, Approval Bureau'
      },
      {
        name: user?.name || 'Dr. R. K. Srivastav',
        role: 'AICTE Admin'
      }
    );

    setIsIssuingNotice(false);

    if (result.success) {
      toast.success('Notice Issued Successfully', result.message);
      if (result.case) {
        setSelectedCase(result.case);
      } else {
        const updated = cases.find((c) => c.id === selectedCase.id);
        setSelectedCase(updated || null);
      }
      setModalTab('overview');
    } else {
      toast.error('Notice Issuance Blocked', result.message);
    }
  };

  const handleSaveRemarks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarksModalCase || !officerRemarksText.trim()) return;
    const res = addOfficerRemarks(
      remarksModalCase.id,
      officerRemarksText,
      user?.name || 'Dr. R. K. Srivastav',
      'AICTE Bureau Officer'
    );
    if (res.success) {
      toast.success('Remarks Logged', res.message);
      setRemarksModalCase(null);
      setOfficerRemarksText('');
    }
  };

  const handleExecuteEscalation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalateModalCase || !escalationReason.trim()) return;
    const res = escalateCase(escalateModalCase.id, escalationReason, user?.name || 'Dr. R. K. Srivastav');
    if (res.success) {
      toast.error('Case Escalated', res.message);
      setEscalateModalCase(null);
      setEscalationReason('');
    }
  };

  const handleResolveCrossConflict = (apaarId: string, resolution: 'Flag Both' | 'Verify Primary' | 'Revoke Secondary') => {
    resolveCrossDuplicate(apaarId, resolution);
    toast.success('Resolution Applied', `Action [${resolution}] applied to dual enrolment conflict.`);
  };

  const getStatusBadge = (status: ComplianceCase['status']) => {
    switch (status) {
      case 'Notice Issued':
        return <Badge variant="error">Notice Issued</Badge>;
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

  return (
    <div className="space-y-6">
      {/* Page Header (Requirement B) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#14233F]">Compliance Case Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EBF3EF] text-[#14513A] border border-[#D1DCD6]">
              Section 10(1) AICTE Act
            </span>
          </div>
          <p className="text-sm text-[#4B5563] mt-1">
            Centralized monitoring, investigation, notice issuance, and resolution of institutional compliance cases.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="px-3 py-1.5 bg-[#F4F8F6] border border-[#E3EAE6] rounded-xl text-xs font-semibold text-[#14513A] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1E9E5A]" />
            <span>AICTE Approval & APAAR Bureau</span>
          </div>
        </div>
      </div>

      {/* Summary Cards (5 Mandatory Cards - Requirement B) */}
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
          <span className="text-[11px] text-[#8A94A0]">Awaiting College Reply</span>
        </Card>

        <Card className="p-3.5 border-l-4 border-l-[#2563EB]">
          <span className="text-[10px] font-bold text-[#8A94A0] uppercase tracking-wider block">
            Responses Pending Review
          </span>
          <div className="text-2xl font-black text-[#2563EB] mt-1">{responsesPendingReview}</div>
          <span className="text-[11px] text-[#8A94A0]">Under Officer Scrutiny</span>
        </Card>

        <Card className="p-3.5 border-l-4 border-l-[#F5B335]">
          <span className="text-[10px] font-bold text-[#8A94A0] uppercase tracking-wider block">
            Escalated Cases
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">{escalatedCasesCount}</div>
          <span className="text-[11px] text-[#8A94A0]">Appellate Council</span>
        </Card>

        <Card className="p-3.5 border-l-4 border-l-[#1E9E5A]">
          <span className="text-[10px] font-bold text-[#8A94A0] uppercase tracking-wider block">
            Resolved Cases
          </span>
          <div className="text-2xl font-black text-[#1E9E5A] mt-1">{resolvedCasesCount}</div>
          <span className="text-[11px] text-[#8A94A0]">Formally Cleared</span>
        </Card>
      </div>

      {/* Tabs Bar (8 Mandatory Tabs - Requirement B) */}
      <div className="flex border-b border-[#E3EAE6] text-xs font-bold gap-1 overflow-x-auto select-none">
        {(
          [
            { id: 'All Cases', count: cases.length },
            { id: 'Cross-Institution Conflicts', count: cases.filter((c) => c.issueType === 'Cross-Institution Conflict').length },
            { id: 'Internal Duplicates', count: cases.filter((c) => c.issueType === 'Internal Duplicate').length },
            { id: 'Invalid APAAR IDs', count: cases.filter((c) => c.issueType === 'Invalid APAAR ID').length },
            {
              id: 'Intake & Quota Violations',
              count: cases.filter(
                (c) =>
                  c.issueType === 'Intake/Quota Violation' ||
                  c.issueType === 'Supernumerary Breach' ||
                  c.issueType === 'Sudden Intake Spike'
              ).length
            },
            { id: 'Notices & Responses', count: cases.filter((c) => c.notices.length > 0).length },
            { id: 'Pending Review', count: responsesPendingReview },
            { id: 'Resolved Cases', count: resolvedCasesCount }
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
            placeholder="Search Case ID, institution, student, APAAR, officer..."
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

      {/* TAB CONTENT: TAB 2 - CROSS-INSTITUTION CONFLICTS (Requirement E) */}
      {activeTab === 'Cross-Institution Conflicts' && (
        <div className="space-y-6">
          {/* Statutory Principle Card */}
          <Card className="p-5 bg-amber-50/50 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#F5B335] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#4B5563] space-y-1">
                <strong className="text-[#14233F] block font-bold">
                  Statutory Single Full-Time Enrolment Principle (AICTE Act Section 10)
                </strong>
                <p>
                  A student cannot hold concurrent active admissions across two approved full-time degree programmes. The detector correlates admissions via 12-digit APAAR IDs across all states. Cases link directly to the central compliance case ledger.
                </p>
              </div>
            </div>
          </Card>

          {/* Integrated Dual-Enrolment Detector Cards */}
          <div className="space-y-4">
            {crossDuplicates.map((conflict) => (
              <Card key={conflict.apaarId} className="p-5 border-l-4 border-l-[#D64545] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3EAE6]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#14233F]">{conflict.studentName}</span>
                      <Badge variant={conflict.status === 'Resolved' || conflict.status === 'Primary Verified' ? 'success' : 'error'} size="sm">
                        {conflict.status}
                      </Badge>
                      <span className="text-[10px] font-mono text-[#14513A] bg-[#EBF3EF] px-2 py-0.5 rounded font-bold">
                        Linked Case: CASE-2026-002
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono font-bold text-[#14513A]">
                        APAAR: {conflict.apaarId}
                      </span>
                      <span className="text-xs text-[#8A94A0]">&bull; Detected: {conflict.detectedOn}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveCrossConflict(conflict.apaarId, 'Flag Both')}
                    >
                      Flag Both for Hearing
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleResolveCrossConflict(conflict.apaarId, 'Verify Primary')}
                    >
                      Confirm Primary Enrolment
                    </Button>
                  </div>
                </div>

                {/* Side-by-Side Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Institution 1 */}
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#1E9E5A] uppercase tracking-wider">
                        Institution 1 (Primary Allotment)
                      </span>
                      <span className="text-[10px] bg-white text-[#14513A] font-semibold px-2 py-0.5 rounded border border-emerald-200">
                        State CAP Merit
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#14233F]">{conflict.firstInstitution.name}</h4>
                    <p className="text-[#4B5563]">Programme: <strong>{conflict.firstInstitution.programme}</strong></p>
                    <p className="text-[#4B5563]">Roll No: <span className="font-mono">{conflict.firstInstitution.studentId}</span></p>
                    <p className="text-[#4B5563]">Admission: <strong>{conflict.firstInstitution.admissionDate}</strong></p>
                  </div>

                  {/* Institution 2 */}
                  <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#D64545] uppercase tracking-wider">
                        Institution 2 (Concurrent Claim)
                      </span>
                      <span className="text-[10px] bg-white text-rose-800 font-semibold px-2 py-0.5 rounded border border-rose-200">
                        COMEDK Quota
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#14233F]">{conflict.secondInstitution.name}</h4>
                    <p className="text-[#4B5563]">Programme: <strong>{conflict.secondInstitution.programme}</strong></p>
                    <p className="text-[#4B5563]">Roll No: <span className="font-mono">{conflict.secondInstitution.studentId}</span></p>
                    <p className="text-[#4B5563]">Admission: <strong>{conflict.secondInstitution.admissionDate}</strong></p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: TAB 6 - NOTICES & RESPONSES MONITORING (Requirement D) */}
      {activeTab === 'Notices & Responses' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#F4F8F6] border border-[#D1DCD6] rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-[#14513A] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#14513A] space-y-0.5">
              <strong className="text-sm font-bold block">Regulatory Notice & Response Monitoring Center</strong>
              <p>
                Track statutory notices dispatched to institutions, response deadlines, institutional explanation submissions, attached authenticating evidence, and officer resolution decisions. Compare original flagged ingest records against corrected submissions side-by-side.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {cases
              .filter((c) => c.notices.length > 0)
              .map((c) => {
                const notice = c.notices[0];
                const latestResp = c.responses?.[0];
                const isOverdue = new Date(notice.responseDeadline) < new Date() && c.status === 'Notice Issued';

                return (
                  <Card key={c.id} className="p-5 border border-[#E3EAE6] space-y-4">
                    {/* Notice Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#E3EAE6] pb-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#14513A] bg-[#EBF3EF] px-2 py-0.5 rounded">
                            {notice.id}
                          </span>
                          <span className="font-bold text-sm text-[#14233F]">{notice.orderNumber}</span>
                          {getStatusBadge(c.status)}
                          {isOverdue && <Badge variant="error">Response Overdue</Badge>}
                        </div>
                        <p className="text-xs text-[#4B5563]">
                          Target: <strong>{notice.institutionName}</strong> &bull; Case: <strong>{c.id}</strong> ({c.issueType})
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
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

                    {/* Notice Mandate */}
                    <div className="text-xs text-[#14233F] space-y-1">
                      <p><strong>Directive Description:</strong> {notice.noticeDescription}</p>
                      <p><strong>Mandated Corrective Action:</strong> {notice.correctiveAction}</p>
                    </div>

                    {/* SIDE-BY-SIDE RECORD COMPARISON (Requirement D) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                      {/* Left: Original Flagged Record */}
                      <div className="p-3 bg-rose-50/40 border border-rose-200 rounded-xl text-xs space-y-2">
                        <span className="font-bold text-[#D64545] text-[11px] uppercase tracking-wider block">
                          Original Flagged Record / Discrepancy
                        </span>
                        <div className="space-y-1 text-[#4B5563]">
                          <p>Metric: <strong className="text-[#D64545]">{c.metric}</strong></p>
                          <p>Evidence on Record: {c.evidence?.[0]?.details || 'Admissions batch data inconsistency'}</p>
                          {c.linkedApaarId && <p>Flagged APAAR: <span className="font-mono">{c.linkedApaarId}</span></p>}
                        </div>
                      </div>

                      {/* Right: Corrected Record & Institutional Submission */}
                      <div className="p-3 bg-emerald-50/40 border border-emerald-200 rounded-xl text-xs space-y-2">
                        <span className="font-bold text-[#1E9E5A] text-[11px] uppercase tracking-wider block">
                          Institutional Response &amp; Correction ({c.responses?.length || 0} Submissions)
                        </span>

                        {latestResp ? (
                          <div className="space-y-1.5 text-[#14233F]">
                            <p className="italic">"{latestResp.explanation}"</p>
                            <p className="text-[#4B5563] text-[11px]">
                              <strong>Action Taken:</strong> {latestResp.actionTaken}
                            </p>
                            {latestResp.supportingDocuments && latestResp.supportingDocuments.length > 0 && (
                              <div className="pt-1 flex flex-wrap gap-1.5">
                                {latestResp.supportingDocuments.map((doc) => (
                                  <span
                                    key={doc.id}
                                    className="px-2 py-0.5 bg-white border border-[#D1DCD6] rounded text-[10px] font-semibold text-[#14513A] flex items-center gap-1"
                                  >
                                    <Paperclip className="w-3 h-3 text-[#1E9E5A]" />
                                    {doc.fileName} ({doc.fileSize})
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-[#8A94A0] italic">
                            No response submitted yet. Within statutory grace period.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Row (Requirement D: Approve Corrections & Mark Resolved, Request Further Information, Escalate) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E3EAE6]">
                      <span className="text-[11px] text-[#8A94A0]">
                        Assigned Bureau Officer: <strong>{notice.assignedOfficer}</strong>
                      </span>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenCaseModal(c, 'overview')}
                        >
                          View Full Dossier
                        </Button>

                        {c.status !== 'Resolved' && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleOpenCaseModal(c, 'review', 'Resolved')}
                              className="text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300"
                            >
                              Approve Corrections &amp; Mark Resolved
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenCaseModal(c, 'review', 'Further Action Required')}
                              className="text-amber-800 border-amber-300 hover:bg-amber-50"
                            >
                              Request Further Information
                            </Button>

                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                setEscalateModalCase(c);
                                setEscalationReason('');
                              }}
                            >
                              Escalate to Higher Regulatory Authority
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: CASE LIST & DETAILS TABLE (Tabs: All Cases, Internal Duplicates, Invalid APAAR, Quota, Pending, Resolved) */}
      {activeTab !== 'Cross-Institution Conflicts' && activeTab !== 'Notices & Responses' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto min-w-full">
            <table className="w-full text-left text-xs min-w-[1260px] table-fixed">
              <colgroup>
                <col className="w-[155px]" />
                <col className="w-[170px]" />
                <col className="w-[145px]" />
                <col className="w-[90px]" />
                <col className="w-[135px]" />
                <col className="w-[165px]" />
                <col className="w-[140px]" />
                <col className="w-[120px]" />
                <col className="w-[240px]" />
              </colgroup>
              <thead className="bg-[#F4F8F6] text-[#8A94A0] uppercase font-bold text-[10px] tracking-wider border-b border-[#E3EAE6]">
                <tr>
                  <th className="py-3 px-3">Case ID &amp; Issue</th>
                  <th className="py-3 px-3">Institution</th>
                  <th className="py-3 px-2.5">Student / APAAR</th>
                  <th className="py-3 px-2">Severity</th>
                  <th className="py-3 px-2.5">Notice &amp; Due Date</th>
                  <th className="py-3 px-2.5">Latest Response</th>
                  <th className="py-3 px-2.5">Assigned Officer</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EAE6]">
                {currentTabCases.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#8A94A0]">
                      <Briefcase className="w-8 h-8 text-[#8A94A0] mx-auto mb-2 opacity-50" />
                      <p className="font-bold text-[#14233F]">No compliance cases found in this category.</p>
                      <p className="text-[11px] text-[#8A94A0] mt-0.5">Try adjusting filters or switching tabs.</p>
                    </td>
                  </tr>
                ) : (
                  currentTabCases.map((c) => {
                    const activeNotice = c.notices[0];
                    const latestResp = c.responses?.[0];
                    const student = students.find((s) => c.linkedStudentIds.includes(s.id) || c.linkedStudentIds.includes(s.studentId));

                    return (
                      <tr key={c.id} className="hover:bg-[#F9FCFA] transition-colors border-b border-[#F0F5F2]">
                        {/* 1. Case ID & Issue */}
                        <td className="py-3 px-3 align-middle">
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-[#14513A] bg-[#EBF3EF] px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                              {c.id}
                            </span>
                            <p className="font-bold text-[#14233F] line-clamp-2 mt-0.5 leading-snug" title={c.title}>
                              {c.title}
                            </p>
                            <span className="text-[10px] text-[#8A94A0] block whitespace-nowrap">
                              {c.detectionDate}
                            </span>
                          </div>
                        </td>

                        {/* 2. Institution */}
                        <td className="py-3 px-3 align-middle">
                          <div className="space-y-1">
                            {c.institutionIds.map((id) => (
                              <div key={id}>
                                <span className="font-semibold text-[#14233F] block text-[11px] line-clamp-2 leading-snug" title={c.institutionNames[id] || id}>
                                  {c.institutionNames[id] || id}
                                </span>
                                <span className="text-[10px] font-mono text-[#8A94A0] whitespace-nowrap">({id})</span>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* 3. Student / APAAR */}
                        <td className="py-3 px-2.5 align-middle">
                          {student || c.linkedApaarId ? (
                            <div className="space-y-1">
                              <span className="font-semibold text-[#14233F] block truncate text-[11px]" title={student?.name || 'Multiple Students'}>
                                {student?.name || 'Multiple Students'}
                              </span>
                              <span className="font-mono text-[10px] text-[#14513A] bg-[#EBF3EF] px-1.5 py-0.5 rounded font-bold whitespace-nowrap inline-block">
                                {student?.apaarId || c.linkedApaarId || 'APAAR Pending'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#8A94A0] italic text-[11px]">Institutional Quota</span>
                          )}
                        </td>

                        {/* 4. Severity */}
                        <td className="py-3 px-2 align-middle">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block whitespace-nowrap ${
                              c.severity === 'Critical'
                                ? 'bg-rose-100 text-rose-800'
                                : c.severity === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {c.severity}
                          </span>
                        </td>

                        {/* 5. Notice & Due Date */}
                        <td className="py-3 px-2.5 align-middle text-[11px]">
                          {activeNotice ? (
                            <div className="space-y-0.5">
                              <span className="font-mono text-[10px] font-semibold text-[#14233F] block whitespace-nowrap">
                                {activeNotice.id}
                              </span>
                              <span className="text-[10px] text-[#8A94A0] block whitespace-nowrap">
                                Issued: {activeNotice.issueDate}
                              </span>
                              <span className="text-[10px] font-semibold text-[#D64545] block whitespace-nowrap">
                                Due: {activeNotice.responseDeadline}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#8A94A0] italic whitespace-nowrap">No Notice</span>
                          )}
                        </td>

                        {/* 6. Latest Response */}
                        <td className="py-3 px-2.5 align-middle text-[11px]">
                          {latestResp ? (
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-bold text-[#1E9E5A] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block whitespace-nowrap">
                                #{latestResp.submissionNumber} Submitted
                              </span>
                              <p className="line-clamp-2 text-[10px] text-[#4B5563] leading-snug" title={latestResp.explanation}>
                                {latestResp.explanation}
                              </p>
                              <span className="text-[9px] text-[#8A94A0] block whitespace-nowrap">{latestResp.submittedAt}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#8A94A0] italic whitespace-nowrap">Awaiting Response</span>
                          )}
                        </td>

                        {/* 7. Assigned Officer */}
                        <td className="py-3 px-2.5 align-middle text-[#4B5563]">
                          <span className="font-semibold text-[11px] block line-clamp-1 text-[#14233F]" title={c.assignedOfficer.name}>
                            {c.assignedOfficer.name}
                          </span>
                          <span className="text-[9px] text-[#8A94A0] block line-clamp-2 leading-snug" title={c.assignedOfficer.role}>
                            {c.assignedOfficer.role}
                          </span>
                        </td>

                        {/* 8. Status */}
                        <td className="py-3 px-2 align-middle">
                          {getStatusBadge(c.status)}
                        </td>

                        {/* 9. Actions (Standardized Primary & Secondary Action Groups) */}
                        <td className="py-3 px-3 text-right align-middle">
                          <div className="flex flex-col gap-1.5 items-end justify-center w-full">
                            {/* Primary Action Group */}
                            <div className="flex items-center gap-1.5 justify-end flex-wrap sm:flex-nowrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenCaseModal(c, 'overview')}
                                className="text-xs py-1 px-2.5 font-medium whitespace-nowrap min-w-[76px] justify-center"
                              >
                                View Case
                              </Button>

                              {c.status === 'Flagged' && (
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleOpenCaseModal(c, 'notice')}
                                  className="text-xs py-1 px-2.5 font-medium whitespace-nowrap min-w-[82px] justify-center"
                                >
                                  Raise Notice
                                </Button>
                              )}

                              {(c.status === 'Response Submitted' || c.status === 'Under AICTE Review') && (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => handleOpenCaseModal(c, 'review')}
                                  className="text-xs py-1 px-2.5 font-medium whitespace-nowrap min-w-[105px] justify-center shadow-xs"
                                >
                                  Review Response
                                </Button>
                              )}

                              {c.status !== 'Resolved' && (c.status === 'Response Submitted' || c.status === 'Under AICTE Review') && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleOpenCaseModal(c, 'review', 'Resolved')}
                                  className="text-xs py-1 px-2 font-medium whitespace-nowrap min-w-[105px] justify-center text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300"
                                >
                                  Mark as Resolved
                                </Button>
                              )}
                            </div>

                            {/* Secondary Action Group */}
                            <div className="flex items-center gap-1.5 text-[10px] text-[#4B5563] justify-end flex-wrap pt-0.5">
                              {(c.status === 'Response Submitted' || c.status === 'Under AICTE Review') && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCaseModal(c, 'review', 'Further Action Required')}
                                    className="text-amber-700 hover:underline font-semibold cursor-pointer whitespace-nowrap"
                                  >
                                    Request Further Information
                                  </button>
                                  <span>&bull;</span>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setRemarksModalCase(c);
                                  setOfficerRemarksText('');
                                }}
                                className="text-[#14513A] hover:underline font-semibold cursor-pointer whitespace-nowrap"
                              >
                                Add Officer Remarks
                              </button>
                              <span>&bull;</span>
                              <button
                                type="button"
                                onClick={() => handleOpenCaseModal(c, 'audit')}
                                className="text-[#4B5563] hover:underline font-semibold cursor-pointer whitespace-nowrap"
                              >
                                View Audit History
                              </button>
                              {c.status !== 'Resolved' && (
                                <>
                                  <span>&bull;</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEscalateModalCase(c);
                                      setEscalationReason('');
                                    }}
                                    className="text-[#D64545] hover:underline font-semibold cursor-pointer whitespace-nowrap"
                                  >
                                    Escalate Case
                                  </button>
                                </>
                              )}
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

      {/* CASE DOSSIER & ADJUDICATION MODAL */}
      {selectedCase && (
        <Modal
          isOpen={!!selectedCase}
          onClose={() => setSelectedCase(null)}
          title={`AICTE Compliance Case Dossier: ${selectedCase.id}`}
          maxWidth="3xl"
        >
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-[#E3EAE6] text-xs font-bold gap-2 overflow-x-auto select-none">
              <button
                type="button"
                onClick={() => setModalTab('overview')}
                className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  modalTab === 'overview'
                    ? 'border-[#14513A] text-[#14513A]'
                    : 'border-transparent text-[#8A94A0] hover:text-[#14233F]'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                Case Overview & Evidence
              </button>

              <button
                type="button"
                onClick={() => setModalTab('responses')}
                className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  modalTab === 'responses'
                    ? 'border-[#14513A] text-[#14513A]'
                    : 'border-transparent text-[#8A94A0] hover:text-[#14233F]'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                Institutional Submissions ({selectedCase.responses?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setModalTab('review')}
                className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  modalTab === 'review'
                    ? 'border-[#14513A] text-[#14513A]'
                    : 'border-transparent text-[#8A94A0] hover:text-[#14233F]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E9E5A]" />
                Bureau Officer Ruling
              </button>

              <button
                type="button"
                onClick={() => setModalTab('notice')}
                className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  modalTab === 'notice'
                    ? 'border-[#14513A] text-[#14513A]'
                    : 'border-transparent text-[#8A94A0] hover:text-[#14233F]'
                }`}
              >
                <Send className="w-3.5 h-3.5 text-amber-600" />
                Issue Show-Cause Notice
              </button>

              <button
                type="button"
                onClick={() => setModalTab('audit')}
                className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  modalTab === 'audit'
                    ? 'border-[#14513A] text-[#14513A]'
                    : 'border-transparent text-[#8A94A0] hover:text-[#14233F]'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Audit Trail ({selectedCase.history.length})
              </button>
            </div>

            {/* MODAL TAB 1: OVERVIEW */}
            {modalTab === 'overview' && (
              <div className="space-y-4">
                <div className="p-4 bg-[#F4F8F6] rounded-xl border border-[#E3EAE6] space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black text-[#14513A]">
                      {selectedCase.id} • {selectedCase.caseNumber}
                    </span>
                    {getStatusBadge(selectedCase.status)}
                  </div>
                  <h3 className="text-base font-bold text-[#14233F]">{selectedCase.title}</h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed">{selectedCase.description}</p>
                  <div className="pt-2 border-t border-[#D1DCD6] flex flex-wrap gap-4 text-xs font-semibold text-[#14513A]">
                    <span>Metric: {selectedCase.metric}</span>
                    <span>Detected: {selectedCase.detectionDate}</span>
                    <span>Assigned Officer: {selectedCase.assignedOfficer.name}</span>
                  </div>
                </div>

                {/* Institutions Involved */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#8A94A0] uppercase tracking-wider">
                    Associated Institutions ({selectedCase.institutionIds.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCase.institutionIds.map((instId) => (
                      <div key={instId} className="p-3 bg-white border border-[#E3EAE6] rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-[#14233F]">
                          <span className="truncate">{selectedCase.institutionNames[instId] || instId}</span>
                          <span className="text-[10px] font-mono text-[#14513A] bg-[#EBF3EF] px-1.5 py-0.5 rounded">
                            {instId}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#4B5563] block">
                          Role: {instId === selectedCase.primaryInstitutionId ? 'Primary Ingest Institution' : 'Secondary Party'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evidence Records */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#8A94A0] uppercase tracking-wider">
                    Supporting Ingest Evidence &amp; Logs
                  </h4>
                  <div className="space-y-2">
                    {selectedCase.evidence.map((ev) => (
                      <div key={ev.id} className="p-3 bg-[#F8FAF9] border border-[#E3EAE6] rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold text-[#14233F]">
                          <span>{ev.title}</span>
                          <span className="text-[10px] text-[#14513A] bg-[#EBF3EF] px-2 py-0.5 rounded font-mono">
                            {ev.type}
                          </span>
                        </div>
                        <p className="text-[#4B5563] text-[11px]">{ev.details}</p>
                        <span className="text-[10px] text-[#8A94A0] block">Ingest Timestamp: {ev.uploadedAt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODAL TAB 2: INSTITUTIONAL SUBMISSIONS & ATTACHMENTS */}
            {modalTab === 'responses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#8A94A0] uppercase tracking-wider">
                    Institutional Submissions Dossier ({selectedCase.responses?.length || 0})
                  </h4>
                  <span className="text-xs text-[#14513A] font-semibold">
                    Target Case: {selectedCase.id}
                  </span>
                </div>

                {(!selectedCase.responses || selectedCase.responses.length === 0) ? (
                  <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-[#D1DCD6]">
                    <Clock className="w-8 h-8 text-[#8A94A0] mx-auto mb-2" />
                    <p className="text-xs font-bold text-[#14233F]">No Responses Filed Yet</p>
                    <p className="text-[11px] text-[#8A94A0] max-w-sm mx-auto mt-1">
                      The institution is within the statutory deadline period to submit authenticated justifications.
                    </p>
                  </div>
                ) : (
                  selectedCase.responses.map((resp) => (
                    <div key={resp.id} className="p-4 bg-white border border-[#E3EAE6] rounded-xl space-y-3 text-xs shadow-xs">
                      <div className="flex flex-wrap items-center justify-between border-b border-[#E3EAE6] pb-2">
                        <div>
                          <span className="font-bold text-[#14233F] text-sm block">
                            Submission #{resp.submissionNumber} ({resp.id})
                          </span>
                          <span className="text-[11px] text-[#14513A] font-semibold">
                            Filed By: {resp.submittedBy} ({resp.institutionName})
                          </span>
                        </div>
                        <span className="text-[11px] text-[#8A94A0] font-mono">
                          {resp.submittedAt}
                        </span>
                      </div>

                      {/* Explanation */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-[#8A94A0] uppercase">
                          Institutional Factual Explanation:
                        </span>
                        <p className="p-3 bg-[#F8FAF9] rounded-lg border border-[#E3EAE6] text-[#14233F] leading-relaxed text-xs">
                          {resp.explanation}
                        </p>
                      </div>

                      <p className="text-[11px] text-[#4B5563]">
                        <strong className="text-[#14233F]">Corrective Action Executed: </strong>
                        {resp.actionTaken}
                      </p>

                      {/* Documents */}
                      {resp.supportingDocuments && resp.supportingDocuments.length > 0 && (
                        <div className="space-y-2 pt-1 border-t border-[#E3EAE6]">
                          <span className="text-[10px] font-bold text-[#8A94A0] uppercase tracking-wider block">
                            Attached Supporting Documents ({resp.supportingDocuments.length}):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {resp.supportingDocuments.map((doc) => (
                              <div
                                key={doc.id}
                                className="p-2.5 bg-[#F4F8F6] border border-[#D1DCD6] rounded-lg flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <Paperclip className="w-4 h-4 text-[#1E9E5A] flex-shrink-0" />
                                  <div className="truncate">
                                    <p className="font-bold text-[#14233F] truncate">{doc.fileName}</p>
                                    <p className="text-[10px] text-[#8A94A0] truncate">{doc.description}</p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-mono text-[#14513A] bg-white px-1.5 py-0.5 rounded border border-[#D1DCD6] flex-shrink-0">
                                  {doc.fileSize}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* MODAL TAB 3: BUREAU OFFICER RULING & ADJUDICATION */}
            {modalTab === 'review' && (
              <form onSubmit={handleOfficerReviewSubmit} className="space-y-4">
                <div className="p-3 bg-[#EBF3EF] border border-[#D1DCD6] rounded-xl">
                  <h4 className="text-xs font-bold text-[#14513A] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#1E9E5A]" />
                    AICTE Regulatory Adjudication Console
                  </h4>
                  <p className="text-[11px] text-[#14513A] mt-0.5">
                    Determine whether the institutional submission satisfactorily addresses the compliance discrepancy. Approval clears student flags and restores institutional compliance.
                  </p>
                </div>

                {/* Ruling Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#14233F] mb-2">
                    Adjudication Decision *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-1 ${
                        reviewDecision === 'Resolved'
                          ? 'border-[#1E9E5A] bg-emerald-50 text-emerald-950'
                          : 'border-[#E3EAE6] hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="decision"
                        checked={reviewDecision === 'Resolved'}
                        onChange={() => setReviewDecision('Resolved')}
                        className="sr-only"
                      />
                      <span className="font-bold flex items-center gap-1.5 text-xs text-[#1E9E5A]">
                        <CheckCircle2 className="w-4 h-4" />
                        Approve &amp; Mark Resolved
                      </span>
                      <span className="text-[11px] text-[#4B5563]">
                        Explanations and documents are verified. Clears student record flags and marks anomaly resolved.
                      </span>
                    </label>

                    <label
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-1 ${
                        reviewDecision === 'Further Action Required'
                          ? 'border-[#F5B335] bg-amber-50 text-amber-950'
                          : 'border-[#E3EAE6] hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="decision"
                        checked={reviewDecision === 'Further Action Required'}
                        onChange={() => setReviewDecision('Further Action Required')}
                        className="sr-only"
                      />
                      <span className="font-bold flex items-center gap-1.5 text-xs text-amber-700">
                        <AlertTriangle className="w-4 h-4" />
                        Request Further Information
                      </span>
                      <span className="text-[11px] text-[#4B5563]">
                        Incomplete documentation. Re-opens response window with a supplementary deadline.
                      </span>
                    </label>

                    <label
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-1 ${
                        reviewDecision === 'Under AICTE Review'
                          ? 'border-[#2563EB] bg-blue-50 text-blue-950'
                          : 'border-[#E3EAE6] hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="decision"
                        checked={reviewDecision === 'Under AICTE Review'}
                        onChange={() => setReviewDecision('Under AICTE Review')}
                        className="sr-only"
                      />
                      <span className="font-bold flex items-center gap-1.5 text-xs text-blue-700">
                        <Clock className="w-4 h-4" />
                        Keep Under AICTE Bureau Review
                      </span>
                      <span className="text-[11px] text-[#4B5563]">
                        Verification with State Admission Committee or exam board is ongoing.
                      </span>
                    </label>

                    <label
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-1 ${
                        reviewDecision === 'Escalated'
                          ? 'border-[#D64545] bg-rose-50 text-rose-950'
                          : 'border-[#E3EAE6] hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="decision"
                        checked={reviewDecision === 'Escalated'}
                        onChange={() => setReviewDecision('Escalated')}
                        className="sr-only"
                      />
                      <span className="font-bold flex items-center gap-1.5 text-xs text-[#D64545]">
                        <AlertOctagon className="w-4 h-4" />
                        Escalate to Council Appellate Body
                      </span>
                      <span className="text-[11px] text-[#4B5563]">
                        Willful non-compliance or quota violations. Refers to national approval committee for sanctions.
                      </span>
                    </label>
                  </div>
                </div>

                {reviewDecision === 'Further Action Required' && (
                  <div>
                    <label className="block text-xs font-bold text-[#14233F] mb-1">
                      Supplementary Response Deadline *
                    </label>
                    <input
                      type="date"
                      value={newDeadlineDate}
                      onChange={(e) => setNewDeadlineDate(e.target.value)}
                      className="p-2 border border-[#E3EAE6] rounded-xl text-xs font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#14233F] mb-1">
                    Bureau Officer Findings &amp; Ruling Memo *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={reviewRemarks}
                    onChange={(e) => setReviewRemarks(e.target.value)}
                    placeholder="Enter official reasoning, statutory validation notes, or instructions for the institution..."
                    className="w-full p-2.5 border border-[#E3EAE6] rounded-xl text-xs focus:outline-none focus:border-[#14513A]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E3EAE6]">
                  <span className="text-[11px] text-[#8A94A0]">
                    Signing Officer: {user?.name || 'Dr. R. K. Srivastav'} (Senior Director)
                  </span>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmittingReview}
                    className="flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSubmittingReview ? 'Recording Ruling...' : 'Record Bureau Ruling'}</span>
                  </Button>
                </div>
              </form>
            )}

            {/* MODAL TAB 4: ISSUE SHOW-CAUSE NOTICE */}
            {modalTab === 'notice' && (
              <form onSubmit={handleIssueNoticeSubmit} className="space-y-4">
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1 text-xs">
                  <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-amber-700" />
                    Dispatch Show-Cause Directive under Section 10(1)
                  </h4>
                  <p className="text-amber-950 text-[11px]">
                    Dispatches a formal regulatory notice. System blocks accidental duplicate notices if an active notice is already outstanding.
                  </p>
                </div>

                {selectedCase.notices.some((n) => n.institutionId === noticeTargetInstId && n.status === 'Active') && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#D64545] flex-shrink-0" />
                    <span>
                      <strong>Duplicate Notice Warning:</strong> An active notice is already outstanding for this institution. Additional notices cannot be issued until response is received.
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#14233F] mb-1">
                    Recipient Institution *
                  </label>
                  <select
                    value={noticeTargetInstId}
                    onChange={(e) => setNoticeTargetInstId(e.target.value)}
                    className="w-full p-2 border border-[#E3EAE6] rounded-xl text-xs font-semibold"
                  >
                    {selectedCase.institutionIds.map((id) => (
                      <option key={id} value={id}>
                        {selectedCase.institutionNames[id] || id} ({id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14233F] mb-1">
                    Notice Description &amp; Violation Charge *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={noticeDescription}
                    onChange={(e) => setNoticeDescription(e.target.value)}
                    className="w-full p-2.5 border border-[#E3EAE6] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14233F] mb-1">
                    Mandated Corrective Action *
                  </label>
                  <input
                    type="text"
                    required
                    value={noticeCorrectiveAction}
                    onChange={(e) => setNoticeCorrectiveAction(e.target.value)}
                    className="w-full p-2 border border-[#E3EAE6] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14233F] mb-1">
                    Response Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={noticeDeadline}
                    onChange={(e) => setNoticeDeadline(e.target.value)}
                    className="p-2 border border-[#E3EAE6] rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3EAE6]">
                  <Button
                    type="submit"
                    variant="danger"
                    disabled={isIssuingNotice}
                    className="flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isIssuingNotice ? 'Dispatching Directive...' : 'Dispatch Regulatory Show-Cause Notice'}</span>
                  </Button>
                </div>
              </form>
            )}

            {/* MODAL TAB 5: AUDIT TRAIL */}
            {modalTab === 'audit' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#8A94A0] uppercase tracking-wider">
                    Immutable Cryptographic Audit Hash Chain
                  </h4>
                  <span className="text-[11px] font-mono text-[#14513A] bg-[#EBF3EF] px-2 py-0.5 rounded">
                    SHA-256 Ledger
                  </span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {selectedCase.history.map((h, idx) => (
                    <div key={h.id || idx} className="p-3 bg-white border border-[#E3EAE6] rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#14233F]">
                        <span className="text-[#14513A]">{h.action}</span>
                        <span className="text-[10px] text-[#8A94A0] font-mono">{h.timestamp}</span>
                      </div>
                      <p className="text-[#4B5563] text-[11px]">{h.remarks}</p>
                      <div className="flex flex-wrap items-center justify-between text-[10px] text-[#8A94A0] pt-1 border-t border-[#E3EAE6]/60">
                        <span>Actor: <strong>{h.actor}</strong> ({h.role})</span>
                        <span>Transition: {h.previousStatus} → <strong>{h.newStatus}</strong></span>
                      </div>
                      <div className="text-[10px] font-mono text-gray-400 truncate">
                        Hash: {h.hash}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* QUICK MODAL: ADD OFFICER REMARKS */}
      {remarksModalCase && (
        <Modal
          isOpen={!!remarksModalCase}
          onClose={() => setRemarksModalCase(null)}
          title={`Add Bureau Officer Remarks — ${remarksModalCase.id}`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveRemarks} className="space-y-4 text-xs">
            <p className="text-[#4B5563]">
              Record official remarks into the immutable case history for {remarksModalCase.title}.
            </p>
            <div>
              <label className="block text-xs font-bold text-[#14233F] mb-1">
                Officer Remarks *
              </label>
              <textarea
                rows={4}
                required
                value={officerRemarksText}
                onChange={(e) => setOfficerRemarksText(e.target.value)}
                placeholder="Enter regulatory notes, hearing instructions, or inspection findings..."
                className="w-full p-2.5 border border-[#E3EAE6] rounded-xl text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#E3EAE6]">
              <Button type="button" variant="ghost" onClick={() => setRemarksModalCase(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Remarks
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* QUICK MODAL: ESCALATE CASE */}
      {escalateModalCase && (
        <Modal
          isOpen={!!escalateModalCase}
          onClose={() => setEscalateModalCase(null)}
          title={`Escalate Case to National Approval Body — ${escalateModalCase.id}`}
          maxWidth="md"
        >
          <form onSubmit={handleExecuteEscalation} className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 space-y-1">
              <strong className="font-bold flex items-center gap-1.5 text-xs text-[#D64545]">
                <AlertOctagon className="w-4 h-4" />
                Statutory Escalation Warning
              </strong>
              <p className="text-[11px]">
                Escalating case {escalateModalCase.id} refers the institution to the AICTE National Approval Committee for formal punitive hearing or sanction determination.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14233F] mb-1">
                Justification for Statutory Escalation *
              </label>
              <textarea
                rows={4}
                required
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="Detail non-compliance, refusal to submit documentary evidence, or repeated supernumerary breaches..."
                className="w-full p-2.5 border border-[#E3EAE6] rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E3EAE6]">
              <Button type="button" variant="ghost" onClick={() => setEscalateModalCase(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger">
                Confirm Escalation
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
