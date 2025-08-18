import axios from 'axios';
const API_BASE = process.env.REACT_APP_API_BASE || '';

// Fetch analytics summary (heatmap and trend)
export async function fetchAnalyticsSummary(from, to, tagsCsv = '') {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API_BASE}/api/analytics/summary`, {
    params: { from, to, tags: tagsCsv || undefined },
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// Fetch day details (mood, journal, self-care)
export async function fetchDayDetails(dateStr, tagsCsv = '') {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API_BASE}/api/analytics/day`, {
    params: { date: dateStr, tags: tagsCsv || undefined },
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
