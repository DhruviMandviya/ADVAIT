import { AuditLog } from '../types';

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'AUD-90214',
    timestamp: '2026-10-29 18:30:12 IST',
    actor: 'Dr. Sunil Bhirud (INST102)',
    role: 'Institution Admin',
    institutionId: 'INST102',
    action: 'BATCH_STUDENT_UPLOAD',
    target: 'COEP-Batch-2024-AY',
    details: 'Uploaded 45 student records for B.Tech Computer Engineering; 44 validated, 1 flagged for invalid APAAR.',
    ipAddress: '14.139.111.2',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'AUD-90213',
    timestamp: '2026-10-29 16:45:00 IST',
    actor: 'Dr. R. K. Srivastav (AICTE)',
    role: 'AICTE Admin',
    action: 'SHOW_CAUSE_NOTICE_ISSUED',
    target: 'INST104 (RVCE Bengaluru)',
    details: 'Formal compliance notice issued for intake quota breach of +90 admissions over sanctioned cap.',
    ipAddress: '164.100.128.45',
    hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4'
  },
  {
    id: 'AUD-90212',
    timestamp: '2026-10-29 14:12:33 IST',
    actor: 'TCS Campus Recruitment Cell',
    role: 'Employer Verifier',
    action: 'STUDENT_RECORD_VERIFIED',
    target: 'STU-2024-001 (APAAR: 9824 5510 8392)',
    details: 'Verified credentials of Aarav Rajesh Mehta via authorized employer portal.',
    ipAddress: '115.112.24.19',
    hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
  },
  {
    id: 'AUD-90211',
    timestamp: '2026-10-29 11:05:44 IST',
    actor: 'System Automated Pipeline',
    role: 'System Worker',
    action: 'CROSS_INSTITUTION_FLAG',
    target: 'APAAR: 7721 9043 1184',
    details: 'Automated anomaly detection caught concurrent enrolment at INST102 and INST104.',
    ipAddress: '127.0.0.1',
    hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'
  },
  {
    id: 'AUD-90210',
    timestamp: '2026-10-28 17:20:10 IST',
    actor: 'Dr. Sachin Kore (INST103)',
    role: 'Institution Admin',
    institutionId: 'INST103',
    action: 'API_KEY_ROTATED',
    target: 'SIS-ERP-Integration-Key',
    details: 'Rotated production API credentials for VJTI ERP integration gateway.',
    ipAddress: '14.139.122.14',
    hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d'
  },
  {
    id: 'AUD-90209',
    timestamp: '2026-10-28 10:14:02 IST',
    actor: 'National Accreditation Board (NBA)',
    role: 'Regulator Auditor',
    action: 'INSTITUTION_AUDIT_REPORT_EXPORT',
    target: 'All Engineering Institutions (Maharashtra)',
    details: 'Exported comprehensive intake vs APAAR enrolment audit report for Tier-1 evaluation.',
    ipAddress: '164.100.88.19',
    hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
  }
];

