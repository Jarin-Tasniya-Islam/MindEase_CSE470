import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [msg, setMsg] = useState('');

    const authHeader = useMemo(() => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
    }), []);

    // client-side guard (backend is still authoritative)
    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'admin') {
            navigate('/mood', { replace: true });
        }
    }, [navigate]);

    const load = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/admin/users', authHeader);
            setUsers(res.data || []);
        } catch (e) {
            console.error(e);
            setMsg('Failed to load users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); /* first load */ }, []); // eslint-disable-line

    const setRole = async (id, role) => {
        try {
            setBusyId(id);
            await axios.patch(`/api/admin/users/${id}/role`, { role }, authHeader);
            setUsers(prev => prev.map(u => (u._id === id ? { ...u, role } : u)));
        } catch (e) {
            console.error(e);
            alert('Failed to update role');
        } finally {
            setBusyId(null);
        }
    };

    const removeUser = async (id) => {
        if (!window.confirm('Remove this user?')) return;
        try {
            setBusyId(id);
            await axios.delete(`/api/admin/users/${id}`, authHeader);
            setUsers(prev => prev.filter(u => u._id !== id));
        } catch (e) {
            console.error(e);
            alert('Failed to remove user');
        } finally {
            setBusyId(null);
        }
    };
    return (
        <div style={styles.wrap}>
            <h2 style={styles.title}>Admin Dashboard</h2>

            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <h3 style={{ margin: 0 }}>Users</h3>
                    <button onClick={load} style={styles.refresh}>Refresh</button>
                </div>

                {loading ? (
                    <div style={styles.empty}>Loading…</div>
                ) : users.length === 0 ? (
                    <div style={styles.empty}>No users yet.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span style={{
                                                ...styles.badge,
                                                background: u.role === 'admin' ? '#e3f2fd' : '#e8f5e9',
                                                borderColor: u.role === 'admin' ? '#90caf9' : '#a5d6a7'
                                            }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            {u.role === 'admin' ? (
                                                <button
                                                    disabled={busyId === u._id}
                                                    onClick={() => setRole(u._id, 'user')}
                                                    style={styles.action}
                                                    title="Demote to user"
                                                >
                                                    Demote
                                                </button>
                                            ) : (
                                                <button
                                                    disabled={busyId === u._id}
                                                    onClick={() => setRole(u._id, 'admin')}
                                                    style={styles.action}
                                                    title="Promote to admin"
                                                >
                                                    Promote
                                                </button>
                                            )}
                                            <button
                                                disabled={busyId === u._id}
                                                onClick={() => removeUser(u._id)}
                                                style={{ ...styles.action, ...styles.danger }}
                                                title="Remove user"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {msg && <div style={styles.msg}>{msg}</div>}
            </div>
        </div>
    );
}

const styles = {
    wrap: { maxWidth: 1000, margin: '28px auto', padding: '0 20px', fontFamily: 'Segoe UI, system-ui, sans-serif' },
    title: { margin: '6px 0 16px', color: '#0b3954' },
    card: {
        background: '#f8fbff',
        border: '1px solid #deebf7',
        borderRadius: 12,
        boxShadow: '0 4px 18px rgba(0,0,0,.06)',
        padding: 16
    },
    cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    refresh: {
        border: '1px solid #0b3954', background: '#fff', padding: '6px 10px',
        borderRadius: 8, cursor: 'pointer', fontWeight: 600
    },
    table: {
        width: '100%', borderCollapse: 'separate', borderSpacing: 0,
        background: '#fff', border: '1px solid #e3edf7', borderRadius: 10, overflow: 'hidden'
    },
    badge: {
        display: 'inline-block', padding: '4px 10px', borderRadius: 20,
        fontSize: 12, border: '1px solid', fontWeight: 600
    },
    action: {
        border: '1px solid #0b3954', background: '#fff', padding: '6px 10px',
        borderRadius: 8, cursor: 'pointer', fontWeight: 600, marginLeft: 8
    },
    danger: { borderColor: '#c62828', color: '#c62828' },
    empty: { padding: 18, textAlign: 'center', color: '#567' },
    msg: { marginTop: 10, color: '#b00020' }
};
