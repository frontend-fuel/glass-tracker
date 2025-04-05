const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const thingspeak = require('../utils/thingspeak');

const router = express.Router();

// Pair a new device
router.post('/', auth, async (req, res) => {
  try {
    const { channelId, apiKey, name } = req.body;
    
    // Check if device is already paired with any user
    const existingUser = await User.findOne({ deviceChannelId: channelId });
    if (existingUser) {
      return res.status(400).json({ error: 'This device is already paired with another account' });
    }

    const user = req.user;
    user.deviceChannelId = channelId;
    user.deviceApiKey = apiKey;
    user.deviceName = name || 'My Smart Glasses';
    
    // Set ThingSpeak credentials and get current location
    try {
      thingspeak.setCredentials(channelId, apiKey);
      const location = await thingspeak.getLatestLocation();
      if (location) {
        user.lastLocation = location;
      }
    } catch (error) {
      console.error('Error fetching initial location:', error);
      // Continue without location
    }
    
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get user's device
router.get('/', auth, async (req, res) => {
  try {
    const user = req.user;
    console.log('Fetching device for user:', user._id);
    
    if (!user.deviceChannelId) {
      return res.json([]);
    }
    
    // Update location from ThingSpeak
    try {
      thingspeak.setCredentials(user.deviceChannelId, user.deviceApiKey);
      const location = await thingspeak.getLatestLocation();
      if (location) {
        user.lastLocation = location;
        await user.save();
        console.log(`Updated location for user ${user._id}:`, location);
      } else {
        console.log(`No location data available for user ${user._id}`);
      }
    } catch (error) {
      console.error(`Error updating location for user ${user._id}:`, error);
    }
    
    // Return device info in the same format as before for compatibility
    const deviceInfo = user.deviceChannelId ? [{
      channelId: user.deviceChannelId,
      apiKey: user.deviceApiKey,
      name: user.deviceName,
      lastLocation: user.lastLocation
    }] : [];
    
    res.json(deviceInfo);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get location history
router.get('/history', auth, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.deviceChannelId) {
      return res.status(404).json({ error: 'No device paired' });
    }
    
    const minutes = parseInt(req.query.minutes) || 60;
    console.log(`Fetching location history for user ${user._id}, last ${minutes} minutes`);
    
    thingspeak.setCredentials(user.deviceChannelId, user.deviceApiKey);
    const history = await thingspeak.getLocationHistory(minutes);
    console.log(`Found ${history.length} location points`);
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching location history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Trigger buzzer
router.post('/buzzer', auth, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.deviceChannelId) {
      return res.status(404).json({ error: 'No device paired' });
    }

    console.log(`Triggering buzzer for user ${user._id}`);
    thingspeak.setCredentials(user.deviceChannelId, user.deviceApiKey);
    const success = await thingspeak.triggerBuzzer();
    
    if (success) {
      console.log('Buzzer triggered successfully');
      res.json({ message: 'Buzzer triggered successfully' });
    } else {
      console.log('Failed to trigger buzzer');
      res.status(500).json({ error: 'Failed to trigger buzzer' });
    }
  } catch (error) {
    console.error('Error triggering buzzer:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
