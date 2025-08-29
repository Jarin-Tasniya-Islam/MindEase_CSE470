import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminModeration() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('journals'); // 'journals' | 'moods'
    const [journals, setJournals] = useState([]);
    const [moods, setMoods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState(null);
    const [msg, setMsg] = useState('');

    const authHeader = useMemo(() => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
    }), []);

    // client-side guard (backend is authoritative)
    useEffect(() => {
        if (localStorage.getItem('role') !== 'admin') navigate('/mood', { replace: true });
    }, [navigate]);


    const loadJournals = async () => {
        setLoading(true);
        setMsg('');
        try {
            const res = await axios.get('/api/admin/journals', authHeader);
            setJournals(res.data || []);
        } catch (e) {
            console.error('Load journals error:', e?.response?.status, e?.response?.data);
            setMsg(`Failed to load journals${e?.response?.status ? ` (HTTP ${e.response.status})` : ''}.`);
        } finally {
            setLoading(false);
        }
    };

    const loadMoods = async () => {
        setLoading(true);
        setMsg('');
        try {
            const res = await axios.get('/api/admin/moods', authHeader);
            setMoods(res.data || []);
        } catch (e) {
            console.error('Load moods error:', e?.response?.status, e?.response?.data);
            setMsg(`Failed to load moods${e?.response?.status ? ` (HTTP ${e.response.status})` : ''}.`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tab === 'journals') loadJournals();
        else loadMoods();
        // eslint-disable-next-line
    }, [tab]);

    const deleteJournal = async (id) => {
        if (!window.confirm('Delete this journal entry?')) return;
        try {
            setBusyId(id);
            await axios.delete(`/api/admin/journals/${id}`, authHeader);
            setJournals(prev => prev.filter(j => j._id !== id));
        } catch {
            alert('Failed to delete journal');
        } finally {
            setBusyId(null);
        }
    };

    const deleteMood = async (id) => {
        if (!window.confirm('Delete this mood entry?')) return;
        try {
            setBusyId(id);
            await axios.delete(`/api/admin/moods/${id}`, authHeader);
            setMoods(prev => prev.filter(m => m._id !== id));
        } catch {
            alert('Failed to delete mood');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div style={styles.wrap}>
            <h2 style={styles.title}>Admin • Content Moderation</h2>

            <div style={styles.tabs}>
                <button
                    onClick={() => setTab('journals')}
                    style={{ ...styles.tabBtn, ...(tab === 'journals' ? styles.tabActive : {}) }}
                >
                    Journals
                </button>
                <button
                    onClick={() => setTab('moods')}
                    style={{ ...styles.tabBtn, ...(tab === 'moods' ? styles.tabActive : {}) }}
                >
                    Moods
                </button>
            </div>

            <div style={styles.card}>
                <div style={styles.headerRow}>
                    <div style={{ fontWeight: 700 }}>{tab === 'journals' ? 'All Journals' : 'All Moods'}</div>
                    <button
                        onClick={tab === 'journals' ? loadJournals : loadMoods}
                        style={styles.refresh}
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div style={styles.empty}>Loading…</div>
                ) : tab === 'journals' ? (
                    journals.length === 0 ? (
                        <div style={styles.empty}>No journals found.</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Created</th>
                                        <th>Content</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {journals.map(j => (
                                        <tr key={j._id}>
                                            <td>{j.user?.name || '—'}</td>
                                            <td>{j.user?.email || '—'}</td>
                                            <td>{new Date(j.createdAt).toLocaleString()}</td>
                                            <td style={{ maxWidth: 480, whiteSpace: 'pre-wrap' }}>{j.content || j.text || ''}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    disabled={busyId === j._id}
                                                    onClick={() => deleteJournal(j._id)}
                                                    style={{ ...styles.action, ...styles.danger }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    moods.length === 0 ? (
                        <div style={styles.empty}>No mood entries found.</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Created</th>
                                        <th>Mood</th>
                                        <th>Note / Tags</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {moods.map(m => (
                                        <tr key={m._id}>
                                            <td>{m.user?.name || '—'}</td>
                                            <td>{m.user?.email || '—'}</td>
                                            <td>{new Date(m.createdAt).toLocaleString()}</td>
                                            <td>{m.mood || m.rating || '—'}</td>
                                            <td style={{ maxWidth: 380 }}>
                                                {(m.note || m.notes) && <div>{m.note || m.notes}</div>}
                                                {Array.isArray(m.tags) && m.tags.length > 0 && (
                                                    <div style={{ marginTop: 4, fontSize: 12, color: '#555' }}>
                                                        Tags: {m.tags.join(', ')}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    disabled={busyId === m._id}
                                                    onClick={() => deleteMood(m._id)}
                                                    style={{ ...styles.action, ...styles.danger }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

                {msg && <div style={styles.msg}>{msg}</div>}
            </div>
        </div>
    );
}

const styles = {
    wrap: { maxWidth: 1100, margin: '28px auto', padding: '0 20px', fontFamily: 'Segoe UI, system-ui, sans-serif' },
    title: { margin: '6px 0 16px', color: '#0b3954' },
    tabs: { display: 'flex', gap: 10, marginBottom: 12 },
    tabBtn: {
        border: '1px solid #b5c8da', background: '#fff', padding: '8px 14px',
        borderRadius: 10, cursor: 'pointer', fontWeight: 600
    },
    tabActive: { background: '#e7f2ff', borderColor: '#7fb1e8' },
    card: { background: '#f8fbff', border: '1px solid #deebf7', borderRadius: 12, boxShadow: '0 4px 18px rgba(0,0,0,.06)', padding: 16 },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    refresh: { border: '1px solid #0b3954', background: '#fff', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', border: '1px solid #e3edf7', borderRadius: 10, overflow: 'hidden' },
    action: { border: '1px solid #0b3954', background: '#fff', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, marginLeft: 8 },
    danger: { borderColor: '#c62828', color: '#c62828' },
    empty: { padding: 18, textAlign: 'center', color: '#567' },
    msg: { marginTop: 10, color: '#b00020' }
};
