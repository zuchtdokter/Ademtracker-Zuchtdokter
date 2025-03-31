const mongoose = require('mongoose');

const sleepDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  stressLevel: {
    type: String,
    required: true
  },
  sunlightExposure: {
    type: String,
    required: true
  },
  screenTime: String,
  foodTime: String,
  alcoholTime: String,
  activityTime: String,
  eveningWalk: String,
  sleepDuration: {
    type: Number,
    required: true
  },
  wakeCount: {
    type: Number,
    required: true
  },
  awakeDuration: {
    type: Number,
    required: true
  },
  inputExercises: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index voor snelle queries op datum
sleepDataSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('SleepData', sleepDataSchema); 