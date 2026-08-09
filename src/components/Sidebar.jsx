import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Map, BarChart2, AlertTriangle, PlusCircle, ShieldAlert, Database, Trees } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePark } from '../context/ParkContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedPark } = usePark();

  const getLinkStyle = (path) => ({
    ...styles.link,
    backgroundColor: location.pathname === path ? '#2d2d44' : 'transparent',
    color: location.pathname === path ? '#ffffff' : '#a0a0b0',
  });

  return (
    <div style={styles.sidebar}>
      <div style={styles.logoContainer} className="animate-fade-in">
        <AlertTriangle color="#ff4444" size={32} />
        <h2 style={styles.title}>HWC Alert</h2>
      </div>

      {/* Park Indicator */}
      <div
        onClick={() => navigate('/select')}
        style={styles.parkIndicator}
        className="hover-elevate"
      >
        <Trees size={16} color="#10b981" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Park</div>
          <div style={{ fontSize: '0.8rem', color: '#f1f5f9', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedPark.name}</div>
        </div>
        <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700, flexShrink: 0 }}>SWITCH</span>
      </div>

      <nav style={styles.nav}>
        <Link to="/" style={getLinkStyle('/')} className="sidebar-link">
          <Map size={20} />
          <span>Live Map</span>
        </Link>
        <Link to="/analytics" style={getLinkStyle('/analytics')} className="sidebar-link">
          <BarChart2 size={20} />
          <span>Analytics</span>
        </Link>
        <Link to="/report" style={getLinkStyle('/report')} className="sidebar-link">
          <PlusCircle size={20} />
          <span>Report Incident</span>
        </Link>
        <Link to="/predict" style={getLinkStyle('/predict')} className="sidebar-link">
          <ShieldAlert size={20} />
          <span>AI Risk Predictor</span>
        </Link>
        <Link to="/dataset" style={getLinkStyle('/dataset')} className="sidebar-link">
          <Database size={20} />
          <span>Dataset Management</span>
        </Link>
      </nav>

      <div style={styles.footer}>
        <div style={styles.userInfo}>
          <span style={styles.roleTag}>{user?.role || 'Ranger'} Unit</span>
          <strong style={styles.username}>{user?.username || 'Active User'}</strong>
        </div>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '250px',
    height: '100vh',
    backgroundColor: '#1e1e2f',
    color: 'white',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    boxSizing: 'border-box',
    borderRight: '1px solid #2d2d44',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '35px',
  },
  title: {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  parkIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    border: '1px solid #334155',
    marginBottom: '20px',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    textDecoration: 'none',
    fontSize: '1rem',
    padding: '12px 14px',
    borderRadius: '8px',
    /* transition is handled by the .sidebar-link CSS class */
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '15px',
    borderTop: '1px solid #2d2d44',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  roleTag: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: '#ff4444',
    fontWeight: '700',
    letterSpacing: '1px',
  },
  username: {
    fontSize: '1rem',
    color: '#ffffff',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px',
    backgroundColor: '#ff4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};

export default Sidebar;