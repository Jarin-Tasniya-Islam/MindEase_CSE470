import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', form);
      localStorage.setItem('token', res.data.token);
      alert(`Welcome ${res.data.name}`);
      navigate('/profile'); // ✅ Redirect to profile page
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Welcome Back 💙</h2>
      <p style={styles.subheading}>Log in to continue your wellness journey</p>

      <form onSubmit={handleSubmit} style={styles.form}>
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
        <button type="submit" style={styles.button}>Login</button>
      </form>

      <p style={styles.footerText}>
        New here?
        <br />
        <Link to="/register">
          <button style={styles.secondaryButton}>Create an Account</button>
        </Link>
      </p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '60px auto',
    padding: '30px',
    borderRadius: '12px',
    backgroundColor: '#e6f4fa',
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
    textAlign: 'center',
    fontFamily: 'Segoe UI, sans-serif'
  },
  heading: {
    color: '#0077b6',
    marginBottom: '5px',
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

export default Login;
