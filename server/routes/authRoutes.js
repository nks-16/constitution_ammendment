const express = require('express');
const authController = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

// Add this route
router.get('/check', protect, (req, res) => {
  res.json({ message: 'Authenticated' });
});

// Your existing routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', protect, authController.logout);
router.post('/create-admin', authController.createAdmin);

module.exports = router;