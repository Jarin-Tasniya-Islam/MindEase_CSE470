import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const unseenCount = useMemo(() => notifications.filter(n => !n.seen).length, [notifications]);

  async function fetchNotifications() {
    try {
      const res = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  }

  async function markAllSeen() {
    try {
      await axios.post('/api/notifications/mark-seen', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(list => list.map(n => ({ ...n, seen: true })));
    } catch (err) {
      console.error(err);
    }
  }

  async function dismissOne(id) {
    try {
      await axios.post(`/api/notifications/${id}/dismiss`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(list => list.filter(n => n._id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 60000);
    return () => clearInterval(id);
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) await markAllSeen();
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={toggle} style={{ fontSize: 20 }}>🔔</button>
      {unseenCount > 0 && (
        <span style={{
          position: 'absolute', top: -6, right: -6,
          background: 'red', color: '#fff', borderRadius: '50%',
          padding: '2px 6px', fontSize: 12
        }}>
          {unseenCount}
        </span>
      )}

      {open && (
        <div style={{
          position: 'absolute', top: '120%', right: 0, background: '#fff',
          border: '1px solid #ccc', borderRadius: 8, width: 300, zIndex: 1000
        }}>
          <h4 style={{ margin: 0, padding: 10, borderBottom: '1px solid #eee' }}>Notifications</h4>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 300, overflowY: 'auto' }}>
            {notifications.length === 0 && <li style={{ padding: 10, color: '#555' }}>No reminders.</li>}
            {notifications.map(n => (
              <li key={n._id} style={{ padding: 10, borderBottom: '1px solid #f1f1f1' }}>
                <div>{n.message}</div>
                <small style={{ color: '#777' }}>{n.isReminder ? 'Reminder' : 'Update'} • {new Date(n.createdAt).toLocaleString()}</small>
                <div><button onClick={() => dismissOne(n._id)} style={{ fontSize: 12, marginTop: 4 }}>Dismiss</button></div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
