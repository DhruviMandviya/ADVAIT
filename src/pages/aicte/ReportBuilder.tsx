import React, { useState } from 'react';
import { FileSpreadsheet, Download, Filter, Printer, FileText, CheckCircle2, Bookmark } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export const ReportBuilder: React.FC = () => {
  const { institutions, students } = useData();
  const toast = useToast();

  const [reportType, setReportType] = useState('quota_compliance');
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedProgramme, setSelectedProgramme] = useState('all');

  // Filtered dataset for preview
  const filteredInstitutions = institutions.filter(
    (i) => selectedState === 'all' || i.state === selectedState
  );

  const handleExportCsv = () => {
    const headers = 'Institution Name,State,Approved Intake,Actual Enrolment,Supernumerary Cap,Supernumerary Enrolled,Risk Score,Compliance Status\n';
    const rows = filteredInstitutions
      .map(
        (i) =>
          `"${i.name}","${i.state}",${i.approvedIntake},${i.actualEnrolment},${i.supernumeraryCap},${i.supernumeraryActual},${i.riskScore},"${i.complianceStatus}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AICTE_Policy_Report_${reportType}_${academicYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report Exported to CSV', `Exported ${filteredInstitutions.length} rows.`);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#1E9E5A] tracking-wider uppercase flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Policy &amp; Accreditation Intelligence</span>
          </span>
          <h1 className="text-2xl font-bold text-[#14233F] tracking-tight">
            Regulatory Report Builder
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5">
            Generate custom data exports for Ministry of Education policy-making, NBA accreditation audits, and Parliament queries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrintPdf} leftIcon={<Printer className="w-4 h-4" />}>
            Print Report
          </Button>
          <Button size="sm" onClick={handleExportCsv} leftIcon={<Download className="w-4 h-4" />}>
            Export CSV ({filteredInstitutions.length})
          </Button>
        </div>
      </div>

      {/* Filter Builder Card */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#14233F] uppercase tracking-wider">
          Configure Report Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold text-[#14233F] uppercase tracking-wider block mb-1.5">
              Report Category
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full text-xs rounded-xl border border-[#D1DCD6] px-3 py-2.5 bg-white outline-none"
            >
              <option value="quota_compliance">Intake Quota &amp; Over-Enrolment Audit</option>
              <option value="supernumerary">Supernumerary (15% Cap) &amp; Foreign Student Audit</option>
              <option value="apaar_saturation">APAAR Identity Saturation by State</option>
              <option value="accreditation_nba">Tier-1 &amp; Tier-2 NBA Accreditation Baseline</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#14233F] uppercase tracking-wider block mb-1.5">
              Academic Session
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full text-xs rounded-xl border border-[#D1DCD6] px-3 py-2.5 bg-white outline-none"
            >
              <option value="2026-27">2026-27 (Current Approval Session)</option>
              <option value="2025-26">2025-26 (Past Year Archive)</option>
              <option value="2024-25">2024-25</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#14233F] uppercase tracking-wider block mb-1.5">
              State Jurisdiction
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full text-xs rounded-xl border border-[#D1DCD6] px-3 py-2.5 bg-white outline-none"
            >
              <option value="all">All States &amp; UTs</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Delhi">Delhi</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Telangana">Telangana</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#14233F] uppercase tracking-wider block mb-1.5">
              Programme Type
            </label>
            <select
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
              className="w-full text-xs rounded-xl border border-[#D1DCD6] px-3 py-2.5 bg-white outline-none"
            >
              <option value="all">All Disciplines</option>
              <option value="B.Tech">B.Tech (Engineering)</option>
              <option value="M.Tech">M.Tech (Post-Graduate)</option>
              <option value="PGDM">PGDM (Standalone AICTE)</option>
              <option value="MBA">MBA</option>
              <option value="MCA">MCA</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Report Preview Table */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E3EAE6]">
          <div>
            <h3 className="text-base font-bold text-[#14233F]">
              Report Preview: {reportType.replace(/_/g, ' ').toUpperCase()} ({academicYear})
            </h3>
            <p className="text-xs text-[#8A94A0]">
              Showing {filteredInstitutions.length} filtered records. Formatted for Council regulatory review.
            </p>
          </div>
          <Badge variant="success" dot>Live Master Reconciled</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F8F6] text-[#8A94A0] uppercase font-bold text-[10px] border-b border-[#E3EAE6]">
              <tr>
                <th className="py-3 px-3">Institution</th>
                <th className="py-3 px-3">State</th>
                <th className="py-3 px-3">Sanctioned Intake</th>
                <th className="py-3 px-3">Actual Enrolment</th>
                <th className="py-3 px-3">Supernumerary (Cap: 15%)</th>
                <th className="py-3 px-3">Risk Index</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3EAE6] font-medium text-[#4B5563]">
              {filteredInstitutions.map((i) => (
                <tr key={i.id} className="hover:bg-[#F4F8F6]">
                  <td className="py-3 px-3 font-bold text-[#14233F]">{i.name}</td>
                  <td className="py-3 px-3">{i.state}</td>
                  <td className="py-3 px-3 font-mono">{i.approvedIntake}</td>
                  <td className="py-3 px-3 font-mono font-bold text-[#14233F]">{i.actualEnrolment}</td>
                  <td className="py-3 px-3 font-mono">{i.supernumeraryActual} / {i.supernumeraryCap}</td>
                  <td className="py-3 px-3 font-mono font-bold">{i.riskScore}/100</td>
                  <td className="py-3 px-3">
                    <Badge variant={i.complianceStatus === 'Compliant' ? 'success' : 'error'} size="sm">
                      {i.complianceStatus}
                    </Badge>
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

