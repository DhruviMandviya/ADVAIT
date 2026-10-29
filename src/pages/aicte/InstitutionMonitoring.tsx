import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Filter, AlertTriangle, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export const InstitutionMonitoring: React.FC = () => {
  const { institutions } = useData();
  const navigate = useNavigate();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = institutions.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.permanentId.includes(searchTerm);

    const matchesState = stateFilter === 'all' || inst.state === stateFilter;
    const matchesStatus = statusFilter === 'all' || inst.complianceStatus === statusFilter;
    return matchesSearch && matchesState && matchesStatus;
  });

  const states = Array.from(new Set(institutions.map((i) => i.state))).sort();

  const handleExportCsv = () => {
    const headers = 'Institution ID,Permanent ID,Name,State,Type,Approved Intake,Actual Enrolment,Supernumerary Cap,Supernumerary Actual,Risk Score,Status\n';
    const rows = filtered
      .map(
        (i) =>
          `"${i.id}","${i.permanentId}","${i.name}","${i.state}","${i.type}",${i.approvedIntake},${i.actualEnrolment},${i.supernumeraryCap},${i.supernumeraryActual},${i.riskScore},"${i.complianceStatus}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AICTE_Institutions_Compliance_Audit.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report Exported', `Exported ${filtered.length} institutions.`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#1E9E5A] tracking-wider uppercase">
            Statutory Quota Compliance
          </span>
          <h1 className="text-2xl font-bold text-[#14233F] tracking-tight">
            Institution Intake &amp; Enrolment Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5">
            Audit of all {institutions.length} AICTE approved colleges against sanctioned intake limits.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCsv} leftIcon={<Download className="w-4 h-4 text-[#14513A]" />}>
          Export Audit Table ({filtered.length})
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8A94A0] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by college name, ID, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#D1DCD6] outline-none focus:border-[#14513A]"
            />
          </div>

          <div>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full text-xs border border-[#D1DCD6] rounded-xl px-3 py-1.5 bg-white outline-none"
            >
              <option value="all">All States ({states.length})</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs border border-[#D1DCD6] rounded-xl px-3 py-1.5 bg-white outline-none"
            >
              <option value="all">All Compliance Statuses</option>
              <option value="Compliant">Compliant</option>
              <option value="Over-Intake">Over-Intake</option>
              <option value="Notice-Issued">Notice-Issued</option>
              <option value="Review-Pending">Review-Pending</option>
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
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-3">State &amp; Type</th>
                <th className="py-3 px-3">Approved Intake</th>
                <th className="py-3 px-3">Actual Enrolment</th>
                <th className="py-3 px-3">Supernumerary (15% Cap)</th>
                <th className="py-3 px-3">Intelligent Risk</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Drill-Down</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3EAE6] font-medium text-[#4B5563]">
              {filtered.map((inst) => {
                const isOver = inst.actualEnrolment > inst.approvedIntake;
                const superRatio = Math.round((inst.supernumeraryActual / inst.approvedIntake) * 100);

                return (
                  <tr key={inst.id} className="hover:bg-[#F4F8F6] transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#14233F] block">{inst.name}</span>
                      <span className="text-[10px] text-[#8A94A0] font-mono">
                        ID: {inst.id} &bull; Perm ID: {inst.permanentId}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-[#14233F] block">{inst.state}</span>
                      <span className="text-[10px] text-[#8A94A0]">{inst.type}</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#14233F]">
                      {inst.approvedIntake}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className={isOver ? 'text-[#D64545] font-extrabold' : 'text-[#14513A] font-bold'}>
                        {inst.actualEnrolment}
                      </span>
                      {isOver && (
                        <span className="text-[10px] text-[#D64545] font-bold block">
                          +{inst.actualEnrolment - inst.approvedIntake} Over Quota!
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className={superRatio > 15 ? 'text-[#D64545] font-bold' : ''}>
                        {inst.supernumeraryActual} / {inst.supernumeraryCap} ({superRatio}%)
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            inst.riskScore >= 70
                              ? 'bg-[#D64545]'
                              : inst.riskScore >= 40
                              ? 'bg-[#F5B335]'
                              : 'bg-[#1E9E5A]'
                          }`}
                        />
                        <span className="font-mono font-bold">{inst.riskScore}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          inst.complianceStatus === 'Compliant'
                            ? 'success'
                            : inst.complianceStatus === 'Notice-Issued'
                            ? 'error'
                            : 'warning'
                        }
                        size="sm"
                        dot
                      >
                        {inst.complianceStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/aicte/institutions/${inst.id}`)}
                        className="inline-flex items-center gap-1 text-xs text-[#14513A] hover:text-[#0E3B2A] font-bold underline cursor-pointer"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

