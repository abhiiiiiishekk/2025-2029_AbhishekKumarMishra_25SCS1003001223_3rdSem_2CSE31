import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { usePark } from '../context/ParkContext';

const ReportIncident = () => {
  const { selectedPark } = usePark();
  
  const parkLocations = {};
  selectedPark.locations.forEach(loc => {
    parkLocations[loc.name] = { lat: loc.lat, lng: loc.lng };
  });
  const parkSpecies = selectedPark.speciesList;

  const [formData, setFormData] = useState({
    species: parkSpecies[0],
    severity: 'High',
    location: selectedPark.locations[0]?.name || ''
  });

  // Reset form when park changes
  useEffect(() => {
    setFormData({
      species: selectedPark.speciesList[0],
      severity: 'High',
      location: selectedPark.locations[0]?.name || ''
    });
    setLiveLocation(null);
  }, [selectedPark.id]);

  const [liveLocation, setLiveLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'location') {
      setLiveLocation(null);
    }
  };

  const handleAutoDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLiveLocation({
          lat: position.coords.latitude.toFixed(4),
          lng: position.coords.longitude.toFixed(4)
        });
        setFormData(prev => ({ ...prev, location: 'Live GPS Auto-Detected Sector' }));
        setGpsLoading(false);
        toast.success("GPS coordinates locked securely in background!");
      },
      (error) => {
        console.error("GPS Error:", error);
        setGpsLoading(false);
        toast.error("Unable to retrieve GPS location. Please check browser location permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalLat = liveLocation ? parseFloat(liveLocation.lat) : (parkLocations[formData.location]?.lat || selectedPark.center[0]);
    const finalLng = liveLocation ? parseFloat(liveLocation.lng) : (parkLocations[formData.location]?.lng || selectedPark.center[1]);

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      } catch (audioErr) {}

      toast.success(`BROADCAST SUCCESSFUL! ${formData.species} alert dispatched from ${selectedPark.name}.`);
      setFormData({
        species: selectedPark.speciesList[0],
        severity: 'High',
        location: selectedPark.locations[0]?.name || ''
      });
      setLiveLocation(null);
    } catch (error) {
      console.error("Dispatch Error:", error);
      toast.error(`Dispatch Failed: ${error.message || "Backend server unreachable"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div className="animate-slide-up" style={{ width: '100%', maxWidth: '650px', backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
        
        <div style={{ backgroundColor: '#1e293b', padding: '32px 32px 24px', borderBottom: '1px solid #334155' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '26px', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800' }}>
            Dispatch Field Incident
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '15px', lineHeight: '1.5' }}>
            Immediately broadcast a live human-wildlife conflict sighting within {selectedPark.name} to the emergency map and analytics engine.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Wildlife Species Sighted
            </label>
            <select name="species" value={formData.species} onChange={handleChange} className="input-transition"
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #475569', fontSize: '16px', fontWeight: '600', color: '#f1f5f9', backgroundColor: '#0f172a', cursor: 'pointer', appearance: 'none', outline: 'none' }}>
              {parkSpecies.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Threat / Severity Level
            </label>
            <select name="severity" value={formData.severity} onChange={handleChange} className="input-transition"
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #475569', fontSize: '16px', fontWeight: '600', color: '#f1f5f9', backgroundColor: '#0f172a', cursor: 'pointer', appearance: 'none', outline: 'none' }}>
              <option value="Critical">Critical (Direct Attack / Extreme Danger)</option>
              <option value="High">High (Immediate Danger / Village Intrusion)</option>
              <option value="Medium">Medium (Peripheral Threat / Buffer Zone)</option>
              <option value="Low">Low (Safe Distance / Monitoring Only)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {selectedPark.name} Incident Location
            </label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select name="location" value={formData.location} onChange={handleChange} disabled={!!liveLocation} className="input-transition"
                style={{ 
                  flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid #475569', 
                  fontSize: '15px', fontWeight: '500', color: liveLocation ? '#64748b' : '#f1f5f9', 
                  backgroundColor: liveLocation ? '#1e293b' : '#0f172a', cursor: liveLocation ? 'not-allowed' : 'pointer',
                  appearance: 'none', outline: 'none' 
                }}>
                {liveLocation && <option value="Live GPS Auto-Detected Sector">Live GPS Auto-Detected Sector</option>}
                {selectedPark.locations.map(loc => (
                  <option key={loc.name} value={loc.name}>{loc.name}</option>
                ))}
              </select>
              
              <button type="button" onClick={handleAutoDetectGPS} disabled={gpsLoading || liveLocation} className="hover-scale"
                style={{
                  padding: '14px 20px', backgroundColor: liveLocation ? '#10b981' : '#3b82f6',
                  color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700',
                  fontSize: '14px', cursor: (gpsLoading || liveLocation) ? 'default' : 'pointer',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: liveLocation ? '0 0 15px rgba(16,185,129,0.3)' : 'none'
                }}>
                {gpsLoading ? 'Locking...' : liveLocation ? 'GPS Locked' : 'Use Live GPS'}
              </button>
            </div>
            {liveLocation && (
              <div className="animate-fade-in" style={{ fontSize: '12px', color: '#10b981', marginTop: '8px', fontWeight: '600' }}>
                Coordinates securely captured in background.
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-danger-glow"
            style={{
              width: '100%', padding: '18px',
              background: loading ? '#475569' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '16px',
              letterSpacing: '1px', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 10px 25px rgba(239, 68, 68, 0.4)',
              marginTop: '16px',
            }}>
            {loading ? 'BROADCASTING TO NETWORK...' : 'BROADCAST INCIDENT REPORT'}
          </button>

        </form>

      </div>
    </div>
  );
};

export default ReportIncident;