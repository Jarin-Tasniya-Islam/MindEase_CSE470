import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/users/register', form);
      alert(res.data.message);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create Your MindEase Account 💙</h2>
      <p style={styles.subheading}>Start building emotional wellness with us</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          name="name"
          type="text"
          placeholder="Full Name"
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Register</button>
      </form>

      <p style={styles.footerText}>
        Already a member?
        <br />
        <Link to="/">
          <button style={styles.secondaryButton}>Go to Login</button>
        </Link>
      </p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '420px',
    margin: '60px auto',
    padding: '30px',
    borderRadius: '12px',
    backgroundColor: '#e6f4fa', // light blue background
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
    textAlign: 'center',
    fontFamily: 'Segoe UI, sans-serif'
  },
  heading: {
    color: '#0077b6',
    marginBottom: '8px',
    fontSize: '24px'
  },
  subheading: {
    color: '#555',
    fontSize: '14px',
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  input: {
    padding: '10px',
    marginBottom: '12px',
    borderRadius: '8px',
    border: '1px solid #a3cde3',
    fontSize: '16px',
    backgroundColor: '#ffffff'
  },
  button: {
    backgroundColor: '#0077b6',
    color: 'white',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  secondaryButton: {
    marginTop: '10px',
    backgroundColor: '#ffffff',
    color: '#0077b6',
    border: '1px solid #0077b6',
    padding: '10px 16px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  footerText: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#444'
  }
};

export default Register;
