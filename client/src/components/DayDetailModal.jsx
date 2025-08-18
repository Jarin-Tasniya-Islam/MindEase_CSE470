import React, { useMemo, useState } from 'react';

const S = {
  backdrop:{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000},
  modal:{background:'#fff',width:'min(900px,92vw)',maxHeight:'86vh',overflow:'auto',borderRadius:10,boxShadow:'0 12px 40px rgba(0,0,0,.2)',padding:20},
  header:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10},
  tabs:{display:'flex',gap:10,marginTop:10,borderBottom:'1px solid #eee',paddingBottom:8},
  tab:(a)=>({padding:'8px 12px',border:`1px solid ${a?'#333':'#ccc'}`,borderBottomColor:a?'#fff':'#ccc',background:a?'#fff':'#f7f7f7',cursor:'pointer',borderRadius:8}),
  list:{listStyle:'none',padding:0,margin:0,display:'grid',gap:10},
  item:{border:'1px solid #eaeaea',borderRadius:8,padding:12},
  pill:{display:'inline-block',padding:'2px 8px',background:'#eef3ff',border:'1px solid #d8e2ff',borderRadius:12,marginRight:6,marginBottom:6,fontSize:12},
  small:{color:'#666',fontSize:12},
};

const t = (d)=> new Date(d).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});

export default function DayDetailModal({ open, onClose, data }) {
  const [tab, setTab] = useState('moods');
  const dateLabel = useMemo(() => data?.date ? new Date(data.date+'T00:00:00').toLocaleDateString() : '', [data]);
  if (!open) return null;

  return (
    <div style={S.backdrop} onClick={onClose}>
      <div style={S.modal} onClick={(e)=>e.stopPropagation()}>
        <div style={S.header}>
          <h2 style={{margin:0}}>Day Details — {dateLabel}</h2>
          <button onClick={onClose} style={{padding:'6px 10px',cursor:'pointer'}}>Close</button>
        </div>

        <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
          <div><b>Mood logs:</b> {data?.summary?.moodCount ?? 0}</div>
          <div><b>Avg mood:</b> {data?.summary?.avgMood ?? '—'}</div>
          <div><b>Journal entries:</b> {data?.summary?.journalCount ?? 0}</div>
          <div><b>Self‑care:</b> {data?.summary?.selfCareCount ?? 0}</div>
        </div>

        <div style={S.tabs}>
          <button style={S.tab(tab==='moods')} onClick={()=>setTab('moods')}>Mood Logs</button>
          <button style={S.tab(tab==='journals')} onClick={()=>setTab('journals')}>Journal Entries</button>
          <button style={S.tab(tab==='selfcare')} onClick={()=>setTab('selfcare')}>Self‑Care</button>
        </div>

        {tab==='moods' && (
          <ul style={S.list}>
            {(Array.isArray(data?.moods) ? data.moods : []).map((m, idx) => (
              <li key={m?._id || idx} style={S.item}>
                <div><b>{typeof m?.emoji === 'string' ? m.emoji : '🙂'}</b> Mood: <b>{typeof m?.mood === 'string' || typeof m?.mood === 'number' ? m.mood : ''}</b>{m?.energy ? ` • Energy: ${m.energy}` : ''}</div>
                {Array.isArray(m?.tags) && m.tags.length ? <div style={{marginTop:6}}>{m.tags.map((t,i)=><span key={i} style={S.pill}>#{String(t)}</span>)}</div> : null}
                {m?.note ? <p style={{marginTop:6}}>{String(m.note)}</p> : null}
                <div style={S.small}>Logged at {m?.loggedAt ? t(m.loggedAt) : ''}</div>
              </li>
            ))}
            {(!data?.moods || !data.moods.length) && <div>No mood logs for this day.</div>}
          </ul>
        )}

        {tab==='journals' && (
          <ul style={S.list}>
            {(Array.isArray(data?.journals) ? data.journals : []).map((j, idx) => (
              <li key={j?._id || idx} style={S.item}>
                <div><b>{typeof j?.title === 'string' ? j.title : 'Untitled entry'}</b></div>
                {Array.isArray(j?.tags) && j.tags.length ? <div style={{marginTop:6}}>{j.tags.map((tg,i)=><span key={i} style={S.pill}>#{String(tg)}</span>)}</div> : null}
                <p style={{marginTop:6,whiteSpace:'pre-wrap'}}>{typeof j?.content === 'string' ? j.content : ''}</p>
                <div style={S.small}>Created at {j?.createdAt ? t(j.createdAt) : ''}</div>
              </li>
            ))}
            {(!data?.journals || !data.journals.length) && <div>No journal entries for this day.</div>}
          </ul>
        )}

        {tab==='selfcare' && (
          <ul style={S.list}>
            {(Array.isArray(data?.selfCare) ? data.selfCare : []).map((s, idx) => (
              <li key={s?._id || idx} style={S.item}>
                <div><b>{typeof s?.label === 'string' ? s.label : ''}</b> <span style={S.small}>({typeof s?.key === 'string' ? s.key : ''})</span></div>
                {s?.details ? <p style={{marginTop:6}}>{String(s.details)}</p> : null}
                <div style={S.small}>Completed at {s?.completedAt ? t(s.completedAt) : ''}</div>
              </li>
            ))}
            {(!data?.selfCare || !data.selfCare.length) && <div>No self‑care activities for this day.</div>}
          </ul>
        )}
      </div>
    </div>
  );
}
