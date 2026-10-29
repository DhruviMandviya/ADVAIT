import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  ShieldAlert,
  Users,
  CheckCircle2,
  AlertTriangle,
  Award,
  Send,
  FileText,
  Mail,
  Briefcase,
  Clock,
  Paperclip
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export const InstitutionDrilldown: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { institutions, students, anomalies, cases, raiseNotice, raiseCaseNotice } = useData();
  const toast = useToast();

  const inst = institutions.find((i) => i.id === id) || institutions[0];
  const instStudents = students.filter((s) => s.institutionId === inst.id);
  const instAnomalies = anomalies.filter((a) => a.institutionId === inst.id);
  const instCases = cases.filter((c) => c.institutionIds.includes(inst.id));

  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [noticeText, setNoticeText] = useState(
    `Pursuant to AICTE Regulation 2026, you are required to submit an explanation within 7 working days regarding admissions exceeding approved intake quotas or supernumerary caps.`
  );

  const handleSendNotice = (e: React.FormEvent) => {
    e.preventDefault();
    const existingCase = instCases[0];
    if (existingCase) {
      const res = raiseCaseNotice(
        existingCase.id,
        {
          institutionId: inst.id,
          description: noticeText,
          correctiveAction: 'Submit formal clarification and authenticated state seat allocation gazette.',
          deadlineDate: '2026-11-20'
        },
        {
          name: 'Dr. R. K. Srivastav',
          role: 'Senior Director, Approval & APAAR Bureau'
        }
      );
      if (res.success) {
        toast.success('Show-Cause Notice Issued', res.message);
        setNoticeModalOpen(false);
      } else {
        toast.error('Notice Issuance Blocked', res.message);
      }
    } else {
      raiseNotice(inst.id, noticeText);
      toast.success('Show-Cause Notice Issued', `Compliance notice dispatched to ${inst.headEmail}.`);
      setNoticeModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/aicte/institutions')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#14513A] hover:underline cursor-pointer mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Institutions Monitoring</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#1E9E5A] tracking-wider uppercase">
              Institution Dossier Inspection
            </span>
            <h1 className="text-2xl font-bold text-[#14233F] tracking-tight">
              {inst.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5">
              AICTE Permanent ID: <strong className="text-[#14233F]">{inst.permanentId}</strong> &bull; {inst.city}, {inst.state} &bull; AISHE: {inst.aisheCode}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="danger"
              onClick={() => setNoticeModalOpen(true)}
              leftIcon={<ShieldAlert className="w-4 h-4" />}
            >
              Issue Show-Cause Notice
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[10px] font-bold text-[#8A94A0] uppercase">Approved Quota</span>
          <div className="text-2xl font-bold text-[#14233F] mt-1">{inst.approvedIntake}</div>
          <span className="text-[11px] text-[#4B5563]">Sanctioned Strength</span>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-bold text-[#8A94A0] uppercase">Actual Enrolment</span>
          <div className={`text-2xl font-bold mt-1 ${inst.actualEnrolment > inst.approvedIntake ? 'text-[#D64545]' : 'text-[#14513A]'}`}>
            {inst.actualEnrolment}
          </div>
          <span className="text-[11px] text-[#4B5563]">
            {inst.actualEnrolment > inst.approvedIntake ? `+${inst.actualEnrolment - inst.approvedIntake} Over Quota` : 'Within Limits'}
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-bold text-[#8A94A0] uppercase">Supernumerary</span>
          <div className="text-2xl font-bold text-[#14233F] mt-1">{inst.supernumeraryActual}</div>
          <span className="text-[11px] text-[#4B5563]">Cap: {inst.supernumeraryCap}</span>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] font-bold text-[#8A94A0] uppercase">Calculated Risk Score</span>
          <div className={`text-2xl font-bold mt-1 ${inst.riskScore >= 70 ? 'text-[#D64545]' : 'text-[#1E9E5A]'}`}>
            {inst.riskScore}/100
          </div>
          <span className="text-[11px] text-[#4B5563]">Level: {inst.riskLevel}</span>
        </Card>
      </div>

      {/* Triggered Anomalies for this Institution */}
      {instAnomalies.length > 0 && (
        <Card className="p-5 border-l-4 border-l-[#D64545]">
          <h3 className="text-sm font-bold text-[#14233F] mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#D64545]" />
            <span>Active Compliance Violations ({instAnomalies.length})</span>
          </h3>

          <div className="space-y-3">
            {instAnomalies.map((anom) => (
              <div key={anom.id} className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#14233F]">{anom.type} &bull; {anom.metric}</span>
                  <Badge variant="error" size="sm">{anom.status}</Badge>
                </div>
                <p className="text-rose-900 mt-1">{anom.description}</p>
                <span className="text-[10px] text-[#8A94A0] mt-1 block">Logged: {anom.detectedAt}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Linked Compliance Cases for this Institution */}
      {instCases.length > 0 && (
        <Card className="p-5 border-l-4 border-l-[#14513A]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#14233F] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#14513A]" />
              <span>Registered Regulatory Compliance Cases ({instCases.length})</span>
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/aicte/cases')}
              className="text-xs"
            >
              Open in Case Manager
            </Button>
          </div>

          <div className="space-y-3">
            {instCases.map((c) => (
              <div key={c.id} className="p-3 bg-[#F8FAF9] rounded-xl border border-[#D1DCD6] text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#14513A] bg-[#EBF3EF] px-2 py-0.5 rounded text-[11px]">
                      {c.id}
                    </span>
                    <span className="font-bold text-[#14233F]">{c.title}</span>
                  </div>
                  <Badge variant={c.status === 'Resolved' ? 'success' : c.status === 'Notice Issued' ? 'error' : 'warning'} size="sm">
                    {c.status}
                  </Badge>
                </div>
                <p className="text-[#4B5563] text-[11px]">{c.description}</p>
                <div className="flex flex-wrap items-center justify-between text-[10px] text-[#8A94A0] pt-1 border-t border-[#E3EAE6]">
                  <span>Metric: <strong>{c.metric}</strong></span>
                  <span>Notices: {c.notices.length} | Responses: {c.responses?.length || 0}</span>
                  <span>Assigned Officer: {c.assignedOfficer.name}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Student Roster for this Institution */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-[#14233F] mb-4">
          Ingested Student Roster ({instStudents.length} Records in AICTE Repository)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F8F6] text-[#8A94A0] uppercase font-bold text-[10px] border-b border-[#E3EAE6]">
              <tr>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">APAAR ID</th>
                <th className="py-2.5 px-3">Roll ID</th>
                <th className="py-2.5 px-3">Programme</th>
                <th className="py-2.5 px-3">Quota</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3EAE6] font-medium text-[#4B5563]">
              {instStudents.map((s) => (
                <tr key={s.id} className="hover:bg-[#F4F8F6]">
                  <td className="py-2.5 px-3 font-bold text-[#14233F]">{s.name}</td>
                  <td className="py-2.5 px-3 font-mono text-[#14513A] font-semibold">{s.apaarId}</td>
                  <td className="py-2.5 px-3 font-mono">{s.studentId}</td>
                  <td className="py-2.5 px-3">{s.programme} - {s.course}</td>
                  <td className="py-2.5 px-3">{s.quotaType}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant={s.status === 'Validated' ? 'success' : 'error'} size="sm">
                      {s.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Show-Cause Notice Modal */}
      {noticeModalOpen && (
        <Modal
          isOpen={noticeModalOpen}
          onClose={() => setNoticeModalOpen(false)}
          title="Issue Official AICTE Show-Cause Notice"
          description={`To: ${inst.headName} (${inst.name}) &bull; Email: ${inst.headEmail}`}
          maxWidth="md"
        >
          <form onSubmit={handleSendNotice} className="space-y-4 text-xs text-[#4B5563]">
            <p>
              This directive will be dispatched under Member Secretary signature and permanently logged into the institutional accreditation dossier.
            </p>

            <div>
              <label className="text-xs font-bold text-[#14233F] uppercase tracking-wider block mb-1.5">
                Statutory Notice Text *
              </label>
              <textarea
                rows={5}
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                className="w-full rounded-xl border border-[#D1DCD6] p-3 text-xs text-[#14233F] focus:border-[#14513A] outline-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setNoticeModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" leftIcon={<Send className="w-4 h-4" />}>
                Dispatch Show-Cause Notice
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

