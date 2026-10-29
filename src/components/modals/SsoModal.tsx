import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Shield, Smartphone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

interface SsoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SsoModal: React.FC<SsoModalProps> = ({ isOpen, onClose }) => {
  const [ssoMethod, setSsoMethod] = useState<'aadhaar' | 'digilocker' | 'mobile'>('digilocker');
  const [accountInput, setAccountInput] = useState('COEP_REGISTRAR_PUNE');
  const [isVerifying, setIsVerifying] = useState(false);
  const { loginWithSso } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSsoAuthenticate = async () => {
    setIsVerifying(true);
    setTimeout(async () => {
      await loginWithSso(accountInput || 'GOV_NODAL_OFFICER');
      setIsVerifying(false);
      toast.success(
        'Government SSO Authenticated',
        'Authenticated via MeriPehchaan / DigiLocker National Gateway.'
      );
      onClose();
      navigate('/institution/dashboard');
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="MeriPehchaan — National Single Sign-On (NSSO)"
      description="Ministry of Electronics and Information Technology (MeitY) & AICTE Gateway"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Tricolor Emblem Banner */}
        <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-orange-50 via-white to-green-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            {/* Indian Flag Pill */}
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-300 flex flex-col shadow-xs">
              <div className="h-1/3 bg-[#FF9933]" />
              <div className="h-1/3 bg-white flex items-center justify-center">
                <div className="w-2 h-2 rounded-full border border-[#000080]" />
              </div>
              <div className="h-1/3 bg-[#128807]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#14233F] block">मेरी पहचान / MeriPehchaan</span>
              <span className="text-[11px] text-[#4B5563]">One Citizen, One Academic Identity</span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[#14513A] bg-emerald-100 px-2 py-0.5 rounded-full">
            DigiLocker Certified
          </span>
        </div>

        {/* Method selector */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSsoMethod('digilocker')}
            className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
              ssoMethod === 'digilocker'
                ? 'border-[#14513A] bg-[#EBF3EF] text-[#14513A]'
                : 'border-[#E3EAE6] bg-white text-[#4B5563] hover:border-gray-300'
            }`}
          >
            DigiLocker ID
          </button>
          <button
            type="button"
            onClick={() => setSsoMethod('aadhaar')}
            className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
              ssoMethod === 'aadhaar'
                ? 'border-[#14513A] bg-[#EBF3EF] text-[#14513A]'
                : 'border-[#E3EAE6] bg-white text-[#4B5563] hover:border-gray-300'
            }`}
          >
            Aadhaar / Virtual ID
          </button>
          <button
            type="button"
            onClick={() => setSsoMethod('mobile')}
            className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
              ssoMethod === 'mobile'
                ? 'border-[#14513A] bg-[#EBF3EF] text-[#14513A]'
                : 'border-[#E3EAE6] bg-white text-[#4B5563] hover:border-gray-300'
            }`}
          >
            Registered Mobile
          </button>
        </div>

        <div>
          <label className="text-xs font-bold text-[#14233F] uppercase tracking-wider block mb-1.5">
            {ssoMethod === 'digilocker'
              ? 'DigiLocker Username / Email'
              : ssoMethod === 'aadhaar'
              ? '12-Digit Aadhaar / VID'
              : 'Registered Mobile Number (+91)'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={accountInput}
              onChange={(e) => setAccountInput(e.target.value)}
              className="w-full rounded-xl border border-[#D1DCD6] px-3.5 py-2.5 text-sm text-[#14233F] focus:border-[#14513A] focus:ring-2 focus:ring-[#14513A]/20 outline-none"
              placeholder={
                ssoMethod === 'digilocker'
                  ? 'e.g. nodal_officer_coep'
                  : ssoMethod === 'aadhaar'
                  ? 'XXXX-XXXX-XXXX'
                  : '98XXXXXXXX'
              }
            />
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-[#4B5563] flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-[#14513A] flex-shrink-0 mt-0.5" />
          <span>
            MeriPehchaan verifies your role with AICTE Institutional Approval Master Database before issuing the authorized token.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSsoAuthenticate}
            isLoading={isVerifying}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Authenticate via MeriPehchaan
          </Button>
        </div>
      </div>
    </Modal>
  );
};

