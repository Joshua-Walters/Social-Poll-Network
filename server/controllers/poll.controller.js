const Poll = require('../models/Poll.model');
const User = require('../models/User.model');
const Notification = require('../models/Notification.model');

// @desc    Create a new poll
// @route   POST /api/polls
// @access  Private
exports.createPoll = async (req, res) => {
  try {
    const { question, options, isAnonymous, tags, expiresAt, visibility } = req.body;

    if (!question || !options || options.length < 2) {
      return res.status(400).json({ message: 'Question and at least two options are required' });
    }

    const formattedOptions = options.map(option => ({
      text: option,
      votes: [],
    }));

    const poll = await Poll.create({
      author: req.user._id,
      question,
      options: formattedOptions,
      isAnonymous: isAnonymous || false,
      tags: tags || [],
      expiresAt: expiresAt || null,
      visibility: visibility || 'public',
    });

    const populatedPoll = await Poll.findById(poll._id).populate('author', 'username profilePicture');

    res.status(201).json(populatedPoll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all polls (with pagination and filters)
// @route   GET /api/polls
// @access  Private
exports.getPolls = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;
    const { visibility = 'public', tag } = req.query;
    
    const query = { visibility };
    
    // If looking for friends-only content, include user's friends
    if (visibility === 'friends') {
      const user = await User.findById(req.user._id);
      query.author = { $in: [...user.friends, req.user._id] };
    }
    
    // Filter by tag if provided
    if (tag) {
      query.tags = tag;
    }

    const polls = await Poll.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skipIndex)
      .populate('author', 'username profilePicture')
      .lean();

    // Count total documents for pagination info
    const totalPolls = await Poll.countDocuments(query);

    res.json({
      polls,
      currentPage: page,
      totalPages: Math.ceil(totalPolls / limit),
      totalPolls,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get poll by ID
// @route   GET /api/polls/:id
// @access  Private
exports.getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id)
      .populate('author', 'username profilePicture')
      .lean();

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user has permission to view this poll
    if (poll.visibility === 'private' && poll.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this poll' });
    }

    if (poll.visibility === 'friends') {
      const user = await User.findById(req.user._id);
      if (
        poll.author._id.toString() !== req.user._id.toString() &&
        !user.friends.includes(poll.author._id)
      ) {
        return res.status(403).json({ message: 'Not authorized to view this poll' });
      }
    }

    res.json(poll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Vote on a poll
// @route   POST /api/polls/:id/vote
// @access  Private
exports.votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: 'Invalid option index' });
    }

    // Check if user has already voted
    const hasVoted = poll.options.some(option => 
      option.votes.some(vote => vote.user.toString() === req.user._id.toString())
    );

    if (hasVoted) {
      return res.status(400).json({ message: 'You have already voted on this poll' });
    }

    // Add vote
    poll.options[optionIndex].votes.push({ user: req.user._id });
    await poll.save();

    // Create notification for poll author if it's not the voter
    if (poll.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: poll.author,
        sender: req.user._id,
        type: 'poll_vote',
        pollId: poll._id,
        message: `${req.user.username} voted on your poll: "${poll.question.substring(0, 30)}${poll.question.length > 30 ? '...' : ''}"`,
      });
    }

    // Return updated poll with author details
    const updatedPoll = await Poll.findById(poll._id)
      .populate('author', 'username profilePicture')
      .lean();

    res.json(updatedPoll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a poll
// @route   DELETE /api/polls/:id
// @access  Private
exports.deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user is the author
    if (poll.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this poll' });
    }

    await poll.remove();
    res.json({ message: 'Poll removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
