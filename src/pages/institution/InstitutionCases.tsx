import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  UploadCloud,
  FileCheck,
  Search,
  ArrowRight,
  Eye,
  Send,
  Building2,
  History,
  Info,
  Calendar,
  User,
  ExternalLink,
  ShieldCheck,
  Paperclip
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { ComplianceCase, ResponseDocument, StudentCorrectionPayload } from '../../types';

export const InstitutionCases: React.FC = () => {
  const { user } = useAuth();
  const currentInstId = user?.institutionId || 'INST102';
  const { cases, submitInstitutionResponse, students } = useData();
  const toast = useToast();

  // Institution-scoped cases (enforce data isolation)
  const instCases = cases.filter((c) => c.institutionIds.includes(currentInstId));

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Notice Issued' | 'Response Submitted' | 'Under AICTE Review' | 'Further Action Required' | 'Resolved'>('all');
  
  // Selected Case for Modal
  const [selectedCase, setSelectedCase] = useState<ComplianceCase | null>(null);

  // Response Form State
  const [explanation, setExplanation] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<ResponseDocument[]>([]);
  const [newDocName, setNewDocName] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [correctionNote, setCorrectionNote] = useState('');
  const [correctedApaar, setCorrectedApaar] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered cases
  const filteredCases = instCases.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchId = c.id.toLowerCase().includes(term);
      const matchTitle = c.title.toLowerCase().includes(term);
      const matchType = c.issueType.toLowerCase().includes(term);
      const matchOrder = c.notices.some((n) => n.orderNumber.toLowerCase().includes(term));
      const matchApaar = c.linkedApaarId?.toLowerCase().includes(term);
      return matchId || matchTitle || matchType || matchOrder || matchApaar;
    }
    return true;
  });

  // Dynamic counts
  const totalCases = instCases.length;
  const activeNotices = instCases.filter((c) => c.status === 'Notice Issued' || c.status === 'Further Action Required').length;
  const pendingReview = instCases.filter((c) => c.status === 'Response Submitted' || c.status === 'Under AICTE Review').length;
  const resolvedCases = instCases.filter((c) => c.status === 'Resolved').length;

  const handleOpenCase = (c: ComplianceCase) => {
    setSelectedCase(c);
    setExplanation('');
    setActionTaken('');
    setSelectedDocs([]);
    setNewDocName('');
    setNewDocDesc('');
    setCorrectionNote('');
    setCorrectedApaar(c.linkedApaarId || '');
  };

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

  const handleAddCustomDoc = () => {
    if (!newDocName.trim()) {
      toast.error('File Required', 'Please enter a document name or select an official document template.');
      return;
    }
    const doc: ResponseDocument = {
      id: `DOC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      fileName: newDocName.trim().endsWith('.pdf') ? newDocName.trim() : `${newDocName.trim()}.pdf`,
      fileSize: '1.2 MB',
      fileType: 'application/pdf',
      uploadedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      description: newDocDesc.trim() || 'Institutional supporting evidence document'
    };
    setSelectedDocs((prev) => [...prev, doc]);
    setNewDocName('');
    setNewDocDesc('');
  };

  const handleRemoveDoc = (id: string) => {
    setSelectedDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    if (!explanation.trim() || explanation.trim().length < 20) {
      toast.error('Detailed Explanation Required', 'Please provide an institutional explanation of at least 20 characters.');
      return;
    }

    setIsSubmitting(true);

    const studentCorrections: StudentCorrectionPayload[] = [];
    if (selectedCase.linkedStudentIds && selectedCase.linkedStudentIds.length > 0) {
      selectedCase.linkedStudentIds.forEach((sId) => {
        studentCorrections.push({
          studentId: sId,
          apaarId: correctedApaar.trim() || undefined,
          statusNote: correctionNote.trim() || 'Institution submitted documentary verification for council review.'
        });
      });
    }

    const result = submitInstitutionResponse(selectedCase.id, currentInstId, {
      explanation: explanation.trim(),
      actionTaken: actionTaken.trim() || 'Institution reviewed academic records and attached authenticated verification documents.',
      documents: selectedDocs,
      studentCorrections,
      submittedBy: `${user?.name || 'Academic Registrar'} (${user?.institutionName || 'Institution'})`
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success('Response Submitted for AICTE Review', result.message);
      if (result.case) {
        setSelectedCase(result.case);
      } else {
        const updated = cases.find((c) => c.id === selectedCase.id);
        setSelectedCase(updated || null);
      }
    } else {
      toast.error('Submission Failed', result.message);
    }
  };

  const getStatusBadge = (status: ComplianceCase['status']) => {
    switch (status) {
      case 'Notice Issued':
        return <Badge variant="error">Notice Issued (Action Required)</Badge>;
      case 'Further Action Required':
        return <Badge variant="warning">Further Action Required</Badge>;
      case 'Response Submitted':
        return <Badge variant="info">Response Submitted (Under Review)</Badge>;
      case 'Under AICTE Review':
        return <Badge variant="info">Under AICTE Official Review</Badge>;
      case 'Resolved':
        return <Badge variant="success">Resolved &amp; Cleared</Badge>;
      case 'Escalated':
        return <Badge variant="error">Escalated to Regulatory Committee</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#14233F]">Compliance Notices & Regulatory Inquiries</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EBF3EF] text-[#14513A] border border-[#D1DCD6]">
              Section 10(1) AICTE Act
            </span>
          </div>
          <p className="text-sm text-[#4B5563] mt-1">
            Centralized portal to review AICTE show-cause directives, upload authenticated evidence, submit record corrections, and track regulatory decisions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="px-3 py-1.5 bg-[#F4F8F6] border border-[#E3EAE6] rounded-xl text-xs font-semibold text-[#14513A] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#1E9E5A]" />
            <span>{user?.institutionName || 'College of Engineering Pune'}</span>
          </div>
        </div>
      </div>

      {/* Mandatory Notice Reminder Banner */}
      <div className="bg-[#FFF8EB] border-l-4 border-[#F5B335] p-4 rounded-xl flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-[#92400E] space-y-1">
          <p className="font-bold text-sm text-[#78350F]">Statutory Response Compliance Requirement</p>
          <p>
            Institutions receiving AICTE Show-Cause notices must submit documented justifications within the stipulated deadline.
            Submissions are transmitted directly to the assigned AICTE Approval Bureau Officer. <strong>Resubmitted records are never automatically verified</strong>; they remain under review until formally signed off by the council.
          </p>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-[#D64545]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#8A94A0] uppercase tracking-wider">Active Show-Cause Notices</p>
              <h3 className="text-2xl font-black text-[#D64545] mt-1">{activeNotices}</h3>
              <p className="text-[11px] text-[#8A94A0] mt-0.5">Require institutional response</p>
            </div>
            <div className="p-3 bg-rose-50 text-[#D64545] rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-[#2563EB]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#8A94A0] uppercase tracking-wider">Under AICTE Review</p>
              <h3 className="text-2xl font-black text-[#2563EB] mt-1">{pendingReview}</h3>
              <p className="text-[11px] text-[#8A94A0] mt-0.5">Responses submitted to bureau</p>
            </div>
            <div className="p-3 bg-blue-50 text-[#2563EB] rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-[#1E9E5A]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#8A94A0] uppercase tracking-wider">Resolved Compliance Inquiries</p>
              <h3 className="text-2xl font-black text-[#1E9E5A] mt-1">{resolvedCases}</h3>
              <p className="text-[11px] text-[#8A94A0] mt-0.5">Approved & records cleared</p>
            </div>
            <div className="p-3 bg-emerald-50 text-[#1E9E5A] rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-[#14513A]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#8A94A0] uppercase tracking-wider">Total Registered Cases</p>
              <h3 className="text-2xl font-black text-[#14233F] mt-1">{totalCases}</h3>
              <p className="text-[11px] text-[#8A94A0] mt-0.5">Institutional audit portfolio</p>
            </div>
            <div className="p-3 bg-[#EBF3EF] text-[#14513A] rounded-xl">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#8A94A0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Case ID, Notice Order, Student APAAR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#E3EAE6] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#14513A] focus:ring-1 focus:ring-[#14513A]"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {(
              [
                { id: 'all', label: 'All Cases' },
                { id: 'Notice Issued', label: 'Notices Pending' },
                { id: 'Response Submitted', label: 'Under Review' },
                { id: 'Further Action Required', label: 'Action Required' },
                { id: 'Resolved', label: 'Resolved' }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === tab.id
                    ? 'bg-[#14513A] text-white shadow-xs'
                    : 'bg-[#F4F8F6] text-[#4B5563] hover:text-[#14233F]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Cases List */}
      <div className="space-y-4">
        {filteredCases.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-[#1E9E5A] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#14233F]">No Compliance Inquiries Found</h3>
            <p className="text-xs text-[#8A94A0] max-w-md mx-auto mt-1">
              There are no pending show-cause notices or compliance cases matching your search criteria. Your institution records are currently synchronized.
            </p>
          </Card>
        ) : (
          filteredCases.map((c) => {
            const activeNotice = c.notices.find((n) => n.institutionId === currentInstId) || c.notices[0];
            const hasSubmittedResponse = c.responses && c.responses.length > 0;
            const isNoticeActive = c.status === 'Notice Issued' || c.status === 'Further Action Required';

            return (
              <Card key={c.id} className="p-5 hover:border-[#14513A] transition-all border border-[#E3EAE6]">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-[#14513A] bg-[#EBF3EF] px-2.5 py-1 rounded-md">
                        {c.id}
                      </span>
                      <span className="text-xs font-bold text-[#4B5563] bg-gray-100 px-2 py-0.5 rounded">
                        {c.issueType}
                      </span>
                      {getStatusBadge(c.status)}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.severity === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : c.severity === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {c.severity} Severity
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#14233F]">{c.title}</h3>
                    <p className="text-xs text-[#4B5563] leading-relaxed">{c.description}</p>

                    {/* Notice Detail Box if active */}
                    {activeNotice && (
                      <div className="bg-[#F8FAF9] p-3 rounded-xl border border-[#D1DCD6] space-y-1.5 mt-2">
                        <div className="flex flex-wrap items-center justify-between text-xs">
                          <span className="font-semibold text-[#14513A]">
                            Official Directive: {activeNotice.orderNumber}
                          </span>
                          <span className="text-[#8A94A0] flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-[#1E9E5A]" />
                            Issued: {activeNotice.issueDate}
                          </span>
                        </div>
                        <p className="text-xs text-[#14233F]">
                          <strong className="text-[#14513A]">Corrective Action Mandate: </strong>
                          {activeNotice.correctiveAction}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#4B5563] pt-1 border-t border-[#E3EAE6]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#D64545]" />
                            <strong>Response Deadline:</strong> {activeNotice.responseDeadline}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-[#14513A]" />
                            <strong>Officer:</strong> {activeNotice.assignedOfficer} ({activeNotice.officerRole})
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Submissions count summary */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[#8A94A0]">
                      <span className="flex items-center gap-1 font-medium">
                        <History className="w-3.5 h-3.5" />
                        {c.responses?.length || 0} Institutional Submissions Filed
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium">
                        <Paperclip className="w-3.5 h-3.5" />
                        {c.evidence?.length || 0} Attached Evidence Records
                      </span>
                      {c.linkedApaarId && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[#14513A] font-bold">
                            APAAR: {c.linkedApaarId}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col gap-2 self-start lg:min-w-[190px]">
                    <Button
                      variant={isNoticeActive ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleOpenCase(c)}
                      className="w-full flex items-center justify-center gap-1.5"
                    >
                      {isNoticeActive ? (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Respond to Notice</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Dossier & Status</span>
                        </>
                      )}
                    </Button>

                    <div className="text-[11px] text-center text-[#8A94A0]">
                      Updated: {c.updatedAt}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Case Dossier & Institutional Response Modal */}
      {selectedCase && (
        <Modal
          isOpen={!!selectedCase}
          onClose={() => setSelectedCase(null)}
          title={`Compliance Case Dossier — ${selectedCase.id}`}
          maxWidth="3xl"
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Header Status Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#F4F8F6] rounded-xl border border-[#E3EAE6]">
              <div>
                <span className="text-xs font-bold text-[#8A94A0] block">Official Case ID</span>
                <span className="text-base font-black text-[#14233F]">{selectedCase.id} ({selectedCase.caseNumber})</span>
              </div>
              <div>
                <span className="text-xs font-bold text-[#8A94A0] block">Issue Category</span>
                <span className="text-xs font-bold text-[#14513A]">{selectedCase.issueType}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-[#8A94A0] block">Current Status</span>
                {getStatusBadge(selectedCase.status)}
              </div>
            </div>

            {/* AICTE Notice Directive Panel */}
            {selectedCase.notices.length > 0 && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-700" />
                    <h4 className="text-sm font-bold text-amber-900">
                      Official AICTE Regulatory Notice Directive
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    {selectedCase.notices[0].orderNumber}
                  </span>
                </div>

                <p className="text-xs text-amber-950 leading-relaxed">
                  {selectedCase.notices[0].noticeDescription}
                </p>

                <div className="bg-white/80 p-3 rounded-lg border border-amber-200/80 space-y-1.5 text-xs text-amber-900">
                  <p>
                    <strong>Mandatory Corrective Action:</strong> {selectedCase.notices[0].correctiveAction}
                  </p>
                  <p>
                    <strong>Supporting Evidence on Record:</strong> {selectedCase.notices[0].supportingEvidence}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-1 font-semibold text-[11px] text-amber-800">
                    <span>Deadline: {selectedCase.notices[0].responseDeadline}</span>
                    <span>Assigned Officer: {selectedCase.notices[0].assignedOfficer}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Linked Student / Evidence Section */}
            {selectedCase.evidence && selectedCase.evidence.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#8A94A0] uppercase tracking-wider">
                  Attached Regulatory Evidence & Logs
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedCase.evidence.map((ev) => (
                    <div key={ev.id} className="p-3 bg-[#F8FAF9] border border-[#E3EAE6] rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#14233F]">
                        <span>{ev.title}</span>
                        <span className="text-[10px] text-[#14513A] bg-[#EBF3EF] px-2 py-0.5 rounded">
                          {ev.type}
                        </span>
                      </div>
                      <p className="text-[#4B5563] text-[11px]">{ev.details}</p>
                      <span className="text-[10px] text-[#8A94A0] block">Logged: {ev.uploadedAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RESPONSE SUBMISSION FORM (Active when notice requires response) */}
            {selectedCase.status !== 'Resolved' && (
              <form onSubmit={handleSubmitResponse} className="p-4 bg-white border-2 border-[#14513A]/20 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#E3EAE6] pb-2">
                  <div>
                    <h4 className="text-sm font-bold text-[#14233F] flex items-center gap-2">
                      <Send className="w-4 h-4 text-[#14513A]" />
                      Institutional Response & Rectification Filing
                    </h4>
                    <p className="text-[11px] text-[#8A94A0]">
                      Submit official clarification, attach authenticating documents, and provide record corrections.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-[#14513A] bg-[#EBF3EF] px-2 py-1 rounded">
                    Submission #{(selectedCase.responses?.length || 0) + 1}
                  </span>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-bold text-[#14233F] mb-1">
                    Institutional Clarification / Legal Explanation *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Provide a factual explanation addressing the specific discrepancy, rationale, council approval reference, or admission confirmation..."
                    className="w-full p-2.5 border border-[#E3EAE6] rounded-xl text-xs focus:outline-none focus:border-[#14513A] focus:ring-1 focus:ring-[#14513A]"
                  />
                </div>

                {/* Action Taken */}
                <div>
                  <label className="block text-xs font-bold text-[#14233F] mb-1">
                    Corrective Mitigation Action Taken
                  </label>
                  <input
                    type="text"
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    placeholder="e.g. Conducted biometric verification; student attendance verified; rectified data error in roster"
                    className="w-full p-2.5 border border-[#E3EAE6] rounded-xl text-xs focus:outline-none focus:border-[#14513A] focus:ring-1 focus:ring-[#14513A]"
                  />
                </div>

                {/* Student Correction Fields if linked APAAR/Student */}
                {selectedCase.linkedStudentIds && selectedCase.linkedStudentIds.length > 0 && (
                  <div className="p-3 bg-[#F4F8F6] rounded-xl border border-[#D1DCD6] space-y-2">
                    <h5 className="text-xs font-bold text-[#14513A]">
                      Inline Student Record Rectification (Optional)
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                          Corrected 12-Digit APAAR ID
                        </label>
                        <input
                          type="text"
                          value={correctedApaar}
                          onChange={(e) => setCorrectedApaar(e.target.value)}
                          placeholder="e.g. 7721 9043 1184"
                          className="w-full p-2 bg-white border border-[#E3EAE6] rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#4B5563] mb-1">
                          Status Note / Rectification Memo
                        </label>
                        <input
                          type="text"
                          value={correctionNote}
                          onChange={(e) => setCorrectionNote(e.target.value)}
                          placeholder="e.g. Verified with state admission allotment memo"
                          className="w-full p-2 bg-white border border-[#E3EAE6] rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Document Attachments */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#14233F]">
                      Supporting Documentary Evidence (PDF / Scanned Gazette / Merit Orders)
                    </label>
                    <span className="text-[11px] text-[#8A94A0]">
                      {selectedDocs.length} Document(s) Attached
                    </span>
                  </div>

                  {/* Document Preset Quick-Select */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="text-[11px] text-[#8A94A0] self-center">Quick Attach:</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleAddSampleDoc({
                          name: 'State_CAP_Round_Allotment_Order.pdf',
                          size: '1.4 MB',
                          type: 'application/pdf',
                          desc: 'Official State Common Entrance Test Cell Merit Allotment Letter'
                        })
                      }
                      className="px-2.5 py-1 bg-[#F4F8F6] hover:bg-[#EBF3EF] border border-[#D1DCD6] rounded text-[11px] font-semibold text-[#14513A]"
                    >
                      + State Allotment Order
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAddSampleDoc({
                          name: 'Biometric_Lecture_Attendance_Roster.pdf',
                          size: '890 KB',
                          type: 'application/pdf',
                          desc: 'Official institutional biometric class attendance confirmation'
                        })
                      }
                      className="px-2.5 py-1 bg-[#F4F8F6] hover:bg-[#EBF3EF] border border-[#D1DCD6] rounded text-[11px] font-semibold text-[#14513A]"
                    >
                      + Biometric Attendance
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAddSampleDoc({
                          name: 'Governing_Council_Sanction_Gazette.pdf',
                          size: '2.1 MB',
                          type: 'application/pdf',
                          desc: 'Sanctioned intake capacity approval order from state higher education department'
                        })
                      }
                      className="px-2.5 py-1 bg-[#F4F8F6] hover:bg-[#EBF3EF] border border-[#D1DCD6] rounded text-[11px] font-semibold text-[#14513A]"
                    >
                      + Sanction Gazette
                    </button>
                  </div>

                  {/* Custom upload input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Or enter custom document name (e.g. Student_Affidavit_Declaration.pdf)"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      className="flex-1 p-2 border border-[#E3EAE6] rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Brief description..."
                      value={newDocDesc}
                      onChange={(e) => setNewDocDesc(e.target.value)}
                      className="w-1/3 p-2 border border-[#E3EAE6] rounded-lg text-xs"
                    />
                    <Button type="button" size="sm" variant="outline" onClick={handleAddCustomDoc}>
                      <UploadCloud className="w-3.5 h-3.5 mr-1" />
                      Attach
                    </Button>
                  </div>

                  {/* Attached Document Pills */}
                  {selectedDocs.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {selectedDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 bg-[#F8FAF9] border border-[#D1DCD6] rounded-lg text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileCheck className="w-4 h-4 text-[#1E9E5A] flex-shrink-0" />
                            <span className="font-bold text-[#14233F] truncate">{doc.fileName}</span>
                            <span className="text-[10px] text-[#8A94A0]">({doc.fileSize})</span>
                            <span className="text-[11px] text-[#4B5563] truncate italic">— {doc.description}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDoc(doc.id)}
                            className="text-xs text-[#D64545] hover:underline font-semibold ml-2"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AICTE Regulatory Notice on Non-Auto Resolution */}
                <div className="bg-[#EBF3EF] border border-[#D1DCD6] p-3 rounded-xl flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#14513A] flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#14513A] leading-relaxed">
                    <strong>Statutory Processing Rule:</strong> Submitting this response transitions the case to <strong>"Response Submitted"</strong> and places it in the AICTE Approval Bureau review queue. In accordance with AICTE regulations, <strong>records are not automatically verified or cleared</strong> until formally scrutinized and approved by an authorized AICTE Officer.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Transmitting Response...' : 'Submit Institutional Response to AICTE'}</span>
                  </Button>
                </div>
              </form>
            )}

            {/* Submission History & AICTE Feedback Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-[#8A94A0] uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#14513A]" />
                Compliance Lifecycle & Audit Trail
              </h4>

              {/* Past Responses */}
              {selectedCase.responses && selectedCase.responses.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-[#14233F]">Past Institutional Submissions</h5>
                  {selectedCase.responses.map((resp) => (
                    <div key={resp.id} className="p-3 bg-white border border-[#E3EAE6] rounded-xl space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between text-[#8A94A0]">
                        <span className="font-bold text-[#14233F]">
                          Submission #{resp.submissionNumber} ({resp.id})
                        </span>
                        <span className="text-[11px]">Submitted: {resp.submittedAt}</span>
                      </div>
                      <p className="text-[#14233F] italic">"{resp.explanation}"</p>
                      <p className="text-[#4B5563] text-[11px]">
                        <strong>Action Taken:</strong> {resp.actionTaken}
                      </p>

                      {/* Documents in response */}
                      {resp.supportingDocuments && resp.supportingDocuments.length > 0 && (
                        <div className="pt-1 border-t border-[#E3EAE6] space-y-1">
                          <span className="text-[10px] font-bold text-[#8A94A0] uppercase">
                            Authenticated Attachments ({resp.supportingDocuments.length}):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {resp.supportingDocuments.map((d) => (
                              <span
                                key={d.id}
                                className="px-2 py-0.5 bg-[#F4F8F6] border border-[#D1DCD6] rounded text-[11px] font-medium text-[#14513A] flex items-center gap-1"
                              >
                                <Paperclip className="w-3 h-3 text-[#1E9E5A]" />
                                {d.fileName} ({d.fileSize})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Officer Review if present */}
                      {resp.officerReview && (
                        <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-1 mt-2">
                          <div className="flex items-center justify-between text-blue-900 font-bold">
                            <span>AICTE Officer Scrutiny: {resp.officerReview.statusDecision}</span>
                            <span className="text-[10px] text-blue-700">{resp.officerReview.reviewedAt}</span>
                          </div>
                          <p className="text-blue-950 text-[11px]">{resp.officerReview.remarks}</p>
                          <span className="text-[10px] text-blue-700 block">
                            Reviewed by: {resp.officerReview.reviewedBy}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Cryptographic Audit Trail */}
              <div className="p-3 bg-[#F8FAF9] border border-[#E3EAE6] rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-[#8A94A0] uppercase tracking-wider block">
                  Immutable Blockchain-Style Audit Hash Chain
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedCase.history.map((h) => (
                    <div key={h.id} className="text-xs border-b border-[#E3EAE6] pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between font-semibold text-[#14233F]">
                        <span>{h.action}</span>
                        <span className="text-[10px] text-[#8A94A0]">{h.timestamp}</span>
                      </div>
                      <p className="text-[#4B5563] text-[11px]">{h.remarks}</p>
                      <div className="flex items-center justify-between text-[10px] text-[#8A94A0] font-mono mt-0.5">
                        <span>Actor: {h.actor} ({h.role})</span>
                        <span className="truncate max-w-[200px]" title={h.hash}>SHA-256: {h.hash.substring(0, 16)}...</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
