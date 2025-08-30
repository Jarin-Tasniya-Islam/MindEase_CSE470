// client/src/pages/Analytics.js
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { formatDayDetails } from '../utils/dayDetailsFormatter';
import './Analytics.css';

// Local timezone YYYY-MM-DD (no UTC shift)
function toLocalISO(dateLike) {
    const d = (dateLike instanceof Date) ? dateLike : new Date(dateLike);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function fromISO(dateStr) {
    const [y, m, d] = (dateStr || '').split('-').map(Number);
    return new Date(y, m - 1, d || 1);
}

const monthName = (d) =>
    d.toLocaleString(undefined, { month: 'long', year: 'numeric' });

export default function Analytics() {
    // calendar anchor = the first day of the current (visible) month
    const [anchor, setAnchor] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return toLocalISO(d);
    });

    // derived range for back-end (one month window)
    const { rangeFrom, rangeTo, firstDay, lastDay } = useMemo(() => {
        const first = fromISO(anchor);        // 1st of month
        const last = new Date(first);
        last.setMonth(last.getMonth() + 1);
        last.setDate(0);                      // last day of month
        return {
            rangeFrom: toLocalISO(first),
            rangeTo: toLocalISO(last),
            firstDay: first,
            lastDay: last
        };
    }, [anchor]);

    // data
    const [summary, setSummary] = useState([]); // array of {date, counts:{moods,journals,selfCare,appointments}, value}
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    // day details
    const [selectedDate, setSelectedDate] = useState('');
    const [dayLoading, setDayLoading] = useState(false);
    const [dayErr, setDayErr] = useState('');
    const [dayText, setDayText] = useState('');

    // auth header
    const token = localStorage.getItem('token');
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

    // fetch one-month summary
    useEffect(() => {
        let cancelled = false;
        async function run() {
            setLoading(true);
            setErr('');
            try {
                const res = await axios.get('/api/analytics/summary', {
                    params: { from: rangeFrom, to: rangeTo },
                    headers: authHeaders
                });
                if (cancelled) return;
                const hm = Array.isArray(res.data?.heatmap) ? res.data.heatmap : [];
                setSummary(
                    hm.map(it => ([
                        { date: toLocalISO(it.date), counts: it.counts || {}, value: Number(it.value ?? it.count ?? 0) }
                    ][0]))
                );
            } catch (e) {
                console.error(e);
                setSummary([]);
                setErr(e?.response?.data?.message || e.message || 'Failed to load analytics');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        run();
        return () => { cancelled = true; };
    }, [rangeFrom, rangeTo, token]);

    // index data by date
    const map = useMemo(() => {
        const m = new Map();
        for (const d of summary) m.set(d.date, d);
        return m;
    }, [summary]);

    // build 6x7 calendar grid (starts on Sunday)
    const cells = useMemo(() => {
        const start = new Date(firstDay);
        const dow = start.getDay();         // 0..6 (Sun..Sat)
        start.setDate(start.getDate() - dow);

        const days = [];
        for (let i = 0; i < 42; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const iso = toLocalISO(d);
            const inMonth = (d.getMonth() === firstDay.getMonth());
            days.push({
                iso,
                date: d,
                inMonth,
                info: map.get(iso) || { counts: {}, value: 0 }
            });
        }
        return days;
    }, [firstDay, map]);

    // load one day details
    async function loadDayDetails(iso) {
        setSelectedDate(iso);
        setDayLoading(true);
        setDayErr('');
        setDayText('');
        try {
            const res = await axios.get('/api/analytics/day', {
                params: { date: iso },
                headers: authHeaders
            });
            const txt = formatDayDetails(res.data);
            setDayText(txt);
        } catch (e) {
            console.error(e);
            setDayErr(e?.response?.data?.message || e.message || 'Failed to load day');
        } finally {
            setDayLoading(false);
        }
    }

    // month nav
    const prevMonth = () => {
        const d = new Date(firstDay);
        d.setMonth(d.getMonth() - 1);
        d.setDate(1);
        setAnchor(toLocalISO(d));
    };
    const nextMonth = () => {
        const d = new Date(firstDay);
        d.setMonth(d.getMonth() + 1);
        d.setDate(1);
        setAnchor(toLocalISO(d));
    };

    return (
        <div className="analytics-page">
            <div className="cal-header">
                <button className="nav" onClick={prevMonth} aria-label="Previous month">‹</button>
                <h2 className="title">{monthName(firstDay)}</h2>
                <button className="nav" onClick={nextMonth} aria-label="Next month">›</button>
            </div>

            <div className="subheader">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>

            {loading ? <div className="loading">Loading…</div> :
                err ? <div className="error">{err}</div> : (
                    <div className="month-grid">
                        {cells.map((c) => {
                            const { moods = 0, journals = 0, selfCare = 0, appointments = 0 } = c.info.counts || {};
                            const total = (moods + journals + selfCare + appointments) || 0;

                            return (
                                <button
                                    key={c.iso}
                                    className={`day ${c.inMonth ? '' : 'muted'} ${selectedDate === c.iso ? 'selected' : ''}`}
                                    onClick={() => loadDayDetails(c.iso)}
                                    title={`${c.date.toLocaleDateString()}\nMoods: ${moods}\nJournals: ${journals}\nSelf-care: ${selfCare}\nAppointments: ${appointments}`}
                                >
                                    <div className="day-num">{c.date.getDate()}</div>

                                    {/* Appointment chip(s) */}
                                    {appointments > 0 && (
                                        <div
                                            className="chip chip-appt"
                                            aria-label={`${appointments} ${appointments === 1 ? 'appointment' : 'appointments'}`}
                                        >
                                            {appointments === 1 ? 'Appointment' : 'Appointments'} · {appointments}
                                        </div>
                                    )}

                                    {/* Stacked tiny chips for quick glance */}
                                    <div className="chip-row">
                                        {moods > 0 && <span className="dot mood" title={`${moods} mood logs`} />}
                                        {journals > 0 && <span className="dot journal" title={`${journals} journals`} />}
                                        {selfCare > 0 && <span className="dot selfcare" title={`${selfCare} self-care`} />}
                                        {appointments > 0 && <span className="dot appt" title={`${appointments} appointments`} />}
                                        {total === 0 && <span className="dot none" title="No data" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )
            }

            {/* Day detail panel */}
            {selectedDate && (
                <div className="card">
                    <div className="detail-head">
                        <h4>Day Details — {fromISO(selectedDate).toLocaleDateString()}</h4>
                        <div className="detail-actions">
                            <button className="ghost" onClick={() => { setSelectedDate(''); setDayText(''); setDayErr(''); }}>
                                Clear
                            </button>
                            <button
                                onClick={() => {
                                    const blob = new Blob([dayText || 'No data'], { type: 'text/plain;charset=utf-8' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `mindease-${selectedDate}.txt`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                            >
                                Download TXT
                            </button>
                        </div>
                    </div>
                    {dayLoading ? <div className="loading">Loading day…</div> :
                        dayErr ? <div className="error">{dayErr}</div> :
                            <pre className="detail">{dayText || 'No data'}</pre>}
                </div>
            )}
        </div>
    );
}
