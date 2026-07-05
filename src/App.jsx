import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- 🔐 AUTHENTICATION IMPORTS ---
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// --- 📊 DASHBOARD COMPONENT IMPORTS ---
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard'; // ✅ Imported your new tactical command deck!
import AnalyticsHub from './components/AnalyticsHub';
import SystemSettings from './components/SystemSettings';
import ReportIncident from './components/ReportIncident';
import RiskPredictor from './components/RiskPredictor';

// A clean wrapper for the protected dashboard layout
const DashboardLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* 1. Fixed Sidebar stays on the left */}
      <Sidebar />
      
      {/* 2. Main Content Area shifts right of the 250px sidebar */}
      <div style={{ marginLeft: '250px', width: '100%' }}>
        <Routes>
          {/* Main Tactical Command Center (includes map + daily telemetry) */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<AnalyticsHub />} />
          <Route path="/settings" element={<SystemSettings />} />
          <Route path="/report" element={<ReportIncident />} />
          <Route path="/predict" element={<RiskPredictor />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes (e.g., Login) can be added here if needed */}
          
          {/* Protected Dashboard Gatekeeper */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;