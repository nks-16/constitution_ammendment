const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  sessionToken: { type: String, default: null },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  votes: [
    {
      amendmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Amendment',
        required: true
      },
      hasVoted: { type: Boolean, default: false }
    }
  ]
});
