const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#60A5FA'
  },
  status: {
    type: String,
    enum: ['sent', 'seen'],
    default: 'sent'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);