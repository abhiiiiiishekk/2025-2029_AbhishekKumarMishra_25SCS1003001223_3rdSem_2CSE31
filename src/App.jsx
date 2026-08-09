import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ParkProvider } from './context/ParkContext';
import { Toaster } from 'react-hot-toast';

import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import KazirangaDashboard from './components/KazirangaDashboard/KazirangaDashboard';
import AnalyticsHub from './components/AnalyticsHub';
import ReportIncident from './components/ReportIncident';
import RiskPredictor from './components/RiskPredictor';
import DatasetManagement from './components/DatasetManagement';

const DashboardLayout = () => {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <Sidebar />
      <div style={{ marginLeft: '250px', width: '100%', position: 'relative' }}>
        <div key={location.pathname} className="animate-fade-in">
          <Routes>
            <Route path="/" element={<KazirangaDashboard />} />
            <Route path="/analytics" element={<AnalyticsHub />} />
            <Route path="/report" element={<ReportIncident />} />
            <Route path="/predict" element={<RiskPredictor />} />
            <Route path="/dataset" element={<DatasetManagement />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ParkProvider>
        <Toaster position="top-right" />
        <Router>
          <Routes>
            <Route path="/select" element={<LandingPage />} />
            <Route path="/*" element={<DashboardLayout />} />
          </Routes>
        </Router>
      </ParkProvider>
    </AuthProvider>
  );
}

export default App;