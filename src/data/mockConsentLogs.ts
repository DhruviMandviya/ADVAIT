import { ConsentRecord } from '../types';

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

