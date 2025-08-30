// client/src/pages/AppointmentBooking.js
import React, { useEffect, useState } from 'react';
import { bookAppointment } from '../api/appointments';
import axios from 'axios';

const CSS = `
.appt-wrap { max-width: 560px; margin: 28px auto; font-family: Segoe UI, system-ui, sans-serif; }
.card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:18px; box-shadow: 0 4px 18px rgba(0,0,0,0.04); }
.h { font-size:20px; margin:0 0 12px 0; color:#0b3954; }
.sub { margin:0 0 18px 0; color:#475569; font-size:13px; }
.form-row { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
.label { font-size:13px; color:#555; }
.input, .select, .textarea { padding:10px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; }
.inline { display:flex; gap:10px; }
.tip { font-size:12px; color:#64748b; margin-top:2px; }
.btn { width:100%; padding:12px; font-weight:600; border-radius:10px; border:1px solid #075985; background:#0ea5e9; color:#fff; cursor:pointer; }
.btn:disabled { opacity:0.6; cursor:not-allowed; }
`;

const buildLocalISO = (d, t) => {
  // returns YYYY-MM-DDTHH:mm:00 (local, no Z)
  const [hh='00', mm='00'] = String(t).split(':');
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  dt.setHours(Number(hh), Number(mm), 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}:00`;
};

const isTimeAllowed = (t) => {
  // allow 16:00 .. 22:00 (22:00 inclusive, no minutes past 22)
  const [h=0, m=0] = String(t).split(':').map(Number);
  if (h < 16 || h > 22) return false;
  if (h === 22 && m > 0) return false;
  return true;
};

export default function AppointmentBooking() {
  const [supportPersons, setSupportPersons] = useState([]);
  const [supportPersonId, setSupportPersonId] = useState('');
  const [fullName, setFullName] = useState('');
  const [date, setDate] = useState(''); // yyyy-mm-dd
  const [time, setTime] = useState(''); // hh:mm
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const { data } = await axios.get(`${base}/api/support-persons`);
        setSupportPersons(Array.isArray(data) ? data : []);
        if (data?.[0]?._id) setSupportPersonId(data[0]._id);
      } catch (e) {
        console.error('Failed to load support persons', e?.response?.data || e.message);
      }
    })();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!supportPersonId || !date || !time) {
      alert('Please select support person, date and time.');
      return;
    }
    if (!isTimeAllowed(time)) {
      alert('Appointments are allowed only between 4:00 PM and 10:00 PM.');
      return;
    }
    const when = buildLocalISO(date, time);
    if (!when) {
      alert('Invalid date/time.');
      return;
    }
    try {
      setLoading(true);
      await bookAppointment({ supportPersonId, date: when, note });
      alert('Appointment request sent!');
      setNote('');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      alert('Failed to book appointment: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appt-wrap">
      <style>{CSS}</style>
      <div className="card">
        <h3 className="h">Book an Appointment</h3>
        <p className="sub">Choose a support person and a convenient time. You’ll get a confirmation if they accept.</p>

        <form onSubmit={submit}>
          <div className="form-row">
            <label className="label">Your display name (optional)</label>
            <input
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
            <div className="tip">Your account identity is taken from your login; this is just what appears in the calendar invite.</div>
          </div>

          <div className="form-row">
            <label className="label">Support person</label>
            <select
              className="select"
              value={supportPersonId}
              onChange={(e) => setSupportPersonId(e.target.value)}
            >
              {supportPersons.map(sp => (
                <option key={sp._id} value={sp._id}>
                  {sp.name} ({sp.title || sp.specialization || 'Support'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row inline">
            <div style={{ flex: 1 }}>
              <label className="label">Date</label>
              <input
                className="input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div style={{ width: 180 }}>
              <label className="label">Time</label>
              <input
                className="input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                min="16:00"
                max="22:00"
                step="900"
              />
              <div className="tip">Available window: 4:00 PM–10:00 PM (local time)</div>
            </div>
          </div>

          <div className="form-row">
            <label className="label">Notes (optional)</label>
            <textarea
              className="textarea"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything your provider should know?"
            />
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Booking…' : 'Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}
