# ADVAIT — AICTE APAAR Student Registry & Verification Platform

> **"Trust in Every Record. Transparency in Every Step."**  
> *Official Student Data Management & Verification Platform for the All India Council for Technical Education (AICTE), Ministry of Education, Government of India.*

---

## 🏛️ Executive Overview & Problem Solved

AICTE receives student data from approved institutions through disparate mechanisms. While PGDM institutions submit detailed student records annually, other institutions traditionally submit only statistical totals (e.g. gross enrolment) during approval cycles. This created incomplete student audit trails and made credentials difficult to verify.

**ADVAIT** unifies all technical education admissions under India's **12-digit APAAR ID** (Automated Permanent Academic Account Registry) as the single academic identity anchor. It establishes an end-to-end automated pipeline:

```
Institution ➔ Student Data Upload ➔ APAAR Validation ➔ Data Verification ➔ AICTE Central Repository ➔ Analytics & Monitoring ➔ Authorized Verification
```

---

## 🔑 Demo Access Credentials

The portal features quick-fill buttons on the login screen for instant evaluation:

| Stakeholder Role | Login ID | Password | Portal Features & Capabilities |
|---|---|---|---|
| **Institution Admin** | `INST102` | `Demo@123` | College of Engineering Pune (COEP): Single & Bulk Data Upload, Validation Center, Verifiable Records, Degree Certificate Preview, API Management, Student DPDP Consent |
| **AICTE Official** | `AICTE001` | `Admin@123` | AICTE Headquarters New Delhi: National Intake Analytics, Quota Monitoring, Intelligent Anomaly Detection, Cross-Institution Duplicate Detector, Central Repository, Regulatory Reports, Audit Trail, RBAC Governance |
| **Authorized Verifier** | *(No credentials required)* | Direct at `/verify` | Employers, verification agencies, regulators: Privacy-preserving instant credential check with CAPTCHA verification |

---

## ✨ Key Platform Features

### 1. Visual Reference & Pixel-Perfect Design
- Exact replication of the government visual design language:
  - **Primary Palette**: Dark Green `#14513A`, Hover `#0E3B2A`, Accent Green `#1E9E5A`, Navy `#14233F`, Amber `#F5B335`, Alert Red `#D64545`.
  - **Branding**: Official AICTE Emblem SVG, stylized **ADVAIT** wordmark with emerald chevron 'A', tagline *"Trust in Every Record. Transparency in Every Step."*, and Hindi lockup *"अखिल भारतीय तकनीकी शिक्षा परिषद"*.
  - **Faint Watermarks**: Subtle outline illustrations of graduation cap, open book, and institution pillars.
  - **Top Announcement Banner**: AICTE Regulation 2026 order with interactive modal reader.
  - **Government SSO**: Simulated MeriPehchaan / DigiLocker National Single Sign-On (NSSO) dialog.

### 2. Institution Portal (`/institution/*`)
- **Real-Time KPI Dashboard**: Sanctioned intake, actual enrolment, supernumerary usage, and live intake-vs-enrolment Recharts visualization.
- **Three Data Ingestion Channels**:
  - *Single-Entry Form*: 17 statutory fields (Approved Intake, Enrolment, Supernumerary, NRI, OCI, FN, DOB, Gender, Programme, Category, Admission Date, APAAR ID).
  - *Bulk CSV / Excel Dropzone*: Drag-and-drop file ingestion with downloadable official CSV template, row parsing, and pre-commit error preview table.
  - *API & SIS Gateway*: Simulated sync with institutional ERPs (TCS iON, ERPNext, SAP Campus) with real-time progress bar.
- **Student Records Roster**: Searchable, filterable by programme, year, category, and status with pagination, detailed student dossier view, and inline record editor.
- **Validation Center**: Automated rule engine that groups violations (Invalid 12-digit APAAR, Duplicate roll/reg, Cross-institution conflicts, Over-intake) with **Fix Record**, **Dismiss Flag**, and **Re-Validate** workflows.
- **Verifiable Records**: Generate tamper-proof digital academic credentials with QR code and SHA-256 verification hash.
- **Degree Certificate Preview**: High-fidelity degree certificate presenting **APAAR ID** prominently alongside the **Student ID**, golden foil seal, and official signatures, with working Print stylesheet.
- **API & Webhook Management**: Production API token management, key rotation, Swagger-style cURL documentation, and webhook trigger configuration with live connection test.
- **Student DPDP Consent Log**: Auditable tracking of explicit student consent under the Digital Personal Data Protection Act 2023.

### 3. AICTE Central Admin Portal (`/aicte/*`)
- **National Intelligence Dashboard**: Pan-India student enrolment statistics, state-wise distribution charts, multi-year APAAR adoption velocity curve, and high-risk institutions list.
- **Institution Monitoring**: Sanctioned quota vs actual admissions comparison with excess-enrolment callouts and drilldown dossiers (`/aicte/institutions/:id`).
- **💡 Innovation Feature: Intelligent Anomaly Detection Engine**:
  - Heuristic risk scoring formula combining over-intake ratios, supernumerary breaches (&gt;15%), cross-institution overlaps, and sudden YoY surges (&gt;25%).
  - Institutions scored 0–100 across *Low*, *Medium*, *High*, and *Critical* risk bands.
  - **Raise Show-Cause Notice** modal dispatching compliance orders directly to institutions.
- **Cross-Institution Duplicate Detector**: Side-by-side comparison of dual concurrent enrolments across separate universities claiming the same APAAR ID, with one-click resolution.
- **Central Repository Search**: Instant global search across all 300+ students in India.
- **Custom Report Builder**: Multi-criteria regulatory report generator exportable to CSV and print-ready format.
- **Tamper-Evident Audit Trail**: Immutable-styled event ledger logging actor, action, timestamp, IP address, and cryptographic SHA-256 block hash.
- **RBAC Governance Matrix**: User management across 5 statutory tiers (AICTE Admin, Institution Admin, Data Operator, Employer Verifier, Regulator Auditor).

### 4. Public / Authorized Verification Portal (`/verify`)
- Privacy-preserving verification card displaying student name, verified institution, degree programme, and authenticity seal while masking sensitive private PII (Aadhaar, exact DOB, phone).
- Anti-bot math CAPTCHA and DPDP legal consent declaration.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Core**: React 18, Vite 5, TypeScript 5.
- **Styling**: Tailwind CSS with custom government theme tokens.
- **Data Visualization**: Recharts (Intake vs Enrolment Bar Charts, Adoption Velocity Line Charts).
- **Icons**: Lucide React.
- **Routing**: React Router v6 with protected role-based guards.
- **State & Persistence**: React Context API (`AuthContext`, `DataContext`, `ToastContext`) persisted to browser `localStorage` (`advait_students_v2`, `advait_institutions_v2`, etc.).

---

## 🚀 Setup & Local Running Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation
```bash
# 1. Clone repository or navigate to folder
cd c:\Dhruvi\ADVAIT

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
http://localhost:5173/
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🔌 Swapping the Mock Layer with a Real Backend

The project is built with an abstracted API service layer in [`src/services/api.ts`](file:///c:/Dhruvi/ADVAIT/src/services/api.ts).

To connect to a live backend:
1. In `src/services/api.ts`, change `USE_MOCK = false`.
2. Configure your environment variable in `.env`:
   ```env
   VITE_API_URL=https://your-production-aicte-api.gov.in/v1
   ```
3. The methods `apiClient.login`, `apiClient.getStudents`, `apiClient.createStudent`, and `apiClient.verifyApaar` are already typed to standard REST specifications.

---

## 📁 Project Directory Structure

```
c:\Dhruvi\ADVAIT\
├── index.html                     # Tab title and Devanagari typography
├── package.json                   # Dependencies & scripts
├── vite.config.ts                 # Vite bundler configuration
├── tailwind.config.js             # Theme color tokens (#14513A, #0E3B2A, #1E9E5A)
├── public/
│   ├── assets/
│   │   ├── aicte-logo.svg         # Official AICTE Emblem SVG
│   └── favicon.svg                # ADVAIT Favicon
└── src/
    ├── types/index.ts             # TypeScript domain interfaces
    ├── data/
    │   ├── mockInstitutions.ts    # 25+ Indian technical institutions
    │   ├── mockStudents.ts        # 300+ students with engineered edge cases
    │   ├── mockAnomalies.ts       # Risk anomalies & cross duplicates
    │   ├── mockAuditLogs.ts       # Tamper-evident ledger events
    │   ├── mockConsentLogs.ts     # DPDP student consent records
    │   └── mockRegulations.ts     # AICTE 2026 circulars
    ├── context/
    │   ├── AuthContext.tsx        # RBAC and session state
    │   ├── DataContext.tsx        # Core CRUD, validation & anomaly methods
    │   └── ToastContext.tsx       # Global toast system
    ├── components/
    │   ├── common/                # Reusable UI primitives
    │   │   ├── AicteLogo.tsx      # Authentic AICTE logo & lockup
    │   │   ├── AdvaitWordmark.tsx # Stylized ADVAIT wordmark
    │   │   ├── TopAnnouncement.tsx# Top banner with modal reader
    │   │   ├── PipelineStepper.tsx# 7-stage architecture stepper
    │   │   ├── WatermarkBg.tsx    # Faint background iconography
    │   │   ├── Button.tsx, Card.tsx, Badge.tsx, Input.tsx, Modal.tsx
    │   ├── layout/                # Header, Sidebar, Footer, MainLayout
    │   └── modals/                # Forgot password, Government SSO
    ├── pages/
    │   ├── auth/LoginPage.tsx     # Pixel-perfect match of visual reference
    │   ├── institution/           # 9 institution portal pages
    │   ├── aicte/                 # 8 AICTE central regulatory pages
    │   ├── public/PublicVerification.tsx # Authorized verification
    │   └── NotFound.tsx
    └── services/
        └── api.ts                 # Backend abstraction gateway
```

---

*Developed for All India Council for Technical Education (AICTE), Ministry of Education, Government of India.*

