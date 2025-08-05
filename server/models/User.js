const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  userId: { type: String, required: true, unique: true },
  profilePicture: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
