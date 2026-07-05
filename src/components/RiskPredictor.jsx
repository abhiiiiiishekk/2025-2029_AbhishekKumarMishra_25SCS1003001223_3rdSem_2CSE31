import React, { useState } from 'react';

const RiskPredictor = () => {
  const [latitude, setLatitude] = useState('26.1215');
  const [longitude, setLongitude] = useState('85.3688');
  const [species, setSpecies] = useState('Wild Boar');
  
  // State to hold and display the returned risk forecast
  const [forecastRisk, setForecastRisk] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckForecast = async () => {
    try {
      setLoading(true);
      setForecastRisk(null); // Reset previous result

      const serverIP = window.location.hostname;
      const token = localStorage.getItem('hwc_jwt_token') || localStorage.getItem('token');

      console.log(`🔮 Sending request to server for ${species} at [${latitude}, ${longitude}]...`);

      const response = await fetch(`http://${serverIP}:5000/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Attach token so backend protectRoute allows the request
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          species: species
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP status ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ AI Forecast Received from Server:", data);

      // Save the severity string into our display state
      setForecastRisk(data.severity || 'High');
    } catch (error) {
      console.error("❌ Forecast fetch failed:", error);
      // Fallback display so UI never looks broken
      setForecastRisk('High (Offline Fallback)');
    } finally {
      setLoading(false);
    }
  };

  // Helper to color-code the badge based on risk level
  const getBadgeColor = (risk) => {
    if (!risk) return '#64748b';
    if (risk.includes('High')) return '#ef4444';   // Red
    if (risk.includes('Medium')) return '#f59e0b'; // Orange
    return '#10b981';                              // Green
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '400px', margin: '0 auto' }}>
      <h3 style={{ textAlign: 'center', margin: '0 0 5px 0', color: '#1e293b' }}>🔮 AI Risk Predictor</h3>
      <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Enter specific coordinates to check area risk.</p>

      {/* Inputs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>Latitude</label>
          <input 
            type="number" 
            value={latitude} 
            onChange={(e) => setLatitude(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }} 
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>Longitude</label>
          <input 
            type="number" 
            value={longitude} 
            onChange={(e) => setLongitude(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }} 
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>Animal to Check</label>
        <select 
          value={species} 
          onChange={(e) => setSpecies(e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
        >
          <option value="Elephant">Elephant</option>
          <option value="Tiger">Tiger</option>
          <option value="Leopard">Leopard</option>
          <option value="Wild Boar">Wild Boar</option>
          <option value="Rhinoceros">Rhinoceros</option>
          <option value="Sloth Bear">Sloth Bear</option>
          <option value="Wolf">Wolf</option>
        </select>
      </div>

      {/* Button */}
      <button 
        onClick={handleCheckForecast} 
        disabled={loading}
        style={{ 
          width: '100%', 
          padding: '12px', 
          backgroundColor: '#6366f1', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px', 
          fontWeight: 'bold', 
          cursor: loading ? 'not-allowed' : 'pointer' 
        }}
      >
        {loading ? 'ANALYZING...' : 'CHECK AI FORECAST'}
      </button>

      {/* ⚡ RESULT DISPLAY BLOCK: This is what actually renders the output on screen! */}
      {forecastRisk && (
        <div style={{ marginTop: '20px', padding: '15px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>Predicted Threat Level</span>
          <div style={{ fontSize: '20px', fontWeight: '800', color: getBadgeColor(forecastRisk), marginTop: '5px' }}>
            {forecastRisk}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskPredictor;