// client/src/pages/Analytics.js
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { formatDayDetails } from '../utils/dayDetailsFormatter';
import './Analytics.css'; // keep your CSS

// Local timezone YYYY-MM-DD (no UTC shift)
function toLocalISO(dateLike) {
    const d = (dateLike instanceof Date) ? dateLike : new Date(dateLike);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function fromISO(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
}

const levelFor = (v, max) => {
    if (!v || v <= 0) return 0;
    const pct = v / Math.max(1, max);
    if (pct >= 0.75) return 4;
    if (pct >= 0.5) return 3;
    if (pct >= 0.25) return 2;
    return 1;
};

export default function Analytics() {
    const [from, setFrom] = useState(() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 1);
        return toLocalISO(d);
    });
    const [to, setTo] = useState(() => toLocalISO(new Date()));

    const [heatmap, setHeatmap] = useState([]);
    const [trend, setTrend] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    const [selectedDate, setSelectedDate] = useState('');
    const [dayLoading, setDayLoading] = useState(false);
    const [dayErr, setDayErr] = useState('');
    const [dayText, setDayText] = useState('');

    // 👉 Read token once per render; used for all calls
    const token = localStorage.getItem('token');
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

    useEffect(() => {
        let cancelled = false;
        async function run() {
            setLoading(true);
            setErr('');
            try {
                const res = await axios.get('/api/analytics/summary', {
                    params: { from, to },
                    headers: authHeaders,   // 👈 attach token
                });
                if (cancelled) return;
                const hm = Array.isArray(res.data?.heatmap) ? res.data.heatmap : [];
                setHeatmap(hm);
                setTrend(Array.isArray(res.data?.trend) ? res.data.trend : []);
            } catch (e) {
                console.error(e);
                setErr(e?.response?.data?.message || e.message || 'Failed to load analytics');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        run();
        return () => { cancelled = true; };
    }, [from, to, token]); // token in deps so header updates if user re-logs in

    async function loadDayDetails(dateStr) {
        setSelectedDate(dateStr);
        setDayLoading(true);
        setDayErr('');
        setDayText('');
        try {
            const res = await axios.get('/api/analytics/day', {
                params: { date: dateStr },
                headers: authHeaders,   // 👈 attach token
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

    const dataMap = useMemo(() => {
        const map = new Map();
        let max = 0;
        for (const item of heatmap) {
            const dateStr = toLocalISO(item.date);
            const value = Number(item.value ?? item.count ?? item.total ?? 0);
            max = Math.max(max, value);
            map.set(dateStr, { ...item, date: dateStr, value });
        }
        return { map, max };
    }, [heatmap]);

    const cells = useMemo(() => {
        const start = fromISO(from);
        const end = fromISO(to);
        const startW = new Date(start);
        const day = startW.getDay();
        const deltaToMon = (day + 6) % 7;
        startW.setDate(startW.getDate() - deltaToMon);

        const days = [];
        for (let d = new Date(startW); d <= end; d.setDate(d.getDate() + 1)) {
            const iso = toLocalISO(d);
            const m = dataMap.map.get(iso);
            days.push({
                date: iso,
                inRange: (d >= start && d <= end),
                info: m || null
            });
        }
        return days;
    }, [from, to, dataMap]);

    const monthLabels = useMemo(() => {
        const labels = [];
        let lastMonth = -1;
        cells.forEach((c, idx) => {
            const m = fromISO(c.date).getMonth();
            if (m !== lastMonth) {
                labels.push({
                    index: idx,
                    month: new Date(fromISO(c.date)).toLocaleString(undefined, { month: 'short' })
                });
                lastMonth = m;
            }
        });
        return labels;
    }, [cells]);

    return (
        <div className="analytics-page">
            <div className="controls">
                <div className="ctrl">
                    <label>From</label>
                    <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
                </div>
                <div className="ctrl">
                    <label>To</label>
                    <input type="date" value={to} onChange={e => setTo(e.target.value)} />
                </div>
                <button className="ghost" onClick={() => {
                    const d = new Date();
                    setTo(toLocalISO(d));
                    d.setFullYear(d.getFullYear() - 1);
                    setFrom(toLocalISO(d));
                }}>This Year</button>
                <button className="ghost" onClick={() => {
                    const d = new Date();
                    setTo(toLocalISO(d));
                    d.setDate(d.getDate() - 89);
                    setFrom(toLocalISO(d));
                }}>Last 90 Days</button>
            </div>

            <h2>Emotion Calendar</h2>

            {loading ? <div className="loading">Loading…</div> : (
                <>
                    {!!err && <div className="error">{err}</div>}

                    <div className="months-row">
                        {monthLabels.map(m => (
                            <div key={m.index} className="month-label" style={{ gridColumnStart: m.index + 1 }}>
                                {m.month}
                            </div>
                        ))}
                    </div>

                    <div className="heatmap">
                        {cells.map((c, i) => {
                            const value = c.info?.value || 0;
                            const level = levelFor(value, dataMap.max);
                            const counts = c.info?.counts || {};
                            const title = [
                                new Date(fromISO(c.date)).toLocaleDateString(),
                                `moods: ${counts.moods ?? 0}`,
                                `journals: ${counts.journals ?? 0}`,
                                `self-care: ${counts.selfCare ?? 0}`,
                                `appointments: ${counts.appointments ?? 0}`
                            ].join('\n');

                            const selected = selectedDate === c.date;
                            return (
                                <button
                                    key={c.date + '_' + i}
                                    className={`cell lvl-${level} ${selected ? 'selected' : ''} ${c.inRange ? '' : 'dim'}`}
                                    title={title}
                                    aria-label={title}
                                    onClick={() => { if (c.inRange) loadDayDetails(c.date); }}
                                />
                            );
                        })}
                    </div>

                    <p className="subtle">Click a day to see mood logs, journals, self-care, and appointments.</p>
                </>
            )}

            {selectedDate && (
                <div className="card">
                    <div className="detail-head">
                        <h4>Day Details — {new Date(fromISO(selectedDate)).toLocaleDateString()}</h4>
                        <div className="detail-actions">
                            <button className="ghost" onClick={() => {
                                setSelectedDate('');
                                setDayText('');
                                setDayErr('');
                            }}>Clear</button>
                            <button onClick={() => {
                                const blob = new Blob([dayText], { type: 'text/plain;charset=utf-8' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `mindease-${selectedDate}.txt`;
                                a.click();
                                URL.revokeObjectURL(url);
                            }}>Download TXT</button>
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
