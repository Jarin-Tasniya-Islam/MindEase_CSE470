import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Profile = () => {
  const [user, setUser] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      axios.get(`http://localhost:5000/api/users/${decoded.id}`)
        .then(res => setUser(res.data))
        .catch(() => alert('Failed to load profile'));
    } catch (err) {
      console.error('Invalid token:', err);
    }
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>👤 Your Profile</h2>
      <p style={styles.text}><strong>Name:</strong> {user.name}</p>
      <p style={styles.text}><strong>Email:</strong> {user.email}</p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '500px',
    margin: '50px auto',
    padding: '30px',
    borderRadius: '10px',
    backgroundColor: '#f0f8ff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontFamily: 'Segoe UI, sans-serif'
  },
  title: {
    color: '#0077b6',
    marginBottom: '20px'
  },
  text: {
    fontSize: '16px',
    margin: '10px 0'
  }
};

export default Profile;
