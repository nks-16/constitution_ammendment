const Vote = require('../models/Vote');
const User = require('../models/User');
const Amendment = require('../models/Amendment');
const mongoose = require('mongoose');

// In voteController.js
// Modified submitVote to only count most recent vote
// In voteController.js
// In voteController.js
// controllers/voteController.js
exports.submitVote = async (req, res) => {
  const { amendmentId, choice } = req.body;
  
  try {
    // Validate input
    if (!mongoose.Types.ObjectId.isValid(amendmentId)) {
      return res.status(400).json({ message: 'Invalid amendment ID' });
    }

    // Check if amendment exists and voting is open
    const amendment = await Amendment.findById(amendmentId);
    if (!amendment) {
      return res.status(404).json({ message: 'Amendment not found' });
    }
    if (!amendment.isVotingOpen) {
      return res.status(400).json({ message: 'Voting is closed for this amendment' });
    }

    // Check for existing vote for THIS SPECIFIC amendment
    const existingVote = await Vote.findOne({
      user: req.user._id,
      amendment: amendmentId  // Note we're checking for this specific amendment
    });
    
    if (existingVote) {
      return res.status(400).json({ 
        message: 'You have already voted on this specific amendment',
        existingVoteId: existingVote._id
      });
    }

    // Create and save new vote
    const vote = new Vote({
      user: req.user._id,
      amendment: amendmentId,
      choice
    });
    await vote.save();

    // Update amendment counts
    const update = choice === 'YES' 
      ? { $inc: { yesVotes: 1 } }
      : { $inc: { noVotes: 1 } };
    await Amendment.findByIdAndUpdate(amendmentId, update);

    res.status(201).json({
      message: 'Vote recorded successfully',
      voteId: vote._id,
      amendmentId: amendmentId
    });

  } catch (err) {
    console.error('Vote submission error:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({
        message: 'Database error: Duplicate vote detected',
        error: err.message
      });
    }

    res.status(500).json({
      message: 'Failed to submit vote',
      error: err.message
    });
  }
};
exports.getVotesForAmendment = async (req, res) => {
  const { amendmentId } = req.params;
  try {
    // Only admin can see individual votes
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const votes = await Vote.find({ amendment: amendmentId })
      .populate('user', 'name email')
      .select('choice user createdAt');

    const amendment = await Amendment.findById(amendmentId);
    
    if (!amendment) {
      return res.status(404).json({ message: 'Amendment not found' });
    }

    res.json({
      amendmentTitle: amendment.title,
      isVotingOpen: amendment.isVotingOpen,
      yesVotes: amendment.yesVotes,
      noVotes: amendment.noVotes,
      votes // Detailed votes with user info
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Failed to get votes',
      error: err.message 
    });
  }
};

exports.getPublicVoteCounts = async (req, res) => {
  const { amendmentId } = req.params;
  try {
    const amendment = await Amendment.findById(amendmentId);
    
    if (!amendment) {
      return res.status(404).json({ message: 'Amendment not found' });
    }

    res.json({
      amendmentTitle: amendment.title,
      isVotingOpen: amendment.isVotingOpen,
      yesVotes: amendment.yesVotes,
      noVotes: amendment.noVotes,
      showResults: amendment.showResults
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Failed to get vote counts',
      error: err.message 
    });
  }
};

exports.toggleVotingStatus = async (req, res) => {
  const { amendmentId } = req.params;
  const { isVotingOpen } = req.body;
  
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const amendment = await Amendment.findByIdAndUpdate(
      amendmentId,
      { isVotingOpen },
      { new: true }
    );

    res.json({
      message: `Voting ${amendment.isVotingOpen ? 'opened' : 'closed'} successfully`,
      amendment
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Failed to update voting status',
      error: err.message 
    });
  }
};

exports.toggleResultsVisibility = async (req, res) => {
  const { amendmentId } = req.params;
  const { showResults } = req.body;
  
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const amendment = await Amendment.findByIdAndUpdate(
      amendmentId,
      { showResults },
      { new: true }
    );

    res.json({
      message: `Results visibility ${amendment.showResults ? 'enabled' : 'disabled'}`,
      amendment
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Failed to update results visibility',
      error: err.message 
    });
  }
};

exports.deleteVote = async (req, res) => {
  const { voteId } = req.params;
  
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const vote = await Vote.findByIdAndDelete(voteId);
    
    if (!vote) {
      return res.status(404).json({ message: 'Vote not found' });
    }

    // Update amendment vote counts
    const update = vote.choice === 'YES' 
      ? { $inc: { yesVotes: -1 } } 
      : { $inc: { noVotes: -1 } };
    
    await Amendment.findByIdAndUpdate(vote.amendment, update);

    res.json({ 
      message: 'Vote deleted successfully',
      deletedVote: vote 
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Failed to delete vote',
      error: err.message 
    });
  }
};