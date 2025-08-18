// server/models/SOSPlan.js
const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    relation: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
  },
  { _id: false }
);

const StepSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    text: { type: String, required: true },
  },
  { _id: false }
);

const SOSPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    title: { type: String, default: 'My SOS Plan' },
    steps: { type: [StepSchema], default: [] },
    contacts: { type: [ContactSchema], default: [] },
    safetyTools: { type: [String], default: [] },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SOSPlan', SOSPlanSchema);
