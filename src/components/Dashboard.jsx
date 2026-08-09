import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { io } from 'socket.io-client';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const droppedPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});

const MapClickHandler = ({ onClick }) => {
  useMapEvents({ click: (e) => onClick(e.latlng) });
  return null;
};

// 🔊 PROGRAMMATIC RADAR BEEP SYNTHESIZER
const playRadarBeep = () => {
  const soundPref = localStorage.getItem('soundEnabled');
  if (soundPref === 'false') return; 

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    console.log("Audio blocked by browser auto-play policy");
  }
};

const Dashboard = () => {
  // ⚡ Starts cleanly empty at [] so 0 pins drop until you hit Start!
  const [incidents, setIncidents] = useState([]);
  const [filterSpecies, setFilterSpecies] = useState('All');
  const [mapLayer, setMapLayer] = useState(localStorage.getItem('mapLayer') || 'street');
  const [systemRunning, setSystemRunning] = useState(localStorage.getItem('simStatus') === 'Running');

  const [droppedPin, setDroppedPin] = useState(null);
  const [selectedSpecies, setSelectedSpecies] = useState('Tiger');
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    const serverIP = window.location.hostname;
    const socket = io(`http://${serverIP}:5000`);

    // 📡 ONLY DROP PINS WHEN LIVE ALERTS ARRIVE VIA SOCKET (AFTER CLICKING START)
    socket.on('live-alert', (newAlert) => {
      playRadarBeep(); // Beep 1-by-1 as pins drop
      const liveAlertWithTime = { ...newAlert, timestamp: new Date().toISOString() };
      setIncidents(prev => [liveAlertWithTime, ...(Array.isArray(prev) ? prev : [])]);
      setSystemRunning(true);
      localStorage.setItem('simStatus', 'Running');
    });

    socket.on('engine-status', (data) => {
      setSystemRunning(data.status === 'Running');
      localStorage.setItem('simStatus', data.status);
    });

    const handleStorage = () => {
      setMapLayer(localStorage.getItem('mapLayer') || 'street');
      setSystemRunning(localStorage.getItem('simStatus') === 'Running');
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      socket.disconnect();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const safeIncidents = useMemo(() => Array.isArray(incidents) ? incidents : [], [incidents]);

  // ⚡ LIVE METRICS COUNT ONLY THE PINS DROPPED DURING THIS LIVE SHIFT
  const metrics = useMemo(() => {
    const high = safeIncidents.filter(i => i.severity === 'High').length;
    const counts = safeIncidents.reduce((acc, i) => { 
      if (i.species) acc[i.species] = (acc[i.species] || 0) + 1; 
      return acc; 
    }, {});
    
    const active = Object.keys(counts).length > 0 
      ? Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) 
      : 'Waiting for dispatches...';

    return { totalToday: safeIncidents.length, highToday: high, mostActive: active };
  }, [safeIncidents]);

  const visibleMarkers = useMemo(() => {
    const filtered = filterSpecies === 'All' ? safeIncidents : safeIncidents.filter(i => i?.species === filterSpecies);
    return filtered.slice(0, 150);
  }, [safeIncidents, filterSpecies]);

  const handleCheckForecast = async () => {
    if (!droppedPin) return;
    setPredicting(true);
    try {
      const token = localStorage.getItem('hwc_jwt_token') || localStorage.getItem('token');
      const res = await fetch(`http://${window.location.hostname}:5000/api/predict`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ latitude: droppedPin.lat, longitude: droppedPin.lng, species: selectedSpecies })
      });
      const data = await res.json();
      setPrediction(data.severity || 'High');
    } catch { 
      setPrediction('High (Offline Estimate)'); 
    } finally { 
      setPredicting(false); 
    }
  };

  const getTileUrl = () => {
    if (mapLayer === 'satellite') return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    if (mapLayer === 'topo') return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  };

  const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>Tactical Command Center</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '8px 16px', borderRadius: '20px', border: '1px solid #e2e8f0', fontWeight: '600', fontSize: '14px' }}>
          <span style={{ height: '10px', width: '10px', borderRadius: '50%', background: systemRunning ? '#10b981' : '#ef4444', display: 'inline-block' }} />
          <span>{formattedDate}</span>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ color: systemRunning ? '#10b981' : '#ef4444' }}>{systemRunning ? 'System Running' : 'System Paused'}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', borderLeft: '6px solid #3b82f6', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>TOTAL ALERTS TODAY</div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', marginTop: '4px' }}>{metrics.totalToday}</div>
        </div>
        <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', borderLeft: '6px solid #ef4444', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>HIGH-SEVERITY CONFLICTS TODAY</div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#ef4444', marginTop: '4px' }}>{metrics.highToday}</div>
        </div>
        <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', borderLeft: '6px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>MOST ACTIVE SPECIES TODAY</div>
          <div style={{ fontSize: metrics.totalToday === 0 ? '16px' : '26px', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>{metrics.mostActive}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>🗺️ Live Tactical Wildlife Map</h2>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select value={filterSpecies} onChange={e => setFilterSpecies(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: '600' }}>
            <option value="All">All Species ({safeIncidents.length})</option>
            <option value="Tiger">Tiger</option>
            <option value="Elephant">Elephant</option>
            <option value="Leopard">Leopard</option>
            <option value="Wild Boar">Wild Boar</option>
            <option value="Rhinoceros">Rhinoceros</option>
            <option value="Sloth Bear">Sloth Bear</option>
          </select>

          <select value={mapLayer} onChange={e => { setMapLayer(e.target.value); localStorage.setItem('mapLayer', e.target.value); }} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>
            <option value="street">Street View</option>
            <option value="topo">Topographic</option>
            <option value="satellite">Satellite</option>
          </select>

          <div style={{ background: '#1e293b', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
            📍 Showing Top {visibleMarkers.length} Pins
          </div>
        </div>
      </div>

      <div style={{ height: '70vh', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <MapContainer center={[26.5775, 88.8997]} zoom={6} style={{ height: '100%', width: '100%' }}>
          <TileLayer url={getTileUrl()} />
          <MapClickHandler onClick={(latlng) => { setDroppedPin({ lat: parseFloat(latlng.lat.toFixed(4)), lng: parseFloat(latlng.lng.toFixed(4)) }); setPrediction(null); }} />

          {droppedPin && (
            <Marker position={[droppedPin.lat, droppedPin.lng]} icon={droppedPinIcon}>
              <Popup>
                <div style={{ minWidth: '180px', padding: '4px' }}>
                  <b style={{ color: '#ef4444' }}>📍 Evaluation Pin</b>
                  <div style={{ fontSize: '12px', margin: '6px 0' }}>Lat: {droppedPin.lat} | Lng: {droppedPin.lng}</div>
                  
                  <select value={selectedSpecies} onChange={e => { setSelectedSpecies(e.target.value); setPrediction(null); }} style={{ width: '100%', padding: '6px', marginBottom: '8px', borderRadius: '4px' }}>
                    <option value="Tiger">Tiger</option><option value="Elephant">Elephant</option><option value="Leopard">Leopard</option><option value="Wild Boar">Wild Boar</option>
                  </select>

                  <button onClick={handleCheckForecast} disabled={predicting} style={{ width: '100%', padding: '8px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {predicting ? 'EVALUATING...' : 'CHECK AI FORECAST'}
                  </button>

                  {prediction && (
                    <div style={{ marginTop: '8px', padding: '6px', background: '#f8fafc', borderRadius: '4px', textAlign: 'center', fontWeight: '800', color: prediction === 'High' ? '#ef4444' : '#f59e0b' }}>
                      THREAT: {prediction.toUpperCase()}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}

          {visibleMarkers.map((item, i) => item?.coordinates?.latitude && item?.coordinates?.longitude ? (
            <Marker key={item._id || i} position={[item.coordinates.latitude, item.coordinates.longitude]}>
              <Popup>
                <b>{item.species}</b> ({item.severity || 'High'} Risk)<br />
                <small style={{ color: '#64748b' }}>📍 {item.location_name || 'Forest Buffer'}</small>
              </Popup>
            </Marker>
          ) : null)}
        </MapContainer>
      </div>

    </div>
  );
};

export default Dashboard;