import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  Server,
  Plus,
  RefreshCw,
  FileCheck,
  Calendar,
  User,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Student, Programme, QuotaType } from '../../types';

export const StudentDataUpload: React.FC = () => {
  const { user } = useAuth();
  const { addStudent, batchAddStudents, institutions } = useData();
  const toast = useToast();

  const currentInst =
    institutions.find((i) => i.id === (user?.institutionId || 'INST102')) || institutions[0];

  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'api'>('single');

  // ================= SINGLE ENTRY STATE =================
  const [formData, setFormData] = useState({
    name: '',
    apaarId: '',
    studentId: '',
    dob: '2005-06-15',
    gender: 'Male' as Student['gender'],
    programme: 'B.Tech' as Programme,
    course: 'Computer Science and Engineering',
    year: 1,
    category: 'General' as Student['category'],
    admissionDate: '2024-08-01',
    quotaType: 'Regular' as QuotaType,
    fatherName: '',
    state: currentInst.state || 'Maharashtra',
    // Quota context fields
    approvedIntakeContext: currentInst.approvedIntake,
    actualEnrolmentContext: currentInst.actualEnrolment,
    supernumerarySeat: false,
    nriCategory: false,
    ociStatus: false,
    foreignNationalStatus: false,
    consentAffirmation: true
  });

  const [isSubmittingSingle, setIsSubmittingSingle] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState<'valid' | 'invalid' | null>(null);

  // ================= BULK CSV STATE =================
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<Partial<Student>[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

  // ================= API SYNC STATE =================
  const [erpSystem, setErpSystem] = useState('TCS iON Campus Management');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncResult, setSyncResult] = useState<{ synced: number; flagged: number } | null>(null);

  // ---------------- Handlers ----------------

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.apaarId || !formData.studentId) {
      toast.error('Incomplete Fields', 'Please complete the student name, 12-digit APAAR ID, and Student ID.');
      return;
    }

    setIsSubmittingSingle(true);

    let quota: QuotaType = 'Regular';
    if (formData.foreignNationalStatus) quota = 'Foreign National';
    else if (formData.nriCategory) quota = 'NRI';
    else if (formData.ociStatus) quota = 'OCI';
    else if (formData.supernumerarySeat) quota = 'Supernumerary';

    const newStudent = addStudent({
      apaarId: formData.apaarId,
      studentId: formData.studentId,
      name: formData.name,
      dob: formData.dob,
      gender: formData.gender,
      programme: formData.programme,
      course: formData.course,
      year: Number(formData.year),
      category: formData.category,
      institutionId: currentInst.id,
      institutionName: currentInst.name,
      admissionDate: formData.admissionDate,
      quotaType: quota,
      fatherName: formData.fatherName || 'Parent / Guardian',
      state: formData.state,
      consentGranted: formData.consentAffirmation,
      consentDate: formData.admissionDate
    });

    setIsSubmittingSingle(false);

    if (newStudent.status === 'Validated') {
      toast.success(
        'Student Enrolled & Validated',
        `${newStudent.name} (${newStudent.apaarId}) verified and synced with AICTE Central Vault.`
      );
    } else {
      toast.warning(
        'Student Enrolled with Flag',
        `Record flagged: ${newStudent.flagReason || 'Requires validation review in Validation Center.'}`
      );
    }

    // Reset single form
    handleResetForm();
  };

  // Reset all single-entry fields to blank defaults
  const handleResetForm = () => {
    setFormData({
      name: '',
      apaarId: '',
      studentId: '',
      dob: '2005-06-15',
      gender: 'Male',
      programme: 'B.Tech',
      course: 'Computer Science and Engineering',
      year: 1,
      category: 'General',
      admissionDate: '2024-08-01',
      quotaType: 'Regular',
      fatherName: '',
      state: currentInst.state || 'Maharashtra',
      approvedIntakeContext: currentInst.approvedIntake,
      actualEnrolmentContext: currentInst.actualEnrolment,
      supernumerarySeat: false,
      nriCategory: false,
      ociStatus: false,
      foreignNationalStatus: false,
      consentAffirmation: true
    });
    setDemoLoaded(null);
  };

  // One-Click Autofill with Demonstration Student Record (Requirement 3)
  const handleAutofillSampleData = () => {
    setFormData({
      name: 'Ishaan Vikram Malhotra',
      apaarId: '7721 9043 1184', // Exactly 12 digits
      studentId: `${currentInst.id}/2024/CSE/058`,
      dob: '2005-04-12',
      gender: 'Male',
      programme: 'B.Tech',
      course: 'Computer Science and Engineering',
      year: 1,
      category: 'General',
      admissionDate: '2024-08-01',
      quotaType: 'Regular',
      fatherName: 'Vikram Malhotra',
      state: currentInst.state || 'Maharashtra',
      approvedIntakeContext: currentInst.approvedIntake,
      actualEnrolmentContext: currentInst.actualEnrolment,
      supernumerarySeat: false,
      nriCategory: false,
      ociStatus: false,
      foreignNationalStatus: false,
      consentAffirmation: true
    });
    setDemoLoaded('valid');
    toast.info('Sample Data Autofilled', 'Populated valid student admission record. All fields remain fully editable.');
  };

  // Load Invalid Sample for Testing Existing Validation Rules (Requirement 3C)
  const handleLoadInvalidSample = () => {
    setFormData({
      name: 'Priya Anand Deshmukh',
      apaarId: '9841 2309', // Deliberately invalid: only 8 digits!
      studentId: `${currentInst.id}/2024/IT/088`,
      dob: '2005-09-18',
      gender: 'Female',
      programme: 'B.Tech',
      course: 'Information Technology',
      year: 1,
      category: 'OBC-NCL',
      admissionDate: '2024-08-01',
      quotaType: 'Regular',
      fatherName: 'Anand Deshmukh',
      state: currentInst.state || 'Maharashtra',
      approvedIntakeContext: currentInst.approvedIntake,
      actualEnrolmentContext: currentInst.actualEnrolment,
      supernumerarySeat: false,
      nriCategory: false,
      ociStatus: false,
      foreignNationalStatus: false,
      consentAffirmation: true
    });
    setDemoLoaded('invalid');
    toast.warning('Invalid Test Sample Loaded', 'Populated sample with an 8-digit APAAR code to test format validation rules.');
  };

  // Quick fill sample single student (retained for backward compatibility)
  const handleQuickFillSingle = (type: 'valid' | 'invalid_apaar' | 'over_quota') => {
    if (type === 'valid') {
      handleAutofillSampleData();
    } else if (type === 'invalid_apaar') {
      handleLoadInvalidSample();
    } else {
      setFormData({
        ...formData,
        name: 'Zayed Al Mansoor',
        apaarId: '4491 8203 1194',
        studentId: `${currentInst.id}/2024/FN/003`,
        dob: '2004-11-05',
        gender: 'Male',
        programme: 'B.Tech',
        course: 'Mechanical Engineering',
        year: 1,
        category: 'General',
        fatherName: 'Hamid Al Mansoor',
        supernumerarySeat: true,
        nriCategory: false,
        ociStatus: false,
        foreignNationalStatus: true
      });
      setDemoLoaded('valid');
      toast.info('Supernumerary FN Sample Loaded', 'Tests Foreign National supernumerary quota handling.');
    }
  };

  // Download Sample CSV
  const handleDownloadTemplate = () => {
    const csvContent =
      'apaar_id,student_id,name,dob,gender,programme,course,year,category,admission_date,quota_type,state\n' +
      '9812 4401 9283,COEP/2024/CS/081,Arjun Narendra Verma,2005-03-12,Male,B.Tech,Computer Science and Engineering,1,General,2024-08-01,Regular,Maharashtra\n' +
      '8821 9012 3341,COEP/2024/CS/082,Anushka Rajesh Pillai,2005-07-25,Female,B.Tech,Computer Science and Engineering,1,General,2024-08-01,Regular,Maharashtra\n' +
      '7721 9043 1184,COEP/2024/ME/018,Tanvi Sanjay Patil,2004-11-20,Female,B.Tech,Mechanical Engineering,2,OBC-NCL,2023-08-14,Regular,Maharashtra\n' +
      '1234 5678,COEP/2024/CV/099,Corrupt Sample Student,2005-01-01,Male,B.Tech,Civil Engineering,1,SC,2024-08-01,Regular,Maharashtra\n' +
      '9012 8841 2291,COEP/2024/FN/011,Tariq Omar,2004-09-09,Male,B.Tech,Mechanical Engineering,1,General,2024-08-01,Foreign National,Maharashtra\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AICTE_APAAR_Upload_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Template Downloaded', 'Use this format for bulk CSV submissions.');
  };

  // Simulated CSV drop or file selection
  const handleSimulatedFileUpload = () => {
    setIsParsing(true);
    setCsvFileName('AICTE_APAAR_Batch_Admissions_2024.csv');

    setTimeout(() => {
      const mockBatch: Partial<Student>[] = [
        {
          apaarId: '9812 4401 9283',
          studentId: `${currentInst.id}/2024/CS/081`,
          name: 'Arjun Narendra Verma',
          dob: '2005-03-12',
          gender: 'Male',
          programme: 'B.Tech',
          course: 'Computer Science and Engineering',
          year: 1,
          category: 'General',
          institutionId: currentInst.id,
          institutionName: currentInst.name,
          admissionDate: '2024-08-01',
          quotaType: 'Regular',
          state: currentInst.state
        },
        {
          apaarId: '8821 9012 3341',
          studentId: `${currentInst.id}/2024/CS/082`,
          name: 'Anushka Rajesh Pillai',
          dob: '2005-07-25',
          gender: 'Female',
          programme: 'B.Tech',
          course: 'Computer Science and Engineering',
          year: 1,
          category: 'General',
          institutionId: currentInst.id,
          institutionName: currentInst.name,
          admissionDate: '2024-08-01',
          quotaType: 'Regular',
          state: currentInst.state
        },
        {
          apaarId: '4819 2039', // Deliberate format error (8 digits)
          studentId: `${currentInst.id}/2024/CE/099`,
          name: 'Rohit Balaji Shinde',
          dob: '2005-01-14',
          gender: 'Male',
          programme: 'B.Tech',
          course: 'Civil Engineering',
          year: 1,
          category: 'OBC-NCL',
          institutionId: currentInst.id,
          institutionName: currentInst.name,
          admissionDate: '2024-08-01',
          quotaType: 'Regular',
          state: currentInst.state
        },
        {
          apaarId: '9012 8841 2291',
          studentId: `${currentInst.id}/2024/FN/011`,
          name: 'Tariq Omar Al-Zahrani',
          dob: '2004-09-09',
          gender: 'Male',
          programme: 'B.Tech',
          course: 'Mechanical Engineering',
          year: 1,
          category: 'General',
          institutionId: currentInst.id,
          institutionName: currentInst.name,
          admissionDate: '2024-08-01',
          quotaType: 'Foreign National',
          state: currentInst.state
        },
        {
          apaarId: '7721 9043 1184', // Cross-institution conflict!
          studentId: `${currentInst.id}/2024/ME/018`,
          name: 'Tanvi Sanjay Patil',
          dob: '2004-11-20',
          gender: 'Female',
          programme: 'B.Tech',
          course: 'Mechanical Engineering',
          year: 2,
          category: 'OBC-NCL',
          institutionId: currentInst.id,
          institutionName: currentInst.name,
          admissionDate: '2024-08-14',
          quotaType: 'Regular',
          state: currentInst.state
        }
      ];

      setParsedRows(mockBatch);
      setIsParsing(false);
      toast.info('File Parsed', 'Parsed 5 rows from CSV. Review validation summary below before submitting.');
    }, 600);
  };

  const handleCommitBulk = () => {
    if (parsedRows.length === 0) return;
    setIsSubmittingBulk(true);

    setTimeout(() => {
      const result = batchAddStudents(parsedRows);
      setIsSubmittingBulk(false);
      setParsedRows([]);
      setCsvFileName(null);
      toast.success(
        'Batch Submitted Successfully',
        `Processed ${result.added + result.flagged} records (${result.added} validated, ${result.flagged} flagged for inspection).`
      );
    }, 700);
  };

  // API Sync Trigger
  const handleTriggerApiSync = () => {
    setIsSyncing(true);
    setSyncProgress(15);
    setSyncResult(null);

    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setIsSyncing(false);
            setSyncProgress(100);
            setSyncResult({ synced: 42, flagged: 2 });
            toast.success('SIS ERP Synchronized', 'Retrieved 42 student admission records from institutional gateway.');
          }, 400);
          return 95;
        }
        return prev + 25;
      });
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-[#1E9E5A] tracking-wider uppercase">
            Data Ingestion Hub
          </span>
          <h1 className="text-2xl font-bold text-[#14233F] tracking-tight">
            Student Data Upload &amp; Registry
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5">
            Keyed by 12-digit APAAR ID. Enforces approved intake quotas and supernumerary caps.
          </p>
        </div>

        <Badge variant="dark" size="md">
          {currentInst.shortName} &bull; Intake: {currentInst.approvedIntake}
        </Badge>
      </div>

      {/* Upload Mode Tabs */}
      <div className="flex bg-[#EBF3EF] p-1.5 rounded-2xl border border-[#D1DCD6] max-w-xl">
        <button
          type="button"
          onClick={() => setActiveTab('single')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'single'
              ? 'bg-[#14513A] text-white shadow-xs'
              : 'text-[#4B5563] hover:text-[#14233F]'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Single-Entry Form</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bulk')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'bulk'
              ? 'bg-[#14513A] text-white shadow-xs'
              : 'text-[#4B5563] hover:text-[#14233F]'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Bulk CSV / Excel</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('api')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'api'
              ? 'bg-[#14513A] text-white shadow-xs'
              : 'text-[#4B5563] hover:text-[#14233F]'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>API / SIS Sync</span>
        </button>
      </div>

      {/* ================= TAB 1: SINGLE ENTRY FORM ================= */}
      {activeTab === 'single' && (
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E3EAE6] mb-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-[#14233F]">
                  Student-Level APAAR Admission Record
                </h3>
                {demoLoaded === 'valid' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#14513A] bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                    <Sparkles className="w-3 h-3 text-[#1E9E5A]" />
                    Demo Data Loaded
                  </span>
                )}
                {demoLoaded === 'invalid' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Invalid Test Sample
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8A94A0] mt-0.5">
                All 17 statutory parameters required for AICTE Central Repository reconciliation.
              </p>
            </div>

            {/* Quick Fill / Autofill Controls (Requirement 3) */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleAutofillSampleData}
                className="flex items-center gap-1.5 shadow-xs font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>Autofill Sample Data</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadInvalidSample}
                className="flex items-center gap-1.5 text-amber-900 border-amber-300 hover:bg-amber-50 font-medium"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Load Invalid Sample</span>
              </Button>

              {demoLoaded && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs text-[#8A94A0] hover:text-[#14233F] px-2 py-1 rounded cursor-pointer transition-colors"
                >
                  Clear Sample
                </button>
              )}
            </div>
          </div>

          {/* Subtle Demo Data Alert Banner (Requirement 3B / 3C) */}
          {demoLoaded === 'valid' && (
            <div className="mb-6 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-[#14513A] shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-1 bg-[#14513A] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0">
                  <Sparkles className="w-3 h-3" />
                  Demo Data
                </span>
                <span className="text-[#374151]">
                  Predefined demonstration student record loaded for <strong>{currentInst.name} ({currentInst.id})</strong>. All fields remain fully editable. Click <em>"Submit &amp; Validate Record"</em> below to run APAAR validation.
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetForm}
                className="text-[11px] font-semibold text-[#14513A] hover:underline cursor-pointer flex-shrink-0 self-start sm:self-auto"
              >
                Reset Fields
              </button>
            </div>
          )}

          {demoLoaded === 'invalid' && (
            <div className="mb-6 p-3 bg-amber-50/80 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-950 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-1 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0">
                  <AlertTriangle className="w-3 h-3" />
                  Invalid Test Data
                </span>
                <span className="text-[#374151]">
                  Deliberately invalid demonstration record loaded with a <strong>truncated 8-digit APAAR code</strong> to test format validation rules. All fields remain fully editable.
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetForm}
                className="text-[11px] font-semibold text-amber-900 hover:underline cursor-pointer flex-shrink-0 self-start sm:self-auto"
              >
                Reset Fields
              </button>
            </div>
          )}

          <form onSubmit={handleSingleSubmit} className="space-y-6">
            {/* Section 1: Academic Identity */}
            <div>
              <h4 className="text-xs font-bold text-[#14513A] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#1E9E5A]" />
                <span>1. Academic Identity &amp; Verification Keys</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="12-DIGIT APAAR ID *"
                  placeholder="e.g. 9824 5510 8392"
                  value={formData.apaarId}
                  onChange={(e) => setFormData({ ...formData, apaarId: e.target.value })}
                  hint="National Academic Account Registry identifier"
                  required
                />
                <Input
                  label="INSTITUTION STUDENT ROLL / REG. ID *"
                  placeholder="e.g. COEP/2024/CS/042"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  required
                />
                <Input
                  label="AICTE INSTITUTION ID"
                  value={currentInst.id}
                  disabled
                  hint={`${currentInst.name}`}
                />
              </div>
            </div>

            {/* Section 2: Personal Profile */}
            <div>
              <h4 className="text-xs font-bold text-[#14513A] uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-[#1E9E5A]" />
                <span>2. Personal Demographic Data</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="STUDENT FULL NAME (AS PER APAAR/AADHAAR) *"
                    placeholder="Enter student full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <Input
                  type="date"
                  label="DATE OF BIRTH (DOB) *"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  required
                />
                <div>
                  <label className="text-xs font-bold text-[#14233F] uppercase tracking-wider block mb-1.5">
                    GENDER *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full rounded-xl border border-[#D1DCD6] px-3.5 py-2.5 text-sm text-[#14233F] bg-white focus:border-[#14513A] focus:ring-2 focus:ring-[#14513A]/20 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <Input
                  label="FATHER'S / GUARDIAN'S NAME"
                  placeholder="Enter guardian name"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                />
                <div>
                  <label className="text-xs font-bold text-[#14233F] uppercase tracking-wider block mb-1.5">
                    SOCIAL CATEGORY *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full rounded-xl border border-[#D1DCD6] px-3.5 py-2.5 text-sm text-[#14233F] bg-white focus:border-[#14513A] focus:ring-2 focus:ring-[#14513A]/20 outline-none"
                  >
                    <option value="General">General (Open)</option>
                    <option value="OBC-NCL">OBC-NCL</option>
                    <option value="SC">SC (Scheduled Caste)</option>
                    <option value="ST">ST (Scheduled Tribe)</option>
                    <option value="EWS">EWS (Economically Weaker Section)</option>
                  </select>
                </div>
                <Input
                  label="DOMICILE STATE *"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Section 3: Academic Programme & Intake Context */}
            <div>
              <h4 className="text-xs font-bold text-[#14513A] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#1E9E5A]" />
                <span>3. Programme Details &amp; Quota Categorization</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#14233F] uppercase tracking-wider block mb-1.5">
                    PROGRAMME *
                  </label>
                  <select
                    value={formData.programme}
                    onChange={(e) => setFormData({ ...formData, programme: e.target.value as any })}
                    className="w-full rounded-xl border border-[#D1DCD6] px-3.5 py-2.5 text-sm text-[#14233F] bg-white focus:border-[#14513A] focus:ring-2 focus:ring-[#14513A]/20 outline-none"
                  >
                    <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                    <option value="M.Tech">M.Tech (Master of Technology)</option>
                    <option value="MBA">MBA</option>
                    <option value="PGDM">PGDM (Standalone AICTE)</option>
                    <option value="MCA">MCA</option>
                    <option value="Diploma">Diploma in Engineering</option>
                    <option value="B.Pharm">B.Pharm (Pharmacy)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label="COURSE / SPECIALIZATION *"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#14233F] uppercase tracking-wider block mb-1.5">
                    ACADEMIC YEAR *
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full rounded-xl border border-[#D1DCD6] px-3.5 py-2.5 text-sm text-[#14233F] bg-white focus:border-[#14513A] focus:ring-2 focus:ring-[#14513A]/20 outline-none"
                  >
                    <option value={1}>1st Year (Fresh Admission)</option>
                    <option value={2}>2nd Year (Lateral Entry / Continuing)</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year (Final)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <Input
                  type="date"
                  label="ADMISSION DATE *"
                  value={formData.admissionDate}
                  onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                  required
                />
                <div>
                  <label className="text-xs font-bold text-[#14233F] uppercase tracking-wider block mb-1.5">
                    PRIMARY QUOTA CLASSIFICATION
                  </label>
                  <select
                    value={formData.quotaType}
                    onChange={(e) => setFormData({ ...formData, quotaType: e.target.value as any })}
                    className="w-full rounded-xl border border-[#D1DCD6] px-3.5 py-2.5 text-sm text-[#14233F] bg-white focus:border-[#14513A] focus:ring-2 focus:ring-[#14513A]/20 outline-none"
                  >
                    <option value="Regular">Regular Sanctioned Quota</option>
                    <option value="Supernumerary">Supernumerary Quota (15% Cap)</option>
                    <option value="NRI">NRI (Non-Resident Indian)</option>
                    <option value="OCI">OCI (Overseas Citizen of India)</option>
                    <option value="Foreign National">Foreign National (FN)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Special Status Toggles */}
            <div className="bg-[#F4F8F6] p-4 rounded-xl border border-[#E3EAE6]">
              <h5 className="text-xs font-bold text-[#14233F] uppercase tracking-wider mb-3">
                Mandatory Statutory Quota Checks (AICTE APH 2026-27)
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.supernumerarySeat}
                    onChange={(e) => setFormData({ ...formData, supernumerarySeat: e.target.checked })}
                    className="w-4 h-4 text-[#14513A] rounded border-[#D1DCD6]"
                  />
                  <span className="font-medium text-[#14233F]">Supernumerary Seat</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.nriCategory}
                    onChange={(e) => setFormData({ ...formData, nriCategory: e.target.checked })}
                    className="w-4 h-4 text-[#14513A] rounded border-[#D1DCD6]"
                  />
                  <span className="font-medium text-[#14233F]">NRI Category</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ociStatus}
                    onChange={(e) => setFormData({ ...formData, ociStatus: e.target.checked })}
                    className="w-4 h-4 text-[#14513A] rounded border-[#D1DCD6]"
                  />
                  <span className="font-medium text-[#14233F]">OCI Status</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.foreignNationalStatus}
                    onChange={(e) => setFormData({ ...formData, foreignNationalStatus: e.target.checked })}
                    className="w-4 h-4 text-[#14513A] rounded border-[#D1DCD6]"
                  />
                  <span className="font-medium text-[#14233F]">Foreign National (FN)</span>
                </label>
              </div>

              {/* Consent checkbox */}
              <div className="mt-4 pt-3 border-t border-[#D1DCD6]">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consentAffirmation}
                    onChange={(e) => setFormData({ ...formData, consentAffirmation: e.target.checked })}
                    className="w-4 h-4 text-[#14513A] rounded border-[#D1DCD6] mt-0.5"
                  />
                  <span className="text-xs text-[#4B5563]">
                    <strong>DPDP Consent Log:</strong> The institution affirms that explicit student consent has been obtained for linking this record to the AICTE National APAAR Registry for verification purposes.
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetForm}
              >
                Reset Fields
              </Button>
              <Button type="submit" isLoading={isSubmittingSingle} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Submit &amp; Validate Record
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ================= TAB 2: BULK CSV / EXCEL UPLOAD ================= */}
      {activeTab === 'bulk' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E3EAE6]">
              <div>
                <h3 className="text-base font-bold text-[#14233F]">
                  Bulk Student Enrolment Upload
                </h3>
                <p className="text-xs text-[#8A94A0] mt-0.5">
                  Upload CSV or Excel data. Pre-validates APAAR format, duplicates, and intake quotas.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                leftIcon={<Download className="w-4 h-4 text-[#14513A]" />}
              >
                Download Official CSV Template
              </Button>
            </div>

            {/* Drag & Drop Area */}
            <div
              onClick={handleSimulatedFileUpload}
              className="mt-6 border-2 border-dashed border-[#A8C2B6] hover:border-[#14513A] bg-[#F4F8F6]/60 hover:bg-[#EBF3EF] rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all group"
            >
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm text-[#14513A] group-hover:scale-105 flex items-center justify-center mx-auto mb-4 transition-transform border border-[#D1DCD6]">
                <UploadCloud className="w-7 h-7 text-[#14513A]" />
              </div>

              <h4 className="text-sm font-bold text-[#14233F]">
                {csvFileName ? `File Selected: ${csvFileName}` : 'Drag and drop your CSV / XLSX file here'}
              </h4>
              <p className="text-xs text-[#4B5563] mt-1 max-w-md mx-auto">
                {csvFileName
                  ? 'Click to choose another file or proceed with the preview below.'
                  : 'Or click anywhere inside this dropzone to browse files from your computer. (Max 5,000 rows per batch)'}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#14513A] bg-white px-3 py-1.5 rounded-lg border border-[#D1DCD6]">
                <FileCheck className="w-4 h-4 text-[#1E9E5A]" />
                <span>Simulate AICTE Batch Load (Sample Records)</span>
              </div>
            </div>
          </Card>

          {/* Parsed Rows Preview Table */}
          {parsedRows.length > 0 && (
            <Card className="p-6 space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-[#14233F]">
                    Pre-Commit Validation Preview ({parsedRows.length} Records)
                  </h4>
                  <p className="text-xs text-[#8A94A0]">
                    Review validation statuses. Records with errors will be marked in Validation Center.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setParsedRows([]);
                      setCsvFileName(null);
                    }}
                  >
                    Discard Batch
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCommitBulk}
                    isLoading={isSubmittingBulk}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Commit {parsedRows.length} Records to Registry
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto border border-[#E3EAE6] rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F4F8F6] text-[#8A94A0] uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">APAAR ID</th>
                      <th className="py-2.5 px-3">Student Roll ID</th>
                      <th className="py-2.5 px-3">Programme</th>
                      <th className="py-2.5 px-3">Quota</th>
                      <th className="py-2.5 px-3">Pre-Check Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3EAE6] font-medium text-[#4B5563]">
                    {parsedRows.map((r, i) => {
                      const cleanApaar = (r.apaarId || '').replace(/\D/g, '');
                      const isFormatErr = cleanApaar.length !== 12;
                      const isConflict = r.apaarId === '7721 9043 1184';

                      return (
                        <tr key={i} className="hover:bg-[#F4F8F6]">
                          <td className="py-2.5 px-3 font-bold text-[#14233F]">{r.name}</td>
                          <td className="py-2.5 px-3 font-mono">
                            {r.apaarId}
                            {isFormatErr && (
                              <span className="block text-[10px] text-[#D64545] font-semibold">
                                Error: {cleanApaar.length} digits
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono">{r.studentId}</td>
                          <td className="py-2.5 px-3">{r.programme}</td>
                          <td className="py-2.5 px-3">{r.quotaType}</td>
                          <td className="py-2.5 px-3">
                            {isFormatErr ? (
                              <Badge variant="error" size="sm">Invalid APAAR</Badge>
                            ) : isConflict ? (
                              <Badge variant="warning" size="sm">Cross-Inst Conflict</Badge>
                            ) : (
                              <Badge variant="success" size="sm">Format OK</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ================= TAB 3: API & SIS INTEGRATION ================= */}
      {activeTab === 'api' && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#14233F]">
              ERP / SIS Automated Synchronization Gateway
            </h3>
            <p className="text-xs text-[#8A94A0] mt-0.5">
              Pull live admissions data directly from institutional management software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-[#14233F] uppercase tracking-wider block mb-1.5">
                Institutional SIS Software
              </label>
              <select
                value={erpSystem}
                onChange={(e) => setErpSystem(e.target.value)}
                className="w-full rounded-xl border border-[#D1DCD6] px-3.5 py-2.5 text-sm text-[#14233F] bg-white focus:border-[#14513A] outline-none"
              >
                <option value="TCS iON Campus Management">TCS iON Campus Management</option>
                <option value="ERPNext Higher Education">ERPNext Higher Education</option>
                <option value="SAP Campus Management Gateway">SAP Campus Management Gateway</option>
                <option value="In-House Autonomous SIS API">In-House Autonomous SIS API</option>
              </select>
            </div>

            <div>
              <Input
                label="ENDPOINT URL"
                value="https://erp.coep.ac.in/api/v2/aicte-sync"
                disabled
              />
            </div>

            <div>
              <Input
                label="ACTIVE AUTH TOKEN"
                value="adv_live_981240182930491823"
                disabled
              />
            </div>
          </div>

          {/* Sync Trigger Box */}
          <div className="bg-[#F4F8F6] p-6 rounded-2xl border border-[#E3EAE6] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-[#14233F]">Synchronize Academic Year 2026-27</h4>
              <p className="text-xs text-[#4B5563] mt-0.5">
                Pulls all approved admissions and runs automated APAAR format and duplicate detection.
              </p>
            </div>

            <Button
              onClick={handleTriggerApiSync}
              isLoading={isSyncing}
              leftIcon={<RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />}
            >
              {isSyncing ? 'Synchronizing with SIS...' : 'Run Sync Now'}
            </Button>
          </div>

          {/* Progress Bar when syncing */}
          {isSyncing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#14513A]">
                <span>Querying SIS Database &amp; APAAR Registry...</span>
                <span>{syncProgress}%</span>
              </div>
              <div className="w-full bg-[#D1DCD6] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#14513A] h-full rounded-full transition-all duration-300"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Sync Result */}
          {syncResult && (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-[#14513A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#1E9E5A] flex-shrink-0" />
                <span>
                  Sync complete: <strong>{syncResult.synced} records ingested</strong> &bull; {syncResult.flagged} flagged for manual review.
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#4B5563]">Last sync: Just now</span>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

