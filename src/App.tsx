import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Layout
import { MainLayout } from './components/layout/MainLayout';

// Auth & Public
import { LoginPage } from './pages/auth/LoginPage';
import { PublicVerification } from './pages/public/PublicVerification';
import { NotFound } from './pages/NotFound';

// Institution Pages
import { InstitutionDashboard } from './pages/institution/InstitutionDashboard';
import { StudentDataUpload } from './pages/institution/StudentDataUpload';
import { StudentRecords } from './pages/institution/StudentRecords';
import { ValidationCenter } from './pages/institution/ValidationCenter';
import { InstitutionCases } from './pages/institution/InstitutionCases';
import { VerifiableRecordsPage } from './pages/institution/VerifiableRecordsPage';
import { CertificatePreview } from './pages/institution/CertificatePreview';
import { ApiIntegration } from './pages/institution/ApiIntegration';
import { ConsentPrivacy } from './pages/institution/ConsentPrivacy';
import { InstitutionProfile } from './pages/institution/InstitutionProfile';

// AICTE Pages
import { NationalDashboard } from './pages/aicte/NationalDashboard';
import { InstitutionMonitoring } from './pages/aicte/InstitutionMonitoring';
import { InstitutionDrilldown } from './pages/aicte/InstitutionDrilldown';
import { AnomalyDetection } from './pages/aicte/AnomalyDetection';
import { DuplicateDetector } from './pages/aicte/DuplicateDetector';
import { ComplianceCaseManager } from './pages/aicte/ComplianceCaseManager';
import { CentralRepository } from './pages/aicte/CentralRepository';
import { ReportBuilder } from './pages/aicte/ReportBuilder';
import { AuditTrail } from './pages/aicte/AuditTrail';
import { UserManagement } from './pages/aicte/UserManagement';

// Protected Route Guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRole?: 'institution' | 'aicte';
}> = ({ children, allowedRole }) => {
  const { user, isAuthenticated, role } = useAuth();
  const toast = useToast();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === 'aicte' ? '/aicte/dashboard' : '/institution/dashboard'} replace />;
  }

  return <>{children}</>;
};

// Root Redirect Component
const RootRedirect: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={role === 'aicte' ? '/aicte/dashboard' : '/institution/dashboard'} replace />;
  }
  return <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              {/* Root */}
              <Route path="/" element={<RootRedirect />} />

              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/verify" element={<PublicVerification />} />

              {/* Institution Portal Protected Routes */}
              <Route
                path="/institution"
                element={
                  <ProtectedRoute allowedRole="institution">
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/institution/dashboard" replace />} />
                <Route path="dashboard" element={<InstitutionDashboard />} />
                <Route path="upload" element={<StudentDataUpload />} />
                <Route path="records" element={<StudentRecords />} />
                <Route path="validation" element={<ValidationCenter />} />
                <Route path="cases" element={<ValidationCenter />} />
                <Route path="verifiable-records" element={<VerifiableRecordsPage />} />
                <Route path="certificate-preview" element={<CertificatePreview />} />
                <Route path="certificates" element={<CertificatePreview />} />
                <Route path="api" element={<ApiIntegration />} />
                <Route path="consent" element={<ConsentPrivacy />} />
                <Route path="profile" element={<InstitutionProfile />} />
              </Route>

              {/* AICTE Admin Portal Protected Routes */}
              <Route
                path="/aicte"
                element={
                  <ProtectedRoute allowedRole="aicte">
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/aicte/dashboard" replace />} />
                <Route path="dashboard" element={<NationalDashboard />} />
                <Route path="institutions" element={<InstitutionMonitoring />} />
                <Route path="institutions/:id" element={<InstitutionDrilldown />} />
                <Route path="anomalies" element={<AnomalyDetection />} />
                <Route path="duplicates" element={<ComplianceCaseManager />} />
                <Route path="cases" element={<ComplianceCaseManager />} />
                <Route path="repository" element={<CentralRepository />} />
                <Route path="reports" element={<ReportBuilder />} />
                <Route path="audit" element={<AuditTrail />} />
                <Route path="users" element={<UserManagement />} />
              </Route>

              {/* 404 Catch All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;

