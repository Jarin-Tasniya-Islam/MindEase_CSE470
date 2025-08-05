const mongoose = require('mongoose');

const selfCareTaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskType: { type: String, required: true }, // e.g., hydration, exercise
  date: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false }
});

module.exports = mongoose.model('SelfCareTask', selfCareTaskSchema);
