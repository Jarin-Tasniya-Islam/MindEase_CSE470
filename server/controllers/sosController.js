// server/controllers/sosController.js
const SOSPlan = require('../models/SOSPlan');

exports.getMyPlan = async (req, res) => {
  try {
    const plan = await SOSPlan.findOne({ user: req.user.id });
    return res.json({ plan });
  } catch {
    return res.status(500).json({ message: 'Failed to fetch SOS plan' });
  }
};

exports.upsertMyPlan = async (req, res) => {
  try {
    const { title, steps, contacts, safetyTools, notes } = req.body;

    const safeSteps = Array.isArray(steps)
      ? steps
          .filter(s => s && typeof s.text === 'string')
          .map(s => ({ order: Number(s.order ?? 0), text: String(s.text).trim() }))
          .sort((a, b) => a.order - b.order)
      : [];

    const safeContacts = Array.isArray(contacts)
      ? contacts
          .filter(c => c && typeof c.name === 'string')
          .map(c => ({
            name: String(c.name).trim(),
            relation: String(c.relation || '').trim(),
            phone: String(c.phone || '').trim(),
            email: String(c.email || '').trim(),
          }))
      : [];

    const safeSafety = Array.isArray(safetyTools)
      ? safetyTools.map(x => String(x).trim()).filter(Boolean)
      : [];

    const update = {
      title: String(title || 'My SOS Plan'),
      steps: safeSteps,
      contacts: safeContacts,
      safetyTools: safeSafety,
      notes: String(notes || ''),
      user: req.user.id,
    };

    const plan = await SOSPlan.findOneAndUpdate(
      { user: req.user.id },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ plan, message: 'SOS plan saved' });
  } catch (err) {
    console.error('❌ SOSPlan save error:', err);
    return res.status(500).json({ message: 'Failed to save SOS plan', error: err.message, stack: err.stack });
  }
};

exports.deleteMyPlan = async (_req, res) => {
  try {
    await SOSPlan.findOneAndDelete({ user: _req.user.id });
    return res.json({ message: 'SOS plan deleted' });
  } catch {
    return res.status(500).json({ message: 'Failed to delete SOS plan' });
  }
};
