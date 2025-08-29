const Appointment = require('../models/Appointment');
const SupportPerson = require('../models/SupportPerson');

exports.book = async (req, res) => {
  try {
    const userId = req.user.id;
    const { supportPersonId, date, note } = req.body;

    const sp = await SupportPerson.findById(supportPersonId);
    if (!sp) return res.status(404).json({ message: 'Support person not found' });

    const when = new Date(date);
    if (Number.isNaN(when.getTime())) {
      return res.status(400).json({ message: 'Invalid date' });
    }

    const appt = await Appointment.create({
      user: userId,
      supportPerson: sp._id,
      providerName: sp.name,
      providerType: sp.title || sp.type || 'Support',
      date: when,
      note: note || '',
      status: 'pending'
    });

    res.status(201).json(appt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to book appointment', error: err.message });
  }
};

// current user's appointments
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
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel appointment', error: err.message });
  }
};

exports.forSupportPerson = async (req, res) => {
  try {
    const spId = req.query.supportPersonId || req.user.id;
    const appts = await Appointment.find({ supportPerson: spId }).sort({ date: 1 });
    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch support appointments', error: err.message });
  }
};

exports.respond = async (req, res) => {
  try {
    const { action } = req.body; // 'confirm' | 'decline'
    if (!['confirm', 'decline'].includes(action)) return res.status(400).json({ message: 'Invalid action' });

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    appt.status = action === 'confirm' ? 'confirmed' : 'declined';
    await appt.save();
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: 'Failed to respond to appointment', error: err.message });
  }
};
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

// Set status (admin) -> body: { status: 'confirmed' | 'declined' | 'cancelled' | 'pending' }
exports.setStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'declined', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    appt.status = status;
    await appt.save();
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
};