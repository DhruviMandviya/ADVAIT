import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Mail, KeyRound, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error('Identifier Required', 'Please enter your registered Institution or Officer ID.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('verify');
      toast.info('OTP Dispatched', 'A 6-digit security code has been sent to the registered email/mobile.');
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join('').length < 6 || !newPassword) {
      toast.error('Incomplete Fields', 'Please enter the 6-digit OTP and your new password.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('success');
      toast.success('Password Reset Successful', 'You can now sign in with your updated credentials.');
    }, 900);
  };

  const handleClose = () => {
    setStep('request');
    setIdentifier('');
    setOtp(['', '', '', '', '', '']);
    setNewPassword('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'success' ? 'Password Reset Complete' : 'Reset Portal Credentials'}
      description="Official credential recovery for AICTE-approved institutions and officials."
      maxWidth="md"
    >
      {step === 'request' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <p className="text-xs text-[#4B5563] leading-relaxed">
            Enter your Permanent Institution ID (e.g., <span className="font-semibold text-[#14513A]">INST102</span>) or AICTE Officer ID. A time-based verification token will be dispatched to the authorized registrar email.
          </p>

          <Input
            label="INSTITUTION ID / OFFICIAL ID"
            placeholder="e.g. INST102 or AICTE001"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-[#8A94A0]" />}
            required
          />

          <div className="bg-[#EBF3EF] p-3 rounded-xl border border-[#D1DCD6] flex items-start gap-2.5 text-xs text-[#14513A]">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#1E9E5A]" />
            <span>AICTE multi-factor recovery guarantees tamper-proof verification via government email servers.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} rightIcon={<KeyRound className="w-4 h-4" />}>
              Send Recovery OTP
            </Button>
          </div>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-xs text-[#4B5563]">
            Enter the 6-digit verification code sent to the contact associated with <strong className="text-[#14233F]">{identifier}</strong>. (Demo: use any 6 numbers like <span className="font-bold text-[#14513A]">123456</span>)
          </p>

          <div>
            <label className="text-xs font-bold text-[#14233F] uppercase tracking-wider block mb-2">
              6-Digit One-Time Password (OTP)
            </label>
            <div className="flex gap-2 justify-between">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const newOtp = [...otp];
                    newOtp[i] = val;
                    setOtp(newOtp);
                    if (val && i < 5) {
                      document.getElementById(`otp-${i + 1}`)?.focus();
                    }
                  }}
                  className="w-11 h-12 text-center text-lg font-bold border border-[#D1DCD6] rounded-xl focus:border-[#14513A] focus:ring-2 focus:ring-[#14513A]/20 outline-none"
                />
              ))}
            </div>
          </div>

          <Input
            type="password"
            label="NEW SECURE PASSWORD"
            placeholder="Minimum 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<KeyRound className="w-4 h-4 text-[#8A94A0]" />}
            required
          />

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep('request')}
              className="text-xs text-[#14513A] hover:underline font-medium"
            >
              Back
            </button>
            <Button type="submit" isLoading={isLoading}>
              Update Password
            </Button>
          </div>
        </form>
      )}

      {step === 'success' && (
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-[#1E9E5A] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-[#14233F]">Password Reset Complete</h4>
            <p className="text-xs text-[#4B5563] mt-1 max-w-sm mx-auto">
              Your credentials for <strong className="text-[#14233F]">{identifier}</strong> have been updated. You can now log in securely.
            </p>
          </div>
          <Button onClick={handleClose} className="w-full">
            Proceed to Sign In
          </Button>
        </div>
      )}
    </Modal>
  );
};

