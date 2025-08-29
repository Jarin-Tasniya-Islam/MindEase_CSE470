import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AdminAppointments() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const authHeader = useMemo(() => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
    }), []);

    const load = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${base}/api/appointments/admin/all`, authHeader);
            setRows(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to load admin appointments', e?.response?.data || e.message);
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); /* on mount */ }, []); // eslint-disable-line

    const setStatus = async (id, status) => {
        try {
            await axios.put(`${base}/api/appointments/admin/${id}/status`, { status }, authHeader);
            setRows(prev => prev.map(r => r._id === id ? { ...r, status } : r));
        } catch (e) {
            alert('Failed to update status');
        }
    };

    return (
        <div style={{ maxWidth: 1100, margin: '24px auto', padding: '0 16px', fontFamily: 'Segoe UI, system-ui, sans-serif' }}>
            <h2 style={{ color: '#0b3954', marginBottom: 12 }}>Admin • Appointments</h2>

            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }}>
                <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
                    <strong>All Appointments</strong>
                    <button onClick={load} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>Refresh</button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={th}>User</th>
                            <th style={th}>Email</th>
                            <th style={th}>Provider</th>
                            <th style={th}>Type</th>
                            <th style={th}>Date</th>
                            <th style={th}>Status</th>
                            <th style={th}>Notes</th>
                            <th style={th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} style={td}>Loading…</td></tr>
                        ) : rows.length === 0 ? (
                            <tr><td colSpan={8} style={td}>No appointments found.</td></tr>
                        ) : rows.map(r => (
                            <tr key={r._id}>
                                <td style={td}>{r.user?.name || '—'}</td>
                                <td style={td}>{r.user?.email || '—'}</td>
                                <td style={td}>{r.providerName}</td>
                                <td style={td}>{r.providerType}</td>
                                <td style={td}>{new Date(r.date).toLocaleString()}</td>
                                <td style={td}>{r.status}</td>
                                <td style={td}>{r.note || '—'}</td>
                                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                                    <button onClick={() => setStatus(r._id, 'confirmed')} style={btn}>Confirm</button>
                                    <button onClick={() => setStatus(r._id, 'cancelled')} style={{ ...btn, borderColor: '#ef4444', color: '#ef4444' }}>Cancel</button>
                                    <button onClick={() => setStatus(r._id, 'declined')} style={{ ...btn, borderColor: '#f59e0b', color: '#b45309' }}>Decline</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const th = { textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #e5e7eb', fontSize: 13, color: '#334155' };
const td = { padding: '10px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 14 };
const btn = { marginRight: 8, padding: '6px 10px', borderRadius: 8, background: '#fff', border: '1px solid #16a34a', color: '#166534', cursor: 'pointer' };
