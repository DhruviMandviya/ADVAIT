import React, { useState } from 'react';
import { UserCog, Plus, Shield, Check, X, Edit, Trash2, KeyRound } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'AICTE Admin' | 'Institution Admin' | 'Data Operator' | 'Employer Verifier' | 'Regulator Auditor';
  organization: string;
  status: 'Active' | 'Deactivated';
  lastLogin: string;
}

export const UserManagement: React.FC = () => {
  const toast = useToast();

  const [users, setUsers] = useState<UserAccount[]>([
    {
      id: 'USR-001',
      name: 'Dr. R. K. Srivastav',
      email: 'rk.srivastav@aicte-india.org',
      role: 'AICTE Admin',
      organization: 'AICTE Headquarters New Delhi',
      status: 'Active',
      lastLogin: '2026-10-29 18:42 IST'
    },
    {
      id: 'USR-002',
      name: 'Dr. Sunil Bhirud',
      email: 'director@coep.ac.in',
      role: 'Institution Admin',
      organization: 'College of Engineering Pune (COEP)',
      status: 'Active',
      lastLogin: '2026-10-29 17:15 IST'
    },
    {
      id: 'USR-003',
      name: 'Mahesh K. Shinde',
      email: 'm.shinde@coep.ac.in',
      role: 'Data Operator',
      organization: 'College of Engineering Pune (COEP)',
      status: 'Active',
      lastLogin: '2026-10-28 14:02 IST'
    },
    {
      id: 'USR-004',
      name: 'Priyanka Ghosh',
      email: 'p.ghosh@tcs-verify.com',
      role: 'Employer Verifier',
      organization: 'Tata Consultancy Services Background Cell',
      status: 'Active',
      lastLogin: '2026-10-29 11:20 IST'
    },
    {
      id: 'USR-005',
      name: 'Prof. Anupama Nair',
      email: 'a.nair@nba-india.org',
      role: 'Regulator Auditor',
      organization: 'National Board of Accreditation (NBA)',
      status: 'Active',
      lastLogin: '2026-10-27 16:30 IST'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserAccount['role']>('Data Operator');
  const [newOrg, setNewOrg] = useState('');

  // RBAC Permission Matrix data
  const permissions = [
    { module: 'Student APAAR Ingestion', aicte: true, instAdmin: true, operator: true, verifier: false, regulator: false },
    { module: 'Validation Issue Override', aicte: true, instAdmin: true, operator: false, verifier: false, regulator: false },
    { module: 'Cross-Institution Resolution', aicte: true, instAdmin: false, operator: false, verifier: false, regulator: false },
    { module: 'Show-Cause Notice Issuance', aicte: true, instAdmin: false, operator: false, verifier: false, regulator: false },
    { module: 'National Policy Reports', aicte: true, instAdmin: false, operator: false, verifier: false, regulator: true },
    { module: 'Student Credential Verification', aicte: true, instAdmin: true, operator: false, verifier: true, regulator: true },
    { module: 'Security Audit Log Export', aicte: true, instAdmin: false, operator: false, verifier: false, regulator: true }
  ];

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserAccount = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: newName,
      email: newEmail,
      role: newRole,
      organization: newOrg || 'AICTE Authorized Organization',
      status: 'Active',
      lastLogin: 'Never'
    };
    setUsers([...users, newUser]);
    toast.success('User Added', `Created account for ${newName} as ${newRole}.`);
    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
  };

  const handleToggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const next = u.status === 'Active' ? 'Deactivated' : 'Active';
          toast.info('Status Changed', `User ${u.name} is now ${next}.`);
          return { ...u, status: next };
        }
        return u;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#1E9E5A] tracking-wider uppercase flex items-center gap-1.5">
            <UserCog className="w-4 h-4" />
            <span>Role-Based Access Control (RBAC)</span>
          </span>
          <h1 className="text-2xl font-bold text-[#14233F] tracking-tight">
            User Accounts &amp; Access Governance
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5">
            Granular authorization boundaries for AICTE Central Admins, Institution Officers, Data Operators, Employers, and Regulatory Bodies.
          </p>
        </div>

        <Button size="sm" onClick={() => setShowAddModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Add Authorized User
        </Button>
      </div>

      {/* RBAC Matrix Card */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-[#14233F] uppercase tracking-wider mb-3">
          Statutory RBAC Permission Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F8F6] text-[#8A94A0] uppercase font-bold text-[10px] border-b border-[#E3EAE6]">
              <tr>
                <th className="py-2.5 px-3">Platform Capability</th>
                <th className="py-2.5 px-3 text-center">AICTE Admin</th>
                <th className="py-2.5 px-3 text-center">Institution Admin</th>
                <th className="py-2.5 px-3 text-center">Data Operator</th>
                <th className="py-2.5 px-3 text-center">Employer Verifier</th>
                <th className="py-2.5 px-3 text-center">Regulator Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3EAE6] text-[#4B5563]">
              {permissions.map((p) => (
                <tr key={p.module} className="hover:bg-[#F4F8F6]">
                  <td className="py-2.5 px-3 font-semibold text-[#14233F]">{p.module}</td>
                  <td className="py-2.5 px-3 text-center">{p.aicte ? <Check className="w-4 h-4 text-[#1E9E5A] inline" /> : <X className="w-4 h-4 text-gray-300 inline" />}</td>
                  <td className="py-2.5 px-3 text-center">{p.instAdmin ? <Check className="w-4 h-4 text-[#1E9E5A] inline" /> : <X className="w-4 h-4 text-gray-300 inline" />}</td>
                  <td className="py-2.5 px-3 text-center">{p.operator ? <Check className="w-4 h-4 text-[#1E9E5A] inline" /> : <X className="w-4 h-4 text-gray-300 inline" />}</td>
                  <td className="py-2.5 px-3 text-center">{p.verifier ? <Check className="w-4 h-4 text-[#1E9E5A] inline" /> : <X className="w-4 h-4 text-gray-300 inline" />}</td>
                  <td className="py-2.5 px-3 text-center">{p.regulator ? <Check className="w-4 h-4 text-[#1E9E5A] inline" /> : <X className="w-4 h-4 text-gray-300 inline" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-[#E3EAE6]">
          <h3 className="text-sm font-bold text-[#14233F]">
            Active User Accounts ({users.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F8F6] text-[#8A94A0] uppercase font-bold text-[10px] border-b border-[#E3EAE6]">
              <tr>
                <th className="py-3 px-4">User Name &amp; ID</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Organization</th>
                <th className="py-3 px-3">Last Active</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3EAE6] font-medium text-[#4B5563]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#F4F8F6]">
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#14233F] block">{u.name}</span>
                    <span className="text-[10px] text-[#8A94A0]">{u.email}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs font-semibold text-[#14513A] bg-[#EBF3EF] px-2.5 py-0.5 rounded-full">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs">{u.organization}</td>
                  <td className="py-3 px-3 font-mono text-[10px] text-[#8A94A0]">{u.lastLogin}</td>
                  <td className="py-3 px-3">
                    <Badge variant={u.status === 'Active' ? 'success' : 'error'} size="sm" dot>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className="text-xs font-semibold text-[#14513A] hover:underline cursor-pointer"
                    >
                      {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add User Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Authorized Platform User"
          description="Grant credentials under AICTE Governance & Role Matrix."
          maxWidth="md"
        >
          <form onSubmit={handleAddUser} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Dr. Rajesh Kumar"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <Input
              label="Official Email"
              type="email"
              placeholder="e.g. rajesh.kumar@institution.edu"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            <div>
              <label className="text-xs font-bold text-[#14233F] uppercase tracking-wider block mb-1">
                Assign Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full rounded-xl border border-[#D1DCD6] px-3 py-2 text-xs bg-white outline-none"
              >
                <option value="AICTE Admin">AICTE Admin</option>
                <option value="Institution Admin">Institution Admin</option>
                <option value="Data Operator">Data Operator</option>
                <option value="Employer Verifier">Employer Verifier</option>
                <option value="Regulator Auditor">Regulator Auditor</option>
              </select>
            </div>
            <Input
              label="Organization / Institute"
              placeholder="e.g. IIT Bombay / AICTE Western Office"
              value={newOrg}
              onChange={(e) => setNewOrg(e.target.value)}
              required
            />
            <div className="flex items-center justify-end gap-3 pt-3">
              <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create User
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

