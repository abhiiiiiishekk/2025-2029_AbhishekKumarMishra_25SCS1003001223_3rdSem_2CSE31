import React, { useState, useEffect } from 'react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { usePark } from '../context/ParkContext';

const PIE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

const RiskGauge = ({ score, label }) => {
  const radius = 70;
  const circumference = Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#ef4444' : score >= 60 ? '#f59e0b' : score >= 35 ? '#3b82f6' : '#10b981';

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="180" height="110" viewBox="0 0 180 110">
        <path d="M 15 100 A 70 70 0 0 1 165 100" fill="none" stroke="#e2e8f0" strokeWidth="14" strokeLinecap="round" />
        <path
          d="M 15 100 A 70 70 0 0 1 165 100"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease-in-out, stroke 0.5s' }}
        />
        <text x="90" y="85" textAnchor="middle" fontSize="32" fontWeight="900" fill={color}>{score}</text>
        <text x="90" y="105" textAnchor="middle" fontSize="12" fill="#64748b">{label}</text>
      </svg>
    </div>
  );
};

const RiskPredictor = () => {
  const { selectedPark } = usePark();
  const speciesDB = selectedPark.speciesDB;
  const parkSpecies = Object.keys(speciesDB);
  
  const [species, setSpecies] = useState(parkSpecies[0]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // Reset species selection when park changes
  useEffect(() => {
    const newSpecies = Object.keys(selectedPark.speciesDB);
    setSpecies(newSpecies[0]);
    setPrediction(null);
    setAnimateIn(false);
  }, [selectedPark.id]);

  const handleCheckForecast = () => {
    setLoading(true);
    setPrediction(null);
    setAnimateIn(false);

    setTimeout(() => {
      const data = speciesDB[species];
      setPrediction(data);
      setLoading(false);
      setTimeout(() => setAnimateIn(true), 50);
    }, 1800);
  };

  const getBadgeStyle = (severity) => {
    const colors = {
      'Critical': { bg: '#fef2f2', border: '#991b1b', text: '#991b1b' },
      'High': { bg: '#fef2f2', border: '#ef4444', text: '#ef4444' },
      'Medium': { bg: '#fffbeb', border: '#f59e0b', text: '#b45309' },
      'Low': { bg: '#f0fdf4', border: '#10b981', text: '#047857' }
    };
    return colors[severity] || colors['Medium'];
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#0f172a', minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      <div className="animate-slide-up" style={{ maxWidth: '1100px', margin: '0 auto 24px auto', textAlign: 'center' }}>
        <h1 style={{ color: '#f1f5f9', fontSize: '28px', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
          {speciesDB[parkSpecies[0]]?.icon || '🌿'} {selectedPark.name} Wildlife Risk Intelligence
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '15px', margin: 0 }}>AI-powered species-specific conflict prediction & analysis for {selectedPark.name}</p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto 24px auto', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={species}
          onChange={(e) => { setSpecies(e.target.value); setPrediction(null); setAnimateIn(false); }}
          className="input-transition"
          style={{
            flex: '1 1 300px', padding: '14px 18px', borderRadius: '10px', border: '1px solid #334155',
            fontSize: '16px', fontWeight: '600', color: '#f1f5f9', backgroundColor: '#1e293b',
            cursor: 'pointer', outline: 'none'
          }}
        >
          {parkSpecies.map(s => (
            <option key={s} value={s}>{speciesDB[s].icon} {s}</option>
          ))}
        </select>
        <button
          onClick={handleCheckForecast}
          disabled={loading}
          className="btn-glow"
          style={{
            flex: '0 0 auto', padding: '14px 32px', borderRadius: '10px', border: 'none',
            background: loading ? '#475569' : 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff', fontWeight: '700', fontSize: '15px', cursor: loading ? 'wait' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 15px rgba(16,185,129,0.4)',
            letterSpacing: '0.5px'
          }}
        >
          {loading ? 'Analyzing...' : 'Run AI Forecast'}
        </button>
      </div>

      {loading && (
        <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', padding: '20px 0 24px 0' }}>
            <div style={{
              width: '56px', height: '56px', margin: '0 auto 20px auto',
              border: '4px solid #334155', borderTop: '4px solid #10b981',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{ color: '#94a3b8', fontSize: '16px' }}>Analyzing movement telemetry, historical conflict records, and habitat data for <strong style={{ color: '#10b981' }}>{species}</strong>...</p>
          </div>
          <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton-card" style={{ height: '130px' }} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="skeleton-card" style={{ height: '260px' }} />
            <div className="skeleton-card" style={{ height: '260px' }} />
          </div>
        </div>
      )}

      {prediction && (
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div className="hover-elevate" style={{ backgroundColor: '#1e293b', borderRadius: '14px', padding: '20px', border: '1px solid #334155', gridColumn: 'span 1' }}>
              <RiskGauge score={prediction.riskScore} label="RISK INDEX" />
            </div>

            <div className="hover-elevate" style={{ backgroundColor: '#1e293b', borderRadius: '14px', padding: '20px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Threat Level</div>
              <div style={{
                fontSize: '22px', fontWeight: '900', padding: '8px 24px', borderRadius: '8px',
                backgroundColor: getBadgeStyle(prediction.severity).bg,
                color: getBadgeStyle(prediction.severity).text,
                border: `2px solid ${getBadgeStyle(prediction.severity).border}`
              }}>
                {prediction.severity.toUpperCase()}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '10px' }}>
                AI Confidence: <strong style={{ color: '#f1f5f9' }}>{prediction.confidence}%</strong>
              </div>
            </div>

            <div className="hover-elevate" style={{ backgroundColor: '#1e293b', borderRadius: '14px', padding: '20px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Est. Population</div>
              <div style={{ fontSize: '36px', fontWeight: '900', color: '#f1f5f9' }}>{prediction.population.toLocaleString()}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>within {selectedPark.name}</div>
            </div>

            <div className="hover-elevate" style={{ backgroundColor: '#1e293b', borderRadius: '14px', padding: '20px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Species Profile</div>
              {Object.entries(prediction.stats).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #334155' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: '600' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div className="hover-elevate chart-appear" style={{ backgroundColor: '#1e293b', borderRadius: '14px', padding: '20px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '14px', color: '#f1f5f9', fontWeight: '700', marginBottom: '12px' }}>Hourly Conflict Risk</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={prediction.hourlyActivity.map((risk, i) => ({ hour: `${String(i * 2).padStart(2, '0')}:00`, risk }))}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9' }} />
                  <Area type="monotone" dataKey="risk" stroke="#ef4444" fillOpacity={1} fill="url(#riskGrad)" strokeWidth={2} name="Risk %" animationDuration={800} animationEasing="ease-out" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="hover-elevate chart-appear" style={{ backgroundColor: '#1e293b', borderRadius: '14px', padding: '20px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '14px', color: '#f1f5f9', fontWeight: '700', marginBottom: '12px' }}>Monthly Conflict Trend</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={prediction.monthlyConflicts.map((incidents, i) => ({ month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i], incidents }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9' }} />
                  <Bar dataKey="incidents" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Incidents" animationDuration={800} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div className="hover-elevate chart-appear" style={{ backgroundColor: '#1e293b', borderRadius: '14px', padding: '20px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '14px', color: '#f1f5f9', fontWeight: '700', marginBottom: '12px' }}>Conflict Type Breakdown</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={Object.entries(prediction.conflictTypes).map(([name, value]) => ({ name, value }))}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {Object.entries(prediction.conflictTypes).map(([name, value], index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#f1f5f9' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="hover-elevate" style={{ backgroundColor: '#1e293b', borderRadius: '14px', padding: '20px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '14px', color: '#f1f5f9', fontWeight: '700' }}>Field Intelligence</div>
              <InfoRow icon="📍" label="Hotspot Zone" value={prediction.hotspot_zone} />
              <InfoRow icon="🧭" label="Movement Direction" value={prediction.movement_direction} />
              <InfoRow icon="🕒" label="Peak Activity Window" value={prediction.expected_time} />
              <div style={{ backgroundColor: '#0f172a', borderRadius: '8px', padding: '12px', borderLeft: '4px solid #8b5cf6', marginTop: '4px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>AI Ecological Analysis</div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>{prediction.reason}</div>
              </div>
            </div>
          </div>

          <div className="hover-elevate" style={{ backgroundColor: '#1e293b', borderRadius: '14px', padding: '20px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '14px', color: '#f1f5f9', fontWeight: '700', marginBottom: '12px' }}>Recommended Ranger Actions</div>
            <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
              {prediction.recommended_actions.map((action, idx) => (
                <div key={idx} className="hover-elevate" style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px',
                  backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155'
                }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', color: '#fff', fontWeight: '700'
                  }}>{idx + 1}</div>
                  <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>{action}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!prediction && !loading && (
        <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🌿</div>
          <p style={{ color: '#64748b', fontSize: '17px', maxWidth: '500px', margin: '0 auto' }}>
            Select a species above and click <strong style={{ color: '#10b981' }}>Run AI Forecast</strong> to generate a comprehensive wildlife conflict risk analysis for {selectedPark.name}.
          </p>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
    <div style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: '600' }}>{value}</div>
    </div>
  </div>
);

export default RiskPredictor;