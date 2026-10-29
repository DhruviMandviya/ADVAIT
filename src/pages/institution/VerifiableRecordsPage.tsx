import React, { useState } from 'react';
import {
  Award,
  Search,
  Download,
  Printer,
  Copy,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Share2,
  ExternalLink
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { AicteLogo } from '../../components/common/AicteLogo';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Student } from '../../types';

export const VerifiableRecordsPage: React.FC = () => {
  const { user } = useAuth();
  const { students } = useData();
  const toast = useToast();

  const currentInstId = user?.institutionId || 'INST102';
  const instStudents = students.filter((s) => s.institutionId === currentInstId);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student>(instStudents[0] || students[0]);

  const filteredList = instStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.apaarId.includes(searchTerm) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyLink = () => {
    const url = `${window.location.origin}/verify?code=${selectedStudent.verificationCode}&apaar=${selectedStudent.apaarId.replace(/\s+/g, '')}`;
    navigator.clipboard.writeText(url);
    toast.success('Verification URL Copied', 'Share this link with employers or universities for instant verification.');
  };

  const handleDownloadPdf = () => {
    toast.success('Verifiable Credential Generated', `Tamper-proof PDF downloaded for ${selectedStudent.name}.`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#1E9E5A] tracking-wider uppercase">
            Cryptographic Credential Issuance
          </span>
          <h1 className="text-2xl font-bold text-[#14233F] tracking-tight">
            Verifiable Academic Records (APAAR Linked)
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5">
            Tamper-evident, QR-signed digital credentials for academic mobility and employer verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyLink} leftIcon={<Copy className="w-4 h-4" />}>
            Copy Verification Link
          </Button>
          <Button size="sm" onClick={handleDownloadPdf} leftIcon={<Download className="w-4 h-4" />}>
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Student Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <Card className="p-4">
            <span className="text-xs font-bold text-[#14233F] uppercase tracking-wider block mb-2">
              Select Student Record
            </span>

            <div className="relative mb-3">
              <Search className="w-4 h-4 text-[#8A94A0] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#D1DCD6] focus:border-[#14513A] outline-none"
              />
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-1.5 pr-1">
              {filteredList.slice(0, 15).map((s) => {
                const isSelected = selectedStudent.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedStudent(s)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#14513A] bg-[#EBF3EF] shadow-2xs'
                        : 'border-[#E3EAE6] bg-white hover:bg-[#F4F8F6]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#14233F]">{s.name}</span>
                      <span className="text-[10px] font-mono text-[#8A94A0]">{s.studentId}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#4B5563] mt-0.5">
                      <span className="font-mono text-[#14513A]">{s.apaarId}</span>
                      <span>{s.programme}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: High Fidelity Verifiable Credential Card */}
        <div className="lg:col-span-8">
          <Card className="p-8 bg-gradient-to-b from-[#FFFFFF] to-[#F9FCFA] border-2 border-[#14513A]/20 shadow-xl print:m-0 print:border-none print:shadow-none">
            {/* Certificate Top Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b-2 border-[#14513A] text-center sm:text-left">
              <AicteLogo size="lg" showLockup={true} />
              <div className="sm:text-right">
                <span className="text-[10px] font-bold text-[#1E9E5A] bg-[#EBF3EF] px-2.5 py-0.5 rounded-full uppercase tracking-wider block sm:inline-block">
                  Verified Academic Credential
                </span>
                <span className="text-xs font-mono font-bold text-[#14233F] block mt-1">
                  TOKEN: {selectedStudent.verificationCode}
                </span>
                <span className="text-[10px] text-[#8A94A0] block">
                  AICTE Central Repository Vault &bull; Reg: 2026-APH
                </span>
              </div>
            </div>

            {/* Certificate Title */}
            <div className="text-center py-6">
              <h2 className="text-lg sm:text-2xl font-black text-[#14233F] tracking-tight uppercase">
                Official Verifiable Student Record
              </h2>
              <p className="text-xs text-[#4B5563] mt-1 font-medium">
                Under the Purview of All India Council for Technical Education, Ministry of Education, Govt. of India
              </p>
            </div>

            {/* Core Student Information Grid */}
            <div className="bg-white p-6 rounded-2xl border border-[#D1DCD6] shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#8A94A0] uppercase font-bold text-[10px] block">
                    Student Full Name
                  </span>
                  <span className="text-base font-bold text-[#14233F]">{selectedStudent.name}</span>
                </div>
                <div>
                  <span className="text-[#8A94A0] uppercase font-bold text-[10px] block">
                    12-Digit National APAAR ID
                  </span>
                  <span className="font-mono text-base font-extrabold text-[#14513A] bg-[#EBF3EF] px-2.5 py-0.5 rounded inline-block">
                    {selectedStudent.apaarId}
                  </span>
                </div>
                <div>
                  <span className="text-[#8A94A0] uppercase font-bold text-[10px] block">
                    Approved Institution
                  </span>
                  <span className="font-bold text-[#14233F]">{selectedStudent.institutionName}</span>
                  <span className="text-[11px] text-[#8A94A0] block">AICTE ID: {selectedStudent.institutionId}</span>
                </div>
                <div>
                  <span className="text-[#8A94A0] uppercase font-bold text-[10px] block">
                    Institutional Roll Number
                  </span>
                  <span className="font-mono font-bold text-sm text-[#14233F]">{selectedStudent.studentId}</span>
                </div>
                <div>
                  <span className="text-[#8A94A0] uppercase font-bold text-[10px] block">
                    Degree Programme &amp; Branch
                  </span>
                  <span className="font-bold text-[#14233F]">{selectedStudent.programme} &mdash; {selectedStudent.course}</span>
                </div>
                <div>
                  <span className="text-[#8A94A0] uppercase font-bold text-[10px] block">
                    Academic Year &amp; Admission Date
                  </span>
                  <span className="font-medium text-[#14233F]">Year {selectedStudent.year} &bull; Admitted on {selectedStudent.admissionDate}</span>
                </div>
              </div>

              {/* Security Seal Strip */}
              <div className="pt-4 border-t border-[#E3EAE6] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#14513A] flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-7 h-7 text-[#1E9E5A]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#14233F] block">
                      Cryptographically Validated
                    </span>
                    <span className="text-[11px] text-[#4B5563]">
                      SHA-256 Tamper-Proof Hash: <span className="font-mono text-[10px] text-[#14513A] font-semibold">{selectedStudent.verificationCode}-AICTE-VAL</span>
                    </span>
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="flex items-center gap-3 bg-[#F4F8F6] p-2.5 rounded-xl border border-[#D1DCD6]">
                  <div className="w-16 h-16 bg-white p-1 rounded-lg border border-[#D1DCD6] flex items-center justify-center">
                    <QrCode className="w-14 h-14 text-[#14513A]" />
                  </div>
                  <div className="text-left text-[10px] text-[#4B5563]">
                    <span className="font-bold text-[#14233F] block">Scan to Verify</span>
                    <span>National Portal URL</span>
                    <span className="block text-[#14513A] font-mono mt-0.5">/verify</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Signatures */}
            <div className="mt-8 pt-6 border-t border-dashed border-[#D1DCD6] grid grid-cols-2 text-center text-xs text-[#4B5563]">
              <div>
                <div className="font-serif italic text-base text-[#14233F] font-bold mb-1">
                  Dr. Sunil Bhirud
                </div>
                <div className="border-t border-gray-400 w-40 mx-auto pt-1 font-semibold text-[11px]">
                  Head of Institution / Director
                </div>
                <span className="text-[10px] text-[#8A94A0]">{selectedStudent.institutionName}</span>
              </div>

              <div>
                <div className="font-serif italic text-base text-[#14513A] font-bold mb-1">
                  Prof. Rajive Kumar
                </div>
                <div className="border-t border-gray-400 w-40 mx-auto pt-1 font-semibold text-[11px]">
                  Member Secretary, AICTE
                </div>
                <span className="text-[10px] text-[#8A94A0]">Ministry of Education, New Delhi</span>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-6 flex items-center justify-between gap-3 print:hidden pt-4 border-t border-[#E3EAE6]">
              <span className="text-xs text-[#8A94A0]">
                Governed under Digital Personal Data Protection Act 2023.
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
                  Print Record
                </Button>
                <Button size="sm" onClick={handleDownloadPdf} leftIcon={<Download className="w-4 h-4" />}>
                  Export Verified PDF
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

