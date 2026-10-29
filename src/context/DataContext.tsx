import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Student,
  Institution,
  AnomalyItem,
  CrossDuplicate,
  AuditLog,
  ConsentRecord,
  ComplianceCase,
  CaseStatus,
  ComplianceNotice,
  InstitutionResponse,
  CaseAuditEntry,
  CaseEvidenceItem,
  ResponseDocument,
  StudentCorrectionPayload,
  OfficerReviewFeedback,
  InAppNotification
} from '../types';
import { mockInstitutions } from '../data/mockInstitutions';
import { mockStudents } from '../data/mockStudents';
import { mockAnomalies, mockCrossDuplicates } from '../data/mockAnomalies';
import { mockAuditLogs } from '../data/mockAuditLogs';
import { mockConsentRecords } from '../data/mockConsentLogs';
import { mockComplianceCases } from '../data/mockComplianceCases';

interface DataContextValue {
  students: Student[];
  institutions: Institution[];
  anomalies: AnomalyItem[];
  crossDuplicates: CrossDuplicate[];
  auditLogs: AuditLog[];
  consentRecords: ConsentRecord[];
  cases: ComplianceCase[];
  // Student actions
  addStudent: (student: Omit<Student, 'id' | 'verificationCode' | 'status'>) => Student;
  batchAddStudents: (newStudents: Partial<Student>[]) => { added: number; flagged: number };
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  // Validation actions
  fixValidationIssue: (id: string, updates: Partial<Student>) => void;
  dismissValidationIssue: (id: string, reason?: string) => void;
  revalidateAll: () => { total: number; flagged: number };
  // AICTE actions
  resolveCrossDuplicate: (apaarId: string, resolution: 'Flag Both' | 'Verify Primary' | 'Revoke Secondary') => void;
  raiseNotice: (institutionId: string, noticeText: string) => void;
  markAnomalyReviewed: (anomalyId: string) => void;
  // Compliance Case Management actions
  raiseCaseNotice: (
    caseId: string,
    noticeData: {
      institutionId?: string;
      title?: string;
      description: string;
      correctiveAction: string;
      deadlineDate: string;
      assignedOfficer?: string;
      officerRole?: string;
      evidence?: CaseEvidenceItem[];
    },
    officer?: { name: string; role: string; email?: string }
  ) => { success: boolean; case?: ComplianceCase; notice?: ComplianceNotice; message: string };
  submitInstitutionResponse: (
    caseId: string,
    institutionId: string,
    responseData: {
      explanation: string;
      actionTaken?: string;
      documents?: ResponseDocument[];
      studentCorrections?: StudentCorrectionPayload[];
      submittedBy?: string;
    }
  ) => { success: boolean; case?: ComplianceCase; response?: InstitutionResponse; message: string };
  reviewCaseByOfficer: (
    caseId: string,
    feedback: {
      decision: 'Under AICTE Review' | 'Further Action Required' | 'Resolved' | 'Escalated';
      remarks: string;
      findings?: string;
      newDeadlineDate?: string;
    },
    officer?: { name: string; role: string }
  ) => { success: boolean; case?: ComplianceCase; message: string };
  addOfficerRemarks: (caseId: string, remarks: string, officerName?: string, officerRole?: string) => { success: boolean; message: string };
  escalateCase: (caseId: string, reason: string, officerName?: string) => { success: boolean; message: string };
  requestCaseClarification: (
    caseId: string,
    noticeId: string,
    query: string,
    submittedBy?: string
  ) => { success: boolean; message: string; case?: ComplianceCase };
  requestDeadlineExtension: (
    caseId: string,
    noticeId: string,
    requestedDate: string,
    justification: string,
    submittedBy?: string
  ) => { success: boolean; message: string; case?: ComplianceCase };
  notifications: InAppNotification[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  getCasesForInstitution: (institutionId: string) => ComplianceCase[];
  getCaseById: (caseId: string) => ComplianceCase | undefined;
  activeNoticesCountForInstitution: (institutionId: string) => number;
  casesNeedingReviewCountForAicte: () => number;
  // Consent
  toggleConsent: (studentId: string) => void;
  // Audit
  logAuditEvent: (action: string, target: string, details: string, actor?: string, role?: string) => void;
  resetToDefaults: () => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

const STUDENTS_KEY = 'advait_students_v2';
const INSTITUTIONS_KEY = 'advait_institutions_v2';
const ANOMALIES_KEY = 'advait_anomalies_v2';
const CROSS_DUPES_KEY = 'advait_cross_dupes_v2';
const AUDIT_KEY = 'advait_audit_logs_v2';
const CONSENT_KEY = 'advait_consent_logs_v2';
const CASES_KEY = 'advait_compliance_cases_v2';
const NOTIFICATIONS_KEY = 'advait_notifications_v2';

const defaultNotifications: InAppNotification[] = [
  {
    id: 'NOTIF-001',
    title: 'AICTE Show-Cause Notice Dispatched',
    message: 'Notice F.No. AICTE/AB/CASE-2026-002/NOT-01 issued regarding Dual Enrolment. Mandated reply deadline: 2026-11-20.',
    timestamp: '2026-10-23 09:30 IST',
    type: 'notice',
    link: '/institution/validation',
    read: false,
    institutionId: 'INST102'
  },
  {
    id: 'NOTIF-002',
    title: 'Regulatory Format Flag: 8-Digit APAAR',
    message: 'Student record STU-2024-004 contains truncated 8-digit APAAR code. Rectification required.',
    timestamp: '2026-10-24 10:12 IST',
    type: 'urgent',
    link: '/institution/validation',
    read: false,
    institutionId: 'INST102'
  },
  {
    id: 'NOTIF-003',
    title: 'Show-Cause Directive: Over-Quota Intake',
    message: 'Notice F.No. AICTE/AB/CASE-2026-001/NOT-01 dispatched to RVCE (+90 seats over-quota). Response due 2026-11-15.',
    timestamp: '2026-10-16 10:00 IST',
    type: 'notice',
    link: '/institution/validation',
    read: false,
    institutionId: 'INST104'
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const stored = localStorage.getItem(STUDENTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading stored students', e);
    }
    return mockStudents;
  });

  const [institutions, setInstitutions] = useState<Institution[]>(() => {
    try {
      const stored = localStorage.getItem(INSTITUTIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading stored institutions', e);
    }
    return mockInstitutions;
  });

  const [anomalies, setAnomalies] = useState<AnomalyItem[]>(() => {
    try {
      const stored = localStorage.getItem(ANOMALIES_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading stored anomalies', e);
    }
    return mockAnomalies;
  });

  const [crossDuplicates, setCrossDuplicates] = useState<CrossDuplicate[]>(() => {
    try {
      const stored = localStorage.getItem(CROSS_DUPES_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading stored cross duplicates', e);
    }
    return mockCrossDuplicates;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const stored = localStorage.getItem(AUDIT_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading stored audit logs', e);
    }
    return mockAuditLogs;
  });

  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading stored consent records', e);
    }
    return mockConsentRecords;
  });

  const [cases, setCases] = useState<ComplianceCase[]>(() => {
    try {
      const stored = localStorage.getItem(CASES_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading stored compliance cases', e);
    }
    return mockComplianceCases;
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading stored notifications', e);
    }
    return defaultNotifications;
  });

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    } catch (e) {
      console.error(e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(INSTITUTIONS_KEY, JSON.stringify(institutions));
    } catch (e) {
      console.error(e);
    }
  }, [institutions]);

  useEffect(() => {
    try {
      localStorage.setItem(ANOMALIES_KEY, JSON.stringify(anomalies));
    } catch (e) {
      console.error(e);
    }
  }, [anomalies]);

  useEffect(() => {
    try {
      localStorage.setItem(CROSS_DUPES_KEY, JSON.stringify(crossDuplicates));
    } catch (e) {
      console.error(e);
    }
  }, [crossDuplicates]);

  useEffect(() => {
    try {
      localStorage.setItem(AUDIT_KEY, JSON.stringify(auditLogs));
    } catch (e) {
      console.error(e);
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consentRecords));
    } catch (e) {
      console.error(e);
    }
  }, [consentRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(CASES_KEY, JSON.stringify(cases));
    } catch (e) {
      console.error(e);
    }
  }, [cases]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const logAuditEvent = useCallback((action: string, target: string, details: string, actor = 'System Officer', role = 'User') => {
    const newLog: AuditLog = {
      id: `AUD-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      actor,
      role,
      action,
      target,
      details,
      ipAddress: '14.139.111.4',
      hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  }, []);

  const addStudent = useCallback((data: Omit<Student, 'id' | 'verificationCode' | 'status'>): Student => {
    const rawApaar = data.apaarId.replace(/\D/g, '');
    let status: Student['status'] = 'Validated';
    let flagReason: string | undefined;
    let flagType: Student['flagType'] | undefined;

    // 1. Format check: 12 numeric digits
    if (rawApaar.length !== 12) {
      status = 'Flagged';
      flagReason = `Invalid APAAR ID (${rawApaar.length} digits). Must be exactly 12 numeric digits.`;
      flagType = 'invalid_apaar';
    } else {
      // 2. Check for duplicate APAAR within the institution
      const duplicate = students.find((s) => s.apaarId.replace(/\D/g, '') === rawApaar && s.institutionId === data.institutionId);
      if (duplicate) {
        status = 'Flagged';
        flagReason = `Duplicate APAAR ID within institution. Already assigned to ${duplicate.name} (${duplicate.studentId}).`;
        flagType = 'duplicate_record';
      }
      // 3. Check cross-institution duplication
      const crossInstDuplicate = students.find((s) => s.apaarId.replace(/\D/g, '') === rawApaar && s.institutionId !== data.institutionId);
      if (crossInstDuplicate) {
        status = 'Flagged';
        flagReason = `Potential duplicate enrolment across institutions. APAAR matches active student record at ${crossInstDuplicate.institutionName}.`;
        flagType = 'cross_institution';
      }
    }

    const newId = `STU-2024-${(students.length + 1).toString().padStart(3, '0')}`;
    const code = `ADV-V${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newStudent: Student = {
      ...data,
      id: newId,
      status,
      flagReason,
      flagType,
      verificationCode: code
    };

    setStudents((prev) => [newStudent, ...prev]);
    logAuditEvent('STUDENT_SINGLE_ADDED', newStudent.id, `Enrolled ${newStudent.name} (${newStudent.programme}) with status: ${newStudent.status}`);
    return newStudent;
  }, [students, logAuditEvent]);

  const batchAddStudents = useCallback((rawList: Partial<Student>[]): { added: number; flagged: number } => {
    let addedCount = 0;
    let flaggedCount = 0;

    const newStudents: Student[] = rawList.map((item, idx) => {
      const rawApaar = (item.apaarId || '').replace(/\D/g, '');
      let status: Student['status'] = 'Validated';
      let flagReason: string | undefined;
      let flagType: Student['flagType'] | undefined;

      if (rawApaar.length !== 12) {
        status = 'Flagged';
        flagReason = `Invalid APAAR ID: length is ${rawApaar.length}, expected 12 digits.`;
        flagType = 'invalid_apaar';
        flaggedCount++;
      } else {
        const existing = students.find((s) => s.apaarId.replace(/\D/g, '') === rawApaar);
        if (existing) {
          status = 'Flagged';
          if (existing.institutionId === item.institutionId) {
            flagReason = `Duplicate APAAR ID in institution: matches ${existing.studentId}`;
            flagType = 'duplicate_record';
          } else {
            flagReason = `Cross-institution duplicate: matches record at ${existing.institutionName}`;
            flagType = 'cross_institution';
          }
          flaggedCount++;
        } else {
          addedCount++;
        }
      }

      const id = `STU-2024-${(students.length + idx + 1).toString().padStart(3, '0')}`;
      return {
        id,
        apaarId: item.apaarId || '9999 0000 1111',
        studentId: item.studentId || `INST/2024/${id}`,
        name: item.name || 'Unnamed Student',
        dob: item.dob || '2004-01-01',
        gender: item.gender || 'Male',
        programme: item.programme || 'B.Tech',
        course: item.course || 'Computer Science and Engineering',
        year: item.year || 1,
        category: item.category || 'General',
        institutionId: item.institutionId || 'INST102',
        institutionName: item.institutionName || 'College of Engineering Pune (COEP Technological University)',
        admissionDate: item.admissionDate || '2024-08-01',
        quotaType: item.quotaType || 'Regular',
        status,
        flagReason,
        flagType,
        verificationCode: `ADV-VBATCH-${Math.floor(1000 + Math.random() * 9000)}`,
        consentGranted: true,
        consentDate: '2024-08-01',
        fatherName: item.fatherName || 'Parent Guardian',
        state: item.state || 'Maharashtra'
      } as Student;
    });

    setStudents((prev) => [...newStudents, ...prev]);
    logAuditEvent('BATCH_STUDENT_UPLOAD', `Batch size: ${rawList.length}`, `Added ${rawList.length} records (${addedCount} valid, ${flaggedCount} flagged).`);
    return { added: addedCount, flagged: flaggedCount };
  }, [students, logAuditEvent]);

  const updateStudent = useCallback((updated: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    logAuditEvent('STUDENT_UPDATED', updated.id, `Updated details for ${updated.name}`);
  }, [logAuditEvent]);

  const deleteStudent = useCallback((id: string) => {
    const student = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    logAuditEvent('STUDENT_DELETED', id, `Removed student record for ${student?.name || id}`);
  }, [students, logAuditEvent]);

  const fixValidationIssue = useCallback((id: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            ...updates,
            status: 'Validated',
            flagReason: undefined,
            flagType: undefined
          };
        }
        return s;
      })
    );
    logAuditEvent('VALIDATION_ISSUE_FIXED', id, `Manually resolved validation flags for record ${id}`);
  }, [logAuditEvent]);

  const dismissValidationIssue = useCallback((id: string, reason?: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status: 'Validated',
            flagReason: reason ? `Dismissed: ${reason}` : undefined,
            flagType: undefined
          };
        }
        return s;
      })
    );
    logAuditEvent('VALIDATION_ISSUE_DISMISSED', id, `Dismissed flag: ${reason || 'Institution acknowledged override'}`);
  }, [logAuditEvent]);

  const revalidateAll = useCallback((): { total: number; flagged: number } => {
    let flagged = 0;
    const rechecked = students.map((s) => {
      const raw = s.apaarId.replace(/\D/g, '');
      if (raw.length !== 12) {
        flagged++;
        return {
          ...s,
          status: 'Flagged' as const,
          flagReason: 'Invalid APAAR format: must be 12 digits.',
          flagType: 'invalid_apaar' as const
        };
      }
      return s;
    });
    setStudents(rechecked);
    logAuditEvent('SYSTEM_REVALIDATION_TRIGGERED', 'All Records', `Re-validated ${students.length} records. Identified ${flagged} issues.`);
    return { total: students.length, flagged };
  }, [students, logAuditEvent]);

  const resolveCrossDuplicate = useCallback((apaarId: string, resolution: 'Flag Both' | 'Verify Primary' | 'Revoke Secondary') => {
    setCrossDuplicates((prev) =>
      prev.map((cd) => (cd.apaarId === apaarId ? { ...cd, status: resolution === 'Verify Primary' ? 'Primary Verified' : 'Resolved' } : cd))
    );

    // Also link to any existing cross duplicate case
    setCases((prev) =>
      prev.map((c) => {
        if (c.linkedApaarId === apaarId || c.issueType === 'Cross-Institution Conflict') {
          const newStatus: CaseStatus = resolution === 'Verify Primary' ? 'Resolved' : 'Further Action Required';
          const auditEntry: CaseAuditEntry = {
            id: `AUD-CD-${Date.now()}`,
            caseId: c.id,
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
            actor: 'AICTE Approval Bureau',
            role: 'AICTE Admin',
            action: 'CROSS_DUPLICATE_RESOLVED',
            previousStatus: c.status,
            newStatus,
            remarks: `Dual enrollment resolution applied: ${resolution}`,
            hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
          };
          return {
            ...c,
            status: newStatus,
            updatedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
            history: [auditEntry, ...c.history]
          };
        }
        return c;
      })
    );

    logAuditEvent('CROSS_DUPLICATE_RESOLVED', `APAAR: ${apaarId}`, `AICTE resolved dual enrolment dispute: ${resolution}`);
  }, [logAuditEvent]);

  const raiseNotice = useCallback((institutionId: string, noticeText: string) => {
    setInstitutions((prev) =>
      prev.map((inst) => (inst.id === institutionId ? { ...inst, complianceStatus: 'Notice-Issued' } : inst))
    );
    setAnomalies((prev) =>
      prev.map((anom) => (anom.institutionId === institutionId ? { ...anom, status: 'Notice Issued' } : anom))
    );
    logAuditEvent('SHOW_CAUSE_NOTICE_ISSUED', institutionId, noticeText);
  }, [logAuditEvent]);

  const markAnomalyReviewed = useCallback((anomalyId: string) => {
    // Keep 'Mark Reviewed' separate from 'Mark as Resolved'. Reviewing an anomaly must not automatically resolve it.
    setAnomalies((prev) =>
      prev.map((anom) => (anom.id === anomalyId ? { ...anom, status: 'Under Review' } : anom))
    );
    setCases((prev) =>
      prev.map((c) => {
        if (c.linkedAnomalyId === anomalyId && c.status === 'Flagged') {
          return {
            ...c,
            status: 'Under AICTE Review',
            updatedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST'
          };
        }
        return c;
      })
    );
    logAuditEvent('ANOMALY_REVIEWED', anomalyId, 'Official marked anomaly under bureau review (not resolved).');
  }, [logAuditEvent]);

  const addOfficerRemarks = useCallback(
    (caseId: string, remarks: string, officerName = 'Dr. R. K. Srivastav', officerRole = 'AICTE Admin') => {
      const nowStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
      const targetCase = cases.find((c) => c.id === caseId);
      if (!targetCase) return { success: false, message: 'Case not found' };

      const auditEntry: CaseAuditEntry = {
        id: `AUD-REM-${Date.now()}`,
        caseId,
        timestamp: nowStr,
        actor: officerName,
        role: officerRole,
        action: 'OFFICER_REMARKS_ADDED',
        previousStatus: targetCase.status,
        newStatus: targetCase.status,
        remarks: remarks.trim(),
        hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      };

      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, history: [auditEntry, ...c.history], updatedAt: nowStr } : c))
      );
      logAuditEvent('OFFICER_REMARKS_ADDED', caseId, remarks, officerName, officerRole);
      return { success: true, message: 'Official remarks recorded.' };
    },
    [cases, logAuditEvent]
  );

  const escalateCase = useCallback(
    (caseId: string, reason: string, officerName = 'Dr. R. K. Srivastav') => {
      const nowStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
      const targetCase = cases.find((c) => c.id === caseId);
      if (!targetCase) return { success: false, message: 'Case not found' };

      const auditEntry: CaseAuditEntry = {
        id: `AUD-ESC-${Date.now()}`,
        caseId,
        timestamp: nowStr,
        actor: officerName,
        role: 'AICTE Admin',
        action: 'CASE_ESCALATED',
        previousStatus: targetCase.status,
        newStatus: 'Escalated',
        remarks: reason || 'Escalated to National Approval Committee for statutory sanctions.',
        hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      };

      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, status: 'Escalated', history: [auditEntry, ...c.history], updatedAt: nowStr } : c))
      );
      logAuditEvent('CASE_ESCALATED', caseId, reason, officerName, 'AICTE Admin');
      return { success: true, message: `Case ${caseId} escalated to Council Appellate Body.` };
    },
    [cases, logAuditEvent]
  );

  // ================= COMPLIANCE CASE ACTIONS =================

  const raiseCaseNotice = useCallback(
    (
      caseId: string,
      noticeData: {
        institutionId?: string;
        title?: string;
        description: string;
        correctiveAction: string;
        deadlineDate: string;
        assignedOfficer?: string;
        officerRole?: string;
        evidence?: CaseEvidenceItem[];
      },
      officer?: { name: string; role: string; email?: string }
    ) => {
      const targetCase = cases.find((c) => c.id === caseId);
      if (!targetCase) {
        return { success: false, message: `Compliance case ${caseId} not found.` };
      }

      const targetInstId = noticeData.institutionId || targetCase.primaryInstitutionId;
      const targetInstName = targetCase.institutionNames[targetInstId] || 'Associated Institution';

      // Duplicate Notice Prevention check
      const existingActiveNotice = targetCase.notices.find(
        (n) => n.institutionId === targetInstId && n.status === 'Active'
      );
      if (existingActiveNotice) {
        return {
          success: false,
          message: `Notice ${existingActiveNotice.orderNumber} is already active for this institution. Additional duplicate notices cannot be issued while pending response.`
        };
      }

      const noticeId = `NOT-2026-${Math.floor(100 + Math.random() * 900)}`;
      const orderNumber = `F.No. AICTE/AB/${caseId}/${noticeId}`;
      const officerName = officer?.name || noticeData.assignedOfficer || targetCase.assignedOfficer?.name || 'Dr. R. K. Srivastav';
      const officerRole = officer?.role || noticeData.officerRole || targetCase.assignedOfficer?.role || 'Senior Director, Approval & APAAR Bureau';
      const nowStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';

      const newNotice: ComplianceNotice = {
        id: noticeId,
        caseId,
        institutionId: targetInstId,
        institutionName: targetInstName,
        orderNumber,
        issueDate: nowStr,
        responseDeadline: noticeData.deadlineDate || '2026-11-20',
        assignedOfficer: officerName,
        officerRole,
        noticeDescription: noticeData.description,
        supportingEvidence: noticeData.evidence?.[0]?.details || targetCase.metric || 'Documented compliance discrepancy flagged by AICTE heuristic engine.',
        correctiveAction: noticeData.correctiveAction,
        status: 'Active'
      };

      const auditEntry: CaseAuditEntry = {
        id: `AUD-NOT-${Date.now()}`,
        caseId,
        timestamp: nowStr,
        actor: officerName,
        role: officerRole,
        action: 'NOTICE_ISSUED',
        previousStatus: targetCase.status,
        newStatus: 'Notice Issued',
        remarks: `Dispatched formal regulatory show-cause notice ${orderNumber} with deadline ${noticeData.deadlineDate}.`,
        hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      };

      const updatedCase: ComplianceCase = {
        ...targetCase,
        status: 'Notice Issued',
        notices: [newNotice, ...targetCase.notices],
        history: [auditEntry, ...targetCase.history],
        updatedAt: nowStr
      };

      // Update case
      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? updatedCase : c))
      );

      // Update linked anomaly if present
      if (targetCase.linkedAnomalyId) {
        setAnomalies((prev) =>
          prev.map((a) => (a.id === targetCase.linkedAnomalyId ? { ...a, status: 'Notice Issued' } : a))
        );
      }

      // Update institution compliance status
      setInstitutions((prev) =>
        prev.map((i) => (i.id === targetInstId ? { ...i, complianceStatus: 'Notice-Issued' } : i))
      );

      logAuditEvent(
        'SHOW_CAUSE_NOTICE_ISSUED',
        `${targetInstId} (${orderNumber})`,
        `Assigned: ${officerName} | Due: ${noticeData.deadlineDate} | Case: ${caseId}`,
        officerName,
        officerRole
      );

      // In-app notification for the target institution
      const instNoticeNotif: InAppNotification = {
        id: `NOTIF-${Date.now()}`,
        title: 'New AICTE Show-Cause Notice Dispatched',
        message: `Formal notice ${orderNumber} issued by ${officerName}. Action required by ${noticeData.deadlineDate}.`,
        timestamp: nowStr,
        type: 'notice',
        link: '/institution/validation',
        read: false,
        institutionId: targetInstId
      };
      setNotifications((prev) => [instNoticeNotif, ...prev]);

      return {
        success: true,
        case: updatedCase,
        notice: newNotice,
        message: `Notice ${orderNumber} has been officially issued and dispatched to ${targetInstName}.`
      };
    },
    [cases, logAuditEvent]
  );

  const submitInstitutionResponse = useCallback(
    (
      caseId: string,
      institutionId: string,
      responseData: {
        explanation: string;
        actionTaken?: string;
        documents?: ResponseDocument[];
        studentCorrections?: StudentCorrectionPayload[];
        submittedBy?: string;
      }
    ) => {
      const targetCase = cases.find((c) => c.id === caseId);
      if (!targetCase) {
        return { success: false, message: `Compliance case ${caseId} not found.` };
      }

      // Role & Boundary Enforcement: Verify institution belongs to case.institutionIds
      if (!targetCase.institutionIds.includes(institutionId)) {
        return {
          success: false,
          message: `Security Boundary Violation: Institution ${institutionId} is not an authorized party to Case ${caseId}.`
        };
      }

      const activeNotice = targetCase.notices.find(
        (n) => n.institutionId === institutionId && n.status === 'Active'
      );
      const noticeId = activeNotice?.id || targetCase.notices[0]?.id || `NOT-REF-${Date.now()}`;
      const instName = targetCase.institutionNames[institutionId] || 'Institution';
      const nowStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
      const respId = `RESP-2026-${Math.floor(100 + Math.random() * 900)}`;

      const newResponse: InstitutionResponse = {
        id: respId,
        caseId,
        noticeId,
        institutionId,
        institutionName: instName,
        submittedBy: responseData.submittedBy || 'Registrar / Academic Authority',
        submittedAt: nowStr,
        submissionNumber: (targetCase.responses?.length || 0) + 1,
        explanation: responseData.explanation,
        actionTaken: responseData.actionTaken || 'Submitted institutional explanation and verification documents.',
        supportingDocuments: responseData.documents || [],
        correctedStudentUpdates: responseData.studentCorrections || []
      };

      const auditEntry: CaseAuditEntry = {
        id: `AUD-RESP-${Date.now()}`,
        caseId,
        timestamp: nowStr,
        actor: responseData.submittedBy || instName,
        role: 'Institution Admin',
        action: 'RESPONSE_SUBMITTED',
        previousStatus: targetCase.status,
        newStatus: 'Response Submitted',
        remarks: `Response submission #${newResponse.submissionNumber} filed with ${responseData.documents?.length || 0} supporting documents. Reason: ${responseData.explanation.substring(0, 80)}...`,
        hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      };

      const updatedCase: ComplianceCase = {
        ...targetCase,
        status: 'Response Submitted',
        responses: [newResponse, ...(targetCase.responses || [])],
        notices: targetCase.notices.map((n) => (n.id === noticeId ? { ...n, status: 'Responded' as const } : n)),
        history: [auditEntry, ...targetCase.history],
        updatedAt: nowStr
      };

      // Critical requirement: Resubmission must enter 'Response Submitted' or 'Under AICTE Review', NEVER automatically become verified/resolved.
      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? updatedCase : c))
      );

      // If student corrections are provided, update student record state with a pending note, but do NOT mark Validated yet!
      if (responseData.studentCorrections && responseData.studentCorrections.length > 0) {
        setStudents((prev) =>
          prev.map((s) => {
            const correction = responseData.studentCorrections?.find((c) => c.studentId === s.studentId || c.studentId === s.id);
            if (correction) {
              return {
                ...s,
                apaarId: correction.apaarId || s.apaarId,
                name: correction.name || s.name,
                course: correction.course || s.course,
                flagReason: `[Pending AICTE Approval]: ${correction.statusNote || 'Correction submitted by institution'}`
              };
            }
            return s;
          })
        );
      }

      logAuditEvent(
        'INSTITUTION_COMPLIANCE_RESPONSE',
        `${caseId} (${instName})`,
        `Submitted institutional response #${newResponse.submissionNumber} for Notice ${noticeId}. Queued for AICTE Officer review.`,
        responseData.submittedBy || instName,
        'Institution Admin'
      );

      // In-app notification for AICTE Officer
      const notif: InAppNotification = {
        id: `NOTIF-${Date.now()}`,
        title: 'Institution Compliance Response Filed',
        message: `${instName} submitted formal response #${newResponse.submissionNumber} for Case ${caseId}.`,
        timestamp: nowStr,
        type: 'review',
        link: '/aicte/cases',
        read: false
      };
      setNotifications((prev) => [notif, ...prev]);

      return {
        success: true,
        case: updatedCase,
        response: newResponse,
        message: 'Response and supporting documentation submitted successfully. Case is now under AICTE Review.'
      };
    },
    [cases, logAuditEvent]
  );

  const requestCaseClarification = useCallback(
    (caseId: string, noticeId: string, query: string, submittedBy = 'Institution Nodal Officer') => {
      const targetCase = cases.find((c) => c.id === caseId);
      if (!targetCase) return { success: false, message: 'Case not found' };

      const nowStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
      const clarId = `CLR-${Date.now()}`;
      const clarification = {
        id: clarId,
        noticeId,
        institutionId: targetCase.primaryInstitutionId,
        submittedAt: nowStr,
        query: query.trim(),
        status: 'Pending' as const
      };

      const auditEntry: CaseAuditEntry = {
        id: `AUD-CLR-${Date.now()}`,
        caseId,
        timestamp: nowStr,
        actor: submittedBy,
        role: 'Institution Admin',
        action: 'CLARIFICATION_REQUESTED',
        previousStatus: targetCase.status,
        newStatus: targetCase.status,
        remarks: `Institution requested clarification on Notice ${noticeId}: "${query.trim().substring(0, 90)}..."`,
        hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      };

      const updatedNotices = targetCase.notices.map((n) => {
        if (n.id === noticeId) {
          return {
            ...n,
            clarifications: [clarification, ...(n.clarifications || [])]
          };
        }
        return n;
      });

      const updatedCase: ComplianceCase = {
        ...targetCase,
        notices: updatedNotices,
        history: [auditEntry, ...targetCase.history],
        updatedAt: nowStr
      };

      setCases((prev) => prev.map((c) => (c.id === caseId ? updatedCase : c)));
      logAuditEvent('NOTICE_CLARIFICATION_REQUESTED', noticeId, query, submittedBy, 'Institution Admin');

      const notif: InAppNotification = {
        id: `NOTIF-${Date.now()}`,
        title: 'Institution Clarification Query Received',
        message: `${targetCase.institutionNames[targetCase.primaryInstitutionId] || 'Institution'} requested clarification for Notice ${noticeId}: "${query.substring(0, 80)}..."`,
        timestamp: nowStr,
        type: 'info',
        link: '/aicte/cases',
        read: false
      };
      setNotifications((prev) => [notif, ...prev]);

      return {
        success: true,
        case: updatedCase,
        message: 'Clarification query successfully submitted to AICTE Bureau Officer.'
      };
    },
    [cases, logAuditEvent]
  );

  const requestDeadlineExtension = useCallback(
    (caseId: string, noticeId: string, requestedDate: string, justification: string, submittedBy = 'Institution Nodal Officer') => {
      const targetCase = cases.find((c) => c.id === caseId);
      if (!targetCase) return { success: false, message: 'Case not found' };

      const nowStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
      const extId = `EXT-${Date.now()}`;
      const extRequest = {
        id: extId,
        noticeId,
        institutionId: targetCase.primaryInstitutionId,
        submittedAt: nowStr,
        requestedDeadline: requestedDate,
        justification: justification.trim(),
        status: 'Pending' as const
      };

      const auditEntry: CaseAuditEntry = {
        id: `AUD-EXT-${Date.now()}`,
        caseId,
        timestamp: nowStr,
        actor: submittedBy,
        role: 'Institution Admin',
        action: 'DEADLINE_EXTENSION_REQUESTED',
        previousStatus: targetCase.status,
        newStatus: targetCase.status,
        remarks: `Institution requested deadline extension to ${requestedDate}. Justification: ${justification.trim().substring(0, 90)}...`,
        hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      };

      const updatedNotices = targetCase.notices.map((n) => {
        if (n.id === noticeId) {
          return {
            ...n,
            extensionRequests: [extRequest, ...(n.extensionRequests || [])]
          };
        }
        return n;
      });

      const updatedCase: ComplianceCase = {
        ...targetCase,
        notices: updatedNotices,
        history: [auditEntry, ...targetCase.history],
        updatedAt: nowStr
      };

      setCases((prev) => prev.map((c) => (c.id === caseId ? updatedCase : c)));
      logAuditEvent('DEADLINE_EXTENSION_REQUESTED', noticeId, `Requested date: ${requestedDate} | Reason: ${justification}`, submittedBy, 'Institution Admin');

      const notif: InAppNotification = {
        id: `NOTIF-${Date.now()}`,
        title: 'Deadline Extension Requested',
        message: `${targetCase.institutionNames[targetCase.primaryInstitutionId] || 'Institution'} requested response extension to ${requestedDate} for Notice ${noticeId}.`,
        timestamp: nowStr,
        type: 'urgent',
        link: '/aicte/cases',
        read: false
      };
      setNotifications((prev) => [notif, ...prev]);

      return {
        success: true,
        case: updatedCase,
        message: `Extension request to ${requestedDate} filed for AICTE Officer review.`
      };
    },
    [cases, logAuditEvent]
  );

  const reviewCaseByOfficer = useCallback(
    (
      caseId: string,
      feedback: {
        decision: 'Under AICTE Review' | 'Further Action Required' | 'Resolved' | 'Escalated';
        remarks: string;
        findings?: string;
        newDeadlineDate?: string;
      },
      officer?: { name: string; role: string }
    ) => {
      const targetCase = cases.find((c) => c.id === caseId);
      if (!targetCase) {
        return { success: false, message: `Compliance case ${caseId} not found.` };
      }

      const officerName = officer?.name || targetCase.assignedOfficer?.name || 'Dr. R. K. Srivastav';
      const officerRole = officer?.role || targetCase.assignedOfficer?.role || 'Senior Director, Approval & APAAR Bureau';
      const nowStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';

      const reviewFeedback: OfficerReviewFeedback = {
        reviewedBy: officerName,
        reviewedAt: nowStr,
        statusDecision: feedback.decision,
        remarks: feedback.remarks
      };

      const auditAction =
        feedback.decision === 'Resolved'
          ? 'CASE_RESOLVED'
          : feedback.decision === 'Further Action Required'
          ? 'FURTHER_ACTION_REQUESTED'
          : feedback.decision === 'Escalated'
          ? 'CASE_ESCALATED'
          : 'OFFICER_REVIEW_STARTED';

      const auditEntry: CaseAuditEntry = {
        id: `AUD-REV-${Date.now()}`,
        caseId,
        timestamp: nowStr,
        actor: officerName,
        role: officerRole,
        action: auditAction,
        previousStatus: targetCase.status,
        newStatus: feedback.decision,
        remarks: feedback.remarks,
        hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      };

      // Update latest response's officer review if responses exist
      const updatedResponses = [...(targetCase.responses || [])];
      if (updatedResponses.length > 0) {
        updatedResponses[0] = {
          ...updatedResponses[0],
          officerReview: reviewFeedback
        };
      }

      // Update notices if resolved
      const updatedNotices = targetCase.notices.map((n) =>
        feedback.decision === 'Resolved' ? { ...n, status: 'Closed' as const } : n
      );

      const updatedCase: ComplianceCase = {
        ...targetCase,
        status: feedback.decision,
        notices: updatedNotices,
        responses: updatedResponses,
        history: [auditEntry, ...targetCase.history],
        updatedAt: nowStr
      };

      // Update case
      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? updatedCase : c))
      );

      // If approved & resolved:
      if (feedback.decision === 'Resolved') {
        // 1. Clear linked student flags and mark validated
        if (targetCase.linkedStudentIds && targetCase.linkedStudentIds.length > 0) {
          setStudents((prev) =>
            prev.map((s) => {
              if (targetCase.linkedStudentIds.includes(s.id) || targetCase.linkedStudentIds.includes(s.studentId)) {
                return {
                  ...s,
                  status: 'Validated' as const,
                  flagReason: undefined,
                  flagType: undefined
                };
              }
              return s;
            })
          );
        }

        // 2. Mark linked anomaly resolved
        if (targetCase.linkedAnomalyId) {
          setAnomalies((prev) =>
            prev.map((a) => (a.id === targetCase.linkedAnomalyId ? { ...a, status: 'Resolved' } : a))
          );
        }

        // 3. Mark cross duplicates resolved if matched
        if (targetCase.linkedApaarId) {
          setCrossDuplicates((prev) =>
            prev.map((cd) => (cd.apaarId === targetCase.linkedApaarId ? { ...cd, status: 'Resolved' } : cd))
          );
        }

        // 4. Reset institutions to Compliant if no other unresolved cases
        targetCase.institutionIds.forEach((instId) => {
          const hasOtherPending = cases.some(
            (c) => c.id !== caseId && c.institutionIds.includes(instId) && c.status !== 'Resolved'
          );
          if (!hasOtherPending) {
            setInstitutions((prev) =>
              prev.map((i) => (i.id === instId ? { ...i, complianceStatus: 'Compliant' } : i))
            );
          }
        });
      }

      logAuditEvent(
        auditAction,
        caseId,
        `AICTE Decision: ${feedback.decision} | Remarks: ${feedback.remarks}`,
        officerName,
        officerRole
      );

      // In-app notification for the target institution(s)
      targetCase.institutionIds.forEach((instId) => {
        const instReviewNotif: InAppNotification = {
          id: `NOTIF-${Date.now()}-${instId}`,
          title: feedback.decision === 'Resolved' ? 'Compliance Case Cleared & Resolved' : feedback.decision === 'Further Action Required' ? 'AICTE Mandate: Further Action Required' : 'AICTE Officer Review Update',
          message: `AICTE recorded decision [${feedback.decision}] for Case ${caseId}. Remarks: ${feedback.remarks.substring(0, 100)}...`,
          timestamp: nowStr,
          type: feedback.decision === 'Resolved' ? 'resolution' : 'urgent',
          link: '/institution/validation',
          read: false,
          institutionId: instId
        };
        setNotifications((prev) => [instReviewNotif, ...prev]);
      });

      return {
        success: true,
        case: updatedCase,
        message: `Case ${caseId} transitioned to ${feedback.decision}.`
      };
    },
    [cases, logAuditEvent]
  );

  const getCasesForInstitution = useCallback(
    (institutionId: string): ComplianceCase[] => {
      return cases.filter((c) => c.institutionIds.includes(institutionId));
    },
    [cases]
  );

  const getCaseById = useCallback(
    (caseId: string): ComplianceCase | undefined => {
      return cases.find((c) => c.id === caseId);
    },
    [cases]
  );

  const activeNoticesCountForInstitution = useCallback(
    (institutionId: string): number => {
      return cases.filter(
        (c) =>
          c.institutionIds.includes(institutionId) &&
          (c.status === 'Notice Issued' || c.status === 'Further Action Required')
      ).length;
    },
    [cases]
  );

  const casesNeedingReviewCountForAicte = useCallback((): number => {
    return cases.filter(
      (c) => c.status === 'Response Submitted' || c.status === 'Under AICTE Review'
    ).length;
  }, [cases]);

  const toggleConsent = useCallback((studentId: string) => {
    setConsentRecords((prev) =>
      prev.map((c) => {
        if (c.studentId === studentId) {
          const nextStatus = c.status === 'Granted' ? 'Revoked' : 'Granted';
          return {
            ...c,
            status: nextStatus,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return c;
      })
    );
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, consentGranted: !s.consentGranted } : s))
    );
    logAuditEvent('CONSENT_TOGGLED', studentId, `Updated APAAR consent state for ${studentId}`);
  }, [logAuditEvent]);

  const resetToDefaults = useCallback(() => {
    setStudents(mockStudents);
    setInstitutions(mockInstitutions);
    setAnomalies(mockAnomalies);
    setCrossDuplicates(mockCrossDuplicates);
    setAuditLogs(mockAuditLogs);
    setConsentRecords(mockConsentRecords);
    setCases(mockComplianceCases);
    setNotifications(defaultNotifications);
    localStorage.removeItem(STUDENTS_KEY);
    localStorage.removeItem(INSTITUTIONS_KEY);
    localStorage.removeItem(ANOMALIES_KEY);
    localStorage.removeItem(CROSS_DUPES_KEY);
    localStorage.removeItem(AUDIT_KEY);
    localStorage.removeItem(CONSENT_KEY);
    localStorage.removeItem(CASES_KEY);
    localStorage.removeItem(NOTIFICATIONS_KEY);
  }, []);

  return (
    <DataContext.Provider
      value={{
        students,
        institutions,
        anomalies,
        crossDuplicates,
        auditLogs,
        consentRecords,
        cases,
        addStudent,
        batchAddStudents,
        updateStudent,
        deleteStudent,
        fixValidationIssue,
        dismissValidationIssue,
        revalidateAll,
        resolveCrossDuplicate,
        raiseNotice,
        markAnomalyReviewed,
        raiseCaseNotice,
        submitInstitutionResponse,
        reviewCaseByOfficer,
        addOfficerRemarks,
        escalateCase,
        requestCaseClarification,
        requestDeadlineExtension,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        getCasesForInstitution,
        getCaseById,
        activeNoticesCountForInstitution,
        casesNeedingReviewCountForAicte,
        toggleConsent,
        logAuditEvent,
        resetToDefaults
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

