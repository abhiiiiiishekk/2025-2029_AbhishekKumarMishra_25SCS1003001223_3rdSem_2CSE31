import React, { useState, useEffect } from 'react';
import SummaryCards from './SummaryCards';
import InteractiveMap from './InteractiveMap';
import AnalyticsPanel from './AnalyticsPanel';
import { usePark } from '../../context/ParkContext';
import { Shield } from 'lucide-react';

const KazirangaDashboard = () => {
  const { selectedPark } = usePark();
  const [selectedSpecies, setSelectedSpecies] = useState('All');

  useEffect(() => {
    setSelectedSpecies('All');
  }, [selectedPark.id]);

  const speciesConfig = selectedPark.speciesConfig;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header */}
      <div className="animate-slide-up" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #334155'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield color="#10b981" />
            {selectedPark.name} Command Portal
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8' }}>
            Real-time Wildlife Tracking & Conflict Prediction System — {selectedPark.state}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Species Filter:</label>
          <select 
            value={selectedSpecies}
            onChange={(e) => setSelectedSpecies(e.target.value)}
            className="input-transition"
            style={{
              backgroundColor: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="All">All Species</option>
            {Object.keys(speciesConfig).map(species => (
              <option key={species} value={species}>{species}</option>
            ))}
          </select>
        </div>
      </div>

      <SummaryCards />
      <InteractiveMap selectedSpecies={selectedSpecies} />
      <AnalyticsPanel />
    </div>
  );
};

export default KazirangaDashboard;
