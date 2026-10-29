import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Award,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useData } from '../../context/DataContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const NationalDashboard: React.FC = () => {
  const { institutions, students, anomalies } = useData();
  const navigate = useNavigate();

  // Aggregate statistics
  const totalInstitutions = institutions.length;
  const totalStudents = students.length;
  const validatedStudents = students.filter((s) => s.status === 'Validated').length;
  const flaggedStudents = students.filter((s) => s.status === 'Flagged').length;
  const validationRate = Math.round((validatedStudents / totalStudents) * 100);

  // Top Risk Institutions (sorted by risk score descending)
  const highRiskInstitutions = [...institutions]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  // State-wise distribution data
  const stateDistributionData = [
    { state: 'Maharashtra', institutions: 6, students: 85, flagged: 3 },
    { state: 'Karnataka', institutions: 4, students: 54, flagged: 4 },
    { state: 'Tamil Nadu', institutions: 3, students: 42, flagged: 0 },
    { state: 'Delhi', institutions: 2, students: 30, flagged: 1 },
    { state: 'Gujarat', institutions: 2, students: 25, flagged: 0 },
    { state: 'Telangana', institutions: 2, students: 24, flagged: 0 },
    { state: 'Uttar Pradesh', institutions: 2, students: 22, flagged: 0 },
    { state: 'West Bengal', institutions: 1, students: 18, flagged: 0 },
    { state: 'Madhya Pradesh', institutions: 2, students: 15, flagged: 1 }
  ];

  // Enrolment Trends over recent academic sessions
  const enrolmentTrendData = [
    { year: '2022-23', TotalSanctioned: 24000, ActualEnrolment: 21800, ApaarAdopted: 4200 },
    { year: '2023-24', TotalSanctioned: 25200, ActualEnrolment: 23600, ApaarAdopted: 11400 },
    { year: '2024-25', TotalSanctioned: 26800, ActualEnrolment: 25900, ApaarAdopted: 21200 },
    { year: '2025-26', TotalSanctioned: 28500, ActualEnrolment: 27800, ApaarAdopted: 26900 },
    { year: '2026-27 (Live)', TotalSanctioned: 30200, ActualEnrolment: 29850, ApaarAdopted: 29400 }
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#1E9E5A] tracking-wider uppercase">
            AICTE National Intelligence &amp; Regulation Bureau
          </span>
          <h1 className="text-2xl font-bold text-[#14233F] tracking-tight">
            National APAAR Student Registry Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5">
            Unified monitoring of approved intake capacities, supernumerary compliance, and cross-institution identity integrity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/aicte/anomalies')}
            leftIcon={<ShieldAlert className="w-4 h-4 text-[#D64545]" />}
          >
            Review {anomalies.length} Risk Anomalies
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/aicte/reports')}
            leftIcon={<TrendingUp className="w-4 h-4" />}
          >
            Generate Policy Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Approved Institutions"
          value={totalInstitutions}
          subValue="Across 12 Regional Jurisdictions"
          icon={<Building2 className="w-5 h-5" />}
        />
        <StatCard
          label="Total Students Registered"
          value={totalStudents}
          subValue="Keyed by 12-Digit APAAR"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="National Validation Rate"
          value={`${validationRate}%`}
          subValue={`${validatedStudents} of ${totalStudents} verified`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="success"
        />
        <StatCard
          label="Flagged / Compliance Issues"
          value={flaggedStudents}
          subValue="Requires State Office Review"
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="danger"
        />
        <StatCard
          label="Active Anomaly Alerts"
          value={anomalies.length}
          subValue="Intelligent Rule Scored"
          icon={<ShieldAlert className="w-5 h-5" />}
          variant="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: State-wise Distribution */}
        <div className="lg:col-span-7">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold text-[#8A94A0] uppercase tracking-wider block">
                  Geographic Coverage
                </span>
                <h3 className="text-base font-bold text-[#14233F]">
                  State-Wise Approved Institutions &amp; Student Registration
                </h3>
              </div>
              <Badge variant="neutral">Top 9 States</Badge>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateDistributionData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3EAE6" vertical={false} />
                  <XAxis dataKey="state" stroke="#8A94A0" fontSize={11} tickLine={false} interval={0} angle={-25} textAnchor="end" height={45} />
                  <YAxis stroke="#8A94A0" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E3EAE6'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="students" fill="#14513A" radius={[4, 4, 0, 0]} name="Students Ingested" />
                  <Bar dataKey="flagged" fill="#D64545" radius={[4, 4, 0, 0]} name="Validation Flags" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right: Enrolment Trends Line Chart */}
        <div className="lg:col-span-5">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold text-[#8A94A0] uppercase tracking-wider block">
                  Multi-Year Progression
                </span>
                <h3 className="text-base font-bold text-[#14233F]">
                  APAAR Identity Adoption Velocity
                </h3>
              </div>
              <Badge variant="success">97.3% Saturation</Badge>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrolmentTrendData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3EAE6" vertical={false} />
                  <XAxis dataKey="year" stroke="#8A94A0" fontSize={11} tickLine={false} />
                  <YAxis stroke="#8A94A0" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E3EAE6'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="ActualEnrolment" stroke="#8A94A0" strokeWidth={2} name="Total Enrolment" />
                  <Line type="monotone" dataKey="ApaarAdopted" stroke="#1E9E5A" strokeWidth={3} name="APAAR Verified Records" activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Top Risk Institutions Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#14233F]">
              Institutions with Elevated Anomaly Scores
            </h3>
            <p className="text-xs text-[#8A94A0] mt-0.5">
              Ranked dynamically by the Intelligent Anomaly Detection Engine (over-intake, supernumerary breaches, sudden spikes).
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/aicte/institutions')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            All Institutions Monitoring
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F8F6] text-[#8A94A0] uppercase font-bold text-[10px] border-b border-[#E3EAE6]">
              <tr>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-3">State</th>
                <th className="py-3 px-3">Approved vs Enrolled</th>
                <th className="py-3 px-3">Supernumerary Ratio</th>
                <th className="py-3 px-3">Risk Score</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3EAE6] font-medium text-[#4B5563]">
              {highRiskInstitutions.map((inst) => {
                const isOver = inst.actualEnrolment > inst.approvedIntake;
                const superRatio = Math.round((inst.supernumeraryActual / inst.approvedIntake) * 100);

                return (
                  <tr key={inst.id} className="hover:bg-[#F4F8F6] transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#14233F] block">{inst.name}</span>
                      <span className="text-[10px] text-[#8A94A0] font-mono">ID: {inst.id} &bull; Perm ID: {inst.permanentId}</span>
                    </td>
                    <td className="py-3 px-3">{inst.state}</td>
                    <td className="py-3 px-3 font-mono">
                      <span className={isOver ? 'text-[#D64545] font-bold' : 'text-[#14233F]'}>
                        {inst.actualEnrolment}
                      </span>{' '}
                      / {inst.approvedIntake}
                      {isOver && (
                        <span className="text-[10px] text-[#D64545] block font-bold">
                          +{inst.actualEnrolment - inst.approvedIntake} Excess
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className={superRatio > 15 ? 'text-[#D64545] font-bold' : ''}>
                        {inst.supernumeraryActual} ({superRatio}%)
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              inst.riskScore >= 70
                                ? 'bg-[#D64545]'
                                : inst.riskScore >= 40
                                ? 'bg-[#F5B335]'
                                : 'bg-[#1E9E5A]'
                            }`}
                            style={{ width: `${inst.riskScore}%` }}
                          />
                        </div>
                        <span className="font-bold font-mono">{inst.riskScore}/100</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          inst.complianceStatus === 'Notice-Issued'
                            ? 'error'
                            : inst.complianceStatus === 'Over-Intake'
                            ? 'warning'
                            : 'success'
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
                        className="text-xs text-[#14513A] hover:text-[#0E3B2A] font-semibold underline cursor-pointer"
                      >
                        Inspect Dossier &rarr;
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

