import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { AicteLogo } from '../components/common/AicteLogo';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F4F8F6] flex flex-col items-center justify-center p-6 text-center">
      <AicteLogo size="lg" showLockup={false} className="mb-6" />
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#D64545] flex items-center justify-center mb-4 border border-rose-200">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-[#14233F]">404 &mdash; Page Not Found</h1>
      <p className="text-sm text-[#4B5563] mt-2 max-w-md">
        The requested pathway does not exist on the ADVAIT AICTE APAAR Platform or has been moved to a restricted regulatory registry.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={() => navigate('/login')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Return to Portal
        </Button>
      </div>
    </div>
  );
};

