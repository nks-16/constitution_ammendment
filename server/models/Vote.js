// models/Vote.js

const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  amendment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Amendment',
    required: true 
  },
  choice: { 
    type: String, 
    enum: ['YES', 'NO'], 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Ensure a user can vote only once per amendment
voteSchema.index({ user: 1, amendment: 1 }, { unique: true });

// Export the model
const Vote = mongoose.model('Vote', voteSchema);
module.exports = Vote;
