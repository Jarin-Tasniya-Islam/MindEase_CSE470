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
    moodDuration: '',
    thoughtPatterns: '',
    stressLevel: '',
    energyLevel: '',
    activity: '',
    location: '',
    socialInteraction: '',
    timeOfDay: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setForm(prev => ({ ...prev, userId: decoded.id }));
      } catch (err) {
        console.error('Invalid token', err);
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

  // Validate all required fields (notes is optional)
  const validate = () => {
    const newErrors = {};
    if (!form.moodLevel) newErrors.moodLevel = 'Mood is required';
    if (!form.moodDescription.trim()) newErrors.moodDescription = 'Description is required';
    if (!form.moodDuration.trim()) newErrors.moodDuration = 'Duration is required';
    if (!form.thoughtPatterns.trim()) newErrors.thoughtPatterns = 'Thought Patterns are required';
    if (!form.stressLevel.trim()) newErrors.stressLevel = 'Stress Level is required';
    if (String(form.energyLevel).trim() === '') newErrors.energyLevel = 'Energy Level is required';
    if (!form.activity.trim()) newErrors.activity = 'Activity is required';
    if (!form.location.trim()) newErrors.location = 'Location is required';
    if (!form.socialInteraction.trim()) newErrors.socialInteraction = 'Social is required';
    if (!form.timeOfDay.trim()) newErrors.timeOfDay = 'Time of Day is required';
    return newErrors;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      alert('⚠️ Please fill all required fields.');
      return;
    }

    try {
      const payload = {
        ...form,
        energyLevel: Number(form.energyLevel), // ensure number
        dateTime: new Date()
      };
      const token = localStorage.getItem('token');

      // IMPORTANT: plural endpoint
      await axios.post('/api/moods', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

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
      const msg = err?.response?.data?.message || err.message;
      alert('❌ Error saving mood: ' + msg);
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
            type="button"
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
      {errors.moodLevel && <div style={styles.error}>{errors.moodLevel}</div>}

      {/* Mood Form */}
      <form onSubmit={handleSubmit} style={styles.form} noValidate>
        <input
          name="moodDescription"
          placeholder="Mood Description (e.g., tired, anxious)"
          value={form.moodDescription}
          onChange={handleChange}
          style={styles.input}
        />
        {errors.moodDescription && <div style={styles.error}>{errors.moodDescription}</div>}

        <input
          name="moodDuration"
          placeholder="Mood Duration (brief, lingering)"
          value={form.moodDuration}
          onChange={handleChange}
          style={styles.input}
        />
        {errors.moodDuration && <div style={styles.error}>{errors.moodDuration}</div>}

        <input
          name="thoughtPatterns"
          placeholder="Thought Patterns (racing thoughts, focus...)"
          value={form.thoughtPatterns}
          onChange={handleChange}
          style={styles.input}
        />
        {errors.thoughtPatterns && <div style={styles.error}>{errors.thoughtPatterns}</div>}

        <input
          name="stressLevel"
          placeholder="Stress Level (Low/Medium/High)"
          value={form.stressLevel}
          onChange={handleChange}
          style={styles.input}
        />
        {errors.stressLevel && <div style={styles.error}>{errors.stressLevel}</div>}

        <input
          name="energyLevel"
          placeholder="Energy Level (1–10)"
          value={form.energyLevel}
          onChange={handleChange}
          style={styles.input}
        />
        {errors.energyLevel && <div style={styles.error}>{errors.energyLevel}</div>}

        <input
          name="activity"
          placeholder="Activity (working, resting...)"
          value={form.activity}
          onChange={handleChange}
          style={styles.input}
        />
        {errors.activity && <div style={styles.error}>{errors.activity}</div>}

        <input
          name="location"
          placeholder="Location (home, outdoors...)"
          value={form.location}
          onChange={handleChange}
          style={styles.input}
        />
        {errors.location && <div style={styles.error}>{errors.location}</div>}

        <input
          name="socialInteraction"
          placeholder="Social (alone, family...)"
          value={form.socialInteraction}
          onChange={handleChange}
          style={styles.input}
        />
        {errors.socialInteraction && <div style={styles.error}>{errors.socialInteraction}</div>}

        <input
          name="timeOfDay"
          placeholder="Time of Day (morning, night...)"
          value={form.timeOfDay}
          onChange={handleChange}
          style={styles.input}
        />
        {errors.timeOfDay && <div style={styles.error}>{errors.timeOfDay}</div>}

        <textarea
          name="notes"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={handleChange}
          style={{ ...styles.input, height: '80px' }}
        />

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
  },
  error: {
    color: 'red',
    fontSize: '13px',
    textAlign: 'left'
  }
};

export default MoodForm;
