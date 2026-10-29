import { ComplianceCase } from '../types';

export const mockComplianceCases: ComplianceCase[] = [
  {
    id: 'CASE-2026-001',
    caseNumber: 'CC-2026-081',
    title: 'Sanctioned Intake Quota Violation (+90 Excess Admissions)',
    issueType: 'Intake/Quota Violation',
    severity: 'Critical',
    status: 'Notice Issued',
    institutionIds: ['INST104'],
    institutionNames: {
      INST104: 'RV College of Engineering (RVCE)'
    },
    primaryInstitutionId: 'INST104',
    detectionDate: '2026-10-15 11:24 IST',
    description: 'Institution admitted 1,290 students against council approved quota of 1,200 (+90 excess admissions across Computer Science and AI&ML programmes).',
    metric: '107.5% of Approved Intake (+90 Seats)',
    assignedOfficer: {
      id: 'AICTE001',
      name: 'Dr. R. K. Srivastav',
      role: 'Senior Director, Approval & APAAR Bureau',
      email: 'rk.srivastav@aicte-india.org'
    },
    evidence: [
      {
        id: 'EVD-001',
        title: 'Institutional Admission Ingest Batch Log',
        type: 'System Log',
        details: 'Batch admissions payload confirmed 1,290 active student enrollments for AY 2026-27.',
        uploadedAt: '2026-10-15 11:24 IST'
      },
      {
        id: 'EVD-002',
        title: 'AICTE Approval Process Handbook (APH) Sanction Order',
        type: 'Document',
        details: 'F.No. South-Western/1-51290384/2026/EOA approved cap strictly established at 1,200 seats.',
        uploadedAt: '2026-10-15 11:30 IST'
      }
    ],
    linkedStudentIds: ['STU-2024-007'],
    linkedAnomalyId: 'ANOM-2024-001',
    notices: [
      {
        id: 'NOT-2026-001',
        caseId: 'CASE-2026-001',
        institutionId: 'INST104',
        institutionName: 'RV College of Engineering (RVCE)',
        orderNumber: 'F.No. AICTE/AB/CASE-2026-001/NOT-01',
        issueDate: '2026-10-16 10:00 IST',
        responseDeadline: '2026-11-15',
        assignedOfficer: 'Dr. R. K. Srivastav',
        officerRole: 'Senior Director, Approval & APAAR Bureau',
        noticeDescription: 'Official Show-Cause directive regarding excess intake of 90 seats without requisite Council approval. You are required to submit an institutional explanation and immediate corrective mitigation plan.',
        supportingEvidence: 'Admissions ingest batch RVCE-2026-B1 verified 1,290 active roll IDs.',
        correctiveAction: 'Provide state government seat allocation authorization or re-align enrolled roster within sanctioned cap.',
        status: 'Active'
      }
    ],
    responses: [],
    history: [
      {
        id: 'AUD-C001-1',
        caseId: 'CASE-2026-001',
        timestamp: '2026-10-15 11:24 IST',
        actor: 'AICTE Automated Heuristic Engine',
        role: 'System Worker',
        action: 'CASE_CREATED',
        previousStatus: 'Flagged',
        newStatus: 'Flagged',
        remarks: 'Automated anomaly rule triggered for over-intake (+90 seats).',
        hash: 'b5d4045c3f466fa91fe2cc6abe79232a1a57cdf104f7a26e716e0a1e2789df78'
      },
      {
        id: 'AUD-C001-2',
        caseId: 'CASE-2026-001',
        timestamp: '2026-10-16 10:00 IST',
        actor: 'Dr. R. K. Srivastav',
        role: 'AICTE Admin',
        action: 'NOTICE_ISSUED',
        previousStatus: 'Flagged',
        newStatus: 'Notice Issued',
        remarks: 'Dispatched formal regulatory show-cause notice NOT-2026-001 with deadline 2026-11-15.',
        hash: '7c9f826a7e0e7a2b901a8f6154326715fbc792019409823192083109a8bcde12'
      }
    ],
    updatedAt: '2026-10-16 10:00 IST'
  },
  {
    id: 'CASE-2026-002',
    caseNumber: 'CC-2026-082',
    title: 'Cross-Institution Dual Concurrent Enrolment Conflict — APAAR 7721 9043 1184',
    issueType: 'Cross-Institution Conflict',
    severity: 'High',
    status: 'Under AICTE Review',
    institutionIds: ['INST102', 'INST104'],
    institutionNames: {
      INST102: 'College of Engineering Pune (COEP Technological University)',
      INST104: 'RV College of Engineering (RVCE)'
    },
    primaryInstitutionId: 'INST102',
    detectionDate: '2026-10-22 17:30 IST',
    description: 'National APAAR ID 7721 9043 1184 (Tanvi Sanjay Patil) is registered concurrently in full-time degree programmes at both COEP Pune (Mechanical Engineering) and RVCE Bengaluru (AI & Data Science).',
    metric: '2 Concurrent Active Registrations in Full-Time Degree Courses',
    assignedOfficer: {
      id: 'AICTE001',
      name: 'Dr. R. K. Srivastav',
      role: 'Senior Director, Approval & APAAR Bureau',
      email: 'rk.srivastav@aicte-india.org'
    },
    evidence: [
      {
        id: 'EVD-003',
        title: 'COEP Pune Student Enrollment Dossier (STU-2024-002)',
        type: 'Student Record',
        referenceId: 'STU-2024-002',
        details: 'Admitted on 2023-08-14 to B.Tech Mechanical under State CAP quota.',
        uploadedAt: '2026-10-22 17:30 IST'
      },
      {
        id: 'EVD-004',
        title: 'RVCE Bengaluru Student Enrollment Dossier (STU-2024-003)',
        type: 'Student Record',
        referenceId: 'STU-2024-003',
        details: 'Admitted on 2023-08-22 to B.Tech AI & Data Science under COMEDK quota.',
        uploadedAt: '2026-10-22 17:30 IST'
      }
    ],
    linkedStudentIds: ['STU-2024-002', 'STU-2024-003'],
    linkedAnomalyId: 'ANOM-2024-005',
    linkedApaarId: '7721 9043 1184',
    notices: [
      {
        id: 'NOT-2026-002',
        caseId: 'CASE-2026-002',
        institutionId: 'INST102',
        institutionName: 'College of Engineering Pune (COEP Technological University)',
        orderNumber: 'F.No. AICTE/AB/CASE-2026-002/NOT-01',
        issueDate: '2026-10-23 09:30 IST',
        responseDeadline: '2026-11-20',
        assignedOfficer: 'Dr. R. K. Srivastav',
        officerRole: 'Senior Director, Approval & APAAR Bureau',
        noticeDescription: 'Dual enrollment conflict detected with RVCE Bengaluru for student Tanvi Sanjay Patil. Please verify whether the student is actively attending classes or has formally cancelled registration.',
        supportingEvidence: 'National APAAR matching algorithm detected concurrent registration across Maharashtra & Karnataka portals.',
        correctiveAction: 'Submit student attendance verification, state allotment memo, and confirmation of active enrollment.',
        status: 'Responded'
      }
    ],
    responses: [
      {
        id: 'RESP-2026-001',
        caseId: 'CASE-2026-002',
        noticeId: 'NOT-2026-002',
        institutionId: 'INST102',
        institutionName: 'College of Engineering Pune (COEP Technological University)',
        submittedBy: 'Dr. Sunil Bhirud (Director, COEP Pune)',
        submittedAt: '2026-10-25 15:45 IST',
        submissionNumber: 1,
        explanation: 'Student Tanvi Sanjay Patil was allotted B.Tech Mechanical through Maharashtra State CET Cell CAP Round-I and is physically enrolled and attending semester lectures with 88% attendance. Student had withdrawn from RVCE seat prior to session commencement.',
        actionTaken: 'Verified student biometric attendance and confirmed valid state domicile merit seat. Uploaded MHT-CET Allotment Letter.',
        supportingDocuments: [
          {
            id: 'DOC-001',
            fileName: 'MHT_CET_2023_Allotment_Letter_TanviPatil.pdf',
            fileSize: '1.4 MB',
            fileType: 'application/pdf',
            uploadedAt: '2026-10-25 15:40 IST',
            description: 'Government of Maharashtra State Common Entrance Test Cell Official Allotment Order'
          },
          {
            id: 'DOC-002',
            fileName: 'COEP_Semester_Attendance_Verification.pdf',
            fileSize: '840 KB',
            fileType: 'application/pdf',
            uploadedAt: '2026-10-25 15:42 IST',
            description: 'Department of Mechanical Engineering Verified Biometric Roster'
          }
        ],
        correctedStudentUpdates: [
          {
            studentId: 'COEP/2023/ME/018',
            name: 'Tanvi Sanjay Patil',
            statusNote: 'Confirmed primary active enrollment at COEP Pune; awaiting RVCE de-registration confirmation from AICTE.'
          }
        ]
      }
    ],
    history: [
      {
        id: 'AUD-C002-1',
        caseId: 'CASE-2026-002',
        timestamp: '2026-10-22 17:30 IST',
        actor: 'AICTE Cross-Institution Correlation Engine',
        role: 'System Worker',
        action: 'CASE_CREATED',
        previousStatus: 'Flagged',
        newStatus: 'Flagged',
        remarks: 'Cross-institution duplicate correlation flagged for APAAR 7721 9043 1184.',
        hash: 'e4d8123c5a6109fbb910243eef67182903102481903829103982019483920194'
      },
      {
        id: 'AUD-C002-2',
        caseId: 'CASE-2026-002',
        timestamp: '2026-10-23 09:30 IST',
        actor: 'Dr. R. K. Srivastav',
        role: 'AICTE Admin',
        action: 'NOTICE_ISSUED',
        previousStatus: 'Flagged',
        newStatus: 'Notice Issued',
        remarks: 'Issued inquiry directive NOT-2026-002 to COEP Pune.',
        hash: 'fa82910482019482019482910482019482019482019482019482019482019482'
      },
      {
        id: 'AUD-C002-3',
        caseId: 'CASE-2026-002',
        timestamp: '2026-10-25 15:45 IST',
        actor: 'Dr. Sunil Bhirud (INST102)',
        role: 'Institution Admin',
        action: 'RESPONSE_SUBMITTED',
        previousStatus: 'Notice Issued',
        newStatus: 'Under AICTE Review',
        remarks: 'COEP Pune submitted official response with State CET allotment letter and biometric attendance.',
        hash: '1920481920381029481029481920381029481029481920381029481029481920'
      }
    ],
    updatedAt: '2026-10-25 15:45 IST'
  },
  {
    id: 'CASE-2026-003',
    caseNumber: 'CC-2026-083',
    title: 'Invalid APAAR Identifier Format — College of Engineering Pune (8-Digit Code)',
    issueType: 'Invalid APAAR ID',
    severity: 'Medium',
    status: 'Flagged',
    institutionIds: ['INST102'],
    institutionNames: {
      INST102: 'College of Engineering Pune (COEP Technological University)'
    },
    primaryInstitutionId: 'INST102',
    detectionDate: '2026-10-24 10:12 IST',
    description: 'Student admission record STU-2024-004 (Rohan Pramod Kulkarni) submitted with truncated 8-digit APAAR identifier "9842 1092". National standard requires exactly 12 numeric digits.',
    metric: 'Truncated APAAR (8 digits instead of 12)',
    assignedOfficer: {
      id: 'AICTE001',
      name: 'Dr. R. K. Srivastav',
      role: 'Senior Director, Approval & APAAR Bureau'
    },
    evidence: [
      {
        id: 'EVD-005',
        title: 'Single-Entry Ingestion Record Validation Error',
        type: 'System Log',
        referenceId: 'STU-2024-004',
        details: 'Regex format check failed: /^[0-9]{12}$/. Found 8 digits.',
        uploadedAt: '2026-10-24 10:12 IST'
      }
    ],
    linkedStudentIds: ['STU-2024-004'],
    linkedAnomalyId: 'ANOM-2024-006',
    notices: [],
    responses: [],
    history: [
      {
        id: 'AUD-C003-1',
        caseId: 'CASE-2026-003',
        timestamp: '2026-10-24 10:12 IST',
        actor: 'Automated APAAR Verifier',
        role: 'System Worker',
        action: 'CASE_CREATED',
        previousStatus: 'Flagged',
        newStatus: 'Flagged',
        remarks: 'Flagged for format non-compliance during single student entry.',
        hash: '9012849102839102839102839102839102839102839102839102839102839102'
      }
    ],
    updatedAt: '2026-10-24 10:12 IST'
  },
  {
    id: 'CASE-2026-004',
    caseNumber: 'CC-2026-084',
    title: 'Supernumerary Seat Ceiling Cap Breach — RVCE Bengaluru (17.9% Ratio)',
    issueType: 'Supernumerary Breach',
    severity: 'High',
    status: 'Notice Issued',
    institutionIds: ['INST104'],
    institutionNames: {
      INST104: 'RV College of Engineering (RVCE)'
    },
    primaryInstitutionId: 'INST104',
    detectionDate: '2026-10-19 09:15 IST',
    description: 'Institution admitted 215 supernumerary students (NRI/OCI/Foreign National) against statutory ceiling of 180 seats (15% of sanctioned 1,200 capacity).',
    metric: '17.9% Supernumerary Ratio (Exceeds 15% Statutory Cap by 35 seats)',
    assignedOfficer: {
      id: 'AICTE001',
      name: 'Dr. R. K. Srivastav',
      role: 'Senior Director, Approval & APAAR Bureau'
    },
    evidence: [
      {
        id: 'EVD-006',
        title: 'Supernumerary Quota Reconciliation Audit',
        type: 'Anomaly Metric',
        details: 'Enrolled: 42 NRI + 12 OCI + 15 FN + 146 others = 215 students (Approved Cap: 180).',
        uploadedAt: '2026-10-19 09:15 IST'
      }
    ],
    linkedStudentIds: ['STU-2024-007'],
    linkedAnomalyId: 'ANOM-2024-003',
    notices: [
      {
        id: 'NOT-2026-003',
        caseId: 'CASE-2026-004',
        institutionId: 'INST104',
        institutionName: 'RV College of Engineering (RVCE)',
        orderNumber: 'F.No. AICTE/AB/CASE-2026-004/NOT-01',
        issueDate: '2026-10-20 14:00 IST',
        responseDeadline: '2026-11-25',
        assignedOfficer: 'Dr. R. K. Srivastav',
        officerRole: 'Senior Director, Approval & APAAR Bureau',
        noticeDescription: 'Supernumerary admissions breach statutory limit of 15% under AICTE Approval Process Handbook Clause 3.4. Provide immediate breakdown and justification.',
        supportingEvidence: 'Registry confirmed 215 supernumerary category admissions.',
        correctiveAction: 'Rectify supernumerary quota classifications or provide Ministry of External Affairs special dispensation.',
        status: 'Active'
      }
    ],
    responses: [],
    history: [
      {
        id: 'AUD-C004-1',
        caseId: 'CASE-2026-004',
        timestamp: '2026-10-19 09:15 IST',
        actor: 'AICTE Quota Auditor',
        role: 'System Worker',
        action: 'CASE_CREATED',
        previousStatus: 'Flagged',
        newStatus: 'Flagged',
        remarks: 'Flagged for supernumerary cap violation (+35 seats).',
        hash: '3829103829103829103829103829103829103829103829103829103829103829'
      },
      {
        id: 'AUD-C004-2',
        caseId: 'CASE-2026-004',
        timestamp: '2026-10-20 14:00 IST',
        actor: 'Dr. R. K. Srivastav',
        role: 'AICTE Admin',
        action: 'NOTICE_ISSUED',
        previousStatus: 'Flagged',
        newStatus: 'Notice Issued',
        remarks: 'Issued statutory directive NOT-2026-003.',
        hash: '4910284910284910284910284910284910284910284910284910284910284910'
      }
    ],
    updatedAt: '2026-10-20 14:00 IST'
  },
  {
    id: 'CASE-2026-005',
    caseNumber: 'CC-2026-085',
    title: 'Internal Duplicate Roll Registration — COEP Pune (Neha Sunil Joshi)',
    issueType: 'Internal Duplicate',
    severity: 'Medium',
    status: 'Flagged',
    institutionIds: ['INST102'],
    institutionNames: {
      INST102: 'College of Engineering Pune (COEP Technological University)'
    },
    primaryInstitutionId: 'INST102',
    detectionDate: '2026-10-23 11:00 IST',
    description: 'APAAR ID 6630 1928 4401 is assigned to two distinct roll registrations (COEP/2023/EE/045 and COEP/2023/EE/046) within the same department at COEP Pune.',
    metric: 'Duplicate APAAR inside same institution under multiple roll IDs',
    assignedOfficer: {
      id: 'AICTE001',
      name: 'Dr. R. K. Srivastav',
      role: 'Senior Director, Approval & APAAR Bureau'
    },
    evidence: [
      {
        id: 'EVD-007',
        title: 'Institutional Database Key Collision',
        type: 'Student Record',
        details: 'Records STU-2024-005 and STU-2024-006 share exact APAAR ID 6630 1928 4401.',
        uploadedAt: '2026-10-23 11:00 IST'
      }
    ],
    linkedStudentIds: ['STU-2024-005', 'STU-2024-006'],
    linkedApaarId: '6630 1928 4401',
    notices: [],
    responses: [],
    history: [
      {
        id: 'AUD-C005-1',
        caseId: 'CASE-2026-005',
        timestamp: '2026-10-23 11:00 IST',
        actor: 'AICTE Ingest Verifier',
        role: 'System Worker',
        action: 'CASE_CREATED',
        previousStatus: 'Flagged',
        newStatus: 'Flagged',
        remarks: 'Duplicate student record detected within COEP Pune.',
        hash: '5920194820194820194820194820194820194820194820194820194820194820'
      }
    ],
    updatedAt: '2026-10-23 11:00 IST'
  },
  {
    id: 'CASE-2026-006',
    caseNumber: 'CC-2026-086',
    title: 'Unsanctioned Enrolment Expansion Spike (+38.4% YoY) — VIT Bhopal',
    issueType: 'Sudden Intake Spike',
    severity: 'Critical',
    status: 'Flagged',
    institutionIds: ['INST122'],
    institutionNames: {
      INST122: 'Vellore Institute of Technology (VIT Bhopal Campus)'
    },
    primaryInstitutionId: 'INST122',
    detectionDate: '2026-10-18 16:40 IST',
    description: 'Enrolment spiked by +38.4% YoY in CSE specialization without corresponding AICTE intake expansion notification or state council concurrence.',
    metric: '+38.4% YoY Sudden Intake Jump',
    assignedOfficer: {
      id: 'AICTE001',
      name: 'Dr. R. K. Srivastav',
      role: 'Senior Director, Approval & APAAR Bureau'
    },
    evidence: [
      {
        id: 'EVD-008',
        title: 'Multi-Year Intake Longitudinal Model',
        type: 'Anomaly Metric',
        details: 'AY 2025-26: 1,380 admissions vs AY 2026-27: 1,920 admissions (+540 students).',
        uploadedAt: '2026-10-18 16:40 IST'
      }
    ],
    linkedStudentIds: [],
    linkedAnomalyId: 'ANOM-2024-002',
    notices: [],
    responses: [],
    history: [
      {
        id: 'AUD-C006-1',
        caseId: 'CASE-2026-006',
        timestamp: '2026-10-18 16:40 IST',
        actor: 'AICTE Longitudinal Analytics Engine',
        role: 'System Worker',
        action: 'CASE_CREATED',
        previousStatus: 'Flagged',
        newStatus: 'Flagged',
        remarks: 'Longitudinal spike anomaly rule triggered (+38.4% surge).',
        hash: '6920194820194820194820194820194820194820194820194820194820194820'
      }
    ],
    updatedAt: '2026-10-18 16:40 IST'
  }
];

