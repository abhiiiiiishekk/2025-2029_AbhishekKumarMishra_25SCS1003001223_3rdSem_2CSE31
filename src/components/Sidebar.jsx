import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Map, BarChart2, AlertTriangle, Settings, PlusCircle, ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth(); // 🔐 Access current user and logout function

  // Helper function to dynamically highlight the active navigation item
  const getLinkStyle = (path) => ({
    ...styles.link,
    backgroundColor: location.pathname === path ? '#2d2d44' : 'transparent',
    color: location.pathname === path ? '#ffffff' : '#a0a0b0',
  });

  return (
    <div style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <AlertTriangle color="#ff4444" size={32} />
        <h2 style={styles.title}>HWC Alert</h2>
      </div>
      
      <nav style={styles.nav}>
        <Link to="/" style={getLinkStyle('/')}>
          <Map size={20} />
          <span>Live Map</span>
        </Link>
        <Link to="/analytics" style={getLinkStyle('/analytics')}>
          <BarChart2 size={20} />
          <span>Analytics</span>
        </Link>
        <Link to="/report" style={getLinkStyle('/report')}>
          <PlusCircle size={20} />
          <span>Report Incident</span>
        </Link>
        <Link to="/predict" style={getLinkStyle('/predict')}>
          <ShieldAlert size={20} />
          <span>AI Risk Predictor</span>
        </Link>
        <Link to="/settings" style={getLinkStyle('/settings')}>
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </nav>

      {/* 🔐 AUTHENTICATED UNIT FOOTER */}
      <div style={styles.footer}>
        <div style={styles.userInfo}>
          <span style={styles.roleTag}>{user?.role || 'Ranger'} Unit</span>
          <strong style={styles.username}>{user?.username || 'Active User'}</strong>
        </div>
        <button onClick={logout} style={styles.logoutButton}>
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
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
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    textDecoration: 'none',
    fontSize: '1rem',
    padding: '12px 14px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
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