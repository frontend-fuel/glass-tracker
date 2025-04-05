const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const user = new User({ email, password, name });
    await user.save();
    
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid login credentials');
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  res.json(req.user);
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, deviceId, channelId, apiKey } = req.body;
    const user = req.user;

    if (username) user.name = username;
    if (deviceId) user.deviceName = deviceId;
    if (channelId) user.deviceChannelId = channelId;
    if (apiKey) user.deviceApiKey = apiKey;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
