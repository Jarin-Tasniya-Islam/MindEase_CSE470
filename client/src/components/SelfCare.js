import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const tasks = [
  { key: 'hydration', label: '💧 Drink Water' },
  { key: 'exercise', label: '🏃 5-Minute Exercise' },
  { key: 'meditation', label: '🧘 3-Minute Meditation' },
  { key: 'breathing', label: '🌬 Breathing Reset' }
];

const affirmations = [
  "Your breath is powerful.",
  "You honored your needs.",
  "That was a beautiful pause.",
  "You're doing your best today.",
  "This moment is yours to rest in."
];

const moods = ['😊 Peaceful', '💪 Energized', '😌 Grounded', '😣 Tense', '🥱 Tired'];

const SelfCare = () => {
  const [step, setStep] = useState('');
  const [timer, setTimer] = useState(null);
  const [affirmation, setAffirmation] = useState('');
  const [mood, setMood] = useState('');
  const [breathPhase, setBreathPhase] = useState('in');
  const [breathCount, setBreathCount] = useState(0);

  const intervalRef = useRef(null);
  const phaseRef = useRef('in');
  const countRef = useRef(0);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const handleTaskStart = (task) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setStep(task);
    setAffirmation('');

    if (task === 'hydration') {
      markTask(task);
    } else if (task === 'breathing') {
      setBreathPhase('in');
      setBreathCount(0);
      setTimer(4);
      phaseRef.current = 'in';
      countRef.current = 0;
      let timeLeft = 4;

      intervalRef.current = setInterval(() => {
        timeLeft -= 1;
        setTimer(timeLeft);
        if (timeLeft <= 0) {
          if (phaseRef.current === 'in') {
            phaseRef.current = 'hold';
            setBreathPhase('hold');
            timeLeft = 3;
            setTimer(3);
          } else if (phaseRef.current === 'hold') {
            phaseRef.current = 'out';
            setBreathPhase('out');
            timeLeft = 4;
            setTimer(4);
          } else if (phaseRef.current === 'out') {
            countRef.current += 1;
            setBreathCount(countRef.current);
            if (countRef.current >= 3) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
              setTimer(null);
              setBreathPhase('in');
              setAffirmation(randomAffirmation());
              markTask('breathing');
              return;
            }
            phaseRef.current = 'in';
            setBreathPhase('in');
            timeLeft = 4;
            setTimer(4);
          }
        }
      }, 1000);
    } else {
      const duration = task === 'exercise' ? 300 : task === 'meditation' ? 180 : 18;
      let timeLeft = duration;
      setTimer(timeLeft);

      intervalRef.current = setInterval(() => {
        timeLeft -= 1;
        setTimer(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setTimer(null);
          setAffirmation(randomAffirmation());
          markTask(task);
        }
      }, 1000);
    }
  };

  const randomAffirmation = () => {
    return affirmations[Math.floor(Math.random() * affirmations.length)];
  };

  const markTask = async (taskType) => {
    try {
      await axios.post('/api/selfcare/complete', { taskType }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (err) {
      console.error('Failed to mark self-care task:', err);
    }
  };

  const handleCompleteActivity = async (activityId) => {
    try {
      const response = await fetch(`/api/selfcare/${activityId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (response.ok) {
        console.log('Activity saved successfully');
        // Refresh the list or update the UI
      } else {
        console.error('Failed to save activity:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🌿 Self-Care Flow</h2>

      <div style={styles.taskList}>
        {tasks.map(t => (
          <button
            key={t.key}
            onClick={() => handleTaskStart(t.key)}
            style={{ ...styles.taskButton, backgroundColor: '#0077b6' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {step === 'breathing' && timer !== null && (
        <div style={styles.breathingBox}>
          <div style={styles.breathText}>
            {breathPhase === 'in' && '🡹 Breathe In'}
            {breathPhase === 'hold' && '⏸ Hold'}
            {breathPhase === 'out' && '🡻 Breathe Out'}
          </div>
          <div style={styles.breathTimer}>{timer}s</div>
          <div style={styles.breathCycle}>Cycle {breathCount + 1} of 3</div>
        </div>
      )}

      {step && timer !== null && step !== 'breathing' && (
        <div style={styles.timer}>
          ⏳ {step.toUpperCase()} — {timer}s left
        </div>
      )}

      {affirmation && (
        <div style={styles.affirmation}>
          💬 {affirmation}
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <h4><span role="img" aria-label="cherry-blossom">🌸</span> How do you feel now?</h4>
        <div style={styles.moodRow}>
          {moods.map(m => (
            <button
              key={m}
              onClick={() => setMood(m)}
              style={{
                ...styles.moodButton,
                backgroundColor: mood === m ? '#2a9d8f' : '#e0fbfc'
              }}
            >
              {m}
            </button>
          ))}
        </div>
        {mood && <p style={styles.moodLabel}>You feel: {mood}</p>}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '30px',
    borderRadius: '12px',
    backgroundColor: '#e6f4fa',
    fontFamily: 'Segoe UI, sans-serif',
    boxShadow: '0 6px 20px rgba(0,0,0,0.08)'
  },
  heading: {
    textAlign: 'center',
    fontSize: '24px',
    marginBottom: '20px',
    color: '#0077b6'
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  taskButton: {
    padding: '14px',
    borderRadius: '10px',
    color: 'white',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px'
  },
  timer: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '18px',
    color: '#023047'
  },
  breathingBox: {
    marginTop: '20px',
    backgroundColor: '#f1faee',
    borderRadius: '10px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  breathText: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#0077b6',
    marginBottom: '10px'
  },
  breathTimer: {
    fontSize: '32px',
    color: '#023047',
    marginBottom: '8px'
  },
  breathCycle: {
    fontSize: '15px',
    color: '#555'
  },
  affirmation: {
    marginTop: '20px',
    backgroundColor: '#dbeafe',
    padding: '15px',
    borderRadius: '8px',
    fontSize: '16px',
    textAlign: 'center'
  },
  moodRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'center',
    marginTop: '10px'
  },
  moodButton: {
    padding: '10px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer',
    border: 'none'
  },
  moodLabel: {
    marginTop: '10px',
    textAlign: 'center',
    color: '#333'
  }
};

export default SelfCare;
