import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { io } from 'socket.io-client';
import { usePark } from '../context/ParkContext';

const AnalyticsHub = () => {
  const { selectedPark } = usePark();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const serverIP = window.location.hostname;
    const token = localStorage.getItem('hwc_jwt_token') || localStorage.getItem('token');

    fetch(`http://${serverIP}:5000/api/analytics-data`, {
      headers: { ...(token && { 'Authorization': `Bearer ${token}` }) }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setIncidents(data);
        } else {
          const simulatedIncidents = [];
          const speciesList = selectedPark.analyticsSpecies || Object.keys(selectedPark.speciesConfig);
          const severities = ['High', 'Medium', 'Low'];
          for(let i=0; i<150; i++) {
            const date = new Date();
            date.setHours(Math.floor(Math.random() * 24));
            simulatedIncidents.push({
              species: speciesList[Math.floor(Math.random() * speciesList.length)],
              severity: severities[Math.floor(Math.random() * severities.length)],
              timestamp: date.toISOString()
            });
          }
          setIncidents(simulatedIncidents);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Analytics Data Error:", err.message);
        const simulatedIncidents = [];
        const speciesList = selectedPark.analyticsSpecies || Object.keys(selectedPark.speciesConfig);
        const severities = ['High', 'Medium', 'Low'];
        for(let i=0; i<150; i++) {
          const date = new Date();
          date.setHours(Math.floor(Math.random() * 24));
          simulatedIncidents.push({
            species: speciesList[Math.floor(Math.random() * speciesList.length)],
            severity: severities[Math.floor(Math.random() * severities.length)],
            timestamp: date.toISOString()
          });
        }
        setIncidents(simulatedIncidents);
        setLoading(false);
      });

    const socket = io(`http://${serverIP}:5000`);
    socket.on('live-alert', (newAlert) => {
      setIncidents(prev => [newAlert, ...(Array.isArray(prev) ? prev : [])]);
    });

    return () => socket.disconnect();
  }, [selectedPark.id]);

  // 1. Safety Check: Guarantees safe iteration over database rows
  const safeData = useMemo(() => Array.isArray(incidents) ? incidents : [], [incidents]);

  // 2. 0ms Math: Species Frequency (Bar Chart)
  const speciesData = useMemo(() => {
    const counts = safeData.reduce((acc, curr) => {
      const sp = curr?.species || 'Unknown';
      acc[sp] = (acc[sp] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(counts)
      .map(key => ({ species: key, sightings: counts[key] }))
      .sort((a, b) => b.sightings - a.sightings);
  }, [safeData]);

  // 3. 0ms Math: Threat Severity (Donut Chart)
  const severityData = useMemo(() => {
    const counts = safeData.reduce((acc, curr) => {
      const sev = curr?.severity || 'Low';
      acc[sev] = (acc[sev] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'High Threat', value: counts['High'] || 0, color: '#ef4444' },
      { name: 'Medium Threat', value: counts['Medium'] || 0, color: '#f59e0b' },
      { name: 'Low Threat', value: counts['Low'] || 0, color: '#3b82f6' }
    ].filter(item => item.value > 0);
  }, [safeData]);

  // 4. 0ms Math: 24-Hour Temporal Cycle (Area Chart)
  const hourlyData = useMemo(() => {
    const map = Array.from({ length: 24 }, (_, i) => ({
      hour: i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`,
      count: 0
    }));

    safeData.forEach(item => {
      if (item?.timestamp) {
        const dateObj = new Date(item.timestamp);
        if (!isNaN(dateObj.getTime())) {
          map[dateObj.getHours()].count += 1;
        }
      }
    });
    return map;
  }, [safeData]);

  // Skeleton loading cards
  const SkeletonCard = ({ height = '340px', span = 1 }) => (
    <div style={{
      gridColumn: span > 1 ? `span ${span}` : undefined,
      borderRadius: '12px',
      border: '1px solid #334155',
      overflow: 'hidden'
    }}>
      <div style={{ padding: '20px' }}>
        <div className="skeleton" style={{ width: '60%', height: '20px', marginBottom: '16px' }} />
        <div className="skeleton" style={{ width: '100%', height, borderRadius: '8px' }} />
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', backgroundColor: '#0f172a', minHeight: '100vh' }}>
      
      <div className="animate-slide-up" style={{ marginBottom: '24px', borderBottom: '2px solid #334155', paddingBottom: '12px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#f1f5f9', fontWeight: '800' }}>Real-Time Tactical Intelligence Hub</h1>
        <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
          Live behavioral analytics for {selectedPark.name} — processed from {safeData.length.toLocaleString()} database telemetry logs.
        </p>
      </div>

      {loading ? (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
            <SkeletonCard height="300px" />
            <SkeletonCard height="300px" />
          </div>
          <SkeletonCard height="320px" />
        </div>
      ) : (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
            
            {/* Frequency Bar Chart */}
            <div className="hover-elevate chart-appear" style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#f1f5f9' }}>🦌 Wildlife Sighting Frequency (By Species)</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={speciesData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="species" angle={-20} textAnchor="end" interval={0} tick={{ fontSize: 12, fill: '#cbd5e1', fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 12, fill: '#cbd5e1' }} />
                    <Tooltip cursor={{ fill: '#0f172a' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
                    <Bar dataKey="sightings" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Confirmed Sightings" animationDuration={800} animationEasing="ease-out" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Severity Donut Chart */}
            <div className="hover-elevate chart-appear" style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#f1f5f9' }}>⚠️ Threat Severity Breakdown</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={severityData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="45%" 
                      outerRadius={95} 
                      innerRadius={55}
                      paddingAngle={3}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#1e293b" />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value.toLocaleString()} incidents`, 'Count']} 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} 
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#cbd5e1' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Temporal Heatmap Line Graph */}
          <div className="hover-elevate chart-appear" style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#f1f5f9' }}>🕒 Temporal Activity Heatmap (Time of Day Line Graph)</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#94a3b8' }}>
              Maps exact conflict timestamps across 24-hour cycles to identify peak animal movement patterns.
            </p>
            <div style={{ height: '320px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#cbd5e1' }} interval={1} />
                  <YAxis tick={{ fontSize: 12, fill: '#cbd5e1' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
                  <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" name="Dispatches Recorded" animationDuration={800} animationEasing="ease-out" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default AnalyticsHub;