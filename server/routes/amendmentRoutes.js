const express = require('express');
const Amendment = require('../models/Amendment');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

// Protected amendment routes
router.get('/', protect, async (req, res) => {
  try {
    const amendments = await Amendment.find().sort({ createdAt: -1 });
    res.json(amendments);
  } catch (err) {
    res.status(500).json({ 
      message: 'Failed to fetch amendments',
      error: err.message 
    });
  }
});

module.exports = router;