import axios from 'axios';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import './Analytics.css'; // Optional for styling

// Defensive plain text rendering
const toText = (v) =>
  v == null ? '' : typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v);

// Defensive helper to render only primitives/strings
function safeRender(val) {
  if (val == null) return '';
  if (typeof val === 'object') return JSON.stringify(val, null, 2);
  return String(val);
}

// Enhance defensive rendering and error handling
export default function Analytics() {
  const [from] = useState('2024-01-01');
  const [to] = useState('2024-12-31');
  const [heatmap, setHeatmap] = useState([]);
  const [dayDetails, setDayDetails] = useState(null);

  useEffect(() => {
    axios
      .get(`/api/analytics/heatmap?from=${from}&to=${to}`)
      .then((res) => {
        console.log('Heatmap API response:', res.data);
        setHeatmap(Array.isArray(res.data.days) ? res.data.days : []);
      })
      .catch((err) => {
        console.error('Failed to fetch heatmap data:', err);
        setHeatmap([]);
      });
  }, [from, to]);

  const heatValues = useMemo(() => {
    const map = {};
    (Array.isArray(heatmap) ? heatmap : []).forEach((d) => {
      if (d && d.date) map[d.date] = d;
    });
    return Object.values(map);
  }, [heatmap]);

  return (
    <div>
      <h2>📊 Mood Analytics</h2>
      <CalendarHeatmap
        startDate={from}
        endDate={to}
        values={heatValues}
        classForValue={(v) => (v && v.count ? 'color-scale-1' : 'color-empty')}
        onClick={(v) =>
          v?.date &&
          axios
            .get(`/api/analytics/day/${v.date}`)
            .then((res) => {
              console.log('Day details API response:', res.data);
              setDayDetails(res.data);
            })
            .catch((err) => {
              console.error('Failed to fetch day details:', err);
              setDayDetails(null);
            })
        }
      />
      {dayDetails && (
        <div style={{ marginTop: '20px' }}>
          <h3>📅 Day Details for {safeRender(dayDetails.date) || 'Selected Day'}</h3>

          <h4>Mood Logs:</h4>
          {Array.isArray(dayDetails.moodLogs) && dayDetails.moodLogs.length > 0 ? (
            dayDetails.moodLogs.map((m, i) => (
              <div key={m && (m._id || i)}>
                Mood: {safeRender(m && m.moodLevel)} | Emoji: {safeRender(m && m.emoji)}
              </div>
            ))
          ) : (
            <div>No mood logs.</div>
          )}

          <h4>Journal Entries:</h4>
          {Array.isArray(dayDetails.journalEntries) && dayDetails.journalEntries.length > 0 ? (
            dayDetails.journalEntries.map((j, i) => (
              <div key={j && (j._id || i)}>
                <strong>{safeRender(j && j.title)}</strong>: {safeRender(j && j.content)}
              </div>
            ))
          ) : (
            <div>No journal entries.</div>
          )}

          <h4>Self-Care Activities:</h4>
          {Array.isArray(dayDetails.selfCareActivities) && dayDetails.selfCareActivities.length > 0 ? (
            dayDetails.selfCareActivities.map((s, i) => (
              <div key={s && (s._id || i)}>
                {safeRender(s && s.activityKey)} ({safeRender(s && s.durationSec)} seconds)
              </div>
            ))
          ) : (
            <div>No self-care activities.</div>
          )}
        </div>
      )}
    </div>
  );
}
