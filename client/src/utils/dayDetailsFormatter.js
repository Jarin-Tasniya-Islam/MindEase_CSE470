// client/src/utils/dayDetailsFormatter.js
function formatDayDetails(data) {
    if (!data) return 'No data';

    const s = data.summary || {};
    let out = `📅 ${data.date}\n`;
    out += `Mood logs: ${s.moodCount ?? 0}, Avg mood: ${s.avgMood ?? '-'}\n`;
    out += `Journal entries: ${s.journalCount ?? 0}\n`;
    out += `Self-care tasks: ${s.selfCareCount ?? 0}\n`;
    out += `Appointments: ${(data.appointments || []).length}\n\n`;

    // Moods
    out += `Moods:\n`;
    if ((data.moods || []).length) {
        data.moods.forEach((m, i) => {
            const t = new Date(m.dateTime || m.createdAt).toLocaleString();
            out += `  ${i + 1}. Level ${m.moodLevel ?? m.mood ?? '-'} ${m.emoji || ''} @ ${t}\n`;
        });
    } else out += `  (none)\n`;

    // Journals
    out += `\nJournals:\n`;
    if ((data.journals || []).length) {
        data.journals.forEach((j, i) => {
            const t = new Date(j.createdAt || j.date).toLocaleString();
            out += `  ${i + 1}. ${j.content?.slice(0, 100) || '(no content)'} @ ${t}\n`;
        });
    } else out += `  (none)\n`;

    // Self-Care
    out += `\nSelf-Care:\n`;
    if ((data.selfCare || []).length) {
        data.selfCare.forEach((sc, i) => {
            const t = new Date(sc.date).toLocaleString();
            out += `  ${i + 1}. ${sc.taskType || sc.activityKey || 'task'} — ${sc.completed ? '✔ done' : '✘ not done'} @ ${t}\n`;
        });
    } else out += `  (none)\n`;

    // Appointments
    out += `\nAppointments:\n`;
    if ((data.appointments || []).length) {
        data.appointments.forEach((a, i) => {
            const t = new Date(a.date).toLocaleString();
            out += `  ${i + 1}. With ${a.providerName || '(provider)'} — ${a.status || 'pending'} @ ${t}\n`;
        });
    } else out += `  (none)\n`;

    return out;
}

module.exports = { formatDayDetails };
