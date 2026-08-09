import React, { useState } from 'react';
import toast from 'react-hot-toast';

const SystemSettings = () => {
  // Sync states with localStorage so they persist across tab switches
  const [simStatus, setSimStatus] = useState(localStorage.getItem('simStatus') || 'Standby');
  const [mapLayer, setMapLayer] = useState(localStorage.getItem('mapLayer') || 'street');
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem('soundEnabled') === 'true');
  const [emailAlerts, setEmailAlerts] = useState(localStorage.getItem('emailAlerts') === 'true');
  const [threatFilter, setThreatFilter] = useState(localStorage.getItem('threatFilter') || 'All');

  const serverIP = window.location.hostname;

  // --- ENGINE CONTROLS ---
  const handleStartSimulation = async () => {
    try {
      setSimStatus('Starting...');
      const token = localStorage.getItem('hwc_jwt_token') || localStorage.getItem('token');

      const res = await fetch(`http://${serverIP}:5000/api/simulation/start`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (res.ok) {
        setSimStatus('Running');
        localStorage.setItem('simStatus', 'Running');
        window.dispatchEvent(new Event('storage'));
        toast.success("Core Engine Simulation Started");
      } else {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        console.error("❌ Backend rejected start:", errorData.message);
        toast.error(`Could not start engine: ${errorData.message || res.statusText}`);
        setSimStatus('Standby');
        localStorage.setItem('simStatus', 'Standby');
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      setSimStatus('Standby');
      toast.error('Error: Backend server is unreachable. Make sure your Node server (server.js) is running on port 5000!');
    }
  };

  const handleStopSimulation = async () => {
    try {
      const token = localStorage.getItem('hwc_jwt_token') || localStorage.getItem('token');

      const res = await fetch(`http://${serverIP}:5000/api/simulation/stop`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (res.ok) {
        setSimStatus('Standby');
        localStorage.setItem('simStatus', 'Standby');
        window.dispatchEvent(new Event('storage'));
        toast.success("Core Engine Simulation Stopped");
      } else {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        toast.error(`Could not stop engine: ${errorData.message || res.statusText}`);
      }
    } catch (error) {
      toast.error('Error: Backend server is unreachable.');
    }
  };

  // --- PREFERENCES ---
  const handleMapChange = (e) => {
    const val = e.target.value;
    setMapLayer(val);
    localStorage.setItem('mapLayer', val); 
    window.dispatchEvent(new Event('storage'));
    toast.success("Map layer updated");
  };

  const handleSoundToggle = (e) => {
    const val = e.target.checked;
    setSoundEnabled(val);
    localStorage.setItem('soundEnabled', val);
    window.dispatchEvent(new Event('storage'));
    toast.success(`Sound alerts ${val ? 'enabled' : 'disabled'}`);
  };

  const handleEmailToggle = (e) => {
    const val = e.target.checked;
    setEmailAlerts(val);
    localStorage.setItem('emailAlerts', val);
    window.dispatchEvent(new Event('storage'));
    toast.success(`Email dispatch ${val ? 'enabled' : 'disabled'}`);
  };

  const handleThreatFilterChange = (e) => {
    const val = e.target.value;
    setThreatFilter(val);
    localStorage.setItem('threatFilter', val);
    window.dispatchEvent(new Event('storage'));
    toast.success("Threat filter updated");
  };

  // --- REAL CSV DOWNLOAD ---
  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('hwc_jwt_token') || localStorage.getItem('token');
      const response = await fetch(`http://${serverIP}:5000/api/analytics-data`, {
        headers: { ...(token && { 'Authorization': `Bearer ${token}` }) }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Failed to fetch data');
      }

      const data = await response.json();

      let csvContent = "Incident_ID,Species,Severity,Location,Latitude,Longitude,Timestamp\n";
      data.forEach((row, index) => {
        const id = row.id || row._id || index + 1;
        const lat = row.coordinates?.latitude || 0;
        const lng = row.coordinates?.longitude || 0;
        csvContent += `${id},${row.species},${row.severity},"${row.location_name || 'Forest Buffer'}",${lat},${lng},${row.timestamp}\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "official_forest_logs.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV log downloaded successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Export failed: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '24px' }}>System Configuration Hub</h2>
        <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>Settings are automatically saved to your browser cache.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', maxWidth: '1000px' }}>
        
        {/* LEFT SIDE: ENGINE & MAP */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderTop: '4px solid #3b82f6' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>⚙️ Core Engine</h3>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={handleStartSimulation} 
                disabled={simStatus === 'Running'}
                style={{ flex: 1, padding: '12px', backgroundColor: simStatus === 'Running' ? '#86efac' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: simStatus === 'Running' ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
              >
                ▶ Start
              </button>
              <button 
                onClick={handleStopSimulation} 
                disabled={simStatus === 'Standby'}
                style={{ flex: 1, padding: '12px', backgroundColor: simStatus === 'Standby' ? '#fca5a5' : '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: simStatus === 'Standby' ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
              >
                ■ Stop
              </button>
            </div>
            <p style={{ textAlign: 'center', marginTop: '12px', marginBottom: 0, color: simStatus === 'Running' ? '#10b981' : '#ef4444', fontWeight: '700' }}>
              Status: {simStatus.toUpperCase()}
            </p>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderTop: '4px solid #8b5cf6' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🗺️ Map Layers</h3>
            <select value={mapLayer} onChange={handleMapChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: '600', color: '#333' }}>
              <option value="street">Standard Street View</option>
              <option value="topo">Topographic View</option>
              <option value="satellite">Satellite Imagery</option>
            </select>
          </div>
        </div>

        {/* RIGHT SIDE: ALERTS & DATA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderTop: '4px solid #f59e0b' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🔔 Notifications</h3>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', cursor: 'pointer', fontWeight: '600', color: '#475569' }}>
              Sound Alerts <input type="checkbox" checked={soundEnabled} onChange={handleSoundToggle} style={{ cursor: 'pointer' }} />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', fontWeight: '600', color: '#475569' }}>
              Email Dispatch <input type="checkbox" checked={emailAlerts} onChange={handleEmailToggle} style={{ cursor: 'pointer' }} />
            </label>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderTop: '4px solid #10b981' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🗄️ Data Management</h3>
            <select value={threatFilter} onChange={handleThreatFilterChange} style={{ width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: '600', color: '#333' }}>
              <option value="All">Show All Incidents</option>
              <option value="Medium">Medium & High Only</option>
              <option value="High">Emergency Only</option>
            </select>
            <button onClick={handleExportData} style={{ width: '100%', padding: '12px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              ⬇ Download CSV Log
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SystemSettings;