const Appointment = require('../models/Appointment');
const SupportPerson = require('../models/SupportPerson');
const Notification = require('../models/Notification'); // ⬅️ needed for anti-dup + clear
const createNotification = require('../utils/createNotification');

/* ------------------------------ Helpers ------------------------------ */

// Allowed window: 16:00–22:00 (22:00 inclusive)
const isWithinAllowedWindow = (dateObj) => {
  const h = dateObj.getHours();
  const m = dateObj.getMinutes();
  if (h < 16) return false;
  if (h > 22) return false;
  if (h === 22 && m > 0) return false;
  return true;
};

// Coerce any incoming date-like value to a Date or return null
const toDateOrNull = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

// Is a date within the next N hours (default 24) from "now"
const isWithinNextHours = (dt, hours = 24) => {
  if (!dt) return false;
  const now = new Date();
  const cutoff = new Date(now.getTime() + hours * 60 * 60 * 1000);
  return dt >= now && dt < cutoff;
};

/* ------------------------------ Controllers ------------------------------ */

// POST /api/appointments  (book a new appointment)
exports.book = async (req, res) => {
  try {
    const userId = req.user.id;
    const { supportPersonId, date, note } = req.body;

    const sp = await SupportPerson.findById(supportPersonId);
    if (!sp) return res.status(404).json({ message: 'Support person not found' });

    const when = toDateOrNull(date);
    if (!when) return res.status(400).json({ message: 'Invalid date' });

    // Enforce 4 PM – 10 PM window
    if (!isWithinAllowedWindow(when)) {
      return res.status(400).json({ message: 'Appointments are allowed only between 4:00 PM and 10:00 PM.' });
    }

    const appt = await Appointment.create({
      user: userId,
      supportPerson: sp._id,
      providerName: sp.name,
      providerType: sp.title || sp.type || 'Support',
      date: when,            // your schema currently uses "date"
      note: note || '',
      status: 'pending'
    });

    // 🔔 Always acknowledge creation
    await createNotification(
      userId,
      'appointment',
      '📩 Appointment request submitted.',
      { isReminder: false }
    );

    // ⏳ If the slot is within the next 24h, nudge immediately (reminder)
    if (isWithinNextHours(appt.date, 24)) {
      // Anti-spam: clear appointment reminders created in the last hour
      await Notification.deleteMany({
        userId,
        type: 'appointment',
        isReminder: true,
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
      });

      await createNotification(
        userId,
        'appointment',
        '⏳ You have an appointment within the next 24 hours.',
        { isReminder: true }
      );
    }

    res.status(201).json(appt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to book appointment', error: err.message });
  }
};

// GET /api/appointments/mine  (current user's appointments)
exports.mine = async (req, res) => {
  const userId = req.user.id;
  try {
    const appointments = await Appointment.find({ user: userId })
      .populate('supportPerson')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments', details: err.message });
  }
};

// DELETE or PATCH /api/appointments/:id/cancel
exports.cancel = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    const userId = req.user.id;
    if (String(appt.user) !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    appt.status = 'cancelled';
    await appt.save();

    // 🔔 notify and clear any appointment reminders
    await createNotification(appt.user, 'appointment', '🗑️ Appointment cancelled.', { isReminder: false });
    await Notification.deleteMany({ userId: appt.user, type: 'appointment', isReminder: true });

    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel appointment', error: err.message });
  }
};

// GET /api/appointments/for-support-person?supportPersonId=...
exports.forSupportPerson = async (req, res) => {
  try {
    const spId = req.query.supportPersonId || req.user.id;
    const appts = await Appointment.find({ supportPerson: spId }).sort({ date: 1 });
    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch support appointments', error: err.message });
  }
};

// POST /api/appointments/:id/respond  (support person confirm/decline)
exports.respond = async (req, res) => {
  try {
    const { action } = req.body; // 'confirm' | 'decline'
    if (!['confirm', 'decline'].includes(action)) return res.status(400).json({ message: 'Invalid action' });

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    appt.status = action === 'confirm' ? 'confirmed' : 'declined';
    await appt.save();

    // 🔔 notify user about decision
    if (appt.status === 'confirmed') {
      await createNotification(appt.user, 'appointment', '✅ Appointment confirmed.', { isReminder: false });

      // If it starts within 24h, ensure a reminder exists
      if (isWithinNextHours(appt.date, 24)) {
        await createNotification(
          appt.user,
          'appointment',
          '⏳ You have an appointment within the next 24 hours.',
          { isReminder: true }
        );
      }
    } else if (appt.status === 'declined') {
      await createNotification(appt.user, 'appointment', '❌ Appointment declined.', { isReminder: false });
      await Notification.deleteMany({ userId: appt.user, type: 'appointment', isReminder: true });
    }

    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: 'Failed to respond to appointment', error: err.message });
  }
};

// GET /api/appointments/admin  (list all, admin use)
exports.listAll = async (req, res) => {
  try {
    const items = await Appointment.find({})
      .populate('user', 'name email')
      .populate('supportPerson', 'name title specialization')
      .sort({ date: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch all appointments', error: err.message });
  }
};

// PATCH /api/appointments/:id/status  (admin set explicit status)
exports.setStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'pending' | 'confirmed' | 'declined' | 'cancelled'
    if (!['pending', 'confirmed', 'declined', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    appt.status = status;
    await appt.save();

    // 🔔 mirror the respond() behavior for notifications
    if (status === 'confirmed') {
      await createNotification(appt.user, 'appointment', '✅ Appointment confirmed.', { isReminder: false });
      if (isWithinNextHours(appt.date, 24)) {
        await createNotification(
          appt.user,
          'appointment',
          '⏳ You have an appointment within the next 24 hours.',
          { isReminder: true }
        );
      }
    } else if (status === 'declined') {
      await createNotification(appt.user, 'appointment', '❌ Appointment declined.', { isReminder: false });
      await Notification.deleteMany({ userId: appt.user, type: 'appointment', isReminder: true });
    } else if (status === 'cancelled') {
      await createNotification(appt.user, 'appointment', '🗑️ Appointment cancelled.', { isReminder: false });
      await Notification.deleteMany({ userId: appt.user, type: 'appointment', isReminder: true });
    }

    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
};
