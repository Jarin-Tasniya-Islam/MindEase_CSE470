// client/src/components/SOSPlan.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const emptyContact = { name: '', relation: '', phone: '', email: '' };
const emptyStep = { order: 1, text: '' };

const SOSPlan = () => {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState({
    title: 'My SOS Plan',
    steps: [ { ...emptyStep } ],
    contacts: [ { ...emptyContact } ],
    safetyTools: ['Breathe 4-7-8', 'Grounding 5-4-3-2-1'],
    notes: ''
  });
  const [msg, setMsg] = useState('');

  const token = localStorage.getItem('token');

  const saveToLocal = (p) => {
    try { localStorage.setItem('sosPlanCache', JSON.stringify(p)); } catch {}
  };
  const loadFromLocal = () => {
    try {
      const raw = localStorage.getItem('sosPlanCache');
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  };

  useEffect(() => {
    const cached = loadFromLocal();
    if (cached) setPlan(cached);

    const fetchPlan = async () => {
      try {
        const { data } = await axios.get('/api/sos/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data?.plan) {
          setPlan({
            title: data.plan.title || 'My SOS Plan',
            steps: data.plan.steps?.length ? data.plan.steps : [{ ...emptyStep }],
            contacts: data.plan.contacts?.length ? data.plan.contacts : [{ ...emptyContact }],
            safetyTools: data.plan.safetyTools || [],
            notes: data.plan.notes || ''
          });
          saveToLocal(data.plan);
        }
      } catch {
        // keep cached/initial
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchPlan();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStepChange = (idx, field, value) => {
    const next = [...plan.steps];
    next[idx] = { ...next[idx], [field]: field === 'order' ? Number(value) : value };
    setPlan(p => ({ ...p, steps: next }));
  };

  const handleContactChange = (idx, field, value) => {
    const next = [...plan.contacts];
    next[idx] = { ...next[idx], [field]: value };
    setPlan(p => ({ ...p, contacts: next }));
  };

  const addStep = () =>
    setPlan(p => ({ ...p, steps: [...p.steps, { order: (p.steps.at(-1)?.order || p.steps.length) + 1, text: '' }] }));
  const removeStep = (idx) =>
    setPlan(p => ({ ...p, steps: p.steps.filter((_, i) => i !== idx) }));

  const addContact = () =>
    setPlan(p => ({ ...p, contacts: [...p.contacts, { ...emptyContact }] }));
  const removeContact = (idx) =>
    setPlan(p => ({ ...p, contacts: p.contacts.filter((_, i) => i !== idx) }));

  const addSafetyTool = (tool) => {
    if (!tool) return;
    setPlan(p => ({ ...p, safetyTools: [...new Set([...(p.safetyTools || []), tool])] }));
  };
  const removeSafetyTool = (tool) =>
    setPlan(p => ({ ...p, safetyTools: (p.safetyTools || []).filter(t => t !== tool) }));

  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const { data } = await axios.put('/api/sos', plan, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg(data?.message || 'Saved');
      if (data?.plan) saveToLocal(data.plan);
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Failed to save');
    }
  };

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#1976d2', fontWeight: 500, fontSize: 20 }}>Loading SOS Plan…</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f0fc 0%, #fafdff 100%)', padding: '40px 0' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px rgba(25, 118, 210, 0.10)', padding: 32, border: '1.5px solid #e3f0fc' }}>
        <h2 style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10, color: '#1976d2', fontWeight: 700, fontSize: 28 }}>
          <span role="img" aria-label="SOS">🆘</span> Emergency SOS Plan
        </h2>

        <form onSubmit={save} style={{ display: 'grid', gap: 24 }}>
          <div>
            <label style={{ fontWeight: 600, color: '#1976d2' }}>Title</label>
            <input
              type="text"
              value={plan.title}
              onChange={e => setPlan(p => ({ ...p, title: e.target.value }))}
              style={{ width: '100%', padding: 10, marginTop: 4, borderRadius: 8, border: '1.5px solid #b6d6f6', fontSize: 17 }}
              placeholder="My SOS Plan"
            />
          </div>

          <section>
            <h3 style={{ margin: '16px 0 8px', color: '#1976d2', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span role="img" aria-label="steps">📝</span> 1) Action Steps
            </h3>
            {plan.steps.map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px', gap: 8, marginBottom: 8 }}>
                <input type="number" min={1} value={s.order} onChange={e => handleStepChange(i, 'order', e.target.value)} style={{ borderRadius: 6, border: '1.5px solid #b6d6f6', padding: 8 }} />
                <input type="text" value={s.text} onChange={e => handleStepChange(i, 'text', e.target.value)} placeholder="e.g., Breathe 4‑7‑8 for 2 minutes" style={{ borderRadius: 6, border: '1.5px solid #b6d6f6', padding: 8 }} />
                <button type="button" onClick={() => removeStep(i)} style={{ padding: 8, background: '#fbe9e7', color: '#d32f2f', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Remove</button>
              </div>
            ))}
            <button type="button" onClick={addStep} style={{ padding: 8, background: '#e3f0fc', color: '#1976d2', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>+ Add Step</button>
          </section>

          <section>
            <h3 style={{ margin: '16px 0 8px', color: '#1976d2', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span role="img" aria-label="contacts">📞</span> 2) Support Contacts
            </h3>
            {plan.contacts.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 100px', gap: 8, marginBottom: 8 }}>
                <input type="text" value={c.name} onChange={e => handleContactChange(i, 'name', e.target.value)} placeholder="Name" style={{ borderRadius: 6, border: '1.5px solid #b6d6f6', padding: 8 }} />
                <input type="text" value={c.relation} onChange={e => handleContactChange(i, 'relation', e.target.value)} placeholder="Relation" style={{ borderRadius: 6, border: '1.5px solid #b6d6f6', padding: 8 }} />
                <input type="tel" value={c.phone} onChange={e => handleContactChange(i, 'phone', e.target.value)} placeholder="Phone" style={{ borderRadius: 6, border: '1.5px solid #b6d6f6', padding: 8 }} />
                <input type="email" value={c.email} onChange={e => handleContactChange(i, 'email', e.target.value)} placeholder="Email" style={{ borderRadius: 6, border: '1.5px solid #b6d6f6', padding: 8 }} />
                <button type="button" onClick={() => removeContact(i)} style={{ padding: 8, background: '#fbe9e7', color: '#d32f2f', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Remove</button>
              </div>
            ))}
            <button type="button" onClick={addContact} style={{ padding: 8, background: '#e3f0fc', color: '#1976d2', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>+ Add Contact</button>
          </section>

          <section>
            <h3 style={{ margin: '16px 0 8px', color: '#1976d2', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span role="img" aria-label="tools">🛡️</span> 3) Safety Tools
            </h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {(plan.safetyTools || []).map(tool => (
                <span key={tool} style={{ border: '1.5px solid #b6d6f6', background: '#fafdff', color: '#1976d2', padding: '6px 12px', borderRadius: 16, fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {tool} <button type="button" onClick={() => removeSafetyTool(tool)} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#d32f2f', fontWeight: 700, cursor: 'pointer', fontSize: 16 }}>×</button>
                </span>
              ))}
            </div>
            <AddToolInput onAdd={addSafetyTool} />
          </section>

          <section>
            <h3 style={{ margin: '16px 0 8px', color: '#1976d2', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span role="img" aria-label="notes">🗒️</span> Notes
            </h3>
            <textarea
              rows={4}
              value={plan.notes}
              onChange={e => setPlan(p => ({ ...p, notes: e.target.value }))}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.5px solid #b6d6f6', fontSize: 16 }}
              placeholder="Anything else you want to remember in a crisis."
            />
          </section>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button type="submit" style={{ padding: '12px 24px', background: 'linear-gradient(90deg, #1976d2 60%, #64b5f6 100%)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 17, boxShadow: '0 2px 8px #e3f0fc', cursor: 'pointer', letterSpacing: 0.5 }}>💾 Save Plan</button>
            {msg && <span style={{ color: msg === 'Saved' ? '#388e3c' : '#d32f2f', fontWeight: 600 }}>{msg}</span>}
          </div>
        </form>

        <hr style={{ margin: '32px 0', border: 'none', borderTop: '1.5px solid #e3f0fc' }} />

        <QuickSOSView plan={plan} />
      </div>
    </div>
  );
};

const AddToolInput = ({ onAdd }) => {
  const [val, setVal] = useState('');
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
      <input value={val} onChange={e => setVal(e.target.value)} placeholder="Add safety tool (e.g., Call hotline)" style={{ flex: 1, padding: 10, borderRadius: 8, border: '1.5px solid #b6d6f6', fontSize: 15 }} />
      <button type="button" onClick={() => { onAdd(val.trim()); setVal(''); }} style={{ padding: '10px 18px', background: '#e3f0fc', color: '#1976d2', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
        Add
      </button>
    </div>
  );
};

const QuickSOSView = ({ plan }) => {
  const [open, setOpen] = useState(false);
  const sortedSteps = [...(plan.steps || [])].sort((a, b) => a.order - b.order);
  return (
    <div>
      <button onClick={() => setOpen(true)} style={{ padding: '12px 24px', background: 'linear-gradient(90deg, #1976d2 60%, #64b5f6 100%)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 17, boxShadow: '0 2px 8px #e3f0fc', cursor: 'pointer', letterSpacing: 0.5 }}>🚨 Open SOS (One‑Click)</button>
      {open && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ margin: 0, color: '#1976d2', fontWeight: 700, fontSize: 22, display: 'flex', alignItems: 'center', gap: 8 }}><span role="img" aria-label="SOS">🆘</span> {plan.title || 'My SOS Plan'}</h3>
              <button onClick={() => setOpen(false)} style={{ padding: 6, background: '#fbe9e7', color: '#d32f2f', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Close</button>
            </div>
            <div style={{ display: 'grid', gap: 18, maxHeight: '70vh', overflow: 'auto' }}>
              <section>
                <h4 style={{ color: '#1976d2', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><span role="img" aria-label="steps">📝</span> Steps</h4>
                <ol style={{ paddingLeft: 20 }}>
                  {sortedSteps.map((s, idx) => <li key={idx} style={{ marginBottom: 6, fontSize: 16 }}>{s.text}</li>)}
                </ol>
              </section>
              <section>
                <h4 style={{ color: '#1976d2', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><span role="img" aria-label="contacts">📞</span> Contacts</h4>
                {(plan.contacts || []).map((c, idx) => (
                  <div key={idx} style={{ marginBottom: 6, fontSize: 16 }}>
                    <strong>{c.name}</strong>{c.relation ? ` (${c.relation})` : ''} —{' '}
                    {c.phone && <a href={`tel:${c.phone}`} style={{ marginRight: 8, color: '#1976d2', textDecoration: 'underline', fontWeight: 600 }}>Call</a>}
                    {c.email && <a href={`mailto:${c.email}`} style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 600 }}>Email</a>}
                  </div>
                ))}
              </section>
              {!!(plan.safetyTools || []).length && (
                <section>
                  <h4 style={{ color: '#1976d2', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><span role="img" aria-label="tools">🛡️</span> Safety Tools</h4>
                  <ul style={{ paddingLeft: 20 }}>
                    {plan.safetyTools.map((t, i) => <li key={i} style={{ fontSize: 16 }}>{t}</li>)}
                  </ul>
                </section>
              )}
              {plan.notes && (
                <section>
                  <h4 style={{ color: '#1976d2', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><span role="img" aria-label="notes">🗒️</span> Notes</h4>
                  <div style={{ fontSize: 16 }}>{plan.notes}</div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
};
const modalStyle = {
  background: '#fff', padding: 16, borderRadius: 8, width: 'min(700px, 95vw)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
};

export default SOSPlan;
