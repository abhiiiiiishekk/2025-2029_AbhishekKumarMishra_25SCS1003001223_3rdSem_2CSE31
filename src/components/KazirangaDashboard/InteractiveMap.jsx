import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Play, Pause, FastForward, Rewind } from 'lucide-react';
import { generateAnimals } from '../../data/simulated_data';
import { usePark } from '../../context/ParkContext';

const MapRecenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const MAP_STYLE = { height: '500px', width: '100%', borderRadius: '0.5rem', zIndex: 1 };
const TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

const InteractiveMap = ({ selectedSpecies }) => {
  const { selectedPark } = usePark();
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const speciesConfig = selectedPark.speciesConfig;
  const conflictZones = selectedPark.conflictZones;
  const parkCenter = selectedPark.center;
  const parkBoundary = selectedPark.boundary;

  // Generate park-specific animal data
  const [animalData, setAnimalData] = useState([]);
  useEffect(() => {
    setAnimalData(generateAnimals(30, selectedPark));
    setCurrentTimeIndex(0);
    setIsPlaying(false);
  }, [selectedPark.id]);

  const maxSteps = animalData[0]?.path.length || 0;

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeIndex(prev => {
          if (prev >= maxSteps - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, maxSteps]);

  const filteredAnimals = animalData.filter(a => selectedSpecies === 'All' || a.species === selectedSpecies);

  const createIcon = (emoji, color) => {
    return L.divIcon({
      className: 'custom-animal-icon',
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${emoji}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  return (
    <div className="hover-elevate animate-slide-up" style={{
      backgroundColor: '#1e293b',
      borderRadius: '0.75rem',
      padding: '1.25rem',
      border: '1px solid #334155',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: '#f1f5f9', fontWeight: 600 }}>Tactical Map: Live Tracking & Hotspots</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#0f172a', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Time: {new Date(animalData[0]?.path[currentTimeIndex]?.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setCurrentTimeIndex(0)} className="hover-scale" style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
              <Rewind size={18} />
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="hover-scale" style={{ background: '#3b82f6', border: 'none', color: '#fff', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }}/>}
            </button>
            <button onClick={() => setCurrentTimeIndex(maxSteps - 1)} className="hover-scale" style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
              <FastForward size={18} />
            </button>
          </div>
          <input type="range" min="0" max={maxSteps - 1} value={currentTimeIndex} onChange={(e) => setCurrentTimeIndex(parseInt(e.target.value))} style={{ width: '150px', cursor: 'pointer' }} />
        </div>
      </div>

      <div className="map-fade-in" style={{ position: 'relative' }}>
        <MapContainer center={parkCenter} zoom={selectedPark.zoom || 12} style={MAP_STYLE} scrollWheelZoom={false}>
          <MapRecenter center={parkCenter} zoom={selectedPark.zoom || 12} />
          <TileLayer url={TILE_URL} attribution='&copy; <a href="https://www.esri.com/">Esri</a>' />
          
          <Polygon positions={parkBoundary} pathOptions={{ color: '#10b981', weight: 2, fillOpacity: 0.1, dashArray: '5, 5' }} />

          {conflictZones.map(zone => (
            <Polygon key={zone.id} positions={zone.coordinates} pathOptions={{ color: '#ef4444', weight: 2, fillOpacity: 0.3 }}>
              <Popup>
                <div style={{ color: '#1e293b' }}>
                  <strong>{zone.name}</strong><br/>
                  Type: {zone.type}<br/>
                  <span style={{ color: '#ef4444' }}>High Conflict Risk</span>
                </div>
              </Popup>
            </Polygon>
          ))}

          {showHeatmap && filteredAnimals.map((animal) => {
            const pathUpToNow = animal.path.slice(0, currentTimeIndex + 1);
            return pathUpToNow.map((pt, i) => (
              <CircleMarker key={`${animal.id}-hist-${i}`} center={[pt.lat, pt.lng]} radius={8} pathOptions={{ color: speciesConfig[animal.species]?.color || '#888', stroke: false, fillOpacity: 0.05 }} />
            ));
          })}

          {filteredAnimals.map(animal => {
            const currentPos = animal.path[currentTimeIndex];
            const config = speciesConfig[animal.species] || { color: '#888', icon: '?' };
            const pathCoordinates = animal.path.slice(0, currentTimeIndex + 1).map(pt => [pt.lat, pt.lng]);
            if (!currentPos) return null;
            return (
              <React.Fragment key={animal.id}>
                <Polyline positions={pathCoordinates} pathOptions={{ color: config.color, weight: 2, opacity: 0.6 }} />
                <Marker position={[currentPos.lat, currentPos.lng]} icon={createIcon(config.icon, config.color)}>
                  <Popup>
                    <div style={{ color: '#1e293b', minWidth: '120px' }}>
                      <strong>{animal.species} ({animal.id})</strong><br/>
                      Time: {new Date(currentPos.timestamp).toLocaleTimeString()}<br/>
                      Lat: {currentPos.lat.toFixed(4)}<br/>
                      Lng: {currentPos.lng.toFixed(4)}
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
        
        <div style={{ position: 'absolute', bottom: '20px', right: '20px', backgroundColor: 'rgba(30, 41, 59, 0.9)', padding: '1rem', borderRadius: '0.5rem', zIndex: 400, border: '1px solid #334155' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#f1f5f9', fontSize: '0.875rem' }}>Legend</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', border: '1px dashed #fff' }}></div>
              Park Boundary
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', opacity: 0.5 }}></div>
              Conflict Zone
            </div>
            {Object.keys(speciesConfig).map(species => (
              <div key={species} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: speciesConfig[species].color, borderRadius: '50%' }}></div>
                {species}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
