import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getRole = () => localStorage.getItem('role') || 'user';
  const [role, setRole] = useState(getRole);

  // ✅ Update role whenever route changes or storage changes
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

  return (
    <nav style={styles.navbar}>
      <div style={styles.brand}>
        MindEase <span role="img" aria-label="sparkle">✨</span>
      </div>
      <div style={styles.links}>
        {/* 👇 Only show if role is admin */}
        {role === 'admin' && <Link to="/admin" style={styles.link}>Admin</Link>}
        {role === 'admin' && <Link to="/admin/moderation" style={styles.link}>Moderation</Link>}
        {role === 'admin' && <Link to="/admin/appointments" style={styles.link}>Appointments</Link>}

        <Link to="/mood" style={styles.link}>Mood Tracker</Link>
        <Link to="/journal" style={styles.link}>Journal</Link>
        <Link to="/selfcare" style={styles.link}>Self-Care</Link>
        <Link to="/appointments" style={styles.link}>Appointments</Link>
        <Link to="/profile" style={styles.link}>Profile</Link>
        <Link to="/analytics" style={styles.link}>Analytics</Link>
        <Link to="/sos" style={styles.sos}>SOS</Link>
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
    gap: '20px',
    alignItems: 'center'
  },
  link: {
    color: '#003f5c',
    textDecoration: 'none',
    fontSize: '15px'
  },
  sos: {
    color: '#d32f2f',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 'bold'
  },
  logout: {
    backgroundColor: '#ffffff',
    border: '1px solid #003f5c',
    borderRadius: '5px',
    color: '#003f5c',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }
};

export default Navbar;
