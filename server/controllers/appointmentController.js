const Appointment = require('../models/Appointment');

// ✅ Book a new appointment
exports.bookAppointment = async (req, res) => {
  const { supportPersonId, date, note } = req.body;
  const userId = req.user.id; // from token

  try {
    const appointment = await Appointment.create({
      user: userId,
      supportPerson: supportPersonId,
      date,
      note,
      status: 'pending'
    });
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to book appointment', details: err.message });
  }
};

// ✅ Fetch current user's appointments
exports.getMyAppointments = async (req, res) => {
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

