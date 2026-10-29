import { AnomalyItem, CrossDuplicate } from '../types';

export const mockAnomalies: AnomalyItem[] = [
  {
    id: 'ANOM-2024-001',
    institutionId: 'INST104',
    institutionName: 'RV College of Engineering (RVCE)',
    type: 'Over-Intake',
    severity: 'Critical',
    description: 'Admitted 1,290 students against approved quota of 1,200 (+90 excess admissions across CSE & AIML).',
    detectedAt: '2024-10-15 11:24 IST',
    metric: '107.5% of Approved Intake',
    status: 'Notice Issued',
    assignedOfficial: 'Dr. R. K. Srivastav (AICTE Southern Regional Office)'
  },
  {
    id: 'ANOM-2024-002',
    institutionId: 'INST122',
    institutionName: 'Vellore Institute of Technology (VIT Bhopal Campus)',
    type: 'Sudden Intake Spike',
    severity: 'Critical',
    description: 'Enrolment spiked by +38.4% YoY in CSE specialization without corresponding AICTE intake expansion order.',
    detectedAt: '2024-10-18 16:40 IST',
    metric: '+38.4% YoY Spike',
    status: 'Open',
    assignedOfficial: 'Prof. M. K. Verma (AICTE Central Bureau)'
  },
  {
    id: 'ANOM-2024-003',
    institutionId: 'INST104',
    institutionName: 'RV College of Engineering (RVCE)',
    type: 'Supernumerary Breach',
    severity: 'High',
    description: 'Supernumerary seats admitted reach 215 students, exceeding statutory AICTE 15% cap (limit: 180 seats).',
    detectedAt: '2024-10-19 09:15 IST',
    metric: '17.9% Supernumerary Ratio',
    status: 'Under Investigation',
    assignedOfficial: 'Dr. R. K. Srivastav'
  },
  {
    id: 'ANOM-2024-004',
    institutionId: 'INST112',
    institutionName: 'K. J. Somaiya Institute of Management',
    type: 'Over-Intake',
    severity: 'High',
    description: 'PGDM programme admissions reached 565 against 480 sanctioned strength (+85 excess students).',
    detectedAt: '2024-10-21 14:05 IST',
    metric: '117.7% of Approved PGDM',
    status: 'Open'
  },
  {
    id: 'ANOM-2024-005',
    institutionId: 'INST102',
    institutionName: 'College of Engineering Pune (COEP Technological University)',
    type: 'Cross-Institution Conflict',
    severity: 'High',
    description: 'APAAR ID 7721 9043 1184 concurrently claimed at COEP Pune (Mechanical) and RVCE Bengaluru (AI & DS).',
    detectedAt: '2024-10-22 17:30 IST',
    metric: '2 Concurrent Active Registrations',
    status: 'Open',
    assignedOfficial: 'S. N. Joshi (AICTE Western Regional Office)'
  },
  {
    id: 'ANOM-2024-006',
    institutionId: 'INST102',
    institutionName: 'College of Engineering Pune (COEP Technological University)',
    type: 'Invalid APAAR Pattern',
    severity: 'Medium',
    description: 'Single-entry upload STU-2024-004 contains truncated 8-digit APAAR code (format check failed).',
    detectedAt: '2024-10-24 10:12 IST',
    metric: 'Truncated APAAR (8 digits)',
    status: 'Under Investigation'
  }
];

export const mockCrossDuplicates: CrossDuplicate[] = [
  {
    apaarId: '7721 9043 1184',
    studentName: 'Tanvi Sanjay Patil',
    conflictType: 'Dual Concurrent Enrolment',
    firstInstitution: {
      id: 'INST102',
      name: 'College of Engineering Pune (COEP Technological University)',
      programme: 'B.Tech - Mechanical Engineering',
      admissionDate: '2023-08-14',
      studentId: 'COEP/2023/ME/018'
    },
    secondInstitution: {
      id: 'INST104',
      name: 'RV College of Engineering (RVCE)',
      programme: 'B.Tech - Artificial Intelligence & Data Science',
      admissionDate: '2023-08-22',
      studentId: 'RVCE/2023/AI/104'
    },
    detectedOn: '2024-10-22',
    status: 'Unresolved'
  },
  {
    apaarId: '4390 1829 9901',
    studentName: 'Karan Vikram Aggarwal',
    conflictType: 'Dual Concurrent Enrolment',
    firstInstitution: {
      id: 'INST112',
      name: 'K. J. Somaiya Institute of Management',
      programme: 'PGDM - International Business',
      admissionDate: '2023-07-15',
      studentId: 'KJSOM/2023/PG/088'
    },
    secondInstitution: {
      id: 'INST106',
      name: 'Delhi Technological University (DTU)',
      programme: 'MBA - Business Analytics',
      admissionDate: '2023-08-01',
      studentId: 'DTU/2023/MBA/024'
    },
    detectedOn: '2024-10-24',
    status: 'Unresolved'
  }
];

