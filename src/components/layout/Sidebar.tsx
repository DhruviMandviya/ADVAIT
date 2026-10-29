import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  Users,
  CheckCircle2,
  Award,
  FileText,
  KeyRound,
  ShieldCheck,
  Building2,
  BarChart3,
  ShieldAlert,
  GitCompare,
  Database,
  FileSpreadsheet,
  History,
  UserCog,
  ExternalLink,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { role, user } = useAuth();
  const { students, anomalies, crossDuplicates, cases, activeNoticesCountForInstitution, casesNeedingReviewCountForAicte } = useData();

  // Institution counts
  const flaggedCount = students.filter(
    (s) => s.status === 'Flagged' && (role === 'institution' ? s.institutionId === user?.institutionId : true)
  ).length;

  const currentInstId = user?.institutionId || 'INST102';
  const instNoticesCount = activeNoticesCountForInstitution(currentInstId);
  const openCasesCount = cases.filter((c) => c.status !== 'Resolved').length;

  const institutionLinks = [
    { to: '/institution/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/institution/upload', label: 'Student Data Upload', icon: UploadCloud },
    { to: '/institution/records', label: 'Student Records', icon: Users },
    {
      to: '/institution/validation',
      label: 'Compliance & Resolution',
      icon: ShieldAlert,
      badge: (flaggedCount + instNoticesCount) > 0 ? (flaggedCount + instNoticesCount) : undefined,
      badgeColor: 'bg-rose-100 text-rose-800'
    },
    { to: '/institution/verifiable-records', label: 'Verifiable Records', icon: Award },
    { to: '/institution/certificate-preview', label: 'Certificate Registry', icon: FileText },
    { to: '/institution/api', label: 'API & Integration', icon: KeyRound },
    { to: '/institution/consent', label: 'Consent & Privacy', icon: ShieldCheck },
    { to: '/institution/profile', label: 'Institution Profile', icon: Building2 },
  ];

  const aicteLinks = [
    { to: '/aicte/dashboard', label: 'National Dashboard', icon: BarChart3 },
    { to: '/aicte/institutions', label: 'Institution Monitoring', icon: Building2 },
    { to: '/aicte/anomalies', label: 'Anomaly Detection', icon: ShieldAlert, badge: anomalies.length, badgeColor: 'bg-amber-100 text-amber-900' },
    { to: '/aicte/cases', label: 'Compliance Cases', icon: GitCompare, badge: openCasesCount > 0 ? openCasesCount : undefined, badgeColor: 'bg-rose-100 text-rose-800' },
    { to: '/aicte/repository', label: 'Central Repository', icon: Database },
    { to: '/aicte/reports', label: 'Policy Reports', icon: FileSpreadsheet },
    { to: '/aicte/audit', label: 'Audit Trail', icon: History },
    { to: '/aicte/users', label: 'User & Role RBAC', icon: UserCog },
  ];

  const currentLinks = role === 'aicte' ? aicteLinks : institutionLinks;

  return (
    <aside className="w-64 bg-white border-r border-[#E3EAE6] flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 overflow-y-auto space-y-6">
        
        {/* Context Header */}
        <div className="bg-[#F4F8F6] p-3 rounded-xl border border-[#E3EAE6]">
          <span className="text-[10px] font-bold text-[#8A94A0] uppercase tracking-wider block">
            {role === 'aicte' ? 'Regulatory Portal' : 'Institution Portal'}
          </span>
          <p className="text-xs font-bold text-[#14233F] truncate mt-0.5">
            {role === 'aicte' ? 'AICTE Central Headquarters' : user?.institutionName || 'College of Engineering Pune'}
          </p>
          <span className="inline-block mt-1 text-[10px] text-[#14513A] font-semibold bg-[#EBF3EF] px-2 py-0.5 rounded-full">
            {role === 'aicte' ? 'Regulatory Bureau' : `ID: ${user?.institutionId || 'INST102'}`}
          </span>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          <span className="text-[10px] font-bold text-[#8A94A0] uppercase tracking-wider px-3 mb-2 block">
            Navigation Menu
          </span>

          {currentLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#14513A] text-white shadow-xs'
                      : 'text-[#4B5563] hover:text-[#14233F] hover:bg-[#F4F8F6]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 truncate">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#8A94A0]'}`} />
                      <span className="truncate">{link.label}</span>
                    </div>

                    {link.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-white text-[#14513A]' : link.badgeColor || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* External verification link */}
        <div className="pt-2 border-t border-[#E3EAE6]">
          <NavLink
            to="/verify"
            onClick={onCloseMobile}
            className="flex items-center justify-between p-3 rounded-xl border border-dashed border-[#D1DCD6] hover:border-[#14513A] hover:bg-[#F4F8F6] text-xs font-semibold text-[#14513A] transition-all group"
          >
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#1E9E5A]" />
              <span>Public Verification</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[#8A94A0] group-hover:text-[#14513A]" />
          </NavLink>
        </div>

      </div>

      {/* Footer Strip inside sidebar */}
      <div className="p-4 border-t border-[#E3EAE6] bg-[#F4F8F6]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#1E9E5A]" />
          <span className="text-[11px] text-[#4B5563] font-medium">APAAR Gateway 2.0 Active</span>
        </div>
      </div>
    </aside>
  );
};

