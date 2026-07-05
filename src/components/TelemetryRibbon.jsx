import React, { useState, useEffect } from 'react';

const TelemetryRibbon = () => {
  const [stats, setStats] = useState({ total: 0, high: 0, activeSpecies: 'None' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const serverIP = window.location.hostname;
        const token = localStorage.getItem('hwc_jwt_token') || localStorage.getItem('token');
        
        const response = await fetch(`http://${serverIP}:5000/api/analytics-data`, {
          headers: { ...(token && { 'Authorization': `Bearer ${token}` }) }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Calculate metrics
          const total = data.length;
          const high = data.filter(i => i.severity === 'High').length;
          
          const speciesMap = data.reduce((acc, i) => {
            acc[i.species] = (acc[i.species] || 0) + 1;
            return acc;
          }, {});
          const activeSpecies = Object.keys(speciesMap).reduce((a, b) => speciesMap[a] > speciesMap[b] ? a : b, 'None');

          setStats({ total, high, activeSpecies });
        }
      } catch (err) {
        console.error("Ribbon stats error:", err);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', padding: '20px 20px 0 20px' }}>
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', borderLeft: '6px solid #3b82f6', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Alerts Today</div>
        <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', marginTop: '4px' }}>{stats.total}</div>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', borderLeft: '6px solid #ef4444', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>High-Severity Conflicts</div>
        <div style={{ fontSize: '28px', fontWeight: '800', color: '#ef4444', marginTop: '4px' }}>{stats.high}</div>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', borderLeft: '6px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Most Active Species</div>
        <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981', marginTop: '6px' }}>{stats.activeSpecies}</div>
      </div>
    </div>
  );
};

export default TelemetryRibbon;