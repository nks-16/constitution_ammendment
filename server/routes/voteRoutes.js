const express = require('express');
const { 
  submitVote, 
  getVotesForAmendment,
  getPublicVoteCounts,
  toggleVotingStatus,
  toggleResultsVisibility,
  deleteVote,
  hasUserVoted,
  markUserAsVoted
} = require('../controllers/voteController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, submitVote);
router.get('/public/:amendmentId', getPublicVoteCounts);
router.put('/:amendmentId/mark-as-voted', protect, markUserAsVoted);
router.get('/:amendmentId', protect, getVotesForAmendment);
router.put('/:amendmentId/toggle-voting', protect, toggleVotingStatus);
router.put('/:amendmentId/toggle-results', protect, toggleResultsVisibility);
router.delete('/:voteId', protect, deleteVote);
router.get('/:amendmentId/has-voted', protect, hasUserVoted);

module.exports = router;