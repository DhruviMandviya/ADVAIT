import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  Landmark,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  BarChart3,
  Users2,
  KeyRound,
  ExternalLink,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { AicteLogo } from '../../components/common/AicteLogo';
import { AdvaitWordmark } from '../../components/common/AdvaitWordmark';
import { TopAnnouncement } from '../../components/common/TopAnnouncement';
import { WatermarkBg } from '../../components/common/WatermarkBg';
import { ForgotPasswordModal } from '../../components/modals/ForgotPasswordModal';
import { SsoModal } from '../../components/modals/SsoModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'institution' | 'aicte'>('institution');
  const [identifier, setIdentifier] = useState('INST102');
  const [password, setPassword] = useState('Demo@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoDrawer, setShowDemoDrawer] = useState(true);

  // Modals
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [ssoModalOpen, setSsoModalOpen] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Tab switch handler
  const handleTabChange = (tab: 'institution' | 'aicte') => {
    setActiveTab(tab);
    if (tab === 'institution') {
      setIdentifier('INST102');
      setPassword('Demo@123');
    } else {
      setIdentifier('AICTE001');
      setPassword('Admin@123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      toast.error('Required Fields', 'Please enter your login identifier and password.');
      return;
    }

    setIsLoading(true);
    const result = await login(identifier, password, activeTab);
    setIsLoading(false);

    if (result.success) {
      toast.success(
        activeTab === 'institution' ? 'Institution Portal Access Granted' : 'AICTE Central Portal Access Granted',
        `Authenticated as ${identifier}`
      );
      if (activeTab === 'institution') {
        navigate('/institution/dashboard');
      } else {
        navigate('/aicte/dashboard');
      }
    } else {
      toast.error('Authentication Failed', result.error);
    }
  };

  const handleFillDemo = (type: 'inst' | 'aicte') => {
    if (type === 'inst') {
      setActiveTab('institution');
      setIdentifier('INST102');
      setPassword('Demo@123');
      toast.info('Demo Credentials Loaded', 'Institution Admin: INST102 / Demo@123');
    } else {
      setActiveTab('aicte');
      setIdentifier('AICTE001');
      setPassword('Admin@123');
      toast.info('Demo Credentials Loaded', 'AICTE Admin: AICTE001 / Admin@123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4F8F6] to-white flex flex-col relative overflow-x-hidden">
      {/* Background Watermark Glyphs */}
      <WatermarkBg />

      {/* Top Regulation Announcement Banner */}
      <TopAnnouncement />

      {/* Main Hero & Auth Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 z-10 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
            <div>
              {/* Category Pill */}
              <div className="inline-flex items-center gap-2 bg-[#EBF3EF] border border-[#D1DCD6] text-[#14513A] px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-2xs">
                <GraduationCap className="w-4 h-4 text-[#1E9E5A]" />
                <span className="tracking-wide uppercase text-[11px]">AICTE APAAR Student Registry</span>
              </div>

              {/* AICTE Logo Lockup with Hindi line */}
              <AicteLogo size="lg" showLockup={true} className="mb-6" />

              {/* ADVAIT Wordmark + Tagline + Subtitle */}
              <AdvaitWordmark size="hero" showTagline={true} />
            </div>

            {/* 4 Feature Highlights Grid (Recreating Screenshot exactly) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {/* Feature 1 */}
              <div className="bg-white p-4 rounded-2xl border border-[#E3EAE6] shadow-[0_2px_10px_rgba(20,81,58,0.04)] hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-xl bg-[#EBF3EF] text-[#14513A] flex items-center justify-center mb-3">
                  <FileCheck2 className="w-5 h-5 text-[#14513A]" />
                </div>
                <h3 className="text-xs font-bold text-[#14233F] leading-tight">
                  Automated Student Validation
                </h3>
                <p className="text-[11px] text-[#4B5563] mt-1.5 leading-relaxed">
                  APAAR ID checks, duplicate detection and intake validation.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-4 rounded-2xl border border-[#E3EAE6] shadow-[0_2px_10px_rgba(20,81,58,0.04)] hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-xl bg-[#EBF3EF] text-[#14513A] flex items-center justify-center mb-3">
                  <BarChart3 className="w-5 h-5 text-[#14513A]" />
                </div>
                <h3 className="text-xs font-bold text-[#14233F] leading-tight">
                  Real-Time Monitoring
                </h3>
                <p className="text-[11px] text-[#4B5563] mt-1.5 leading-relaxed">
                  Institution-wise reporting and auditable records.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-4 rounded-2xl border border-[#E3EAE6] shadow-[0_2px_10px_rgba(20,81,58,0.04)] hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-xl bg-[#EBF3EF] text-[#14513A] flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5 text-[#14513A]" />
                </div>
                <h3 className="text-xs font-bold text-[#14233F] leading-tight">
                  Secure &amp; Tamper-Proof
                </h3>
                <p className="text-[11px] text-[#4B5563] mt-1.5 leading-relaxed">
                  Complete audit trail for every submission and verification.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-4 rounded-2xl border border-[#E3EAE6] shadow-[0_2px_10px_rgba(20,81,58,0.04)] hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-xl bg-[#EBF3EF] text-[#14513A] flex items-center justify-center mb-3">
                  <Users2 className="w-5 h-5 text-[#14513A]" />
                </div>
                <h3 className="text-xs font-bold text-[#14233F] leading-tight">
                  Verifiable Student Records
                </h3>
                <p className="text-[11px] text-[#4B5563] mt-1.5 leading-relaxed">
                  Trusted academic data for institutions, regulators and other stakeholders.
                </p>
              </div>
            </div>

            {/* Security Advisory Pill at Bottom Left */}
            <div className="flex items-center gap-3 pt-2 text-xs text-[#4B5563]">
              <div className="w-7 h-7 rounded-full bg-[#EBF3EF] text-[#14513A] flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#1E9E5A]" />
              </div>
              <p className="text-[11px] leading-relaxed">
                For security, do not share your login credentials or OTP with anyone. AICTE officials will never ask for your password or OTP.
              </p>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LOGIN CARD ================= */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            
            {/* Quick Demo Access Bar */}
            <div className="bg-white/90 backdrop-blur-xs rounded-xl border border-[#D1DCD6] p-3 shadow-xs">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowDemoDrawer(!showDemoDrawer)}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-[#14513A]">
                  <Sparkles className="w-4 h-4 text-[#F5B335]" />
                  <span>Demo Access Quick Fill</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#8A94A0] transition-transform ${
                    showDemoDrawer ? 'rotate-180' : ''
                  }`}
                />
              </div>

              {showDemoDrawer && (
                <div className="mt-2.5 pt-2 border-t border-[#E3EAE6] grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleFillDemo('inst')}
                    className="p-2 rounded-lg bg-[#EBF3EF] hover:bg-[#DCEAE4] text-[#14513A] font-semibold text-left transition-colors cursor-pointer"
                  >
                    <span className="block text-[10px] text-[#8A94A0] uppercase font-bold">Institution Demo</span>
                    <span className="font-mono text-xs">INST102 / Demo@123</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('aicte')}
                    className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-left transition-colors cursor-pointer"
                  >
                    <span className="block text-[10px] text-amber-700 uppercase font-bold">AICTE Official</span>
                    <span className="font-mono text-xs">AICTE001 / Admin@123</span>
                  </button>
                </div>
              )}
            </div>

            {/* Main Auth Card */}
            <div className="bg-white rounded-2xl border border-[#E3EAE6] shadow-[0_8px_30px_rgba(20,81,58,0.06)] p-6 sm:p-8">
              {/* Card Header */}
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#14233F] tracking-tight">
                  Authorized Portal Access
                </h2>
                <p className="text-xs sm:text-sm text-[#4B5563] mt-1 leading-relaxed">
                  Enter your credentials to access student data management tools, using APAAR ID.
                </p>
              </div>

              {/* Login Tabs: Institution vs AICTE Official */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#F4F8F6] rounded-xl border border-[#E3EAE6] mb-6">
                <button
                  type="button"
                  onClick={() => handleTabChange('institution')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'institution'
                      ? 'bg-[#14513A] text-white shadow-sm'
                      : 'text-[#4B5563] hover:text-[#14233F] hover:bg-black/5'
                  }`}
                >
                  <Building2 className="w-4 h-4 flex-shrink-0" />
                  <span>Institution Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('aicte')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'aicte'
                      ? 'bg-[#14513A] text-white shadow-sm'
                      : 'text-[#4B5563] hover:text-[#14233F] hover:bg-black/5'
                  }`}
                >
                  <Landmark className="w-4 h-4 flex-shrink-0" />
                  <span>AICTE Official Login</span>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ID Input */}
                <div>
                  <label
                    htmlFor="login-identifier"
                    className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider block mb-1.5"
                  >
                    {activeTab === 'institution'
                      ? 'INSTITUTION ID / PERMANENT ID'
                      : 'AICTE OFFICER ID / USERNAME'}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3 text-[#8A94A0]">
                      {activeTab === 'institution' ? (
                        <Building2 className="w-4 h-4" />
                      ) : (
                        <Landmark className="w-4 h-4" />
                      )}
                    </div>
                    <input
                      id="login-identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        activeTab === 'institution'
                          ? 'Enter Institution ID / Permanent ID (e.g., INST102)'
                          : 'Enter AICTE Officer ID (e.g., AICTE001)'
                      }
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D1DCD6] text-sm text-[#14233F] placeholder:text-[#8A94A0] focus:border-[#14513A] focus:ring-2 focus:ring-[#14513A]/20 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider"
                    >
                      PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(true)}
                      className="text-xs text-[#14513A] hover:text-[#0E3B2A] font-semibold hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3 text-[#8A94A0]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D1DCD6] text-sm text-[#14233F] placeholder:text-[#8A94A0] focus:border-[#14513A] focus:ring-2 focus:ring-[#14513A]/20 transition-all outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-[#8A94A0] hover:text-[#14233F] cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#14513A] rounded border-[#D1DCD6] focus:ring-[#14513A] cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-xs text-[#4B5563] font-medium cursor-pointer">
                    Remember me
                  </label>
                </div>

                {/* Secure Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#14513A] hover:bg-[#0E3B2A] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] cursor-pointer disabled:opacity-60"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isLoading ? 'Authenticating...' : 'Secure Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* OR Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E3EAE6]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-[#8A94A0] font-bold tracking-widest">
                      OR
                    </span>
                  </div>
                </div>

                {/* Government SSO Button with Tricolor Flag */}
                <button
                  type="button"
                  onClick={() => setSsoModalOpen(true)}
                  className="w-full bg-white hover:bg-[#F4F8F6] border border-[#D1DCD6] text-[#14233F] font-semibold py-2.5 px-4 rounded-xl flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center gap-2.5">
                    {/* Tricolor Flag Icon Badge */}
                    <div className="w-5 h-3.5 rounded-xs overflow-hidden border border-gray-300 flex flex-col flex-shrink-0 shadow-2xs">
                      <div className="h-1/3 bg-[#FF9933]" />
                      <div className="h-1/3 bg-white flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full border border-[#000080]" />
                      </div>
                      <div className="h-1/3 bg-[#128807]" />
                    </div>
                    <span className="text-xs sm:text-[13px] font-medium text-[#14233F]">
                      Login with Government SSO (DigiLocker / MeriPehchaan)
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8A94A0] group-hover:text-[#14513A] transition-colors" />
                </button>
              </form>

              {/* Bottom Encrypted Badge Strip */}
              <div className="mt-6 pt-4 border-t border-[#E3EAE6] flex items-center justify-center gap-2 text-xs text-[#8A94A0]">
                <ShieldCheck className="w-4 h-4 text-[#1E9E5A]" />
                <span className="font-medium text-[11px]">
                  Encrypted session &bull; Authorized access only
                </span>
              </div>
            </div>

            {/* Employer / Regulator External Verification Link */}
            <div className="text-center py-1">
              <button
                type="button"
                onClick={() => navigate('/verify')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#14513A] hover:text-[#0E3B2A] hover:underline cursor-pointer"
              >
                <span>Authorized Employer / Regulator Verification Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#E3EAE6] bg-white py-5 px-4 sm:px-8 z-10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4B5563]">
          <div className="flex items-center gap-3">
            <AicteLogo size="sm" showLockup={false} />
            <div>
              <span className="font-bold text-[#14233F]">ADVAIT</span>
              <span className="hidden sm:inline"> &mdash; Trust in Every Record. Transparency in Every Step.</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button onClick={() => toast.info('Privacy Policy', 'AICTE APAAR adheres to the Digital Personal Data Protection (DPDP) Act 2023.')} className="hover:text-[#14513A] cursor-pointer">
              Privacy Policy
            </button>
            <span>&bull;</span>
            <button onClick={() => toast.info('Terms of Service', 'Access restricted to authorized institutional nodal officers and AICTE regulators.')} className="hover:text-[#14513A] cursor-pointer">
              Terms of Use
            </button>
            <span>&bull;</span>
            <button onClick={() => toast.info('Support Desk', 'Helpline: 011-29581000 | Email: apaar-support@aicte-india.org')} className="hover:text-[#14513A] cursor-pointer">
              Help Desk
            </button>
            <span>&bull;</span>
            <span>&copy; 2026 AICTE, Ministry of Education, Government of India</span>
          </div>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
      />

      {/* Government SSO Modal */}
      <SsoModal
        isOpen={ssoModalOpen}
        onClose={() => setSsoModalOpen(false)}
      />
    </div>
  );
};

