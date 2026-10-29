export type Role = 'institution' | 'aicte' | 'verifier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  institutionId?: string;
  institutionName?: string;
  designation?: string;
  avatar?: string;
}

export type Programme = 'B.Tech' | 'M.Tech' | 'MBA' | 'PGDM' | 'MCA' | 'Diploma' | 'B.Pharm';
export type QuotaType = 'Regular' | 'Supernumerary' | 'NRI' | 'OCI' | 'Foreign National';
export type StudentStatus = 'Validated' | 'Flagged' | 'Pending';

export interface Student {
  id: string; // Internal system ID e.g. STU-2024-001
  apaarId: string; // 12-digit formatted string, e.g. "9824 5510 8392"
  studentId: string; // Institution roll / reg no.
  name: string;
  dob: string; // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other';
  programme: Programme;
  course: string;
  year: number; // 1, 2, 3, 4
  category: 'General' | 'OBC-NCL' | 'SC' | 'ST' | 'EWS';
  institutionId: string;
  institutionName: string;
  admissionDate: string;
  quotaType: QuotaType;
  status: StudentStatus;
  flagReason?: string;
  flagType?: 'duplicate_record' | 'invalid_apaar' | 'exceeds_intake' | 'cross_institution' | 'data_inconsistency';
  verificationCode: string;
  consentGranted: boolean;
  consentDate?: string;
  fatherName?: string;
  state: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Institution {
  id: string; // e.g. INST102
  permanentId: string; // AICTE Permanent ID e.g. 1-10492817
  name: string;
  shortName: string;
  state: string;
  city: string;
  type: 'Government' | 'Government-Aided' | 'Private-Autonomous' | 'Affiliated' | 'Deemed';
  approvedIntake: number;
  actualEnrolment: number;
  supernumeraryCap: number; // 15% of approved
  supernumeraryActual: number;
  nriStudents: number;
  ociStudents: number;
  fnStudents: number;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  complianceStatus: 'Compliant' | 'Over-Intake' | 'Review-Pending' | 'Notice-Issued';
  programmes: {
    name: Programme;
    courses: string[];
    approved: number;
    enrolled: number;
  }[];
  aisheCode: string;
  establishedYear: number;
  headName: string;
  headEmail: string;
}

export interface AnomalyItem {
  id: string;
  institutionId: string;
  institutionName: string;
  type: 'Sudden Intake Spike' | 'Over-Intake' | 'Supernumerary Breach' | 'Cross-Institution Conflict' | 'Invalid APAAR Pattern';
  severity: 'Critical' | 'High' | 'Medium';
  description: string;
  detectedAt: string;
  metric: string;
  status: 'Open' | 'Under Investigation' | 'Under Review' | 'Notice Issued' | 'Resolved';
  assignedOfficial?: string;
}

export interface CrossDuplicate {
  apaarId: string;
  studentName: string;
  conflictType: 'Dual Concurrent Enrolment' | 'Identity Overlap';
  firstInstitution: {
    id: string;
    name: string;
    programme: string;
    admissionDate: string;
    studentId: string;
  };
  secondInstitution: {
    id: string;
    name: string;
    programme: string;
    admissionDate: string;
    studentId: string;
  };
  detectedOn: string;
  status: 'Unresolved' | 'Primary Verified' | 'Flagged Both' | 'Resolved';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  institutionId?: string;
  action: string;
  target: string;
  details: string;
  ipAddress: string;
  hash: string;
}

export interface ConsentRecord {
  id: string;
  studentId: string;
  studentName: string;
  apaarId: string;
  status: 'Granted' | 'Revoked' | 'Pending';
  lastUpdated: string;
  academicPurpose: boolean;
  employerSharing: boolean;
  regulatoryVerification: boolean;
}

export interface RegulationNotice {
  id: string;
  title: string;
  orderNumber: string;
  date: string;
  category: string;
  pdfUrl?: string;
  summary: string;
  mandatory: boolean;
}

// ================= COMPLIANCE CASE MANAGEMENT =================

export type CaseStatus =
  | 'Action Required'
  | 'Flagged'
  | 'Notice Issued'
  | 'Response Submitted'
  | 'Under AICTE Review'
  | 'Further Action Required'
  | 'Resolved'
  | 'Escalated';

export type CaseIssueType =
  | 'Cross-Institution Conflict'
  | 'Internal Duplicate'
  | 'Invalid APAAR ID'
  | 'Intake/Quota Violation'
  | 'Supernumerary Breach'
  | 'Sudden Intake Spike'
  | 'Data Inconsistency'
  | 'Other Regulatory Anomaly';

export interface CaseEvidenceItem {
  id: string;
  title: string;
  type: 'Student Record' | 'Anomaly Metric' | 'System Log' | 'Document';
  referenceId?: string;
  details: string;
  uploadedAt: string;
}

export interface NoticeClarification {
  id: string;
  noticeId: string;
  institutionId: string;
  submittedAt: string;
  query: string;
  status: 'Pending' | 'Answered';
  officerResponse?: string;
}

export interface DeadlineExtensionRequest {
  id: string;
  noticeId: string;
  institutionId: string;
  submittedAt: string;
  requestedDeadline: string;
  justification: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  decisionRemarks?: string;
}

export interface ComplianceNotice {
  id: string; // e.g. NOT-2026-0041
  caseId: string;
  institutionId: string;
  institutionName: string;
  orderNumber: string; // e.g. F.No. AICTE/AB/CASE-2026-1001/NOT-01
  issueDate: string;
  responseDeadline: string; // YYYY-MM-DD
  assignedOfficer: string;
  officerRole: string;
  noticeDescription: string;
  supportingEvidence: string;
  correctiveAction: string;
  status: 'Active' | 'Responded' | 'Overdue' | 'Closed';
  acknowledgedAt?: string;
  clarifications?: NoticeClarification[];
  extensionRequests?: DeadlineExtensionRequest[];
}

export interface ResponseDocument {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedAt: string;
  description?: string;
}

export interface StudentCorrectionPayload {
  studentId: string;
  apaarId?: string;
  name?: string;
  course?: string;
  statusNote?: string;
}

export interface OfficerReviewFeedback {
  reviewedBy: string;
  reviewedAt: string;
  statusDecision: 'Resolved' | 'Further Action Required' | 'Escalated' | 'Under AICTE Review';
  remarks: string;
}

export interface InstitutionResponse {
  id: string; // e.g. RESP-2026-001
  caseId: string;
  noticeId: string;
  institutionId: string;
  institutionName: string;
  submittedBy: string;
  submittedAt: string;
  submissionNumber: number; // 1 = first, 2 = resubmission, etc.
  explanation: string;
  actionTaken: string;
  supportingDocuments: ResponseDocument[];
  correctedStudentUpdates?: StudentCorrectionPayload[];
  officerReview?: OfficerReviewFeedback;
}

export interface CaseAuditEntry {
  id: string;
  caseId: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  previousStatus: CaseStatus;
  newStatus: CaseStatus;
  remarks: string;
  hash: string;
}

export interface ComplianceCase {
  id: string; // e.g. CASE-2026-1001
  caseNumber: string; // e.g. CC-2026-042
  title: string;
  issueType: CaseIssueType;
  severity: RiskLevel;
  status: CaseStatus;
  institutionIds: string[]; // Supports single or multiple institutions for cross-conflicts
  institutionNames: Record<string, string>;
  primaryInstitutionId: string;
  detectionDate: string;
  description: string;
  metric: string;
  assignedOfficer: {
    id: string;
    name: string;
    role: string;
    email?: string;
  };
  evidence: CaseEvidenceItem[];
  linkedStudentIds: string[];
  linkedAnomalyId?: string;
  linkedApaarId?: string;
  notices: ComplianceNotice[];
  responses: InstitutionResponse[];
  history: CaseAuditEntry[];
  updatedAt: string;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'notice' | 'review' | 'resolution' | 'info' | 'urgent';
  link?: string;
  read: boolean;
  institutionId?: string;
}



