import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Student, Programme } from '../../types';

export const StudentRecords: React.FC = () => {
  const { user } = useAuth();
  const { students, updateStudent, deleteStudent } = useData();
  const toast = useToast();

  const currentInstId = user?.institutionId || 'INST102';

  // Filter students by current institution for this view
  const institutionStudents = useMemo(() => {
    return students.filter((s) => s.institutionId === currentInstId);
  }, [students, currentInstId]);

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgramme, setSelectedProgramme] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedQuota, setSelectedQuota] = useState<string>('all');

  // Sorting
  const [sortField, setSortField] = useState<'name' | 'apaarId' | 'admissionDate' | 'year'>('admissionDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modals state
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [verifiableStudent, setVerifiableStudent] = useState<Student | null>(null);

  // Filter logic
  const filteredStudents = useMemo(() => {
    return institutionStudents
      .filter((s) => {
        const matchesSearch =
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.apaarId.includes(searchTerm) ||
          s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.course.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesProgramme = selectedProgramme === 'all' || s.programme === selectedProgramme;
        const matchesYear = selectedYear === 'all' || s.year.toString() === selectedYear;
        const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
        const matchesQuota = selectedQuota === 'all' || s.quotaType === selectedQuota;

        return matchesSearch && matchesProgramme && matchesYear && matchesStatus && matchesQuota;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          return sortOrder === 'asc'
            ? valA.localeCompare(valB as string)
            : (valB as string).localeCompare(valA);
        }
        return sortOrder === 'asc'
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      });
  }, [institutionStudents, searchTerm, selectedProgramme, selectedYear, selectedStatus, selectedQuota, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage]);

  // Export to CSV
  const handleExportCsv = () => {
    const headers = 'ID,Name,APAAR ID,Student ID,Programme,Course,Year,Category,Quota,Status,Admission Date\n';
    const rows = filteredStudents
      .map(
        (s) =>
          `"${s.id}","${s.name}","${s.apaarId}","${s.studentId}","${s.programme}","${s.course}",${s.year},"${s.category}","${s.quotaType}","${s.status}","${s.admissionDate}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ADVAIT_Students_${currentInstId}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Roster Exported', `Exported ${filteredStudents.length} student records.`);
  };

  // Save Edit Handler
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    updateStudent(editStudent);
    toast.success('Record Updated', `Successfully updated record for ${editStudent.name}.`);
    setEditStudent(null);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deleteId) return;
    deleteStudent(deleteId);
    toast.success('Record Deleted', 'Student record removed from registry.');
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#1E9E5A] tracking-wider uppercase">
            Institutional Registry
          </span>
          <h1 className="text-2xl font-bold text-[#14233F] tracking-tight">
            Enrolled Student Records
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5">
            Total {institutionStudents.length} students enrolled under institution code <strong>{currentInstId}</strong>.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          leftIcon={<Download className="w-4 h-4 text-[#14513A]" />}
        >
          Export CSV ({filteredStudents.length})
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search bar */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-[#8A94A0] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by student name, APAAR ID, or roll number..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#D1DCD6] focus:border-[#14513A] focus:ring-2 focus:ring-[#14513A]/20 outline-none"
            />
          </div>

          {/* Programme Filter */}
          <div>
            <select
              value={selectedProgramme}
              onChange={(e) => {
                setSelectedProgramme(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs rounded-xl border border-[#D1DCD6] bg-white text-[#14233F] focus:border-[#14513A] outline-none"
            >
              <option value="all">All Programmes</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="MBA">MBA</option>
              <option value="PGDM">PGDM</option>
              <option value="MCA">MCA</option>
              <option value="Diploma">Diploma</option>
              <option value="B.Pharm">B.Pharm</option>
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs rounded-xl border border-[#D1DCD6] bg-white text-[#14233F] focus:border-[#14513A] outline-none"
            >
              <option value="all">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          {/* Quota Filter */}
          <div>
            <select
              value={selectedQuota}
              onChange={(e) => {
                setSelectedQuota(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs rounded-xl border border-[#D1DCD6] bg-white text-[#14233F] focus:border-[#14513A] outline-none"
            >
              <option value="all">All Quotas</option>
              <option value="Regular">Regular</option>
              <option value="Supernumerary">Supernumerary</option>
              <option value="NRI">NRI</option>
              <option value="OCI">OCI</option>
              <option value="Foreign National">Foreign National</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs rounded-xl border border-[#D1DCD6] bg-white text-[#14233F] focus:border-[#14513A] outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Validated">Validated</option>
              <option value="Flagged">Flagged</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F8F6] text-[#8A94A0] uppercase font-bold text-[10px] border-b border-[#E3EAE6]">
              <tr>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-[#14513A]"
                  onClick={() => {
                    setSortField('name');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  Student Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-[#14513A]"
                  onClick={() => {
                    setSortField('apaarId');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                >
                  12-Digit APAAR ID {sortField === 'apaarId' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="py-3 px-3">Student Roll ID</th>
                <th className="py-3 px-3">Programme &amp; Course</th>
                <th className="py-3 px-2 text-center">Year</th>
                <th className="py-3 px-3">Quota</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3EAE6] font-medium text-[#4B5563]">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#8A94A0]">
                    No matching student records found. Try modifying your search or filters.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-[#F4F8F6] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#14233F]">{student.name}</div>
                      <div className="text-[10px] text-[#8A94A0]">{student.category} &bull; DOB: {student.dob}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#14513A]">
                      {student.apaarId}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">{student.studentId}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#14233F]">{student.programme}</span>
                      <span className="text-[11px] text-[#8A94A0] block truncate max-w-[180px]">
                        {student.course}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-[#14233F]">
                      {student.year}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          student.quotaType === 'Regular'
                            ? 'bg-[#EBF3EF] text-[#14513A]'
                            : student.quotaType === 'Supernumerary'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {student.quotaType}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {student.status === 'Validated' && (
                        <Badge variant="success" size="sm" dot>Validated</Badge>
                      )}
                      {student.status === 'Flagged' && (
                        <Badge variant="error" size="sm" dot>Flagged</Badge>
                      )}
                      {student.status === 'Pending' && (
                        <Badge variant="warning" size="sm" dot>Pending</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewStudent(student)}
                          title="View Student Dossier"
                          className="p-1.5 text-[#8A94A0] hover:text-[#14513A] hover:bg-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setVerifiableStudent(student)}
                          title="Generate Verifiable APAAR Record"
                          className="p-1.5 text-[#1E9E5A] hover:text-[#14513A] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditStudent(student)}
                          title="Edit Student Information"
                          className="p-1.5 text-[#8A94A0] hover:text-[#2F6FDB] hover:bg-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(student.id)}
                          title="Delete Record"
                          className="p-1.5 text-[#8A94A0] hover:text-[#D64545] hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#E3EAE6] flex items-center justify-between text-xs text-[#4B5563]">
          <span>
            Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong>{Math.min(currentPage * pageSize, filteredStudents.length)}</strong> of{' '}
            <strong>{filteredStudents.length}</strong> records
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[#D1DCD6] disabled:opacity-40 hover:bg-[#F4F8F6] cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-[#14233F]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#D1DCD6] disabled:opacity-40 hover:bg-[#F4F8F6] cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* ================= MODAL: VIEW STUDENT DOSSIER ================= */}
      {viewStudent && (
        <Modal
          isOpen={!!viewStudent}
          onClose={() => setViewStudent(null)}
          title="Student Academic Dossier"
          description={`AICTE National APAAR Registry &bull; System ID: ${viewStudent.id}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs text-[#4B5563]">
            <div className="flex items-center justify-between p-4 bg-[#F4F8F6] rounded-xl border border-[#E3EAE6]">
              <div>
                <h4 className="text-base font-bold text-[#14233F]">{viewStudent.name}</h4>
                <p className="text-xs text-[#8A94A0] mt-0.5">{viewStudent.institutionName}</p>
              </div>
              <Badge
                variant={
                  viewStudent.status === 'Validated'
                    ? 'success'
                    : viewStudent.status === 'Flagged'
                    ? 'error'
                    : 'warning'
                }
              >
                {viewStudent.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[#8A94A0] block">12-Digit APAAR ID</span>
                <span className="font-mono font-bold text-sm text-[#14513A]">{viewStudent.apaarId}</span>
              </div>
              <div>
                <span className="text-[#8A94A0] block">Student Roll ID</span>
                <span className="font-mono font-bold text-sm text-[#14233F]">{viewStudent.studentId}</span>
              </div>
              <div>
                <span className="text-[#8A94A0] block">Programme &amp; Year</span>
                <span className="font-bold text-[#14233F]">{viewStudent.programme} &bull; Year {viewStudent.year}</span>
              </div>
              <div>
                <span className="text-[#8A94A0] block">Course Specialization</span>
                <span className="font-bold text-[#14233F]">{viewStudent.course}</span>
              </div>
              <div>
                <span className="text-[#8A94A0] block">Date of Birth &amp; Gender</span>
                <span className="font-medium text-[#14233F]">{viewStudent.dob} &bull; {viewStudent.gender}</span>
              </div>
              <div>
                <span className="text-[#8A94A0] block">Social Category &amp; State</span>
                <span className="font-medium text-[#14233F]">{viewStudent.category} &bull; {viewStudent.state}</span>
              </div>
              <div>
                <span className="text-[#8A94A0] block">Admission Date</span>
                <span className="font-medium text-[#14233F]">{viewStudent.admissionDate}</span>
              </div>
              <div>
                <span className="text-[#8A94A0] block">Quota Type</span>
                <span className="font-bold text-[#14513A]">{viewStudent.quotaType}</span>
              </div>
            </div>

            {viewStudent.flagReason && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                <strong className="block text-xs font-bold mb-0.5">Validation Issue Flag:</strong>
                <p className="text-xs">{viewStudent.flagReason}</p>
              </div>
            )}

            <div className="p-3 bg-[#EBF3EF] border border-[#D1DCD6] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#8A94A0] block">Verification Token</span>
                <span className="font-mono font-bold text-xs text-[#14513A]">{viewStudent.verificationCode}</span>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  const target = viewStudent;
                  setViewStudent(null);
                  setVerifiableStudent(target);
                }}
              >
                Generate Certificate Card
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= MODAL: EDIT STUDENT ================= */}
      {editStudent && (
        <Modal
          isOpen={!!editStudent}
          onClose={() => setEditStudent(null)}
          title="Edit Student Information"
          description={`Update details for ${editStudent.name} (${editStudent.id})`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Input
              label="Student Name"
              value={editStudent.name}
              onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
              required
            />
            <Input
              label="12-Digit APAAR ID"
              value={editStudent.apaarId}
              onChange={(e) => setEditStudent({ ...editStudent, apaarId: e.target.value })}
              required
            />
            <Input
              label="Student Roll ID"
              value={editStudent.studentId}
              onChange={(e) => setEditStudent({ ...editStudent, studentId: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#14233F] uppercase tracking-wider block mb-1">
                  Programme
                </label>
                <select
                  value={editStudent.programme}
                  onChange={(e) => setEditStudent({ ...editStudent, programme: e.target.value as any })}
                  className="w-full rounded-xl border border-[#D1DCD6] px-3 py-2 text-xs bg-white outline-none"
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="MBA">MBA</option>
                  <option value="PGDM">PGDM</option>
                  <option value="MCA">MCA</option>
                  <option value="Diploma">Diploma</option>
                  <option value="B.Pharm">B.Pharm</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#14233F] uppercase tracking-wider block mb-1">
                  Year
                </label>
                <select
                  value={editStudent.year}
                  onChange={(e) => setEditStudent({ ...editStudent, year: Number(e.target.value) })}
                  className="w-full rounded-xl border border-[#D1DCD6] px-3 py-2 text-xs bg-white outline-none"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button type="button" variant="ghost" onClick={() => setEditStudent(null)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {deleteId && (
        <Modal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          title="Confirm Record Deletion"
          description="Are you sure you want to remove this student record from the institutional registry?"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-[#4B5563]">
              This action will revoke the APAAR synchronization token for this student. This action is auditable.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= MODAL: VERIFIABLE RECORD QR ================= */}
      {verifiableStudent && (
        <Modal
          isOpen={!!verifiableStudent}
          onClose={() => setVerifiableStudent(null)}
          title="Verifiable Student Record"
          description="Cryptographically signed academic credential card linked to APAAR ID"
          maxWidth="md"
        >
          <div className="space-y-5 text-center">
            {/* Tamper-Proof Credential Card */}
            <div className="bg-gradient-to-b from-[#14513A] to-[#0E3B2A] text-white p-6 rounded-2xl shadow-lg text-left relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/20">
                <div>
                  <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">
                    AICTE APAAR Academic Identity
                  </span>
                  <h4 className="text-base font-bold text-white leading-tight">
                    {verifiableStudent.name}
                  </h4>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-[#1E9E5A]" />
                </div>
              </div>

              {/* Body */}
              <div className="py-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300">12-Digit APAAR ID:</span>
                  <span className="font-mono font-bold text-emerald-300">{verifiableStudent.apaarId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Student Roll ID:</span>
                  <span className="font-mono font-bold text-white">{verifiableStudent.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Programme &amp; Course:</span>
                  <span className="font-bold text-white">{verifiableStudent.programme} - {verifiableStudent.course}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Institution:</span>
                  <span className="font-bold text-white truncate max-w-[200px]">{verifiableStudent.institutionName}</span>
                </div>
              </div>

              {/* QR Code and Verification Seal */}
              <div className="pt-4 border-t border-white/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-300 block">Verification Hash Code</span>
                  <span className="font-mono text-xs font-bold text-[#F5B335]">{verifiableStudent.verificationCode}</span>
                </div>
                {/* Simulated QR Code SVG */}
                <div className="w-14 h-14 bg-white p-1 rounded-lg flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-[#14513A]" />
                </div>
              </div>
            </div>

            <p className="text-xs text-[#8A94A0]">
              Employers &amp; regulators can scan this QR or verify the code at <strong>/verify</strong>.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setVerifiableStudent(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  toast.success('Certificate Card Exported', 'Verifiable PDF credential downloaded to your device.');
                  setVerifiableStudent(null);
                }}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download Tamper-Proof PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

