import React, { useState } from 'react';
import { Shield, Lock, CheckCircle2, XCircle, Search, ToggleLeft, ToggleRight, FileText } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export const ConsentPrivacy: React.FC = () => {
  const { consentRecords, toggleConsent } = useData();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = consentRecords.filter((c) => {
    const matchesSearch =
      c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.apaarId.includes(searchTerm) ||
      c.studentId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleToggle = (studentId: string, currentStatus: string) => {
    toggleConsent(studentId);
    toast.info(
      'Consent Status Updated',
      `Student ${studentId} APAAR consent is now ${currentStatus === 'Granted' ? 'Revoked' : 'Granted'}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <span className="text-xs font-bold text-[#1E9E5A] tracking-wider uppercase">
          Privacy &amp; Regulatory Compliance
        </span>
        <h1 className="text-2xl font-bold text-[#14233F] tracking-tight">
          Student Consent Management (DPDP Act 2023)
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5">
          Auditable logs of explicit student consent authorizing APAAR identity registration and background verification.
        </p>
      </div>

      {/* Compliance Overview Banner */}
      <Card className="p-5 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-emerald-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#14513A] flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-[#1E9E5A]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#14233F]">
                Digital Personal Data Protection (DPDP) Act Compliance: Active
              </h3>
              <p className="text-xs text-[#4B5563] mt-0.5">
                Every APAAR query requires affirmative user consent. Students maintain the statutory right to withdraw data sharing.
              </p>
            </div>
          </div>
          <Badge variant="success">Fully Compliant</Badge>
        </div>
      </Card>

      {/* Search and Filters */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8A94A0] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by student name or APAAR ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#D1DCD6] outline-none focus:border-[#14513A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#8A94A0]">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-[#D1DCD6] rounded-xl px-3 py-1.5 bg-white outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Granted">Granted</option>
            <option value="Revoked">Revoked</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </Card>

      {/* Consent Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F8F6] text-[#8A94A0] uppercase font-bold text-[10px] border-b border-[#E3EAE6]">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-3">12-Digit APAAR ID</th>
                <th className="py-3 px-3">Student Roll ID</th>
                <th className="py-3 px-3 text-center">Academic Repo</th>
                <th className="py-3 px-3 text-center">Employer Sharing</th>
                <th className="py-3 px-3 text-center">Regulatory Audit</th>
                <th className="py-3 px-3">Consent Status</th>
                <th className="py-3 px-4 text-right">Toggle State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3EAE6] font-medium text-[#4B5563]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#F4F8F6] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#14233F]">{item.studentName}</td>
                  <td className="py-3 px-3 font-mono font-semibold text-[#14513A]">{item.apaarId}</td>
                  <td className="py-3 px-3 font-mono">{item.studentId}</td>
                  <td className="py-3 px-3 text-center">
                    {item.academicPurpose ? (
                      <CheckCircle2 className="w-4 h-4 text-[#1E9E5A] inline" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#D64545] inline" />
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {item.employerSharing ? (
                      <CheckCircle2 className="w-4 h-4 text-[#1E9E5A] inline" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#D64545] inline" />
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {item.regulatoryVerification ? (
                      <CheckCircle2 className="w-4 h-4 text-[#1E9E5A] inline" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#D64545] inline" />
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        item.status === 'Granted'
                          ? 'success'
                          : item.status === 'Revoked'
                          ? 'error'
                          : 'warning'
                      }
                      size="sm"
                      dot
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggle(item.studentId, item.status)}
                      className="text-xs text-[#14513A] hover:text-[#0E3B2A] font-semibold underline cursor-pointer"
                    >
                      {item.status === 'Granted' ? 'Revoke Consent' : 'Grant Consent'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

