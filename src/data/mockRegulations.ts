import { ConsentRecord, RegulationNotice } from '../types';

export const mockConsentRecords: ConsentRecord[] = [
  {
    id: 'CON-001',
    studentId: 'COEP/2023/CS/042',
    studentName: 'Aarav Rajesh Mehta',
    apaarId: '9824 5510 8392',
    status: 'Granted',
    lastUpdated: '2023-08-11',
    academicPurpose: true,
    employerSharing: true,
    regulatoryVerification: true
  },
  {
    id: 'CON-002',
    studentId: 'COEP/2023/ME/018',
    studentName: 'Tanvi Sanjay Patil',
    apaarId: '7721 9043 1184',
    status: 'Granted',
    lastUpdated: '2023-08-15',
    academicPurpose: true,
    employerSharing: false,
    regulatoryVerification: true
  },
  {
    id: 'CON-003',
    studentId: 'COEP/2023/CE/091',
    studentName: 'Rohan Pramod Kulkarni',
    apaarId: '9842 1092',
    status: 'Revoked',
    lastUpdated: '2024-02-10',
    academicPurpose: true,
    employerSharing: false,
    regulatoryVerification: false
  },
  {
    id: 'CON-004',
    studentId: 'COEP/2023/EE/045',
    studentName: 'Neha Sunil Joshi',
    apaarId: '6630 1928 4401',
    status: 'Granted',
    lastUpdated: '2023-08-12',
    academicPurpose: true,
    employerSharing: true,
    regulatoryVerification: true
  },
  {
    id: 'CON-005',
    studentId: 'COEP/2024/MT/009',
    studentName: 'Kavya Suresh Deshmukh',
    apaarId: '5519 2837 4910',
    status: 'Pending',
    lastUpdated: '2024-07-20',
    academicPurpose: true,
    employerSharing: false,
    regulatoryVerification: true
  }
];

export const mockRegulations: RegulationNotice[] = [
  {
    id: 'REG-2026-04',
    title: 'AICTE Regulation 2026: Mandatory electronic verification of joint Lien FDRs for academic approval continuity is active.',
    orderNumber: 'F.No. AICTE/AB/Regulation/2026/04',
    date: '15 January 2026',
    category: 'Approval Process Handbook (APH)',
    mandatory: true,
    summary: 'Pursuant to Council meeting resolution, all AICTE-approved standalone PGDM and technical institutions are mandated to connect their student registry directly with the APAAR ID national repository. Furthermore, electronic verification of joint Lien Fixed Deposit Receipts (FDRs) is enforced with immediate effect for approval continuation for Academic Year 2026-27.'
  },
  {
    id: 'REG-2025-18',
    title: 'Directives on Strict Adherence to Sanctioned Intake & Supernumerary Quota Limits',
    orderNumber: 'F.No. AICTE/P&AP/Supernumerary/2025/18',
    date: '12 September 2025',
    category: 'Quota Enforcement',
    mandatory: true,
    summary: 'Any institution found admitting students beyond 15% supernumerary cap for NRI/OCI/FN categories will face punitive seat reductions in subsequent academic sessions along with immediate suspension of portal registration privileges.'
  },
  {
    id: 'REG-2025-09',
    title: 'Implementation Guidelines for Unified APAAR Registry in Autonomous Technical Institutions',
    orderNumber: 'F.No. AICTE/e-Gov/APAAR/2025/09',
    date: '04 July 2025',
    category: 'National Academic Identity',
    mandatory: true,
    summary: 'Admissions must be keyed against the 12-digit APAAR identifier generated through the Ministry of Education MeriPehchaan/DigiLocker academic account framework to ensure singular academic portability.'
  }
];

