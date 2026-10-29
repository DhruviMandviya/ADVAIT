import React, { useState } from 'react';
import { Building2, Mail, Phone, MapPin, Award, CheckCircle2, Shield, Calendar, Edit3 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export const InstitutionProfile: React.FC = () => {
  const { user } = useAuth();
  const { institutions } = useData();
  const toast = useToast();

  const currentInst =
    institutions.find((i) => i.id === (user?.institutionId || 'INST102')) || institutions[0];

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [headName, setHeadName] = useState(currentInst.headName);
  const [headEmail, setHeadEmail] = useState(currentInst.headEmail);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Institutional Profile Updated', 'Saved Nodal Officer contact updates.');
    setEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#1E9E5A] tracking-wider uppercase">
            AICTE Approval Master Data
          </span>
          <h1 className="text-2xl font-bold text-[#14233F] tracking-tight">
            Institution Profile &amp; Quota Parameters
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5">
            Synchronized with AICTE Central Database for Academic Year 2026-27.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditModalOpen(true)}
          leftIcon={<Edit3 className="w-4 h-4 text-[#14513A]" />}
        >
          Edit Nodal Contact
        </Button>
      </div>

      {/* Main Institution Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#E3EAE6]">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EBF3EF] text-[#14513A] flex items-center justify-center flex-shrink-0 border border-[#D1DCD6]">
              <Building2 className="w-8 h-8 text-[#14513A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1E9E5A] bg-[#EBF3EF] px-2.5 py-0.5 rounded-full uppercase">
                  AICTE Permanent ID: {currentInst.permanentId}
                </span>
                <Badge variant="success" dot>Approved &bull; Active</Badge>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#14233F] mt-1.5">
                {currentInst.name}
              </h2>
              <p className="text-xs text-[#8A94A0] mt-0.5">
                AISHE Code: {currentInst.aisheCode} &bull; Established: {currentInst.establishedYear} &bull; Type: {currentInst.type}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-xs text-[#4B5563]">
          <div>
            <span className="text-[#8A94A0] uppercase font-bold text-[10px] block">
              Campus Location
            </span>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-[#14513A] flex-shrink-0" />
              <span className="font-semibold text-[#14233F]">
                Wellesley Road, Shivajinagar, {currentInst.city}, {currentInst.state} &ndash; 411005
              </span>
            </div>
          </div>

          <div>
            <span className="text-[#8A94A0] uppercase font-bold text-[10px] block">
              Head of Institution / Director
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4 text-[#14513A] flex-shrink-0" />
              <div>
                <span className="font-bold text-[#14233F] block">{headName}</span>
                <span className="text-[11px] text-[#8A94A0]">{headEmail}</span>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[#8A94A0] uppercase font-bold text-[10px] block">
              AICTE Regional Office
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Shield className="w-4 h-4 text-[#14513A] flex-shrink-0" />
              <div>
                <span className="font-bold text-[#14233F] block">Western Regional Office (WRO)</span>
                <span className="text-[11px] text-[#8A94A0]">Industrial Assurance Bldg., Mumbai</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quota Sanction Card */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-[#14233F] mb-4">
          Sanctioned Seat Capacity &amp; Supernumerary Quotas
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#F4F8F6] border border-[#E3EAE6]">
            <span className="text-[10px] font-bold text-[#8A94A0] uppercase block">Sanctioned Intake</span>
            <span className="text-2xl font-black text-[#14233F] mt-1 block">{currentInst.approvedIntake}</span>
            <span className="text-[11px] text-[#4B5563]">Total Approved Seats</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F8F6] border border-[#E3EAE6]">
            <span className="text-[10px] font-bold text-[#8A94A0] uppercase block">Supernumerary Limit (15%)</span>
            <span className="text-2xl font-black text-[#14513A] mt-1 block">{currentInst.supernumeraryCap}</span>
            <span className="text-[11px] text-[#4B5563]">Statutory Maximum Cap</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F8F6] border border-[#E3EAE6]">
            <span className="text-[10px] font-bold text-[#8A94A0] uppercase block">NRI Quota Enrolled</span>
            <span className="text-2xl font-black text-[#14233F] mt-1 block">{currentInst.nriStudents}</span>
            <span className="text-[11px] text-[#4B5563]">Verified in APAAR</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F4F8F6] border border-[#E3EAE6]">
            <span className="text-[10px] font-bold text-[#8A94A0] uppercase block">Foreign National (FN)</span>
            <span className="text-2xl font-black text-[#14233F] mt-1 block">{currentInst.fnStudents}</span>
            <span className="text-[11px] text-[#4B5563]">Verified with MEA/MHA</span>
          </div>
        </div>
      </Card>

      {/* Edit Nodal Contact Modal */}
      {editModalOpen && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Update Nodal Officer Contact"
          description="Designate the official authorized to submit and verify APAAR student rosters."
          maxWidth="md"
        >
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Director / Nodal Officer Name"
              value={headName}
              onChange={(e) => setHeadName(e.target.value)}
              required
            />
            <Input
              label="Official Institutional Email"
              type="email"
              value={headEmail}
              onChange={(e) => setHeadEmail(e.target.value)}
              required
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Updates
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

