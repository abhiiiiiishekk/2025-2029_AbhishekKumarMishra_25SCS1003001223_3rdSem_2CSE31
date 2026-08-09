import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Trees, Calendar, Shield, ArrowRight } from 'lucide-react';
import { usePark } from '../context/ParkContext';

const PARK_GRADIENTS = {
  kaziranga: 'linear-gradient(135deg, #065f46 0%, #064e3b 50%, #022c22 100%)',
  corbett: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #14532d 100%)',
  ranthambore: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #78350f 100%)',
  bandipur: 'linear-gradient(135deg, #166534 0%, #15803d 50%, #166534 100%)',
  nagarhole: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #065f46 100%)',
  kanha: 'linear-gradient(135deg, #14532d 0%, #16a34a 50%, #14532d 100%)',
  sundarbans: 'linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #0c4a6e 100%)',
  periyar: 'linear-gradient(135deg, #065f46 0%, #059669 50%, #065f46 100%)',
  gir: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #78350f 100%)',
  manas: 'linear-gradient(135deg, #14532d 0%, #15803d 50%, #14532d 100%)',
};

const LandingPage = () => {
  const { allParks, selectPark } = usePark();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [hoveredPark, setHoveredPark] = useState(null);

  const filteredParks = useMemo(() => {
    if (!search.trim()) return allParks;
    const q = search.toLowerCase();
    return allParks.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.state.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.famousSpecies.some(s => s.toLowerCase().includes(q))
    );
  }, [search, allParks]);

  const handleSelectPark = (park) => {
    selectPark(park.id);
    navigate('/');
  };

  const handleImageError = useCallback((e) => {
    e.target.style.display = 'none';
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        borderBottom: '1px solid #334155',
        padding: '60px 40px 40px',
        textAlign: 'center'
      }}>
        <div className="animate-slide-up" style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            marginBottom: '20px', boxShadow: '0 0 40px rgba(16,185,129,0.3)'
          }}>
            <Shield color="#fff" size={40} />
          </div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px' }}>
            India Wildlife Intelligence
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
            Select a national park to access real-time tracking, conflict prediction, and ranger intelligence systems
          </p>
        </div>

        {/* Search Bar */}
        <div className="animate-slide-up" style={{ maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
          <Search color="#94a3b8" size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search parks, states, or species..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-transition"
            style={{
              width: '100%', padding: '14px 16px 14px 48px',
              backgroundColor: '#1e293b', color: '#f1f5f9',
              border: '1px solid #334155', borderRadius: '12px',
              fontSize: '1rem', outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Park Grid */}
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="stagger-children" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '24px'
        }}>
          {filteredParks.map((park) => (
            <div
              key={park.id}
              className="hover-elevate"
              onMouseEnter={() => setHoveredPark(park.id)}
              onMouseLeave={() => setHoveredPark(null)}
              onClick={() => handleSelectPark(park)}
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '16px',
                border: hoveredPark === park.id ? '2px solid #10b981' : '2px solid #334155',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: hoveredPark === park.id ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hoveredPark === park.id
                  ? '0 20px 40px rgba(16,185,129,0.15)'
                  : '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              {/* Park Image */}
              <div style={{
                height: '180px',
                background: PARK_GRADIENTS[park.id] || 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <img
                  src={park.image}
                  alt={park.name}
                  onError={handleImageError}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: '80px',
                  background: 'linear-gradient(transparent, #1e293b)'
                }} />
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  backgroundColor: 'rgba(16,185,129,0.9)', padding: '4px 12px',
                  borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#fff'
                }}>
                  {park.area}
                </div>
              </div>

              {/* Park Info */}
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <MapPin size={14} color="#10b981" />
                  <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>{park.state}</span>
                </div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9' }}>
                  {park.name}
                </h3>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.875rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  {park.tagline}
                </p>

                {/* Famous Species */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {park.famousSpecies.map(s => (
                    <span key={s} style={{
                      backgroundColor: '#0f172a', padding: '3px 10px',
                      borderRadius: '12px', fontSize: '0.7rem', color: '#cbd5e1',
                      border: '1px solid #334155'
                    }}>
                      {s}
                    </span>
                  ))}
                </div>

                {/* Meta Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.8rem' }}>
                    <Calendar size={12} />
                    Est. {park.established}
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    color: '#10b981', fontWeight: 700, fontSize: '0.875rem'
                  }}>
                    Open Dashboard <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredParks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <Trees size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontSize: '1.1rem' }}>No parks found matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
