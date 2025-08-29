import React, { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { myAppointments, cancelAppointment } from '../api/appointments';

const STATUS_COLORS = {
    pending: '#fbbf24',
    confirmed: '#22c55e',
    declined: '#ef4444',
    cancelled: '#9ca3af'
};

const CSS = `
.cal-wrap { padding:20px; font-family: Segoe UI, system-ui, sans-serif; }
.legend { display:flex; gap:10px; align-items:center; margin: 0 0 10px; }
.legend span { display:inline-flex; align-items:center; gap:6px; font-size:14px; }
.legend i { width:12px; height:12px; display:inline-block; border-radius:3px; }
.details { border:1px solid #e5e7eb; padding:12px; border-radius:8px; margin-top:12px; background:#fff; }
.details h4 { margin:0 0 6px 0; }
.details .btns { display:flex; gap:8px; margin-top:8px; }
.details button { padding:6px 10px; border-radius:6px; border:1px solid #ccc; background:#fff; cursor:pointer; }
`;

export default function AppointmentCalendar() {
    const [items, setItems] = useState([]);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await myAppointments();
                setItems(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error('Failed to load appointments', e?.response?.data || e.message);
            }
        })();
    }, []);

    const events = useMemo(
        () =>
            items.map(a => ({
                id: a._id,
                title: `${a.providerName} (${a.providerType})`,
                start: a.date,
                color: STATUS_COLORS[a.status] || '#60a5fa',
                extendedProps: a
            })),
        [items]
    );

    const onEventClick = (info) => setSelected(info.event.extendedProps);

    const onCancel = async () => {
        if (!selected) return;
        try {
            await cancelAppointment(selected._id);
            setItems(prev => prev.map(p => p._id === selected._id ? { ...p, status: 'cancelled' } : p));
            setSelected(prev => prev ? { ...prev, status: 'cancelled' } : prev);
        } catch (e) {
            alert('Failed to cancel');
        }
    };

    return (
        <div className="cal-wrap">
            <style>{CSS}</style>

            <div className="legend">
                <span><i style={{ background: STATUS_COLORS.pending }} /> Pending</span>
                <span><i style={{ background: STATUS_COLORS.confirmed }} /> Confirmed</span>
                <span><i style={{ background: STATUS_COLORS.declined }} /> Declined</span>
                <span><i style={{ background: STATUS_COLORS.cancelled }} /> Cancelled</span>
            </div>

            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                height="auto"
                events={events}
                eventClick={onEventClick}
                headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' }}
            />

            {selected && (
                <div className="details">
                    <h4>Appointment Details</h4>
                    <div><b>Provider:</b> {selected.providerName} ({selected.providerType})</div>
                    <div><b>Date:</b> {new Date(selected.date).toLocaleString()}</div>
                    <div><b>Status:</b> {selected.status}</div>
                    {selected.note ? <div><b>Note:</b> {selected.note}</div> : null}
                    <div className="btns">
                        {selected.status !== 'cancelled' && selected.status !== 'declined' && (
                            <button onClick={onCancel}>Cancel Appointment</button>
                        )}
                        <button onClick={() => setSelected(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
