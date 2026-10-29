import React, { useState } from 'react';
import { Search, Database, User, Building2, CheckCircle2, ShieldCheck, Download, Filter } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Student } from '../../types';

export const CentralRepository: React.FC = () => {
  const { students } = useData();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [programmeFilter, setProgrammeFilter] = useState('all');

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.apaarId.includes(searchTerm) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.institutionName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProg = programmeFilter === 'all' || s.programme === programmeFilter;
    return matchesSearch && matchesProg;
  });

  const handleExportAll = () => {
    const headers = 'ID,Name,APAAR ID,Student ID,Institution,Programme,Course,Year,Status,Admission Date\n';
    const rows = filtered
      .slice(0, 500)
      .map(
        (s) =>
          `"${s.id}","${s.name}","${s.apaarId}","${s.studentId}","${s.institutionName}","${s.programme}","${s.course}",${s.year},"${s.status}","${s.admissionDate}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AICTE_Central_Repository_Master_Export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Repository Export Complete', `Exported ${filtered.length} master student records.`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#1E9E5A] tracking-wider uppercase flex items-center gap-1.5">
            <Database className="w-4 h-4" />
            <span>National Academic Identity Vault</span>
          </span>
          <h1 className="text-2xl font-bold text-[#14233F] tracking-tight">
            AICTE Central Student Repository
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5">
            Single Source of Truth across all AICTE-approved institutions in India keyed by 12-digit APAAR ID.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportAll} leftIcon={<Download className="w-4 h-4 text-[#14513A]" />}>
          Export Master Repository ({filtered.length})
        </Button>
      </div>

      {/* Global Search Bar */}
      <Card className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-3 relative">
            <Search className="w-4 h-4 text-[#8A94A0] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search across India by 12-Digit APAAR ID, Student Name, Roll No., or Institution..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D1DCD6] focus:border-[#14513A] outline-none font-medium"
            />
          </div>

          <div>
            <select
              value={programmeFilter}
              onChange={(e) => setProgrammeFilter(e.target.value)}
              className="w-full text-xs sm:text-sm border border-[#D1DCD6] rounded-xl px-3.5 py-2.5 bg-white outline-none"
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
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F8F6] text-[#8A94A0] uppercase font-bold text-[10px] border-b border-[#E3EAE6]">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-3">12-Digit APAAR ID</th>
                <th className="py-3 px-3">Institution</th>
                <th className="py-3 px-3">Programme</th>
                <th className="py-3 px-3">Quota</th>
                <th className="py-3 px-3">Verification Status</th>
                <th className="py-3 px-4 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3EAE6] font-medium text-[#4B5563]">
              {filtered.slice(0, 30).map((s) => (
                <tr key={s.id} className="hover:bg-[#F4F8F6] transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#14233F] block">{s.name}</span>
                    <span className="text-[10px] text-[#8A94A0] font-mono">{s.studentId}</span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[#14513A]">{s.apaarId}</td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-[#14233F] block truncate max-w-[200px]">
                      {s.institutionName}
                    </span>
                    <span className="text-[10px] text-[#8A94A0] font-mono">{s.institutionId} &bull; {s.state}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-[#14233F]">{s.programme}</span>
                    <span className="text-[10px] text-[#8A94A0] block truncate max-w-[140px]">{s.course}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF3EF] text-[#14513A]">
                      {s.quotaType}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={s.status === 'Validated' ? 'success' : 'error'} size="sm" dot>
                      {s.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedStudent(s)}
                      className="text-xs text-[#14513A] hover:underline font-bold cursor-pointer"
                    >
                      View Dossier &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dossier Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title="National Master Academic Record"
          description={`APAAR Identifier: ${selectedStudent.apaarId}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs text-[#4B5563]">
            <div className="p-3.5 bg-[#EBF3EF] rounded-xl border border-[#D1DCD6] flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#14233F]">{selectedStudent.name}</h4>
                <p className="text-[11px] text-[#14513A] font-semibold">{selectedStudent.institutionName}</p>
              </div>
              <Badge variant={selectedStudent.status === 'Validated' ? 'success' : 'error'}>
                {selectedStudent.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#8A94A0] block">APAAR ID</span>
                <span className="font-mono font-bold text-[#14513A] text-sm">{selectedStudent.apaarId}</span>
              </div>
              <div>
                <span className="text-[#8A94A0] block">Institutional Roll ID</span>
                <span className="font-mono font-bold text-[#14233F] text-sm">{selectedStudent.studentId}</span>
              </div>
              <div>
                <span className="text-[#8A94A0] block">Degree Programme</span>
                <span className="font-bold text-[#14233F]">{selectedStudent.programme} - {selectedStudent.course}</span>
              </div>
              <div>
                <span className="text-[#8A94A0] block">Quota &amp; Year</span>
                <span className="font-bold text-[#14513A]">{selectedStudent.quotaType} &bull; Year {selectedStudent.year}</span>
              </div>
              <div>
                <span className="text-[#8A94A0] block">DOB &amp; Gender</span>
                <span>{selectedStudent.dob} &bull; {selectedStudent.gender}</span>
              </div>
              <div>
                <span className="text-[#8A94A0] block">State Domicile</span>
                <span>{selectedStudent.state}</span>
              </div>
            </div>

            <div className="p-3 bg-[#F4F8F6] rounded-xl border border-[#E3EAE6] flex items-center justify-between">
              <span className="text-[10px] text-[#8A94A0]">Cryptographic Hash</span>
              <span className="font-mono text-xs font-bold text-[#14233F]">{selectedStudent.verificationCode}</span>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setSelectedStudent(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

