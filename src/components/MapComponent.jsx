import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { io } from 'socket.io-client';

// Fix for React Leaflet default marker icons disappearing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom highlighted icon for the user's dropped pin
const droppedPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Sub-component to catch map click events and drop a pin
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const MapComponent = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapLayer, setMapLayer] = useState(localStorage.getItem('mapLayer') || 'street');

  // --- INTERACTIVE PIN DROP STATE ---
  const [droppedPin, setDroppedPin] = useState(null); // Holds { lat, lng }
  const [selectedSpecies, setSelectedSpecies] = useState('Tiger');
  const [predictionResult, setPredictionResult] = useState(null);
  const [predicting, setPredicting] = useState(false);

  // Tile layer URL selector
  const getTileUrl = () => {
    if (mapLayer === 'satellite') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
    if (mapLayer === 'topo') {
      return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    }
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  };

  useEffect(() => {
    const serverIP = window.location.hostname;
    const token = localStorage.getItem('hwc_jwt_token') || localStorage.getItem('token');

    // 1. Load historical database records
    const fetchDatabaseIncidents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://${serverIP}:5000/api/analytics-data`, {
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIncidents(data);
        }
      } catch (error) {
        console.error("❌ Failed to fetch map coordinates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabaseIncidents();

    // 2. Connect live WebSocket listener
    const socket = io(`http://${serverIP}:5000`);

    socket.on('live-alert', (newAlert) => {
      console.log('🚨 Live Sighting Pinned to Map:', newAlert.species);
      setIncidents((prevList) => [newAlert, ...prevList]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Handle clicking anywhere on the map tiles
  const handleMapTileClick = (latlng) => {
    setDroppedPin({
      lat: parseFloat(latlng.lat.toFixed(4)),
      lng: parseFloat(latlng.lng.toFixed(4))
    });
    setPredictionResult(null); // Reset old prediction when moving pin
  };

  // Call the backend AI model for the dropped pin coordinates
  const handleCheckDroppedPinForecast = async () => {
    if (!droppedPin) return;
    try {
      setPredicting(true);
      const serverIP = window.location.hostname;
      const token = localStorage.getItem('hwc_jwt_token') || localStorage.getItem('token');

      const response = await fetch(`http://${serverIP}:5000/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          latitude: droppedPin.lat,
          longitude: droppedPin.lng,
          species: selectedSpecies
        })
      });

      const data = await response.json();
      setPredictionResult(data.severity || 'High');
    } catch (error) {
      console.error("Prediction error:", error);
      setPredictionResult('High (Offline Estimate)');
    } finally {
      setPredicting(false);
    }
  };

  const defaultCenter = [26.5775, 88.8997];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '88vh' }}>
      
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b' }}>🗺️ Live Tactical Wildlife Map</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
            Click anywhere on the map to drop a pin, select a species, and evaluate forest corridor threat levels.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select 
            value={mapLayer} 
            onChange={(e) => { setMapLayer(e.target.value); localStorage.setItem('mapLayer', e.target.value); }}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}
          >
            <option value="street">Street View</option>
            <option value="topo">Topographic</option>
            <option value="satellite">Satellite</option>
          </select>
          <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '8px 18px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>
            📍 {loading ? 'Syncing...' : `${incidents.length} Active Pins`}
          </div>
        </div>
      </div>

      {/* VISUAL INTERACTIVE MAP CONTAINER */}
      <div style={{ borderRadius: '12px', overflow: 'hidden', border: '2px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '72vh', width: '100%', position: 'relative' }}>
        
        <MapContainer center={defaultCenter} zoom={6} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
            url={getTileUrl()}
          />

          {/* Invisible click catcher that triggers handleMapTileClick */}
          <MapClickHandler onMapClick={handleMapTileClick} />

          {/* 📍 INTERACTIVE DROPPED PIN (Appears when you click anywhere on the map) */}
          {droppedPin && (
            <Marker position={[droppedPin.lat, droppedPin.lng]} icon={droppedPinIcon}>
              <Popup>
                <div style={{ minWidth: '200px', padding: '5px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#ef4444', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>📍 Dropped Pin Coordinates</span>
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                    Lat: <strong>{droppedPin.lat}</strong> | Lng: <strong>{droppedPin.lng}</strong>
                  </div>

                  {/* Species Dropdown Options */}
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '3px' }}>
                      Select Species:
                    </label>
                    <select
                      value={selectedSpecies}
                      onChange={(e) => { setSelectedSpecies(e.target.value); setPredictionResult(null); }}
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="Tiger">Tiger</option>
                      <option value="Elephant">Elephant</option>
                      <option value="Leopard">Leopard</option>
                      <option value="Wild Boar">Wild Boar</option>
                      <option value="Rhinoceros">Rhinoceros</option>
                      <option value="Sloth Bear">Sloth Bear</option>
                      <option value="Wolf">Wolf</option>
                    </select>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleCheckDroppedPinForecast}
                    disabled={predicting}
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: '#6366f1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      cursor: predicting ? 'not-allowed' : 'pointer',
                      marginBottom: predictionResult ? '10px' : '0'
                    }}
                  >
                    {predicting ? 'EVALUATING RISK...' : 'CHECK AI FORECAST'}
                  </button>

                  {/* Prediction Result Display */}
                  {predictionResult && (
                    <div style={{ padding: '8px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>ESTIMATED THREAT</div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '800',
                        color: predictionResult === 'High' ? '#ef4444' : predictionResult === 'Medium' ? '#f59e0b' : '#10b981',
                        marginTop: '2px'
                      }}>
                        {predictionResult.toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}

          {/* 📍 DATABASE & LIVE SIMULATION PINS */}
          {incidents.map((item, index) => {
            const lat = item.coordinates?.latitude;
            const lng = item.coordinates?.longitude;

            if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

            return (
              <Marker key={item.id || index} position={[lat, lng]}>
                <Popup>
                  <div style={{ minWidth: '180px', padding: '5px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', marginBottom: '6px' }}>
                      ✨ AI Future Prediction
                    </div>
                    <div style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}>
                      <strong>Species:</strong> {item.species}
                    </div>
                    <div style={{ fontSize: '13px', marginBottom: '6px' }}>
                      <strong>Risk:</strong>{' '}
                      <span style={{
                        fontWeight: '800',
                        color: item.severity === 'High' ? '#ef4444' : item.severity === 'Medium' ? '#f59e0b' : '#10b981'
                      }}>
                        {item.severity || 'High'}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      📍 {item.location_name || 'Forest Buffer Zone'}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

      </div>
    </div>
  );
};

export default MapComponent;