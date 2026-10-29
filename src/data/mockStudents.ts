import { Student } from '../types';

// Helper to format APAAR ID as 4-4-4
export const formatApaar = (numStr: string): string => {
  const clean = numStr.replace(/\D/g, '');
  return clean.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
};

const firstNames = [
  'Aarav', 'Ananya', 'Rohan', 'Priya', 'Aditya', 'Diya', 'Vihaan', 'Sneha',
  'Ishaan', 'Tanvi', 'Kabir', 'Meera', 'Reyansh', 'Rhea', 'Arjun', 'Isha',
  'Dev', 'Pooja', 'Dhruv', 'Kavya', 'Aryan', 'Neha', 'Atharv', 'Shreya',
  'Harsh', 'Anushka', 'Manish', 'Sonal', 'Varun', 'Deepika', 'Akash', 'Pooja',
  'Nikhil', 'Simran', 'Rahul', 'Kriti', 'Siddharth', 'Aditi', 'Pranav', 'Payal',
  'Gaurav', 'Swati', 'Kunal', 'Jyoti', 'Tarun', 'Sakshi', 'Karan', 'Richa'
];

const lastNames = [
  'Sharma', 'Verma', 'Patil', 'Kulkarni', 'Deshmukh', 'Iyer', 'Nair', 'Reddy',
  'Choudhury', 'Joshi', 'Gupta', 'Singh', 'Mehta', 'Shah', 'Banerjee', 'Chatterjee',
  'Bhat', 'Rao', 'Patel', 'Menon', 'Pillai', 'Saxena', 'Mishra', 'Trivedi',
  'Bhardwaj', 'Malhotra', 'Aggarwal', 'Dutta', 'Mukherjee', 'Dubey', 'Yadav'
];

const programmesList: Array<Student['programme']> = ['B.Tech', 'M.Tech', 'MBA', 'PGDM', 'MCA', 'Diploma', 'B.Pharm'];

const coursesMap: Record<Student['programme'], string[]> = {
  'B.Tech': ['Computer Science and Engineering', 'Mechanical Engineering', 'Electronics & Telecom', 'Civil Engineering', 'Information Technology', 'Artificial Intelligence & Data Science'],
  'M.Tech': ['VLSI Design', 'Structural Engineering', 'Computer Networks', 'Machine Design'],
  'MBA': ['Financial Management', 'Marketing & Sales', 'Human Resources', 'Business Analytics'],
  'PGDM': ['Executive Management', 'International Business', 'Operations & Logistics'],
  'MCA': ['Master of Computer Applications', 'Cloud Computing & DevOps'],
  'Diploma': ['Diploma in Mechanical', 'Diploma in Computer Tech', 'Diploma in Electrical'],
  'B.Pharm': ['Bachelor of Pharmacy', 'Pharmaceutical Chemistry']
};

const statesList = [
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat', 
  'Telangana', 'Uttar Pradesh', 'West Bengal', 'Kerala', 'Punjab', 'Rajasthan'
];

export const generateMockStudents = (): Student[] => {
  const students: Student[] = [];

  // 1. SPECIFIC DELIBERATE VALIDATION TEST CASES

  // Deliberate 1: Valid sample student for COEP (matches demo login)
  students.push({
    id: 'STU-2024-001',
    apaarId: '9824 5510 8392',
    studentId: 'COEP/2023/CS/042',
    name: 'Aarav Rajesh Mehta',
    dob: '2004-05-14',
    gender: 'Male',
    programme: 'B.Tech',
    course: 'Computer Science and Engineering',
    year: 2,
    category: 'General',
    institutionId: 'INST102',
    institutionName: 'College of Engineering Pune (COEP Technological University)',
    admissionDate: '2023-08-10',
    quotaType: 'Regular',
    status: 'Validated',
    verificationCode: 'ADV-V893-K9201',
    consentGranted: true,
    consentDate: '2023-08-11',
    fatherName: 'Rajesh Mehta',
    state: 'Maharashtra'
  });

  // Deliberate 2: Cross-Institution Duplicate conflict (Same APAAR enrolled at COEP and RVCE concurrently!)
  students.push({
    id: 'STU-2024-002',
    apaarId: '7721 9043 1184',
    studentId: 'COEP/2023/ME/018',
    name: 'Tanvi Sanjay Patil',
    dob: '2004-11-20',
    gender: 'Female',
    programme: 'B.Tech',
    course: 'Mechanical Engineering',
    year: 2,
    category: 'OBC-NCL',
    institutionId: 'INST102',
    institutionName: 'College of Engineering Pune (COEP Technological University)',
    admissionDate: '2023-08-14',
    quotaType: 'Regular',
    status: 'Flagged',
    flagReason: 'Potential duplicate enrolment across institutions. APAAR matches active student record at RVCE Bengaluru.',
    flagType: 'cross_institution',
    verificationCode: 'ADV-V893-T7721',
    consentGranted: true,
    consentDate: '2023-08-15',
    fatherName: 'Sanjay Patil',
    state: 'Maharashtra'
  });

  students.push({
    id: 'STU-2024-003',
    apaarId: '7721 9043 1184', // Same APAAR!
    studentId: 'RVCE/2023/AI/104',
    name: 'Tanvi S. Patil',
    dob: '2004-11-20',
    gender: 'Female',
    programme: 'B.Tech',
    course: 'Artificial Intelligence & Data Science',
    year: 2,
    category: 'OBC-NCL',
    institutionId: 'INST104',
    institutionName: 'RV College of Engineering (RVCE)',
    admissionDate: '2023-08-22',
    quotaType: 'Regular',
    status: 'Flagged',
    flagReason: 'Potential duplicate enrolment across institutions. APAAR matches active student record at COEP Pune.',
    flagType: 'cross_institution',
    verificationCode: 'ADV-V893-T7722',
    consentGranted: true,
    consentDate: '2023-08-23',
    fatherName: 'Sanjay Patil',
    state: 'Karnataka'
  });

  // Deliberate 3: Invalid APAAR ID (not 12 digits - format check failed)
  students.push({
    id: 'STU-2024-004',
    apaarId: '9842 1092', // Only 8 digits
    studentId: 'COEP/2023/CE/091',
    name: 'Rohan Pramod Kulkarni',
    dob: '2005-02-18',
    gender: 'Male',
    programme: 'B.Tech',
    course: 'Civil Engineering',
    year: 1,
    category: 'General',
    institutionId: 'INST102',
    institutionName: 'College of Engineering Pune (COEP Technological University)',
    admissionDate: '2023-09-01',
    quotaType: 'Regular',
    status: 'Flagged',
    flagReason: 'Invalid APAAR ID format. Standard 12-digit numeric identity string required.',
    flagType: 'invalid_apaar',
    verificationCode: 'ADV-ERR-004',
    consentGranted: false,
    fatherName: 'Pramod Kulkarni',
    state: 'Maharashtra'
  });

  // Deliberate 4: Duplicate record within same institution
  students.push({
    id: 'STU-2024-005',
    apaarId: '6630 1928 4401',
    studentId: 'COEP/2023/EE/045',
    name: 'Neha Sunil Joshi',
    dob: '2004-09-12',
    gender: 'Female',
    programme: 'B.Tech',
    course: 'Electronics & Telecom',
    year: 2,
    category: 'General',
    institutionId: 'INST102',
    institutionName: 'College of Engineering Pune (COEP Technological University)',
    admissionDate: '2023-08-12',
    quotaType: 'Regular',
    status: 'Validated',
    verificationCode: 'ADV-V893-N6630',
    consentGranted: true,
    consentDate: '2023-08-12',
    fatherName: 'Sunil Joshi',
    state: 'Maharashtra'
  });

  students.push({
    id: 'STU-2024-006',
    apaarId: '6630 1928 4401', // Identical APAAR within COEP
    studentId: 'COEP/2023/EE/046', // Duplicate entry under different roll no.
    name: 'Neha Joshi',
    dob: '2004-09-12',
    gender: 'Female',
    programme: 'B.Tech',
    course: 'Electronics & Telecom',
    year: 2,
    category: 'General',
    institutionId: 'INST102',
    institutionName: 'College of Engineering Pune (COEP Technological University)',
    admissionDate: '2023-08-13',
    quotaType: 'Regular',
    status: 'Flagged',
    flagReason: 'Duplicate student record within institution. APAAR ID already registered to STU-2024-005.',
    flagType: 'duplicate_record',
    verificationCode: 'ADV-ERR-006',
    consentGranted: false,
    fatherName: 'Sunil Joshi',
    state: 'Maharashtra'
  });

  // Deliberate 5: Admission exceeding approved intake (RVCE CSE over-intake student)
  students.push({
    id: 'STU-2024-007',
    apaarId: '8192 4019 7723',
    studentId: 'RVCE/2023/CS/991',
    name: 'Varun K. Rao',
    dob: '2003-12-05',
    gender: 'Male',
    programme: 'B.Tech',
    course: 'Computer Science and Engineering',
    year: 2,
    category: 'General',
    institutionId: 'INST104',
    institutionName: 'RV College of Engineering (RVCE)',
    admissionDate: '2023-09-15',
    quotaType: 'Supernumerary',
    status: 'Flagged',
    flagReason: 'Admissions exceed approved institutional intake quota for CSE (Enrolled: 1040, Approved: 960).',
    flagType: 'exceeds_intake',
    verificationCode: 'ADV-ERR-007',
    consentGranted: true,
    consentDate: '2023-09-16',
    fatherName: 'Krishna Rao',
    state: 'Karnataka'
  });

  // Deliberate 6: Data Inconsistency (Admission Date prior to DOB or invalid year logic)
  students.push({
    id: 'STU-2024-008',
    apaarId: '5519 2837 4910',
    studentId: 'COEP/2024/MT/009',
    name: 'Kavya Suresh Deshmukh',
    dob: '2024-01-10', // Inconsistent DOB: born same year as admission!
    gender: 'Female',
    programme: 'M.Tech',
    course: 'VLSI Design',
    year: 1,
    category: 'EWS',
    institutionId: 'INST102',
    institutionName: 'College of Engineering Pune (COEP Technological University)',
    admissionDate: '2024-07-20',
    quotaType: 'Regular',
    status: 'Flagged',
    flagReason: 'Data inconsistency flagged: DOB (2024-01-10) is incongruous with PG admission date (2024-07-20).',
    flagType: 'data_inconsistency',
    verificationCode: 'ADV-ERR-008',
    consentGranted: true,
    consentDate: '2024-07-20',
    fatherName: 'Suresh Deshmukh',
    state: 'Maharashtra'
  });

  // Deliberate 7: Another Cross-Institution conflict (PGDM student at KJ Somaiya and MBA at DTU Delhi)
  students.push({
    id: 'STU-2024-009',
    apaarId: '4390 1829 9901',
    studentId: 'KJSOM/2023/PG/088',
    name: 'Karan Vikram Aggarwal',
    dob: '2001-07-22',
    gender: 'Male',
    programme: 'PGDM',
    course: 'International Business',
    year: 2,
    category: 'General',
    institutionId: 'INST112',
    institutionName: 'K. J. Somaiya Institute of Management',
    admissionDate: '2023-07-15',
    quotaType: 'Regular',
    status: 'Flagged',
    flagReason: 'Cross-institution conflict: Active concurrent registration detected at DTU Delhi (MBA).',
    flagType: 'cross_institution',
    verificationCode: 'ADV-ERR-009',
    consentGranted: true,
    consentDate: '2023-07-16',
    fatherName: 'Vikram Aggarwal',
    state: 'Maharashtra'
  });

  students.push({
    id: 'STU-2024-010',
    apaarId: '4390 1829 9901',
    studentId: 'DTU/2023/MBA/024',
    name: 'Karan Aggarwal',
    dob: '2001-07-22',
    gender: 'Male',
    programme: 'MBA',
    course: 'Business Analytics',
    year: 2,
    category: 'General',
    institutionId: 'INST106',
    institutionName: 'Delhi Technological University (DTU)',
    admissionDate: '2023-08-01',
    quotaType: 'Regular',
    status: 'Flagged',
    flagReason: 'Cross-institution conflict: Active concurrent registration detected at KJ Somaiya Mumbai (PGDM).',
    flagType: 'cross_institution',
    verificationCode: 'ADV-ERR-010',
    consentGranted: true,
    consentDate: '2023-08-02',
    fatherName: 'Vikram Aggarwal',
    state: 'Delhi'
  });

  // 2. GENERATE REMAINING 290+ REALISTIC STUDENTS TO SURPASS 300
  // Distribute across INST102 (COEP - around 70 students for rich local testing) and other institutions
  const instIds = [
    'INST102', 'INST103', 'INST104', 'INST105', 'INST106', 'INST107', 'INST108', 'INST109',
    'INST110', 'INST111', 'INST112', 'INST113', 'INST114', 'INST115', 'INST116', 'INST117',
    'INST118', 'INST119', 'INST120', 'INST121', 'INST122', 'INST123', 'INST124', 'INST125', 'INST126'
  ];

  const instNames: Record<string, string> = {
    INST102: 'College of Engineering Pune (COEP Technological University)',
    INST103: 'Veermata Jijabai Technological Institute (VJTI)',
    INST104: 'RV College of Engineering (RVCE)',
    INST105: 'PSG College of Technology',
    INST106: 'Delhi Technological University (DTU)',
    INST107: 'Institute of Chemical Technology (ICT)',
    INST108: 'National Institute of Engineering (NIE)',
    INST109: 'BMS College of Engineering (BMSCE)',
    INST110: 'Sardar Patel Institute of Technology (SPIT)',
    INST111: 'Birla Institute of Technology, Mesra',
    INST112: 'K. J. Somaiya Institute of Management',
    INST113: 'Thiagarajar College of Engineering (TCE)',
    INST114: 'Government College of Technology (GCT)',
    INST115: 'Harcourt Butler Technical University (HBTU)',
    INST116: 'L. D. College of Engineering (LDCE)',
    INST117: 'Chaitanya Bharathi Institute of Technology (CBIT)',
    INST118: 'College of Engineering Trivandrum (CET)',
    INST119: 'Guru Nanak Dev Engineering College (GNDEC)',
    INST120: 'Malaviya National Institute of Technology Jaipur (MNIT)',
    INST121: 'Jadavpur University, Faculty of Engineering & Technology',
    INST122: 'Vellore Institute of Technology (VIT Bhopal Campus)',
    INST123: 'Government Engineering College, Thrissur (GECT)',
    INST124: 'National Institute of Foundry and Forge Technology (NIFFT)',
    INST125: 'Andhra University College of Engineering (AUCE)',
    INST126: 'Shri Govindram Seksaria Institute of Technology and Science (SGSITS)'
  };

  const categories: Array<Student['category']> = ['General', 'OBC-NCL', 'SC', 'ST', 'EWS'];
  const quotas: Array<Student['quotaType']> = ['Regular', 'Regular', 'Regular', 'Regular', 'Supernumerary', 'NRI', 'OCI', 'Foreign National'];

  let idCounter = 11;
  const targetCount = 315;

  while (idCounter <= targetCount) {
    const fName = firstNames[(idCounter * 7) % firstNames.length];
    const lName = lastNames[(idCounter * 11) % lastNames.length];
    const fullName = `${fName} ${lName}`;
    const gender: 'Male' | 'Female' = (idCounter % 3 === 0) ? 'Female' : 'Male';
    
    // Give more students to INST102 so the institution portal has great rich data
    const instId = (idCounter <= 75) 
      ? 'INST102' 
      : instIds[idCounter % instIds.length];
    
    const instName = instNames[instId] || 'College of Engineering Pune (COEP Technological University)';
    const prog = programmesList[idCounter % programmesList.length];
    const progCourses = coursesMap[prog];
    const course = progCourses[idCounter % progCourses.length];
    const yr = (idCounter % 4) + 1;
    const cat = categories[idCounter % categories.length];
    const quota = quotas[idCounter % quotas.length];

    // APAAR generation (12 digits)
    const part1 = (2000 + (idCounter * 31) % 7000).toString().padStart(4, '0');
    const part2 = (1000 + (idCounter * 83) % 8000).toString().padStart(4, '0');
    const part3 = (1000 + (idCounter * 97) % 8999).toString().padStart(4, '0');
    const apaarFormatted = `${part1} ${part2} ${part3}`;

    const birthYear = 2005 - yr;
    const birthMonth = ((idCounter * 3) % 12 + 1).toString().padStart(2, '0');
    const birthDay = ((idCounter * 5) % 27 + 1).toString().padStart(2, '0');
    const dob = `${birthYear}-${birthMonth}-${birthDay}`;

    const adminYear = 2024 - (yr - 1);
    const admissionDate = `${adminYear}-08-${((idCounter * 2) % 25 + 1).toString().padStart(2, '0')}`;

    // Status: 92% validated, 8% pending
    const status: Student['status'] = (idCounter % 14 === 0) ? 'Pending' : 'Validated';

    students.push({
      id: `STU-2024-${idCounter.toString().padStart(3, '0')}`,
      apaarId: apaarFormatted,
      studentId: `${instId}/${adminYear}/${prog.slice(0, 2)}/${(100 + idCounter).toString()}`,
      name: fullName,
      dob,
      gender,
      programme: prog,
      course,
      year: yr,
      category: cat,
      institutionId: instId,
      institutionName: instName,
      admissionDate,
      quotaType: quota,
      status,
      verificationCode: `ADV-V${(1000 + idCounter * 17).toString(16).toUpperCase()}-${idCounter.toString().padStart(4, '0')}`,
      consentGranted: idCounter % 15 !== 0,
      consentDate: idCounter % 15 !== 0 ? admissionDate : undefined,
      fatherName: `${firstNames[(idCounter * 3) % firstNames.length]} ${lName}`,
      state: statesList[idCounter % statesList.length]
    });

    idCounter++;
  }

  return students;
};

export const mockStudents: Student[] = generateMockStudents();

