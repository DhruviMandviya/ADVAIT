/**
 * ADVAIT — AICTE APAAR Platform API Service Layer
 * 
 * This service encapsulates all remote HTTP network calls.
 * To connect to a live backend (e.g. Node.js/Go/Java Spring AICTE backend),
 * update `USE_MOCK = false` and set `BASE_URL` to your production endpoint.
 */

import { Student, Institution, AnomalyItem, AuditLog, ConsentRecord, ComplianceCase } from '../types';

const USE_MOCK = true;
const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://api.aicte-india.org/advait/v1';

export const apiClient = {
  // Authentication
  login: async (id: string, pass: string, role: string) => {
    if (USE_MOCK) {
      // Local authentication simulated in AuthContext
      return { token: 'mock_jwt_token_advait_2026', role, id };
    }
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password: pass, role })
    });
    return res.json();
  },

  // Student Endpoints
  getStudents: async (institutionId?: string): Promise<Student[]> => {
    if (USE_MOCK) {
      const stored = localStorage.getItem('advait_students_v2');
      if (stored) return JSON.parse(stored);
      return [];
    }
    const url = institutionId
      ? `${BASE_URL}/students?institutionId=${institutionId}`
      : `${BASE_URL}/students`;
    const res = await fetch(url);
    return res.json();
  },

  createStudent: async (studentData: Partial<Student>): Promise<Student> => {
    if (USE_MOCK) {
      // Handled in DataContext
      return studentData as Student;
    }
    const res = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    return res.json();
  },

  verifyApaar: async (apaarId: string) => {
    if (USE_MOCK) {
      const stored = localStorage.getItem('advait_students_v2');
      const list: Student[] = stored ? JSON.parse(stored) : [];
      const clean = apaarId.replace(/\s+/g, '');
      const match = list.find((s) => s.apaarId.replace(/\s+/g, '') === clean);
      return match || null;
    }
    const res = await fetch(`${BASE_URL}/verify/${apaarId}`);
    return res.json();
  },

  // Institutions
  getInstitutions: async (): Promise<Institution[]> => {
    if (USE_MOCK) {
      const stored = localStorage.getItem('advait_institutions_v2');
      if (stored) return JSON.parse(stored);
      return [];
    }
    const res = await fetch(`${BASE_URL}/institutions`);
    return res.json();
  },

  // Anomalies & Notices
  issueNotice: async (institutionId: string, directiveText: string) => {
    if (USE_MOCK) {
      return { success: true, timestamp: new Date().toISOString() };
    }
    const res = await fetch(`${BASE_URL}/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ institutionId, directiveText })
    });
    return res.json();
  },

  // ================= COMPLIANCE CASE MANAGEMENT API =================
  getCases: async (institutionId?: string): Promise<ComplianceCase[]> => {
    if (USE_MOCK) {
      const stored = localStorage.getItem('advait_compliance_cases_v2');
      if (stored) {
        const all: ComplianceCase[] = JSON.parse(stored);
        if (institutionId) {
          return all.filter((c) => c.institutionIds.includes(institutionId));
        }
        return all;
      }
      return [];
    }
    const url = institutionId
      ? `${BASE_URL}/cases?institutionId=${institutionId}`
      : `${BASE_URL}/cases`;
    const res = await fetch(url);
    return res.json();
  },

  getCaseById: async (caseId: string): Promise<ComplianceCase | null> => {
    if (USE_MOCK) {
      const stored = localStorage.getItem('advait_compliance_cases_v2');
      if (stored) {
        const all: ComplianceCase[] = JSON.parse(stored);
        return all.find((c) => c.id === caseId) || null;
      }
      return null;
    }
    const res = await fetch(`${BASE_URL}/cases/${caseId}`);
    return res.json();
  },

  raiseCaseNotice: async (caseId: string, noticeData: any) => {
    if (USE_MOCK) {
      // Delegated to DataContext for live state & storage synchronization
      return { success: true, noticeId: `NOT-${Date.now()}` };
    }
    const res = await fetch(`${BASE_URL}/cases/${caseId}/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noticeData)
    });
    return res.json();
  },

  submitCaseResponse: async (caseId: string, noticeId: string, responseData: any) => {
    if (USE_MOCK) {
      return { success: true, responseId: `RESP-${Date.now()}` };
    }
    const res = await fetch(`${BASE_URL}/cases/${caseId}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noticeId, ...responseData })
    });
    return res.json();
  },

  reviewCase: async (caseId: string, reviewData: any) => {
    if (USE_MOCK) {
      return { success: true, timestamp: new Date().toISOString() };
    }
    const res = await fetch(`${BASE_URL}/cases/${caseId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    return res.json();
  }
};
