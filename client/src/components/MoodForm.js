import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const moodOptions = [
  { level: 6, emoji: '😄', label: 'Very Happy' },
  { level: 5, emoji: '🙂', label: 'Happy' },
  { level: 4, emoji: '😐', label: 'Neutral' },
  { level: 3, emoji: '😟', label: 'Sad' },
  { level: 2, emoji: '😢', label: 'Very Sad' },
  { level: 1, emoji: '😡', label: 'Angry' }
];

const MoodForm = () => {
  const [form, setForm] = useState({
    userId: '',
    moodLevel: '',
    emoji: '',
    moodDescription: '',
    // moodType: '',
    moodDuration: '',
    thoughtPatterns: '',
    stressLevel: '',
    energyLevel: '',
    activity: '',
    location: '',
    socialInteraction: '',
    timeOfDay: '',
    notes: '',
    // categories: ''
  });

  const [errors, setErrors] = useState({});
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setForm(prev => ({ ...prev, userId: decoded.id }));
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleEmojiSelect = (level, emoji) => {
    setForm({ ...form, moodLevel: level, emoji });
    setErrors({ ...errors, moodLevel: '' });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Validation: all except notes required
    const requiredFields = [
      'moodLevel', 'emoji', 'moodDescription', 'moodDuration', 'thoughtPatterns',
      'stressLevel', 'energyLevel', 'activity', 'location', 'socialInteraction', 'timeOfDay'
    ];
    const newErrors = {};
    requiredFields.forEach(field => {
      if (!form[field]) {
        newErrors[field] = 'Required';
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      const payload = {
        ...form,
        dateTime: new Date()
      };
      await axios.post('http://localhost:5000/api/mood', payload);
      alert('✅ Mood saved!');
      setForm(prev => ({
        ...prev,
        moodLevel: '',
        emoji: '',
        moodDescription: '',
        moodDuration: '',
        thoughtPatterns: '',
        stressLevel: '',
        energyLevel: '',
        activity: '',
        location: '',
        socialInteraction: '',
        timeOfDay: '',
        notes: ''
      }));
      setErrors({});
    } catch (err) {
      alert('❌ Error saving mood.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Log Your Mood 💙</h2>

      {/* Mood Emoji Selector */}
      <div style={styles.emojiContainer}>
        {moodOptions.map(option => (
          <button
            key={option.level}
            onClick={() => handleEmojiSelect(option.level, option.emoji)}
            style={{
              ...styles.emojiButton,
              backgroundColor: form.moodLevel === option.level ? '#0077b6' : '#d9f0ff',
              color: form.moodLevel === option.level ? '#ffffff' : '#000000'
            }}
            title={option.label}
          >
            {option.emoji}
          </button>
        ))}
      </div>

      {/* Mood Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="moodDescription" placeholder="Mood Description (e.g., tired, anxious)" value={form.moodDescription} onChange={handleChange} style={styles.input} />
        {errors.moodDescription && <div style={{ color: 'red', fontSize: '13px' }}>Description is required.</div>}
        <input name="moodDuration" placeholder="Mood Duration (brief, lingering)" value={form.moodDuration} onChange={handleChange} style={styles.input} />
        {errors.moodDuration && <div style={{ color: 'red', fontSize: '13px' }}>Duration is required.</div>}
        <input name="thoughtPatterns" placeholder="Thought Patterns (racing thoughts, focus...)" value={form.thoughtPatterns} onChange={handleChange} style={styles.input} />
        {errors.thoughtPatterns && <div style={{ color: 'red', fontSize: '13px' }}>Thought Patterns are required.</div>}
        <input name="stressLevel" placeholder="Stress Level (Low/Medium/High)" value={form.stressLevel} onChange={handleChange} style={styles.input} />
        {errors.stressLevel && <div style={{ color: 'red', fontSize: '13px' }}>Stress Level is required.</div>}
        <input name="energyLevel" placeholder="Energy Level (1–10)" value={form.energyLevel} onChange={handleChange} style={styles.input} />
        {errors.energyLevel && <div style={{ color: 'red', fontSize: '13px' }}>Energy Level is required.</div>}
        <input name="activity" placeholder="Activity (working, resting...)" value={form.activity} onChange={handleChange} style={styles.input} />
        {errors.activity && <div style={{ color: 'red', fontSize: '13px' }}>Activity is required.</div>}
        <input name="location" placeholder="Location (home, outdoors...)" value={form.location} onChange={handleChange} style={styles.input} />
        {errors.location && <div style={{ color: 'red', fontSize: '13px' }}>Location is required.</div>}
        <input name="socialInteraction" placeholder="Social (alone, family...)" value={form.socialInteraction} onChange={handleChange} style={styles.input} />
        {errors.socialInteraction && <div style={{ color: 'red', fontSize: '13px' }}>Social is required.</div>}
        <input name="timeOfDay" placeholder="Time of Day (morning, night...)" value={form.timeOfDay} onChange={handleChange} style={styles.input} />
        {errors.timeOfDay && <div style={{ color: 'red', fontSize: '13px' }}>Time of Day is required.</div>}
        <textarea name="notes" placeholder="Notes (optional)" value={form.notes} onChange={handleChange} style={{ ...styles.input, height: '80px' }} />
        <button type="submit" style={styles.button}>Save Mood</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '520px',
    margin: '50px auto',
    padding: '30px',
    borderRadius: '12px',
    backgroundColor: '#e6f4fa',
    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
    textAlign: 'center',
    fontFamily: 'Segoe UI, sans-serif'
  },
  heading: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#0077b6'
  },
  emojiContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '20px'
  },
  emojiButton: {
    fontSize: '28px',
    borderRadius: '50%',
    padding: '10px',
    cursor: 'pointer',
    border: 'none',
    width: '50px',
    height: '50px',
    backgroundColor: '#d9f0ff',
    transition: '0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #a3cde3',
    fontSize: '15px',
    backgroundColor: '#ffffff'
  },
  button: {
    padding: '12px',
    backgroundColor: '#0077b6',
    color: 'white',
    fontSize: '16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '10px'
  }
};

export default MoodForm;
