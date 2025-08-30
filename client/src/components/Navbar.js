import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getRole = () => localStorage.getItem('role') || 'user';
  const [role, setRole] = useState(getRole);

  // Update role when route changes (or after role changes elsewhere)
  useEffect(() => {
    setRole(getRole());
  }, [location.pathname]);

  useEffect(() => {
    const syncRole = () => setRole(getRole());
    window.addEventListener('storage', syncRole);
    return () => window.removeEventListener('storage', syncRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  // Utility: active style for NavLink
  const linkStyle = ({ isActive }) =>
    isActive ? { ...styles.link, ...styles.active } : styles.link;
  const sosStyle = ({ isActive }) =>
    isActive ? { ...styles.sos, ...styles.activeSos } : styles.sos;

  return (
    <nav style={styles.navbar}>
      <div style={styles.brand}>
        MindEase <span role="img" aria-label="sparkle">✨</span>
      </div>

      <div style={styles.links}>
        {role === 'admin' && (
          <>
            <NavLink to="/admin" style={linkStyle} end>Admin</NavLink>
            {/* <NavLink to="/admin/moderation" style={linkStyle}>Moderation</NavLink> */}
            <NavLink to="/admin/appointments" style={linkStyle}>Appointments Management</NavLink>
          </>
        )}

        <NavLink to="/mood" style={linkStyle}>Mood Tracker</NavLink>
        <NavLink to="/journal" style={linkStyle}>Journal</NavLink>
        <NavLink to="/selfcare" style={linkStyle}>Self-Care</NavLink>
        <NavLink to="/appointments" style={linkStyle}>Appointments</NavLink>
        <NavLink to="/profile" style={linkStyle}>Profile</NavLink>
        <NavLink to="/analytics" style={linkStyle}>Analytics</NavLink>
        <NavLink to="/sos" style={sosStyle}>SOS</NavLink>

        <NotificationBell />
        <button onClick={handleLogout} style={styles.logout}>Logout</button>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#d0eaff',
    padding: '15px 30px',
    color: '#003f5c',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'Segoe UI, sans-serif',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  brand: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#003f5c'
  },
  links: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  link: {
    color: '#003f5c',
    textDecoration: 'none',
    fontSize: '15px',
    padding: '8px 14px',
    borderRadius: 16, // rounded pill
    transition: 'all .15s ease'
  },
  // 💙 Active pill style
  active: {
    color: '#ffffff',
    backgroundImage: 'linear-gradient(180deg, #2f80ff 0%, #0a66ff 100%)',
    border: '1px solid #0b5cff',
    boxShadow: '0 2px 8px rgba(10,102,255,0.35)'
  },
  // default SOS (inactive)
  sos: {
    color: '#d32f2f',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 'bold',
    padding: '8px 14px',
    borderRadius: 16,
    transition: 'all .15s ease'
  },
  // 🔴 Active SOS pill
  activeSos: {
    color: '#ffffff',
    backgroundImage: 'linear-gradient(180deg, #ff6b6b 0%, #e53935 100%)',
    border: '1px solid #d32f2f',
    boxShadow: '0 2px 8px rgba(227, 76, 66, 0.35)'
  },
  logout: {
    backgroundColor: '#ffffff',
    border: '1px solid #003f5c',
    borderRadius: '8px',
    color: '#003f5c',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginLeft: 6
  }
};

export default Navbar;
