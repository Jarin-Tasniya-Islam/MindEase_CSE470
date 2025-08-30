// client/src/components/Appointments/AppointmentBooking.js
import React, { useEffect, useState } from 'react';
import { bookAppointment } from '../../api/appointments';
import axios from 'axios';

const CSS = `
.appt-wrap { max-width: 560px; margin: 28px auto; font-family: Segoe UI, system-ui, sans-serif; }
.card { background:#fff; border:1px solid #0055ff; border-radius:12px; padding:18px; box-shadow:0 4px 18px rgba(0,0,0,0.04); }
.h { font-size:20px; margin:0 0 12px 0; color:#0b3954; }
.sub { margin:0 0 18px 0; color:#475569; font-size:13px; }

.form-row { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
.label { font-size:13px; color:#1b3357; font-weight:700; margin-bottom:6px; } /* bold + spacing */
.input, .select, .textarea { padding:10px 12px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; }

.inline { display:flex; gap:10px; }
.inline .col { display:flex; flex-direction:column; flex:1; }

.btn { width:100%; padding:12px; font-weight:600; border-radius:10px; border:1px solid #075985; background:#0ea5e9; color:#fff; cursor:pointer; }
.btn:disabled { opacity:0.6; cursor:not-allowed; }
.tip { font-size:12px; color:#64748b; margin-top:4px; }
`;

const toLocalNaive = (d, t) => {
  // Return "YYYY-MM-DDTHH:mm:00" (no timezone)
  const [hh='00', mm='00'] = String(t).split(':');
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  dt.setHours(Number(hh), Number(mm), 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}:00`;
};

const isTimeAllowed = (t) => {
  // t = "HH:mm"
  const [h=0, m=0] = String(t).split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  // Allow 16:00 .. 22:00 inclusive
  if (h < 16 || h > 22) return false;
  if (h === 22 && m > 0) return false; // exactly 22:00 only at the upper bound
  return true;
};

export default function AppointmentBooking() {
  const [supportPersons, setSupportPersons] = useState([]);
  const [supportPersonId, setSupportPersonId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const { data } = await axios.get(`${base}/api/support-persons`);
        const list = Array.isArray(data) ? data : [];
        setSupportPersons(list);
        if (list[0]?._id) setSupportPersonId(list[0]._id);
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
    const when = toLocalNaive(date, time);
    if (!when) return alert('Invalid date/time.');

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
        <p className="sub">Choose a support person and a convenient time.</p>

        <form onSubmit={submit} noValidate>
          {/* Support person */}
          <div className="form-row">
            <label className="label" htmlFor="sp">Support person</label>
            <select
              id="sp"
              className="select"
              value={supportPersonId}
              onChange={(e) => setSupportPersonId(e.target.value)}
              required
            >
              {supportPersons.map((sp) => (
                <option key={sp._id} value={sp._id}>
                  {sp.name} ({sp.title || sp.specialization || 'Support'})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="form-row inline">
            <div className="col">
              <label className="label" htmlFor="date">Date</label>
              <input
                id="date"
                className="input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="col" style={{ maxWidth: 200 }}>
              <label className="label" htmlFor="time">Time</label>
              <input
                id="time"
                className="input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                min="16:00"
                max="22:00"
                step="900"
                required
              />
              <div className="tip">Available window: 4:00 PM–10:00 PM (local time)</div>
            </div>
          </div>

          {/* Notes */}
          <div className="form-row">
            <label className="label" htmlFor="note">Notes (optional)</label>
            <textarea
              id="note"
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
