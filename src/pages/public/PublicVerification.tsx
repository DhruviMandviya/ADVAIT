import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Award,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Building2,
  ArrowRight,
  Lock,
  RotateCw,
  QrCode,
  FileCheck
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { AicteLogo } from '../../components/common/AicteLogo';
import { AdvaitWordmark } from '../../components/common/AdvaitWordmark';
import { WatermarkBg } from '../../components/common/WatermarkBg';
import { TopAnnouncement } from '../../components/common/TopAnnouncement';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Student } from '../../types';

export const PublicVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const initialApaar = searchParams.get('apaar') || '';

  const { students } = useData();
  const toast = useToast();
  const navigate = useNavigate();

  const [queryInput, setQueryInput] = useState(initialApaar || initialCode || '9824 5510 8392');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedStudent, setVerifiedStudent] = useState<Student | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verified' | 'not_found' | 'flagged'>('idle');

  // Math Captcha state
  const [captchaQuestion, setCaptchaQuestion] = useState({ a: 7, b: 5 });

  const refreshCaptcha = () => {
    const a = Math.floor(2 + Math.random() * 8);
    const b = Math.floor(1 + Math.random() * 9);
    setCaptchaQuestion({ a, b });
    setCaptchaAnswer('');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) {
      toast.error('Input Required', 'Please enter a 12-digit APAAR ID or Verification Token.');
      return;
    }

    if (parseInt(captchaAnswer) !== captchaQuestion.a + captchaQuestion.b) {
      toast.error('CAPTCHA Failed', 'Please solve the math verification challenge correctly.');
      refreshCaptcha();
      return;
    }

    if (!consentAccepted) {
      toast.error('Consent Affirmation Required', 'You must affirm authorized background check intent under DPDP Act.');
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('idle');
    setVerifiedStudent(null);

    setTimeout(() => {
      setIsVerifying(false);

      const cleanQuery = queryInput.replace(/\s+/g, '').toLowerCase();

      // Look for matching student by APAAR ID or verification code or roll number
      const match = students.find((s) => {
        const cleanApaar = s.apaarId.replace(/\s+/g, '').toLowerCase();
        const cleanCode = s.verificationCode.toLowerCase();
        const cleanStudentId = s.studentId.toLowerCase();

        return cleanApaar === cleanQuery || cleanCode === cleanQuery || cleanStudentId === cleanQuery;
      });

      if (match) {
        setVerifiedStudent(match);
        if (match.status === 'Validated') {
          setVerificationStatus('verified');
          toast.success('Credential Authenticated', `Official verification confirmed for ${match.name}.`);
        } else {
          setVerificationStatus('flagged');
          toast.warning('Discrepancy Detected', 'Record is currently under institutional review or audit flag.');
        }
      } else {
        setVerificationStatus('not_found');
        toast.error('Record Not Found', 'No student registered with this APAAR ID in the AICTE Central Repository.');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4F8F6] to-white flex flex-col relative overflow-x-hidden">
      <WatermarkBg />
      <TopAnnouncement slim={true} />

      {/* Top Navbar */}
      <header className="bg-white border-b border-[#E3EAE6] py-3.5 px-4 sm:px-8 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AicteLogo size="md" showLockup={true} />
            <div className="hidden sm:block h-6 w-px bg-[#D1DCD6]" />
            <div className="hidden sm:block">
              <span className="font-extrabold text-sm text-[#14233F]">ADVAIT</span>
              <span className="text-xs text-[#14513A] font-semibold block">
                Trust in Every Record. Transparency in Every Step.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
              Portal Sign In &rarr;
            </Button>
          </div>
        </div>
      </header>

      {/* Verification Hero Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 z-10 space-y-8">
        
        {/* Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#EBF3EF] border border-[#D1DCD6] text-[#14513A] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#1E9E5A]" />
            <span>Public Academic Registry Verification</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#14233F] tracking-tight">
            Verify AICTE Student Academic Credentials
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] max-w-xl mx-auto leading-relaxed">
            Authorized portal for employers, verification agencies, state regulators, and foreign universities to authenticate degree admissions against India's 12-digit APAAR ID.
          </p>
        </div>

        {/* Verification Form Card */}
        <Card className="p-6 sm:p-8 shadow-md">
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-[#14233F] uppercase tracking-wider block mb-1.5">
                12-DIGIT APAAR ID OR VERIFICATION CODE *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Enter 12-digit APAAR ID (e.g. 9824 5510 8392) or Token (ADV-V893-K9201)"
                  className="w-full py-3 px-4 rounded-xl border border-[#D1DCD6] text-sm text-[#14233F] font-mono focus:border-[#14513A] focus:ring-2 focus:ring-[#14513A]/20 outline-none"
                  required
                />
              </div>
              <span className="text-[11px] text-[#8A94A0] mt-1 block">
                Demo sample APAAR: <strong className="text-[#14513A]">9824 5510 8392</strong> (Valid) or <strong className="text-[#D64545]">7721 9043 1184</strong> (Cross-institution duplicate)
              </span>
            </div>

            {/* Anti-Bot Challenge & Consent */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Math Captcha */}
              <div className="bg-[#F4F8F6] p-3.5 rounded-xl border border-[#E3EAE6] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8A94A0] uppercase font-bold block">
                    Security Challenge
                  </span>
                  <span className="text-sm font-bold text-[#14233F]">
                    {captchaQuestion.a} + {captchaQuestion.b} = ?
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    placeholder="Result"
                    className="w-20 p-2 text-center text-xs font-bold border border-[#D1DCD6] rounded-lg bg-white outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="p-2 text-[#8A94A0] hover:text-[#14513A]"
                    title="Refresh Math Challenge"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Consent check */}
              <div className="flex items-center p-3.5 bg-[#F4F8F6] rounded-xl border border-[#E3EAE6]">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#4B5563]">
                  <input
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="w-4 h-4 text-[#14513A] rounded border-[#D1DCD6] mt-0.5"
                  />
                  <span>
                    I declare authorized entity status and have obtained student consent under DPDP Act 2023.
                  </span>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isVerifying}
              className="w-full py-3.5 text-base"
              leftIcon={<Search className="w-5 h-5" />}
            >
              Verify Credential Authenticity
            </Button>
          </form>
        </Card>

        {/* ================= RESULT CARD ================= */}
        {verificationStatus === 'verified' && verifiedStudent && (
          <Card className="p-6 sm:p-8 border-2 border-[#1E9E5A] bg-[#FFFFFF] shadow-lg animate-in fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3EAE6]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#14513A] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-7 h-7 text-[#1E9E5A]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#1E9E5A] uppercase tracking-wider block">
                    AICTE APAAR Authenticated Record
                  </span>
                  <h3 className="text-xl font-extrabold text-[#14233F]">
                    {verifiedStudent.name}
                  </h3>
                </div>
              </div>

              <Badge variant="success" size="md">
                Verified &bull; Authentic
              </Badge>
            </div>

            {/* Privacy-Preserving Limited Fields Grid (Protects Private PII) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#4B5563]">
              <div>
                <span className="text-[#8A94A0] uppercase font-bold text-[10px] block">
                  12-Digit APAAR ID
                </span>
                <span className="font-mono text-sm font-black text-[#14513A]">
                  {verifiedStudent.apaarId}
                </span>
              </div>

              <div>
                <span className="text-[#8A94A0] uppercase font-bold text-[10px] block">
                  Institutional Roll Number
                </span>
                <span className="font-mono text-sm font-bold text-[#14233F]">
                  {verifiedStudent.studentId}
                </span>
              </div>

              <div>
                <span className="text-[#8A94A0] uppercase font-bold text-[10px] block">
                  Approved Institution Name
                </span>
                <span className="font-bold text-[#14233F]">{verifiedStudent.institutionName}</span>
                <span className="text-[10px] text-[#8A94A0] block">State: {verifiedStudent.state}</span>
              </div>

              <div>
                <span className="text-[#8A94A0] uppercase font-bold text-[10px] block">
                  Degree Programme &amp; Specialization
                </span>
                <span className="font-bold text-[#14233F]">
                  {verifiedStudent.programme} &mdash; {verifiedStudent.course}
                </span>
              </div>

              <div>
                <span className="text-[#8A94A0] uppercase font-bold text-[10px] block">
                  Academic Year
                </span>
                <span className="font-medium text-[#14233F]">Current Year: {verifiedStudent.year}</span>
              </div>

              <div>
                <span className="text-[#8A94A0] uppercase font-bold text-[10px] block">
                  Verification Timestamp
                </span>
                <span className="font-mono text-[11px] text-[#14233F]">
                  {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                </span>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="p-3 bg-[#F4F8F6] rounded-xl border border-[#D1DCD6] text-[11px] text-[#4B5563] flex items-center justify-between">
              <span>
                Personal data (Aadhaar, contact, exact DOB) masked in accordance with DPDP Act.
              </span>
              <span className="font-mono font-bold text-[#14513A]">{verifiedStudent.verificationCode}</span>
            </div>
          </Card>
        )}

        {/* Flagged Status */}
        {verificationStatus === 'flagged' && verifiedStudent && (
          <Card className="p-6 border-2 border-amber-300 bg-amber-50/50 space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-[#F5B335] flex-shrink-0" />
              <div>
                <h3 className="text-base font-bold text-[#14233F]">
                  Record Under Institutional Discrepancy Review
                </h3>
                <p className="text-xs text-amber-900 mt-0.5">
                  The APAAR ID was located, but is flagged under an active compliance notice: <em>"{verifiedStudent.flagReason}"</em>
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Not Found */}
        {verificationStatus === 'not_found' && (
          <Card className="p-6 border-2 border-rose-300 bg-rose-50/50 text-center space-y-3">
            <XCircle className="w-10 h-10 text-[#D64545] mx-auto" />
            <h3 className="text-base font-bold text-[#14233F]">No Record Found in AICTE Registry</h3>
            <p className="text-xs text-[#4B5563] max-w-md mx-auto">
              The identifier you provided does not match any validated student enrollment submitted by AICTE-approved institutions.
            </p>
          </Card>
        )}

      </main>

      {/* Public Footer */}
      <footer className="w-full border-t border-[#E3EAE6] bg-white py-5 px-4 text-center text-xs text-[#8A94A0] z-10 mt-auto">
        <span>&copy; 2026 All India Council for Technical Education, Ministry of Education, Government of India</span>
      </footer>
    </div>
  );
};

