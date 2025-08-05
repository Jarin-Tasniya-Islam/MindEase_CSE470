import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.brand}>MindEase <span role="img" aria-label="sparkle">✨</span></div>
      <div style={styles.links}>
        <Link to="/mood" style={styles.link}>Mood Tracker</Link>
        <Link to="/journal" style={styles.link}>Journal</Link>
        <Link to="/selfcare" style={styles.link}>Self-Care</Link>
        <Link to="/appointments" style={styles.link}>Appointments</Link>
        <Link to="/profile" style={styles.link}>Profile</Link>
        <button onClick={handleLogout} style={styles.logout}>Logout</button>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#d0eaff', // 💙 Light blue
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
