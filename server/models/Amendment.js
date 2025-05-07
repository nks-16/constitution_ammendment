const mongoose = require('mongoose');

const amendmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  isVotingOpen: { type: Boolean, default: false },
  showResults: { type: Boolean, default: false },
  yesVotes: { type: Number, default: 0 },
  noVotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Amendment', amendmentSchema);