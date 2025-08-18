const mongoose = require('mongoose');

const selfCareTaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskType: { type: String, required: true }, // e.g., hydration, exercise
  completed: { type: Boolean, default: false }
}, { timestamps: true }); // ✅ Enables createdAt for daily reminder checks

module.exports = mongoose.model('SelfCareTask', selfCareTaskSchema);
