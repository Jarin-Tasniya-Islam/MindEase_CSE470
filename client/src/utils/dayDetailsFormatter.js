// client/src/utils/dayDetailsFormatter.js

function fmt(ts) {
  try { return new Date(ts).toLocaleString(); } catch { return ''; }
}

function lineify(label, value) {
  if (value === null || value === undefined) return '';
  const v = String(value).trim();
  if (!v) return '';
  return `    ${label}: ${v}\n`;
}

function formatDayDetails(data) {
  if (!data) return 'No data';

  const moods        = data.moods || [];
  const journals     = data.journals || [];
  const selfCare     = data.selfCare || [];
  const appointments = data.appointments || [];

  const s = data.summary || {
    moodCount: moods.length,
    journalCount: journals.length,
    selfCareCount: selfCare.length,
    avgMood: moods.length
      ? Number(
          (moods.reduce((sum, m) => sum + Number(m.moodLevel ?? m.mood ?? 0), 0) / moods.length).toFixed(2)
        )
      : null
  };

  let out = `📅 ${data.date}\n`;
  out += `Mood logs: ${s.moodCount ?? 0}, Avg mood: ${s.avgMood ?? '-'}\n`;
  out += `Journal entries: ${s.journalCount ?? 0}\n`;
  out += `Self-care tasks: ${s.selfCareCount ?? 0}\n`;
  out += `Appointments: ${appointments.length}\n\n`;

  // ==== Moods: full detail ====
  out += `Moods:\n`;
  if (moods.length) {
    moods.forEach((m, i) => {
      const when = fmt(m.dateTime || m.createdAt);

      const moodLevel       = m.moodLevel ?? m.mood;
      const moodDescription = m.moodDescription ?? m.description;
      const moodDuration    = m.moodDuration ?? m.duration;
      const thoughtPatterns = m.thoughtPatterns ?? m.thoughts;
      const social          = m.socialInteraction ?? m.social;

      const headerBits = [];
      if (moodLevel !== undefined && moodLevel !== null) headerBits.push(`Level ${moodLevel}`);
      if (m.emoji) headerBits.push(m.emoji);
      out += `  ${i + 1}. ${headerBits.join(' ')} @ ${when}\n`;

      out += lineify('Description', moodDescription);
      out += lineify('Duration', moodDuration);
      out += lineify('Thoughts', thoughtPatterns);
      out += lineify('Stress', m.stressLevel);
      out += lineify('Energy', m.energyLevel);
      out += lineify('Activity', m.activity);
      out += lineify('Location', m.location);
      out += lineify('Social', social);
      out += lineify('Time of Day', m.timeOfDay);
      out += lineify('Notes', m.notes);
    });
  } else {
    out += `  (none)\n`;
  }

  // ==== Journals: full content + extras (excluding language/theme/font) ====
  out += `\nJournals:\n`;
  if (journals.length) {
    journals.forEach((j, i) => {
      const when = fmt(j.createdAt || j.date);
      const titleLine = j.title ? `  ${i + 1}. ${j.title} @ ${when}\n` : `  ${i + 1}. @ ${when}\n`;
      out += titleLine;

      if (j.content) out += `    ${j.content}\n`;

      // Omit technical/UI fields
      const omit = new Set([
        '_id','__v','user','userId','title','content','createdAt','updatedAt','date',
        'language','theme','font'  // ⬅️ hide these
      ]);

      const extras = Object.keys(j)
        .filter(k => !omit.has(k) && j[k] !== null && j[k] !== undefined)
        .filter(k => ['string','number','boolean'].includes(typeof j[k]));

      if (extras.length) {
        out += `    · ${extras.map(k => `${k}:${j[k]}`).join('  ')}\n`;
      }
    });
  } else {
    out += `  (none)\n`;
  }

  // ==== Self-Care ====
  out += `\nSelf-Care:\n`;
  if (selfCare.length) {
    selfCare.forEach((sc, i) => {
      out += `  ${i + 1}. ${sc.taskType || sc.activityKey || 'task'} — ${sc.completed ? '✔ done' : '✘ not done'} @ ${fmt(sc.date || sc.createdAt)}\n`;
      if (sc.notes) out += `     ${sc.notes}\n`;
    });
  } else {
    out += `  (none)\n`;
  }

  // ==== Appointments ====
  out += `\nAppointments:\n`;
  if (appointments.length) {
    appointments.forEach((a, i) => {
      const withWho =
        a.providerName ||
        a.provider ||
        (a.supportPerson && a.supportPerson.name) ||
        '(provider)';
      out += `  ${i + 1}. With ${withWho} — ${a.status || 'pending'} @ ${fmt(a.when || a.date)}\n`;
      if (a.note) out += `     ${a.note}\n`;
    });
  } else {
    out += `  (none)\n`;
  }

  return out;
}

module.exports = { formatDayDetails };
