// client/src/components/Appointments/AppointmentBooking.js
import React, { useEffect, useState } from 'react';
import { bookAppointment } from '../../api/appointments';
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

export default function AppointmentBooking() {
    const [supportPersons, setSupportPersons] = useState([]);
    const [supportPersonId, setSupportPersonId] = useState('');
    const [name, setName] = useState('');   // ✅ NEW
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
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

    const buildISO = (d, t) => {
        const dt = new Date(`${d}T${t}:00`);
        return Number.isNaN(dt.getTime()) ? null : dt.toISOString();
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!supportPersonId || !date || !time) {
            alert('Please select support person, date and time.');
            return;
        }
        const when = buildISO(date, time);
        if (!when) return alert('Invalid date/time.');

        try {
            setLoading(true);
            // ✅ Include the typed-in name by prepending it to the note
            const finalNote = name ? `Name: ${name}\n${note}` : note;
            await bookAppointment({ supportPersonId, date: when, note: finalNote });
            alert('Appointment request sent!');
            setName('');
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

                <form onSubmit={submit}>
                    {/* ✅ New Name field */}
                    <div className="form-row">
                        <label className="label">Your Name (optional)</label>
                        <input
                            className="input"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your display name"
                        />
                    </div>

                    <div className="form-row">
                        <label className="label">Support person</label>
                        <select
                            className="select"
                            value={supportPersonId}
                            onChange={(e) => setSupportPersonId(e.target.value)}
                        >
                            {supportPersons.map((sp) => (
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
                        <div style={{ width: 160 }}>
                            <label className="label">Time</label>
                            <input
                                className="input"
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
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
