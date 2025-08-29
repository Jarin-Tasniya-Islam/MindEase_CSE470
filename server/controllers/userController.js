const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
// REGISTER
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body; // ✅ include role
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      passwordHash,
      userId: Date.now().toString(),
      role: role || 'user' // ✅ default is user
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid email or password' });

    // ✅ include role in the token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // ✅ also return the role to the client
    res.json({
      token,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture || ''
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
};

// UPDATE profile picture
exports.updateProfilePicture = async (req, res) => {
  try {
    const { userId, profilePicture } = req.body;
    const updated = await User.findByIdAndUpdate(userId, { profilePicture }, { new: true });
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Profile picture updated', profilePicture: updated.profilePicture });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update picture', error: err.message });
  }
};
