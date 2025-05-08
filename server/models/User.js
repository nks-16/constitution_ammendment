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

// ✅ Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// ✅ Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
