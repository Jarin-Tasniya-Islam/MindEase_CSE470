import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

export default function Appointments() {
  const [people, setPeople] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(true);

  const [supportPersonId, setSupportPersonId] = useState('');
  const [date, setDate] = useState('');   // yyyy-mm-dd
  const [time, setTime] = useState('');   // HH:mm
  const [note, setNote] = useState('');

  const [myAppointments, setMyAppointments] = useState([]);
  const [loadingMy, setLoadingMy] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const authHeader = useMemo(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
  }), []);

  // Load support persons + my appointments
  useEffect(() => {
    const loadPeople = async () => {
      try {
        const res = await axios.get('/api/support-persons');
        setPeople(res.data || []);
      } catch (e) {
        console.error('Failed to load support persons', e);
      } finally {
        setLoadingPeople(false);
      }
    };

    const loadMine = async () => {
      try {
        const res = await axios.get('/api/appointments/my', authHeader);
        setMyAppointments(res.data || []);
      } catch (e) {
        console.error('Failed to load my appointments', e);
      } finally {
        setLoadingMy(false);
      }
    };

    loadPeople();
    loadMine();
  }, [authHeader]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (!supportPersonId || !date || !time) {
      setMsg('Please choose a support person, date and time.');
      return;
    }
    const iso = new Date(`${date}T${time}:00`).toISOString();

    try {
      setSubmitting(true);
      await axios.post('/api/appointments', {
        supportPersonId,
        date: iso,
        note
      }, authHeader);

      setMsg('Appointment request submitted.');
      // refresh list
      const mine = await axios.get('/api/appointments/my', authHeader);
      setMyAppointments(mine.data || []);

      // reset form
      setSupportPersonId('');
      setDate('');
      setTime('');
      setNote('');
    } catch (e) {
      console.error(e);
      setMsg('Failed to submit appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <h2 style={styles.h2}>Appointments</h2>

      <div style={styles.grid}>
        {/* Book */}
        <div style={styles.card}>
          <h3 style={styles.h3}>Book a new appointment</h3>
          {loadingPeople ? (
            <p>Loading support persons…</p>
          ) : people.length === 0 ? (
            <p>No support persons found. Ask backend to seed them.</p>
          ) : (
            <form onSubmit={submit} style={styles.form}>
              <label style={styles.label}>
                Support person
                <select
                  value={supportPersonId}
                  onChange={(e) => setSupportPersonId(e.target.value)}
                  style={styles.input}
                >
                  <option value="">Select…</option>
                  {people.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} — {p.title}{p.specialization ? ` (${p.specialization})` : ''}
                    </option>
                  ))}
                </select>
              </label>

              <div style={styles.row}>
                <label style={{ ...styles.label, flex: 1 }}>
                  Date
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} style={styles.input} />
                </label>
                <label style={{ ...styles.label, flex: 1 }}>
                  Time
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} style={styles.input} />
                </label>
              </div>

              <label style={styles.label}>
                Note (optional)
                <textarea
                  rows={3}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  style={{ ...styles.input, resize: 'vertical' }}
                  placeholder="What would you like to discuss?"
                />
              </label>

              <button type="submit" disabled={submitting} style={styles.button}>
                {submitting ? 'Submitting…' : 'Book appointment'}
              </button>

              {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
            </form>
          )}
        </div>

        {/* My appointments */}
        <div style={styles.card}>
          <h3 style={styles.h3}>My appointments</h3>
          {loadingMy ? (
            <p>Loading…</p>
          ) : myAppointments.length === 0 ? (
            <p>No appointments yet.</p>
          ) : (
            <ul style={styles.list}>
              {myAppointments.map(appt => (
                <li key={appt._id} style={styles.item}>
                  <div style={{ fontWeight: 600 }}>
                    {appt.supportPerson?.name || 'Support Person'}
                    {appt.supportPerson?.title ? ` — ${appt.supportPerson.title}` : ''}
                  </div>
                  <div>{new Date(appt.date).toLocaleString()}</div>
                  <div style={{ fontSize: 13, color: '#666' }}>Status: {appt.status}</div>
                  {appt.note && <div style={{ fontSize: 13, marginTop: 4 }}>Note: {appt.note}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 900, margin: '30px auto', padding: '0 20px', fontFamily: 'Segoe UI, system-ui, sans-serif' },
  h2: { marginBottom: 16, color: '#094067' },
  grid: { display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' },
  card: { background: '#f7fbff', border: '1px solid #dde7f3', borderRadius: 10, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.05)' },
  h3: { marginTop: 0, marginBottom: 10, color: '#0b3954' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  label: { fontSize: 13, color: '#334', display: 'flex', flexDirection: 'column', gap: 6 },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #c8d7e6', background: '#fff', fontSize: 14 },
  row: { display: 'flex', gap: 12 },
  button: { marginTop: 6, padding: '10px 14px', borderRadius: 8, border: '1px solid #0b3954', background: '#fff', color: '#0b3954', cursor: 'pointer', fontWeight: 600 },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 },
  item: { background: '#fff', border: '1px solid #e6eef7', borderRadius: 8, padding: 12 }
};
