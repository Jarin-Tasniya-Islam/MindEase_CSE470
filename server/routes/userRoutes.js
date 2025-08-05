const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getUserById,
  updateProfilePicture
} = require('../controllers/userController');

router.post('/register', register);
router.post('/login', login);
router.get('/:id', getUserById);
router.put('/profile-picture', updateProfilePicture);

module.exports = router;
