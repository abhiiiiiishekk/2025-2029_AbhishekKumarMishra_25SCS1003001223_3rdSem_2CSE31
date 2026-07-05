import React, { useState } from 'react';

const ReportIncident = () => {
  const [formData, setFormData] = useState({
    species: 'Tiger',
    severity: 'High',
    location: 'Valmiki Buffer Zone, Bihar',
    latitude: '27.1500',
    longitude: '84.1500'
  });

  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 📍 REAL HTML5 GPS AUTO-DETECTION
  const handleAutoDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setGpsLoading(true);
    setStatusMessage({ type: '', text: '' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(4),
          longitude: position.coords.longitude.toFixed(4),
          location: "Live GPS Auto-Detected Sector"
        }));
        setGpsLoading(false);
        setStatusMessage({ type: 'success', text: '📍 GPS coordinates locked successfully!' });
      },
      (error) => {
        console.error("GPS Error:", error);
        setGpsLoading(false);
        alert("Unable to retrieve GPS location. Please check browser location permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 📡 REAL-TIME NETWORK BROADCAST
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ type: '', text: '' });

    const serverIP = window.location.hostname;
    const token = localStorage.getItem('hwc_jwt_token') || localStorage.getItem('token');

    try {
      const response = await fetch(`http://${serverIP}:5000/api/trigger-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          species: formData.species,
          severity: formData.severity,
          location: formData.location,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Play confirmation beep
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 pitch
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          }
        } catch (audioErr) {}

        setStatusMessage({
          type: 'success',
          text: `🚨 BROADCAST SUCCESSFUL! [${formData.species}] alert dispatched live across national command network.`
        });

        // Reset form for next report
        setFormData({
          species: 'Tiger',
          severity: 'High',
          location: '',
          latitude: '',
          longitude: ''
        });
      } else {
        throw new Error(data.error || data.message || "Server rejected dispatch");
      }
    } catch (error) {
      console.error("Dispatch Error:", error);
      setStatusMessage({
        type: 'error',
        text: `❌ Dispatch Failed: ${error.message || "Backend server unreachable on port 5000"}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '650px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* Header Banner */}
        <div style={{ backgroundColor: '#fff', padding: '28px 32px', borderBottom: '1px solid #f1f5f9' }}>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '24px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🚨 Dispatch Field Incident
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>
            Immediately broadcast a live human-wildlife sighting to the emergency map and analytics engine.
          </p>
        </div>

        {/* Status Feedback Banner */}
        {statusMessage.text && (
          <div style={{
            margin: '20px 32px 0 32px',
            padding: '14px 18px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            backgroundColor: statusMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${statusMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`
          }}>
            {statusMessage.text}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Wildlife Species */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Wildlife Species Sighted
            </label>
            <select
              name="species"
              value={formData.species}
              onChange={handleChange}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '600', color: '#1e293b', backgroundColor: '#f8fafc' }}
            >
              <option value="Tiger">Tiger</option>
              <option value="Elephant">Elephant</option>
              <option value="Leopard">Leopard</option>
              <option value="Wild Boar">Wild Boar</option>
              <option value="Sloth Bear">Sloth Bear</option>
              <option value="Rhinoceros">Rhinoceros</option>
              <option value="Wolf">Wolf</option>
            </select>
          </div>

          {/* Threat / Severity Level */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Threat / Severity Level
            </label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '600', color: '#1e293b', backgroundColor: '#f8fafc' }}
            >
              <option value="High">High (Immediate Danger / Village Intrusion)</option>
              <option value="Medium">Medium (Peripheral Threat / Buffer Zone)</option>
              <option value="Low">Low (Safe Distance / Monitoring Only)</option>
            </select>
          </div>

          {/* Location Description */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              Location / Landmark Description
            </label>
            <input
              type="text"
              name="location"
              required
              placeholder="e.g., Valmiki Buffer Zone, Sector 4"
              value={formData.location}
              onChange={handleChange}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Lat / Long Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Latitude
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                required
                placeholder="27.1500"
                value={formData.latitude}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Longitude
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                required
                placeholder="84.1500"
                value={formData.longitude}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Auto-Detect GPS Button */}
          <button
            type="button"
            onClick={handleAutoDetectGPS}
            disabled={gpsLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px dashed #94a3b8',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: gpsLoading ? 'wait' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {gpsLoading ? '⏳ Acquiring Satellite Lock...' : '📍 Auto-Detect My Current GPS Coordinates'}
          </button>

          {/* Broadcast Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: loading ? '#fdba74' : '#f97316',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '800',
              fontSize: '16px',
              letterSpacing: '0.5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
              marginTop: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? '📡 BROADCASTING TO NETWORK...' : 'BROADCAST INCIDENT REPORT'}
          </button>

        </form>

      </div>
    </div>
  );
};

export default ReportIncident;