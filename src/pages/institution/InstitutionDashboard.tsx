import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Award,
  UploadCloud,
  FileCheck2,
  Building2,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const InstitutionDashboard: React.FC = () => {
  const { user } = useAuth();
  const { students, institutions, anomalies } = useData();
  const navigate = useNavigate();

  const currentInst =
    institutions.find((i) => i.id === (user?.institutionId || 'INST102')) || institutions[0];

  const instStudents = students.filter(
    (s) => s.institutionId === currentInst.id
  );

  const totalEnrolled = instStudents.length;
  const validatedCount = instStudents.filter((s) => s.status === 'Validated').length;
  const flaggedCount = instStudents.filter((s) => s.status === 'Flagged').length;
  const supernumeraryCount = instStudents.filter((s) => s.quotaType === 'Supernumerary').length;

  // Chart data: Programme-wise Approved vs Enrolled
  const programmeChartData = currentInst.programmes.map((p) => ({
    name: p.name,
    Approved: p.approved,
    Enrolled: instStudents.filter((s) => s.programme === p.name).length || p.enrolled
  }));

  // Recent alerts for this institution
  const instAlerts = anomalies.filter(
    (a) => a.institutionId === currentInst.id
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E3EAE6] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#1E9E5A] bg-[#EBF3EF] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Permanent ID: {currentInst.permanentId}
            </span>
            <span className="text-xs text-[#8A94A0]">&bull;</span>
            <span className="text-xs text-[#4B5563]">AISHE: {currentInst.aisheCode}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#14233F] tracking-tight">
            {currentInst.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1">
            Nodal Officer: <span className="font-semibold text-[#14233F]">{user?.name || currentInst.headName}</span> &bull; {currentInst.city}, {currentInst.state}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/institution/records')}
            leftIcon={<Users className="w-4 h-4 text-[#14513A]" />}
          >
            View All Records
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/institution/upload')}
            leftIcon={<UploadCloud className="w-4 h-4" />}
          >
            Upload Student Data
          </Button>
        </div>
      </div>

      {/* Five Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Approved Intake"
          value={currentInst.approvedIntake}
          subValue="Sanctioned AICTE Quota"
          icon={<Building2 className="w-5 h-5" />}
        />
        <StatCard
          label="Actual Enrolment"
          value={totalEnrolled > 0 ? totalEnrolled : currentInst.actualEnrolment}
          subValue={`${Math.round(((totalEnrolled || currentInst.actualEnrolment) / currentInst.approvedIntake) * 100)}% Capacity Utilized`}
          icon={<Users className="w-5 h-5" />}
          trend={{ value: 'Within Quota', isPositive: true }}
        />
        <StatCard
          label="Supernumerary Seats"
          value={supernumeraryCount > 0 ? supernumeraryCount : currentInst.supernumeraryActual}
          subValue={`Cap: ${currentInst.supernumeraryCap} (15% limit)`}
          icon={<Award className="w-5 h-5" />}
          variant={
            (supernumeraryCount || currentInst.supernumeraryActual) > currentInst.supernumeraryCap
              ? 'danger'
              : 'default'
          }
        />
        <StatCard
          label="APAAR Validated"
          value={validatedCount}
          subValue="Verified in AICTE Vault"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="success"
        />
        <StatCard
          label="Flagged Issues"
          value={flaggedCount}
          subValue="Requires Rectification"
          icon={<AlertTriangle className="w-5 h-5" />}
          variant={flaggedCount > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Middle Grid: Intake vs Enrolment Chart + Urgent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Chart */}
        <div className="lg:col-span-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold text-[#8A94A0] uppercase tracking-wider block">
                  Intake vs Enrolment Analytics
                </span>
                <h3 className="text-base font-bold text-[#14233F]">
                  Sanctioned vs Registered Students by Programme
                </h3>
              </div>
              <Badge variant="success">AY 2026-27 Active</Badge>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={programmeChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3EAE6" vertical={false} />
                  <XAxis dataKey="name" stroke="#8A94A0" fontSize={12} tickLine={false} />
                  <YAxis stroke="#8A94A0" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E3EAE6',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Approved" fill="#D1DCD6" radius={[6, 6, 0, 0]} name="Approved Intake" />
                  <Bar dataKey="Enrolled" fill="#14513A" radius={[6, 6, 0, 0]} name="Actual Enrolment (APAAR Keyed)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right 4 Cols: Validation Alerts & Actions */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <Card className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#14233F]">Validation Center Alerts</h3>
                <span className="text-xs bg-rose-50 text-[#D64545] font-semibold px-2 py-0.5 rounded-full">
                  {flaggedCount} Active
                </span>
              </div>

              {flaggedCount === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-10 h-10 text-[#1E9E5A] mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-bold text-[#14233F]">All Student Records Validated</p>
                  <p className="text-[11px] text-[#4B5563] mt-1">No duplicates or APAAR mismatches detected.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {instStudents
                    .filter((s) => s.status === 'Flagged')
                    .slice(0, 3)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#14233F]">{item.name}</span>
                          <span className="text-[10px] font-mono text-rose-700 bg-white px-1.5 py-0.5 rounded border border-rose-200">
                            {item.studentId}
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-800 mt-1 line-clamp-2 leading-relaxed">
                          {item.flagReason}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={() => navigate('/institution/validation')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open Validation Center
            </Button>
          </Card>

          {/* Quick Upload CTA Card */}
          <div className="bg-gradient-to-br from-[#14513A] to-[#0E3B2A] text-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold">New Student Batch?</h4>
              <p className="text-xs text-emerald-200 mt-1">
                Upload via CSV or use Single-Entry Form.
              </p>
            </div>
            <button
              onClick={() => navigate('/institution/upload')}
              className="bg-white text-[#14513A] hover:bg-emerald-50 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex-shrink-0"
            >
              Upload &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* Programme-wise Summary Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#14233F]">
              Programme-wise Quota &amp; Enrolment Summary
            </h3>
            <p className="text-xs text-[#8A94A0] mt-0.5">
              Live data reconciled with AICTE Approval Process Handbook (APH)
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/institution/records')}
          >
            Detailed Roster
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E3EAE6] text-[#8A94A0] uppercase font-bold text-[10px]">
                <th className="py-3 px-3">Programme</th>
                <th className="py-3 px-3">Approved Intake</th>
                <th className="py-3 px-3">Actual Enrolment</th>
                <th className="py-3 px-3">Supernumerary Seats</th>
                <th className="py-3 px-3">NRI / OCI / FN</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3EAE6] font-medium text-[#4B5563]">
              {currentInst.programmes.map((p) => {
                const enrolled =
                  instStudents.filter((s) => s.programme === p.name).length || p.enrolled;
                const isOver = enrolled > p.approved;

                return (
                  <tr key={p.name} className="hover:bg-[#F4F8F6] transition-colors">
                    <td className="py-3 px-3 font-bold text-[#14233F]">{p.name}</td>
                    <td className="py-3 px-3 font-mono">{p.approved}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#14233F]">{enrolled}</td>
                    <td className="py-3 px-3 font-mono">
                      {Math.round(enrolled * 0.08)} / {Math.round(p.approved * 0.15)} allowed
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {Math.round(enrolled * 0.03)} NRI &bull; {Math.round(enrolled * 0.01)} FN
                    </td>
                    <td className="py-3 px-3">
                      {isOver ? (
                        <Badge variant="error" dot>Over Sanctioned</Badge>
                      ) : (
                        <Badge variant="success" dot>Within Quota</Badge>
                      )}
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

