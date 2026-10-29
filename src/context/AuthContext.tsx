import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  role: Role | null;
  login: (id: string, pass: string, roleType: 'institution' | 'aicte') => Promise<{ success: boolean; error?: string }>;
  loginWithSso: (digiLockerId: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'advait_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading stored auth user', e);
    }
    // Default to logged-out state so user sees the login page first
    return null;
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error writing auth user to localStorage', e);
    }
  }, [user]);

  const login = async (id: string, pass: string, roleType: 'institution' | 'aicte'): Promise<{ success: boolean; error?: string }> => {
    const cleanId = id.trim().toUpperCase();

    if (roleType === 'institution') {
      // Demo institution INST102 / Demo@123
      if (cleanId === 'INST102' && pass === 'Demo@123') {
        const instUser: User = {
          id: 'INST102',
          name: 'Dr. Sunil Bhirud',
          email: 'director@coep.ac.in',
          role: 'institution',
          institutionId: 'INST102',
          institutionName: 'College of Engineering Pune (COEP Technological University)',
          designation: 'Director & Institution Admin'
        };
        setUser(instUser);
        return { success: true };
      }
      // Allow any INSTxxx for demo flexibility if password is Demo@123
      if (cleanId.startsWith('INST') && pass === 'Demo@123') {
        const instUser: User = {
          id: cleanId,
          name: 'Authorized Institution Officer',
          email: `${cleanId.toLowerCase()}@aicte-portal.in`,
          role: 'institution',
          institutionId: cleanId,
          institutionName: `${cleanId} Technical Campus`,
          designation: 'Nodal Verification Officer'
        };
        setUser(instUser);
        return { success: true };
      }
      return { success: false, error: 'Invalid Institution ID or Password. Demo: INST102 / Demo@123' };
    }

    if (roleType === 'aicte') {
      // Demo AICTE AICTE001 / Admin@123
      if (cleanId === 'AICTE001' && pass === 'Admin@123') {
        const aicteUser: User = {
          id: 'AICTE001',
          name: 'Dr. R. K. Srivastav',
          email: 'rk.srivastav@aicte-india.org',
          role: 'aicte',
          designation: 'Senior Director, Approval & APAAR Bureau',
          institutionName: 'AICTE New Delhi HQ'
        };
        setUser(aicteUser);
        return { success: true };
      }
      return { success: false, error: 'Invalid AICTE Officer ID or Password. Demo: AICTE001 / Admin@123' };
    }

    return { success: false, error: 'Unknown authentication category' };
  };

  const loginWithSso = async (digiLockerId: string): Promise<boolean> => {
    // Simulated Government SSO via MeriPehchaan / DigiLocker
    const ssoUser: User = {
      id: 'SSO-GOV-982',
      name: 'Dr. S. K. Narayanan (DigiLocker Verified)',
      email: `${digiLockerId.toLowerCase()}@meripehchaan.gov.in`,
      role: 'institution',
      institutionId: 'INST102',
      institutionName: 'College of Engineering Pune (COEP Technological University)',
      designation: 'SSO Authorized Institutional Officer'
    };
    setUser(ssoUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchRole = (newRole: Role) => {
    if (newRole === 'institution') {
      setUser({
        id: 'INST102',
        name: 'Dr. Sunil Bhirud',
        email: 'director@coep.ac.in',
        role: 'institution',
        institutionId: 'INST102',
        institutionName: 'College of Engineering Pune (COEP Technological University)',
        designation: 'Director & Institution Admin'
      });
    } else if (newRole === 'aicte') {
      setUser({
        id: 'AICTE001',
        name: 'Dr. R. K. Srivastav',
        email: 'rk.srivastav@aicte-india.org',
        role: 'aicte',
        designation: 'Senior Director, Approval & APAAR Bureau',
        institutionName: 'AICTE New Delhi HQ'
      });
    } else {
      setUser({
        id: 'VERIF-091',
        name: 'Verification Officer',
        email: 'verifier@employer-portal.org',
        role: 'verifier',
        designation: 'Authorized Background Verifier'
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role: user ? user.role : null,
        login,
        loginWithSso,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

