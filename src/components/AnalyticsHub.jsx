import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { io } from 'socket.io-client';

const AnalyticsHub = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const serverIP = window.location.hostname;
    const token = localStorage.getItem('hwc_jwt_token') || localStorage.getItem('token');

    // ⚡ Silent Background Fetch: Runs once on mount
    fetch(`http://${serverIP}:5000/api/analytics-data`, {
      headers: { ...(token && { 'Authorization': `Bearer ${token}` }) }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setIncidents(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Analytics Data Error:", err.message);
        setLoading(false);
      });

    const socket = io(`http://${serverIP}:5000`);
    socket.on('live-alert', (newAlert) => {
      setIncidents(prev => [newAlert, ...(Array.isArray(prev) ? prev : [])]);
    });

    return () => socket.disconnect();
  }, []);

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

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      <div style={{ marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>📈 Real-Time Tactical Intelligence Hub</h1>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
          Live behavioral analytics processed from {safeData.length.toLocaleString()} database telemetry logs.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '18px', color: '#64748b', fontWeight: 'bold' }}>
          ⏳ Processing 6,032 historical database logs...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
            
            {/* Frequency Bar Chart */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b' }}>🦌 Wildlife Sighting Frequency (By Species)</h3>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={speciesData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="species" angle={-20} textAnchor="end" interval={0} tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 12, fill: '#475569' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="sightings" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Confirmed Sightings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Severity Donut Chart */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b' }}>⚠️ Threat Severity Breakdown</h3>
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
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value.toLocaleString()} incidents`, 'Count']} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Temporal Heatmap Line Graph */}
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1e293b' }}>🕒 Temporal Activity Heatmap (Time of Day Line Graph)</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#475569' }} interval={1} />
                  <YAxis tick={{ fontSize: 12, fill: '#475569' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" name="Dispatches Recorded" />
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