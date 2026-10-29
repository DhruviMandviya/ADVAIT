import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  LogOut,
  User,
  Shield,
  Building2,
  ExternalLink,
  ChevronDown,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  Menu,
  RotateCw,
  RotateCcw,
  ShieldAlert,
  Info
} from 'lucide-react';
import { AicteLogo } from '../common/AicteLogo';
import { AdvaitWordmark } from '../common/AdvaitWordmark';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { user, logout, switchRole, role } = useAuth();
  const { anomalies, revalidateAll, notifications, markNotificationRead, clearAllNotifications, resetToDefaults } = useData();
  const toast = useToast();
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Institution vs AICTE scoped notifications
  const userNotifications = role === 'institution'
    ? notifications.filter((n) => !n.institutionId || n.institutionId === user?.institutionId)
    : notifications;
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    toast.info('Logged Out', 'You have been safely signed out from ADVAIT.');
    navigate('/login');
  };

  const handleQuickRevalidate = () => {
    const res = revalidateAll();
    toast.success('System Re-validation Executed', `Checked ${res.total} records across APAAR registry (${res.flagged} flagged).`);
  };

  const handleExecuteReset = async () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      resetToDefaults();
      toast.success(
        'Demo Environment Restored',
        'ADVAIT demonstration data has been successfully restored to its pristine sample baseline.'
      );
      setShowResetModal(false);
    } catch (err) {
      toast.error('Reset Failed', 'An error occurred while restoring demonstration data.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E3EAE6] shadow-2xs">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Mobile hamburger + Branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-[#4B5563] hover:text-[#14233F] hover:bg-[#F4F8F6]"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate(role === 'aicte' ? '/aicte/dashboard' : '/institution/dashboard')}
            >
              <AicteLogo size="md" showLockup={false} />
              <div className="hidden sm:block h-6 w-px bg-[#D1DCD6]" />
              <AdvaitWordmark size="md" showTagline={false} />
            </div>
          </div>

          {/* Right: Actions, Notifications, User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Re-validate Button */}
            <button
              onClick={handleQuickRevalidate}
              title="Run Automated Validation Check"
              className="p-2 rounded-xl text-[#4B5563] hover:text-[#14513A] hover:bg-[#EBF3EF] transition-colors cursor-pointer"
              aria-label="Re-validate data"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                className="relative p-2 rounded-xl text-[#4B5563] hover:text-[#14233F] hover:bg-[#F4F8F6] transition-colors cursor-pointer"
                aria-label="Open notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D64545] ring-2 ring-white" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E3EAE6] shadow-xl py-3 z-50 animate-in fade-in">
                  <div className="px-4 py-2 border-b border-[#E3EAE6] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#14233F] uppercase tracking-wider">
                      Regulatory Alerts &amp; Directives
                    </span>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-rose-50 text-[#D64545] font-semibold px-2 py-0.5 rounded-full">
                          {unreadCount} Unread
                        </span>
                      )}
                      <button
                        onClick={clearAllNotifications}
                        className="text-[10px] text-[#8A94A0] hover:text-[#14233F] underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                    {userNotifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#8A94A0]">
                        No new notifications. All regulatory communications up to date.
                      </div>
                    ) : (
                      userNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            setNotificationsOpen(false);
                            navigate(notif.link || (role === 'aicte' ? '/aicte/cases' : '/institution/validation'));
                          }}
                          className={`p-3 hover:bg-[#F4F8F6] cursor-pointer transition-colors flex items-start gap-3 ${
                            !notif.read ? 'bg-emerald-50/30' : ''
                          }`}
                        >
                          {notif.type === 'notice' ? (
                            <ShieldAlert className="w-4 h-4 text-[#D64545] flex-shrink-0 mt-0.5" />
                          ) : notif.type === 'resolution' ? (
                            <CheckCircle2 className="w-4 h-4 text-[#1E9E5A] flex-shrink-0 mt-0.5" />
                          ) : notif.type === 'urgent' ? (
                            <AlertTriangle className="w-4 h-4 text-[#F5B335] flex-shrink-0 mt-0.5" />
                          ) : (
                            <Info className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-[#14233F] truncate">{notif.title}</p>
                              {!notif.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#14513A] flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-[#4B5563] line-clamp-2 mt-0.5">{notif.message}</p>
                            <span className="text-[10px] text-[#8A94A0] mt-1 block">{notif.timestamp}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 border-t border-[#E3EAE6] text-center">
                    <button
                      onClick={() => {
                        setNotificationsOpen(false);
                        navigate(role === 'aicte' ? '/aicte/cases' : '/institution/validation');
                      }}
                      className="text-xs text-[#14513A] font-semibold hover:underline"
                    >
                      Open Compliance &amp; Resolution Center &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill & Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-[#D1DCD6] hover:border-[#14513A] bg-white hover:bg-[#F4F8F6] transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#14513A] text-white flex items-center justify-center text-xs font-bold">
                  {user?.role === 'aicte' ? 'A' : 'I'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-[#14233F] leading-tight truncate max-w-[120px]">
                    {user?.name || 'Authorized Officer'}
                  </p>
                  <p className="text-[10px] text-[#8A94A0] uppercase font-semibold">
                    {user?.role === 'aicte' ? 'AICTE Admin' : user?.institutionId || 'Institution'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#8A94A0] hidden sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#E3EAE6] shadow-xl py-2 z-50 animate-in fade-in">
                  <div className="px-4 py-3 border-b border-[#E3EAE6]">
                    <p className="text-xs font-bold text-[#14233F]">{user?.name}</p>
                    <p className="text-[11px] text-[#4B5563] mt-0.5">{user?.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF3EF] text-[#14513A]">
                      <Shield className="w-3 h-3 text-[#1E9E5A]" />
                      <span>{user?.role === 'aicte' ? 'AICTE Official' : 'Institution Admin'}</span>
                    </div>
                  </div>

                  {/* Switch Role Fast Toggle */}
                  <div className="px-4 py-2 border-b border-[#E3EAE6]">
                    <span className="text-[10px] font-bold text-[#8A94A0] uppercase tracking-wider block mb-1.5">
                      Switch Active Portal
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          switchRole('institution');
                          setProfileOpen(false);
                          toast.info('Role Switched', 'Viewing as Institution Admin (INST102)');
                          navigate('/institution/dashboard');
                        }}
                        className={`flex-1 text-[11px] py-1 rounded-lg border font-semibold ${
                          role === 'institution'
                            ? 'bg-[#14513A] text-white border-[#14513A]'
                            : 'bg-white text-[#4B5563] border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        Institution
                      </button>
                      <button
                        onClick={() => {
                          switchRole('aicte');
                          setProfileOpen(false);
                          toast.info('Role Switched', 'Viewing as AICTE Central Bureau');
                          navigate('/aicte/dashboard');
                        }}
                        className={`flex-1 text-[11px] py-1 rounded-lg border font-semibold ${
                          role === 'aicte'
                            ? 'bg-[#14513A] text-white border-[#14513A]'
                            : 'bg-white text-[#4B5563] border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        AICTE HQ
                      </button>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate('/verify');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#4B5563] hover:bg-[#F4F8F6] hover:text-[#14233F] flex items-center justify-between cursor-pointer"
                    >
                      <span>Public Verification Portal</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#8A94A0]" />
                    </button>

                    {/* Reset Demo Data (Between Public Verification Portal & Sign Out) */}
                    {(user?.role === 'institution' || user?.role === 'aicte') && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          setShowResetModal(true);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-amber-800 hover:bg-amber-50/80 flex items-center gap-2 font-medium transition-colors cursor-pointer border-t border-b border-gray-100 my-0.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>Reset Demo Data</span>
                      </button>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-[#D64545] hover:bg-rose-50 flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Reset Demo Data Confirmation Modal */}
      {showResetModal && (
        <Modal
          isOpen={showResetModal}
          onClose={() => !isResetting && setShowResetModal(false)}
          title="Reset Demo Data?"
          description="Administrative Demonstration Environment Recovery"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed space-y-1">
                <strong className="block font-bold">Restore Baseline Sample State</strong>
                <p>
                  This will restore the ADVAIT demonstration environment to its original sample state. Demo records, test transactions, and demonstration workflow changes may be cleared or restored. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3EAE6]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleExecuteReset}
                disabled={isResetting}
                className="text-xs flex items-center gap-1.5 bg-amber-700 hover:bg-amber-800 border-amber-700 text-white font-medium"
              >
                {isResetting ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Resetting Environment...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Demo Data</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </header>
  );
};

