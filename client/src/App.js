import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterClinicPage from './pages/RegisterClinicPage';
import RegisterPatientPage from './pages/RegisterPatientPage';
import RequestDemoPage from './pages/RequestDemoPage';
import ClinicDashboard from './pages/clinic/ClinicDashboard';
import ClinicPatients from './pages/clinic/ClinicPatients';
import ClinicPatientDetail from './pages/clinic/ClinicPatientDetail';
import ClinicScanPage from './pages/clinic/ClinicScanPage';
import PatientHome from './pages/patient/PatientHome';
import PatientChart from './pages/patient/PatientChart';
import PatientEducation from './pages/patient/PatientEducation';
import PatientTreatment from './pages/patient/PatientTreatment';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminClinics from './pages/admin/AdminClinics';
import AdminConsultations from './pages/admin/AdminConsultations';

// Route guards
const ClinicRoute = ({ children }) => {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="page" style={{display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner" /></div>;
  if (!user || role !== 'clinic') return <Navigate to="/login?role=clinic" replace />;
  return children;
};

const PatientRoute = ({ children }) => {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="page" style={{display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner" /></div>;
  if (!user || role !== 'patient') return <Navigate to="/login?role=patient" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="page" style={{display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner" /></div>;
  if (!user || role !== 'clinic' || !user.isAdmin) return <Navigate to="/login?role=clinic" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register/clinic" element={<RegisterClinicPage />} />
    <Route path="/register/patient" element={<RegisterPatientPage />} />
    <Route path="/join/:code" element={<RegisterPatientPage />} />
    <Route path="/request-demo" element={<RequestDemoPage />} />

    {/* Clinic routes */}
    <Route path="/clinic" element={<ClinicRoute><ClinicDashboard /></ClinicRoute>} />
    <Route path="/clinic/patients" element={<ClinicRoute><ClinicPatients /></ClinicRoute>} />
    <Route path="/clinic/patients/:id" element={<ClinicRoute><ClinicPatientDetail /></ClinicRoute>} />
    <Route path="/clinic/scan" element={<ClinicRoute><ClinicScanPage /></ClinicRoute>} />

    {/* Patient routes */}
    <Route path="/my" element={<PatientRoute><PatientHome /></PatientRoute>} />
    <Route path="/my/chart" element={<PatientRoute><PatientChart /></PatientRoute>} />
    <Route path="/my/treatment" element={<PatientRoute><PatientTreatment /></PatientRoute>} />
    <Route path="/my/learn" element={<PatientRoute><PatientEducation /></PatientRoute>} />

    {/* Admin routes */}
    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
    <Route path="/admin/clinics" element={<AdminRoute><AdminClinics /></AdminRoute>} />
    <Route path="/admin/consultations" element={<AdminRoute><AdminConsultations /></AdminRoute>} />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
