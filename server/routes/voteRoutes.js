const express = require('express');
const { 
  submitVote, 
  getVotesForAmendment,
  getPublicVoteCounts,
  toggleVotingStatus,
  toggleResultsVisibility,
  deleteVote
} = require('../controllers/voteController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, submitVote);
router.get('/:amendmentId', protect, getVotesForAmendment);
router.get('/public/:amendmentId', getPublicVoteCounts);
router.put('/:amendmentId/toggle-voting', protect, toggleVotingStatus);
router.put('/:amendmentId/toggle-results', protect, toggleResultsVisibility);
router.delete('/:voteId', protect, deleteVote);

module.exports = router;