import React, { useEffect, useMemo, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DayDetailModal from '../components/DayDetailModal';
import { fetchAnalyticsSummary, fetchDayDetails } from '../api/analytics';

const CSS = `
.analytics-root { padding: 20px; }
.analytics-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.filters { display: flex; gap: 12px; align-items: end; flex-wrap: wrap; }
.filters label { display: block; font-size: 12px; color: #555; }
.filters input[type="date"], .filters input[type="text"] { padding: 6px 8px; border: 1px solid #ccc; border-radius: 6px; }
.filters button { padding: 6px 12px; border: 1px solid #666; border-radius: 6px; background: #fff; cursor: pointer; }
.grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
.card { border: 1px solid #eaeaea; border-radius: 10px; padding: 16px; background: #fff; }
.card h3 { margin: 0 0 10px 0; }
.heatmap-wrapper { overflow-x: auto; }
`;

export default function Analytics() {
  const [from, setFrom] = useState(() => new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [tags, setTags] = useState('');

  const [heatmapData, setHeatmapData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [dayData, setDayData] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { heatmap, trend } = await fetchAnalyticsSummary(from, to, tags);
        setHeatmapData(Array.isArray(heatmap) ? heatmap : []);
        setTrendData(Array.isArray(trend) ? trend : []);
      } catch {
        setHeatmapData([]);
        setTrendData([]);
      }
    })();
  }, [from, to, tags]);

  const startDate = useMemo(() => new Date(from), [from]);
  const endDate   = useMemo(() => new Date(to), [to]);

  const classForValue = (v) => {
    if (!v || typeof v !== 'object' || Array.isArray(v) || v === null) return 'color-empty';
    if (typeof v.count !== 'number') return 'color-empty';
    if (v.count >= 5) return 'color-github-4';
    if (v.count === 4) return 'color-github-3';
    if (v.count === 3) return 'color-github-2';
    if (v.count === 2) return 'color-github-1';
    return 'color-github-0';
  };

  const onDayClick = async (v) => {
    const dateStr = v?.date || null;
    if (!dateStr) return;
    try {
      const data = await fetchDayDetails(dateStr, tags);
      setDayData(data);
      setOpen(true);
    } catch {
      alert('Failed to load details for that date.');
    }
  };

  return (
    <div className="analytics-root">
      <style>{CSS}</style>

      <div className="analytics-header">
        <h2>Analytics</h2>
        <div className="filters">
          <div>
            <label>From</label>
            <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
          </div>
          <div>
            <label>To</label>
            <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} />
          </div>
          <div>
            <label>Emotion Tags (CSV)</label>
            <input type="text" placeholder="e.g., stress,exam" value={tags} onChange={(e)=>setTags(e.target.value)} />
          </div>
          <button onClick={()=>{/* state already bound; this is just a UX button */}}>Apply</button>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Emotion Calendar</h3>
          <div className="heatmap-wrapper">
            <CalendarHeatmap
              startDate={startDate}
              endDate={endDate}
              values={Array.isArray(heatmapData) ? heatmapData : []}
              classForValue={classForValue}
              showWeekdayLabels
              onClick={onDayClick}
              tooltipDataAttrs={(v) => {
                if (!v || typeof v !== 'object' || !v.date) return { 'data-tip': 'No data' };
                return { 'data-tip': `${v.date}: ${typeof v.count === 'number' ? v.count : 0} mood logs` };
              }}
            />
          </div>
          <p style={{ color: '#666', marginTop: 8 }}>
            Click a day to see mood logs, journal entries, and self‑care tasks.
          </p>
        </div>

        <div className="card">
          <h3>Mood Trend</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={Array.isArray(trendData) ? trendData : []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="avgMood" stroke="#8884d8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <DayDetailModal open={open} onClose={()=>setOpen(false)} data={dayData} />
    </div>
  );
}
