import React, { useEffect, useState } from 'react';
import axios from 'axios';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 60000); // every 60s
    return () => clearInterval(id);
  }, []);


  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const markAllSeen = async () => {
    try {
      await axios.post('/api/notifications/mark-seen', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notifications as seen', err);
    }
  };

  const unseenCount = notifications.filter(n => !n.seen).length;

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => { setOpen(!open); markAllSeen(); }}>
        🔔 {unseenCount > 0 && <span>({unseenCount})</span>}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, background: 'white',
          border: '1px solid #ccc', padding: 10, width: 250, zIndex: 1000
        }}>
          <h4>Notifications</h4>
          {notifications.length === 0 && <p>No reminders yet.</p>}
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {notifications.map((n, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                <small>{n.message}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
