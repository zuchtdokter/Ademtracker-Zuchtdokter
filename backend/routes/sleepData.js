const express = require('express');
const SleepData = require('../models/SleepData');
const { auth, isTherapist } = require('../middleware/auth');

const router = express.Router();

// Slaapdata opslaan
router.post('/', auth, async (req, res) => {
  try {
    const sleepData = new SleepData({
      ...req.body,
      userId: req.user._id
    });
    await sleepData.save();
    res.status(201).json(sleepData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Slaapdata ophalen voor een specifieke gebruiker
router.get('/user/:userId', auth, isTherapist, async (req, res) => {
  try {
    const sleepData = await SleepData.find({ userId: req.params.userId })
      .sort({ date: -1 });
    res.json(sleepData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eigen slaapdata ophalen
router.get('/my-data', auth, async (req, res) => {
  try {
    const sleepData = await SleepData.find({ userId: req.user._id })
      .sort({ date: -1 });
    res.json(sleepData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Slaapdata updaten
router.patch('/:id', auth, async (req, res) => {
  try {
    const sleepData = await SleepData.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!sleepData) {
      return res.status(404).json({ error: 'Sleep data not found' });
    }

    Object.assign(sleepData, req.body);
    await sleepData.save();
    res.json(sleepData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Slaapdata verwijderen
router.delete('/:id', auth, async (req, res) => {
  try {
    const sleepData = await SleepData.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!sleepData) {
      return res.status(404).json({ error: 'Sleep data not found' });
    }

    res.json({ message: 'Sleep data deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 