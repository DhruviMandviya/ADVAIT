import React, { useState, useMemo } from 'react';
import {
  Award,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Download,
  Printer,
  QrCode,
  ShieldCheck,
  Building2,
  User,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  Layers,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { AicteLogo } from '../../components/common/AicteLogo';
import { AdvaitWordmark } from '../../components/common/AdvaitWordmark';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Student } from '../../types';

export const CertificatePreview: React.FC = () => {
  const { user } = useAuth();
  const { students } = useData();
  const toast = useToast();

  const currentInstId = user?.institutionId || 'INST102';
  // Filter students strictly belonging to the authenticated institution
  const institutionStudents = useMemo(() => {
    return students.filter((s) => s.institutionId === currentInstId);
  }, [students, currentInstId]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Validated' | 'Flagged' | 'Pending'>('all');
  const [programmeFilter, setProgrammeFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'ineligible'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Selected Student Modals
  const [previewStudent, setPreviewStudent] = useState<Student | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [ineligibleModalStudent, setIneligibleModalStudent] = useState<Student | null>(null);

  // Mask APAAR helper: e.g. "9824 5510 8392" -> "•••• •••• 8392"
  const maskApaar = (apaar: string) => {
    if (!apaar) return '•••• •••• ••••';
    const clean = apaar.trim();
    const parts = clean.split(' ');
    if (parts.length === 3) {
      return `•••• •••• ${parts[2]}`;
    }
    const unspaced = clean.replace(/\s+/g, '');
    if (unspaced.length >= 4) {
      const last4 = unspaced.slice(-4);
      return `•••• •••• ${last4}`;
    }
    return '•••• •••• ••••';
  };

  // Filtered List
  const filteredStudents = useMemo(() => {
    return institutionStudents.filter((stu) => {
      // Search
      const search = searchTerm.trim().toLowerCase();
      if (search) {
        const matchName = stu.name.toLowerCase().includes(search);
        const matchRoll = stu.studentId.toLowerCase().includes(search);
        const matchApaar = stu.apaarId.toLowerCase().includes(search);
        const matchCourse = stu.course.toLowerCase().includes(search);
        if (!matchName && !matchRoll && !matchApaar && !matchCourse) return false;
      }

      // Status
      if (statusFilter !== 'all' && stu.status !== statusFilter) return false;

      // Programme
      if (programmeFilter !== 'all' && stu.programme !== programmeFilter) return false;

      // Certificate Availability
      if (availabilityFilter === 'available' && stu.status !== 'Validated') return false;
      if (availabilityFilter === 'ineligible' && stu.status === 'Validated') return false;

      return true;
    });
  }, [institutionStudents, searchTerm, statusFilter, programmeFilter, availabilityFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage]);

  // Download Handler with Strict Eligibility Check
  const handleDownloadCertificate = (student: Student) => {
    if (student.status !== 'Validated') {
      setIneligibleModalStudent(student);
      return;
    }

    toast.success(
      'Official Certificate Generated',
      `APAAR Verification Credential for ${student.name} (${student.studentId}) exported successfully.`
    );
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  // Unique Programmes for filter
  const uniqueProgrammes = useMemo(() => {
    return Array.from(new Set(institutionStudents.map((s) => s.programme)));
  }, [institutionStudents]);

  return (
    <div className="space-y-6">
      {/* Page Title & Heading (Requirement 5) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#1E9E5A] tracking-wider uppercase">
            Credential Management &amp; Issuance
          </span>
          <h1 className="text-2xl font-bold text-[#14233F] tracking-tight">
            Student Certificate Registry
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5">
            View verified student records and preview their corresponding academic identity verification certificates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="success" size="md">
            {institutionStudents.filter((s) => s.status === 'Validated').length} Eligible Certificates
          </Badge>
          <span className="text-xs text-[#8A94A0] hidden sm:inline">&bull;</span>
          <span className="text-xs font-mono text-[#14513A] bg-[#EBF3EF] px-2.5 py-1 rounded-full font-bold">
            {currentInstId}
          </span>
        </div>
      </div>

      {/* Summary KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-[#14513A]">
          <span className="text-[10px] font-bold text-[#8A94A0] uppercase tracking-wider block">
            Total Institution Roster
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#14233F]">{institutionStudents.length}</span>
            <span className="text-xs text-[#4B5563]">Enrolled Students</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-[#1E9E5A]">
          <span className="text-[10px] font-bold text-[#8A94A0] uppercase tracking-wider block">
            Certificates Available
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#1E9E5A]">
              {institutionStudents.filter((s) => s.status === 'Validated').length}
            </span>
            <span className="text-xs text-[#1E9E5A] font-semibold">100% APAAR Validated</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-[#D64545]">
          <span className="text-[10px] font-bold text-[#8A94A0] uppercase tracking-wider block">
            Ineligible (Flagged / Pending)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#D64545]">
              {institutionStudents.filter((s) => s.status !== 'Validated').length}
            </span>
            <span className="text-xs text-[#8A94A0]">Requires Resolution</span>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar (Requirement 6) */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8A94A0] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by student, roll no, or APAAR..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border border-[#E3EAE6] rounded-xl text-xs bg-white text-[#14233F] focus:outline-none focus:border-[#14513A]"
            />
          </div>

          {/* Verification Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-[#4B5563] uppercase whitespace-nowrap">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="flex-1 p-2 border border-[#E3EAE6] rounded-xl text-xs bg-white text-[#14233F] focus:outline-none focus:border-[#14513A]"
            >
              <option value="all">All Statuses</option>
              <option value="Validated">Validated (Eligible)</option>
              <option value="Flagged">Flagged (Discrepancy)</option>
              <option value="Pending">Pending Verification</option>
            </select>
          </div>

          {/* Programme Filter */}
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-[#4B5563] uppercase whitespace-nowrap">Prog:</label>
            <select
              value={programmeFilter}
              onChange={(e) => {
                setProgrammeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 p-2 border border-[#E3EAE6] rounded-xl text-xs bg-white text-[#14233F] focus:outline-none focus:border-[#14513A]"
            >
              <option value="all">All Programmes</option>
              {uniqueProgrammes.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Certificate Availability Filter */}
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-[#4B5563] uppercase whitespace-nowrap">Cert:</label>
            <select
              value={availabilityFilter}
              onChange={(e) => {
                setAvailabilityFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="flex-1 p-2 border border-[#E3EAE6] rounded-xl text-xs bg-white text-[#14233F] focus:outline-none focus:border-[#14513A]"
            >
              <option value="all">All Records</option>
              <option value="available">Available / Eligible Only</option>
              <option value="ineligible">Ineligible Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Student Certificate Registry Table (Requirement 6) */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs min-w-[1040px] table-fixed">
            <colgroup>
              <col className="w-[155px]" />
              <col className="w-[125px]" />
              <col className="w-[115px]" />
              <col className="w-[160px]" />
              <col className="w-[85px]" />
              <col className="w-[100px]" />
              <col className="w-[105px]" />
              <col className="w-[255px]" />
            </colgroup>
            <thead className="bg-[#F4F8F6] text-[#8A94A0] uppercase font-bold text-[10px] tracking-wider border-b border-[#E3EAE6]">
              <tr>
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">Student Roll / Reg ID</th>
                <th className="py-3 px-3">APAAR ID</th>
                <th className="py-3 px-3">Programme / Course</th>
                <th className="py-3 px-2">Academic Year</th>
                <th className="py-3 px-2">Verification</th>
                <th className="py-3 px-2 text-left">Certificate</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3EAE6]">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#8A94A0]">
                    <Award className="w-8 h-8 text-[#8A94A0] mx-auto mb-2 opacity-60" />
                    <p className="font-bold text-[#14233F]">No student certificate records found.</p>
                    <p className="text-[11px] text-[#8A94A0] mt-0.5">Try adjusting your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((stu) => {
                  const isEligible = stu.status === 'Validated';

                  return (
                    <tr key={stu.id} className="hover:bg-[#F9FCFA] transition-colors">
                      {/* 1. Student Name */}
                      <td className="py-3 px-3 align-middle">
                        <div className="space-y-0.5">
                          <span className="font-bold text-[#14233F] block truncate" title={stu.name}>
                            {stu.name}
                          </span>
                          <span className="text-[10px] text-[#8A94A0] block font-mono">
                            {stu.id} &bull; {stu.gender}
                          </span>
                        </div>
                      </td>

                      {/* 2. Student Roll ID */}
                      <td className="py-3 px-3 align-middle">
                        <span className="font-mono text-[11px] font-semibold text-[#14233F] bg-gray-50 px-2 py-0.5 rounded border border-[#E3EAE6] block truncate" title={stu.studentId}>
                          {stu.studentId}
                        </span>
                      </td>

                      {/* 3. APAAR ID (Masked for privacy) */}
                      <td className="py-3 px-3 align-middle">
                        <span className="font-mono text-[11px] text-[#14513A] bg-[#EBF3EF] px-2 py-0.5 rounded block truncate">
                          {maskApaar(stu.apaarId)}
                        </span>
                      </td>

                      {/* 4. Programme / Course */}
                      <td className="py-3 px-3 align-middle">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-[#14233F] block truncate" title={stu.programme}>
                            {stu.programme}
                          </span>
                          <span className="text-[10px] text-[#4B5563] block truncate" title={stu.course}>
                            {stu.course}
                          </span>
                        </div>
                      </td>

                      {/* 5. Academic Year */}
                      <td className="py-3 px-2 align-middle">
                        <span className="text-xs text-[#14233F] font-semibold">
                          Year {stu.year}
                        </span>
                      </td>

                      {/* 6. Verification Status */}
                      <td className="py-3 px-2.5 align-middle">
                        {stu.status === 'Validated' && <Badge variant="success">Validated</Badge>}
                        {stu.status === 'Flagged' && <Badge variant="error">Flagged</Badge>}
                        {stu.status === 'Pending' && <Badge variant="neutral">Pending</Badge>}
                      </td>

                      {/* 7. Certificate Status */}
                      <td className="py-3 px-2 align-middle text-left">
                        {isEligible ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1E9E5A] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#D64545] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                            Ineligible
                          </span>
                        )}
                      </td>

                      {/* 8. Actions (Requirement 7: View Record, View Certificate, Download Certificate) */}
                      <td className="py-3 px-3 text-right align-middle">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Record */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDetailStudent(stu)}
                            className="text-xs py-1 px-1.5 text-[#4B5563] hover:text-[#14233F]"
                            title="View student admission profile"
                          >
                            <User className="w-3.5 h-3.5 mr-0.5" />
                            Record
                          </Button>

                          {/* View Certificate */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (isEligible) {
                                setPreviewStudent(stu);
                              } else {
                                setIneligibleModalStudent(stu);
                              }
                            }}
                            className="text-xs py-1 px-2 font-medium whitespace-nowrap border-[#D1DCD6] hover:border-[#14513A]"
                            title={
                              isEligible
                                ? 'Preview certificate'
                                : 'Certificate unavailable for flagged/pending record'
                            }
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-[#14513A]" />
                            View Certificate
                          </Button>

                          {/* Download Certificate */}
                          <Button
                            size="sm"
                            variant={isEligible ? 'primary' : 'ghost'}
                            onClick={() => handleDownloadCertificate(stu)}
                            className={`text-xs py-1 px-2 font-medium whitespace-nowrap ${
                              !isEligible
                                ? 'opacity-80 text-[#8A94A0] border border-[#E3EAE6] hover:bg-rose-50 hover:text-[#D64545]'
                                : ''
                            }`}
                            title={
                              isEligible
                                ? 'Download official certificate PDF'
                                : 'Certificate unavailable - click to view ineligibility notice'
                            }
                          >
                            <Download className="w-3.5 h-3.5 mr-1" />
                            Download
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-[#E3EAE6] bg-[#F4F8F6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#4B5563]">
          <div>
            Showing <strong>{paginatedStudents.length}</strong> of <strong>{filteredStudents.length}</strong> student records
            {statusFilter !== 'all' && ` (filtered by ${statusFilter})`}
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="py-1 px-2.5 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
              Previous
            </Button>
            <span className="px-3 py-1 font-mono font-bold text-[#14513A]">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="py-1 px-2.5 text-xs"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* ================= MODAL 1: STUDENT RECORD DETAIL MODAL (Requirement 7) ================= */}
      {detailStudent && (
        <Modal
          isOpen={!!detailStudent}
          onClose={() => setDetailStudent(null)}
          title={`Student Admission Profile: ${detailStudent.name}`}
          description={`Permanent System ID: ${detailStudent.id} • AICTE Registry Key`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-[#F4F8F6] rounded-xl border border-[#D1DCD6] flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-[#14233F] block">{detailStudent.name}</span>
                <span className="text-[11px] text-[#4B5563] font-mono mt-0.5 block">
                  Roll ID: {detailStudent.studentId} &bull; DOB: {detailStudent.dob} &bull; Gender: {detailStudent.gender}
                </span>
              </div>
              {detailStudent.status === 'Validated' ? (
                <Badge variant="success">Validated</Badge>
              ) : (
                <Badge variant="error">{detailStudent.status}</Badge>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-[#E3EAE6] rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-[#8A94A0] uppercase block">Academic APAAR ID</span>
                <span className="font-mono text-sm font-black text-[#14513A] block">{detailStudent.apaarId}</span>
                <span className="text-[10px] text-[#4B5563]">National Academic Registry 12-Digit Unique Code</span>
              </div>

              <div className="p-3 bg-white border border-[#E3EAE6] rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-[#8A94A0] uppercase block">Institution</span>
                <span className="font-bold text-[#14233F] block truncate">{detailStudent.institutionName}</span>
                <span className="text-[10px] font-mono text-[#8A94A0]">Institution ID: {detailStudent.institutionId}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 bg-gray-50 rounded-lg border border-[#E3EAE6]">
                <span className="text-[10px] text-[#8A94A0] block">Programme</span>
                <span className="font-bold text-[#14233F]">{detailStudent.programme}</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg border border-[#E3EAE6]">
                <span className="text-[10px] text-[#8A94A0] block">Course</span>
                <span className="font-bold text-[#14233F] truncate block">{detailStudent.course}</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg border border-[#E3EAE6]">
                <span className="text-[10px] text-[#8A94A0] block">Academic Year</span>
                <span className="font-bold text-[#14233F]">Year {detailStudent.year}</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg border border-[#E3EAE6]">
                <span className="text-[10px] text-[#8A94A0] block">Quota Type</span>
                <span className="font-bold text-[#14233F]">{detailStudent.quotaType}</span>
              </div>
            </div>

            {/* Demographics & Consent */}
            <div className="p-3 bg-gray-50 rounded-xl border border-[#E3EAE6] space-y-1 text-[11px] text-[#4B5563]">
              <p><strong>Father / Guardian:</strong> {detailStudent.fatherName || 'Parent on Record'}</p>
              <p><strong>Category / Domicile:</strong> {detailStudent.category} &bull; {detailStudent.state}</p>
              <p><strong>Admission Date:</strong> {detailStudent.admissionDate}</p>
              <p className="flex items-center gap-1.5 text-[#14513A] font-semibold pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E9E5A]" />
                DPDP Consent Affirmation on file (Granted on {detailStudent.consentDate || detailStudent.admissionDate})
              </p>
            </div>

            {detailStudent.flagReason && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-[#D64545] space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Active Regulatory Discrepancy Flag
                </span>
                <p className="text-[11px]">{detailStudent.flagReason}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#E3EAE6]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDetailStudent(null);
                  setPreviewStudent(detailStudent);
                }}
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                Preview Certificate
              </Button>

              <Button
                variant="primary"
                size="sm"
                disabled={detailStudent.status !== 'Validated'}
                onClick={() => {
                  handleDownloadCertificate(detailStudent);
                  setDetailStudent(null);
                }}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Download Certificate
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= MODAL 2: DEDICATED STUDENT-SPECIFIC CERTIFICATE PREVIEW (Requirement 8) ================= */}
      {previewStudent && (
        <Modal
          isOpen={!!previewStudent}
          onClose={() => setPreviewStudent(null)}
          title={`Certificate Preview: ${previewStudent.name}`}
          description={`Official AICTE APAAR Academic Verification Credential • Ref: AICTE/APAAR/2026/REG-${previewStudent.id}`}
          maxWidth="4xl"
          contentClassName="p-4 sm:p-6"
        >
          <div className="space-y-6">
            {/* Action Bar for Modal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#F4F8F6] border border-[#D1DCD6] rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#14513A]">Student Target:</span>
                <span className="font-semibold text-[#14233F]">{previewStudent.name}</span>
                <span className="font-mono text-[#8A94A0]">({previewStudent.studentId})</span>
                {previewStudent.status === 'Validated' ? (
                  <Badge variant="success" size="sm">Vault Validated</Badge>
                ) : (
                  <Badge variant="warning" size="sm">Flagged / Unresolved</Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrintCertificate}
                  className="flex items-center gap-1 text-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-[#14513A]" />
                  <span>Print</span>
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  disabled={previewStudent.status !== 'Validated'}
                  onClick={() => handleDownloadCertificate(previewStudent)}
                  className="flex items-center gap-1 text-xs shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Certificate</span>
                </Button>
              </div>
            </div>

            {/* Official Academic Verification Certificate Card */}
            <div className="relative bg-[#FFFDF9] border-8 sm:border-12 border-[#14513A] p-6 sm:p-12 rounded-3xl shadow-xl text-center overflow-hidden">
              {/* Ornate Gold & Emerald Inner Accent Borders */}
              <div className="absolute inset-2 sm:inset-3 border-2 border-[#D1DCD6] rounded-2xl pointer-events-none" />
              <div className="absolute inset-3 sm:inset-5 border border-[#1E9E5A]/30 rounded-xl pointer-events-none" />

              {/* Watermark Crest */}
              <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none">
                <AicteLogo size="xl" />
              </div>

              {/* Top AICTE Authentic Emblem & Government Lockup */}
              <div className="flex flex-col items-center justify-center mb-5">
                <AicteLogo size="lg" showLockup={false} />
                <span className="text-[12px] font-hindi font-bold text-[#14513A] mt-2 tracking-wider">
                  अखिल भारतीय तकनीकी शिक्षा परिषद
                </span>
                <h2 className="text-sm sm:text-base font-bold text-[#14233F] tracking-tight uppercase mt-0.5">
                  All India Council for Technical Education
                </h2>
                <span className="text-[10px] sm:text-[11px] text-[#4B5563]">
                  Ministry of Education, Government of India &bull; New Delhi
                </span>
              </div>

              {/* Certificate Title */}
              <div className="my-4">
                <div className="inline-block bg-[#14513A] text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-xs mb-2">
                  Academic Identity &amp; APAAR Verification Credential
                </div>
                <p className="text-[11px] text-[#8A94A0] uppercase tracking-wider font-mono">
                  Certificate Ref No: AICTE/APAAR/2026/REG-{previewStudent.id}
                </p>
              </div>

              {/* Student Name Presentation */}
              <div className="my-6">
                <p className="text-xs font-serif italic text-[#4B5563]">This is to certify that the academic identity of</p>
                <h3 className="text-2xl sm:text-3xl font-serif font-black text-[#14233F] tracking-wide uppercase mt-1">
                  {previewStudent.name}
                </h3>
                <p className="text-xs text-[#4B5563] mt-1">
                  Son / Daughter of <span className="font-semibold text-[#14233F]">{previewStudent.fatherName || 'Parent on Record'}</span>
                </p>
              </div>

              {/* Institution Authentication Details */}
              <div className="my-4">
                <p className="text-xs text-[#4B5563]">is officially authenticated as an enrolled student in approved standing at</p>
                <h4 className="text-base sm:text-lg font-bold text-[#14513A] uppercase mt-0.5">
                  {previewStudent.institutionName}
                </h4>
                <p className="text-[11px] font-mono text-[#8A94A0]">
                  AICTE Permanent Institution ID: {previewStudent.institutionId}
                </p>
              </div>

              {/* Dual Identifiers Presentation Box */}
              <div className="my-6 max-w-xl mx-auto bg-gradient-to-r from-emerald-50 via-[#EBF3EF] to-emerald-50 p-4 rounded-2xl border-2 border-[#14513A]/30 flex flex-col sm:flex-row items-center justify-around gap-3 shadow-xs">
                <div className="text-center px-4 sm:border-r border-[#D1DCD6] w-full sm:w-1/2">
                  <span className="text-[10px] font-bold text-[#14513A] uppercase tracking-wider block">
                    NATIONAL 12-DIGIT APAAR ID
                  </span>
                  <span className="font-mono text-base sm:text-lg font-black text-[#0E3B2A] tracking-wider block mt-0.5">
                    {previewStudent.apaarId}
                  </span>
                </div>
                <div className="text-center px-4 w-full sm:w-1/2">
                  <span className="text-[10px] font-bold text-[#14233F] uppercase tracking-wider block">
                    INSTITUTIONAL ROLL / REG. ID
                  </span>
                  <span className="font-mono text-base sm:text-lg font-black text-[#14233F] tracking-wider block mt-0.5">
                    {previewStudent.studentId}
                  </span>
                </div>
              </div>

              {/* Programme & Academic Standing */}
              <div className="text-xs text-[#4B5563] leading-relaxed max-w-2xl mx-auto space-y-1 mb-6">
                <p>
                  Enrolled in the approved programme <strong className="text-[#14233F]">{previewStudent.programme}</strong> in{' '}
                  <strong className="text-[#14233F]">{previewStudent.course}</strong> (Academic Standing: Year {previewStudent.year}).
                </p>
                <p className="text-[11px]">
                  Admission Category: <strong className="text-[#14233F]">{previewStudent.quotaType} Quota</strong> &bull; Date of Admission: <strong className="text-[#14233F]">{previewStudent.admissionDate}</strong>
                </p>
              </div>

              {/* Vault Certified Stamp & QR Code Footer */}
              <div className="pt-6 border-t-2 border-[#D1DCD6] flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* QR Code Verification */}
                <div className="flex items-center gap-3 text-left">
                  <div className="p-2 bg-white rounded-xl border border-[#D1DCD6] shadow-xs flex-shrink-0">
                    <QrCode className="w-12 h-12 text-[#14513A]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#14513A] uppercase tracking-wider block">
                      Tamper-Proof Verification
                    </span>
                    <span className="text-[10px] text-[#4B5563] font-mono block">
                      advait.aicte-india.org/verify
                    </span>
                    <span className="text-[9px] text-[#8A94A0] block">
                      Scan code for instant DigiLocker / NAD integrity
                    </span>
                  </div>
                </div>

                {/* Central Vault Certified Seal */}
                <div className="text-center sm:text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EBF3EF] border border-[#1E9E5A] rounded-full text-[11px] font-bold text-[#14513A]">
                    <ShieldCheck className="w-4 h-4 text-[#1E9E5A]" />
                    <span>AICTE CENTRAL REPOSITORY VERIFIED</span>
                  </div>
                  <p className="text-[10px] text-[#8A94A0] font-mono mt-1">
                    Signatory: Approval Bureau &bull; Ministry of Education
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= MODAL 3: INELIGIBLE CERTIFICATE EXPLANATION MODAL (Requirement 7) ================= */}
      {ineligibleModalStudent && (
        <Modal
          isOpen={!!ineligibleModalStudent}
          onClose={() => setIneligibleModalStudent(null)}
          title="Certificate Download Ineligible"
          description={`Student Record: ${ineligibleModalStudent.name} (${ineligibleModalStudent.studentId})`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#D64545] flex-shrink-0" />
                <span className="font-bold text-sm">Regulatory Flag Unresolved</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                In compliance with AICTE Statutory Regulations, academic verification credentials cannot be issued for records with active compliance flags or pending verification.
              </p>
              {ineligibleModalStudent.flagReason && (
                <div className="p-2 bg-white rounded-lg border border-rose-200 font-mono text-[10px] text-rose-800">
                  <strong>Discrepancy Note:</strong> {ineligibleModalStudent.flagReason}
                </div>
              )}
            </div>

            <p className="text-[#4B5563]">
              To clear this student record, navigate to the <strong>Compliance &amp; Resolution Center</strong> and submit the mandated institutional clarification and authenticated evidence.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIneligibleModalStudent(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
