const mongoose = require('mongoose');

const supportPersonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: String,
  specialization: String
});

module.exports = mongoose.model('SupportPerson', supportPersonSchema);
