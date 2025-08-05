import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const JournalForm = () => {
  const [form, setForm] = useState({
    content: '',
    entryType: '',
    // avatar: '',
    font: 'Segoe UI',
    theme: 'lightblue',
    userId: '',
    language: 'en'
  });
  const [appreciation, setAppreciation] = useState('');

  // Get user ID from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setForm(prev => ({ ...prev, userId: decoded.id }));
    }
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const appreciationMessages = [
    "🌟 Sharing your thoughts is amazing! Thank you for opening up.",
    "💙 Expressing yourself is powerful. We're glad you shared!",
    "👏 You just did something wonderful by sharing your entry!",
    "✨ Your story matters. Thanks for letting it out!",
    "🙌 Sharing is self-care. You did great!",
    "📝 Every share is a step forward. Well done!",
    "😊 You made your day better by sharing. Keep it up!"
  ];

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = {
        userId: form.userId,
        content: form.content,
        entryType: form.entryType,
        // avatar: form.avatar,
        font: form.font,
        theme: form.theme,
        language: form.language,
        date: new Date()
      };

      await axios.post('http://localhost:5000/api/journal', payload);
      const msg = appreciationMessages[Math.floor(Math.random() * appreciationMessages.length)];
      setAppreciation(msg);
      setForm(prev => ({
        ...prev,
        content: '',
        entryType: '',
        // avatar: ''
      }));
    } catch (err) {
      console.error(err.response?.data || err.message);
      setAppreciation('');
      alert('Error saving entry');
    }
  };

  return (
    <div style={{ ...styles.container, fontFamily: form.font, backgroundColor: form.theme === 'lightblue' ? '#e6f4fa' : '#fff9f0' }}>
      <h2 style={styles.heading}>📝 Write</h2>

      {/* Entry Type Label */}
      <select name="entryType" value={form.entryType} onChange={handleChange} style={styles.input}>
        <option value="">Select Entry Type</option>
        <option value="Reflection">🪞 Reflection</option>
        <option value="Gratitude">🙏 Gratitude</option>
        <option value="Goal">🎯 Goals</option>
        <option value="Venting">💢 Venting</option>
        <option value="Dream">🌙 Dream</option>
      </select>

      {/* Removed avatar select */}

      {/* Freeform Entry */}
      <textarea
        name="content"
        value={form.content}
        onChange={handleChange}
        placeholder={form.language === 'bn' ? 'আপনার ভাবনা, আইডিয়া, স্বপ্ন...' : 'Your thoughts, ideas, dreams...'}
        style={{ ...styles.input, height: '100px' }}
      />

      {/* Removed tags input */}

      {/* Appreciation message after save */}
      {appreciation && (
        <div style={{
          background: '#e0ffe6',
          color: '#1b5e20',
          borderRadius: '8px',
          padding: '12px',
          margin: '16px 0',
          fontWeight: 'bold',
          textAlign: 'center',
          fontSize: '16px'
        }}>{appreciation}</div>
      )}

      {/* Theme and Font */}
      <div style={styles.row}>
        <select name="theme" value={form.theme} onChange={handleChange} style={styles.dropdown}>
          <option value="lightblue">🌤️ Light Blue</option>
          <option value="cream">🍦 Cream</option>
        </select>

        <select name="font" value={form.font} onChange={handleChange} style={styles.dropdown}>
          <option>Segoe UI</option>
          <option>Georgia</option>
          <option>Courier New</option>
          <option>Verdana</option>
        </select>

        <select name="language" value={form.language} onChange={handleChange} style={styles.dropdown}>
          <option value="en">English</option>
          <option value="bn">বাংলা</option>
        </select>
      </div>

      <button onClick={handleSubmit} style={styles.button}>Save Entry</button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.08)'
  },
  heading: {
    textAlign: 'center',
    color: '#0077b6',
    marginBottom: '20px'
  },
  input: {
    padding: '10px',
    marginBottom: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '15px',
    width: '100%',
    backgroundColor: 'white'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#0077b6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
    gap: '10px'
  },
  dropdown: {
    flex: 1,
    padding: '8px',
    borderRadius: '6px',
    fontSize: '14px'
  }
};

export default JournalForm;
