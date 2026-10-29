import React, { useState } from 'react';
import { History, ShieldCheck, Download, Search, Filter, Lock, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export const AuditTrail: React.FC = () => {
  const { auditLogs } = useData();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleExportAudit = () => {
    const headers = 'ID,Timestamp,Actor,Role,Action,Target,IP Address,SHA-256 Hash\n';
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.actor}","${l.role}","${l.action}","${l.target}","${l.ipAddress}","${l.hash}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AICTE_Tamper_Evident_Audit_Ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit Log Exported', 'Exported immutable security logs.');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#1E9E5A] tracking-wider uppercase flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Immutable Regulatory Ledger</span>
          </span>
          <h1 className="text-2xl font-bold text-[#14233F] tracking-tight">
            Security &amp; Compliance Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5">
            Cryptographically sealed event ledger capturing all student enrolments, validation overrides, and notice issuances.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportAudit} leftIcon={<Download className="w-4 h-4 text-[#14513A]" />}>
          Export Audit Trail ({filteredLogs.length})
        </Button>
      </div>

      {/* Ledger Security Banner */}
      <Card className="p-4 bg-slate-900 text-white rounded-2xl border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#1E9E5A]">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-300">WORM Storage Emulation</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                  Write Once, Read Many
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Each event block is secured by a SHA-256 integrity digest linking actor, role, and action timestamp.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">Ledger Height: {auditLogs.length} Blocks</span>
        </div>
      </Card>

      {/* Filters Toolbar */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8A94A0] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by actor, action, or IP address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#D1DCD6] outline-none focus:border-[#14513A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#8A94A0]">Action Type:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs border border-[#D1DCD6] rounded-xl px-3 py-1.5 bg-white outline-none"
          >
            <option value="all">All Actions</option>
            <option value="BATCH_STUDENT_UPLOAD">BATCH_STUDENT_UPLOAD</option>
            <option value="SHOW_CAUSE_NOTICE_ISSUED">SHOW_CAUSE_NOTICE_ISSUED</option>
            <option value="STUDENT_RECORD_VERIFIED">STUDENT_RECORD_VERIFIED</option>
            <option value="CROSS_INSTITUTION_FLAG">CROSS_INSTITUTION_FLAG</option>
            <option value="VALIDATION_ISSUE_FIXED">VALIDATION_ISSUE_FIXED</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F8F6] text-[#8A94A0] uppercase font-bold text-[10px] border-b border-[#E3EAE6]">
              <tr>
                <th className="py-3 px-4">Event ID &amp; Timestamp</th>
                <th className="py-3 px-3">Actor &amp; Role</th>
                <th className="py-3 px-3">Action Type</th>
                <th className="py-3 px-3">Target Entity</th>
                <th className="py-3 px-3">IP Address</th>
                <th className="py-3 px-4 text-right">Integrity Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3EAE6] font-medium text-[#4B5563]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F4F8F6] transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-[#14233F] block">{log.id}</span>
                    <span className="text-[10px] text-[#8A94A0]">{log.timestamp}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-[#14233F] block">{log.actor}</span>
                    <span className="text-[10px] text-[#14513A] font-semibold">{log.role}</span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[#14233F]">
                    <span className="bg-[#EBF3EF] text-[#14513A] px-2 py-0.5 rounded text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-[#14233F] block">{log.target}</span>
                    <span className="text-[10px] text-[#8A94A0] block truncate max-w-[220px]">
                      {log.details}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px]">{log.ipAddress}</td>
                  <td className="py-3 px-4 text-right font-mono text-[10px] text-[#8A94A0]">
                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      {log.hash.slice(0, 16)}...
                    </span>
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

