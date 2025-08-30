const Comment = require('../models/Comment.model');
const Poll = require('../models/Poll.model');
const Notification = require('../models/Notification.model');

// @desc    Add comment to poll
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res) => {
  try {
    const { pollId, content, parentCommentId } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if comments are allowed on this poll
    if (!poll.allowComments) {
      return res.status(403).json({ message: 'Comments are disabled for this poll' });
    }

    // Create the comment
    const comment = await Comment.create({
      poll: pollId,
      author: req.user._id,
      content,
      parentComment: parentCommentId || null,
    });

    // Populate the author details
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username profilePicture')
      .lean();

    // Create notification for poll author (if not the commenter)
    if (poll.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: poll.author,
        sender: req.user._id,
        type: 'comment',
        pollId: poll._id,
        commentId: comment._id,
        message: `${req.user.username} commented on your poll`,
      });
    }

    // If this is a reply to another comment, notify that comment's author
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (parentComment && parentComment.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: parentComment.author,
          sender: req.user._id,
          type: 'comment',
          pollId: poll._id,
          commentId: comment._id,
          message: `${req.user.username} replied to your comment`,
        });
      }
    }

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get comments for poll
// @route   GET /api/comments/poll/:pollId
// @access  Private
exports.getPollComments = async (req, res) => {
  try {
    const { pollId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skipIndex = (page - 1) * limit;

    // Get top-level comments first
    const comments = await Comment.find({
      poll: pollId,
      parentComment: null,
    })
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(limit)
      .populate('author', 'username profilePicture')
      .lean();

    // Get replies for each top-level comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          parentComment: comment._id,
        })
          .sort({ createdAt: 1 })
          .populate('author', 'username profilePicture')
          .lean();
        
        return { ...comment, replies };
      })
    );

    const totalComments = await Comment.countDocuments({
      poll: pollId,
      parentComment: null,
    });

    res.json({
      comments: commentsWithReplies,
      currentPage: page,
      totalPages: Math.ceil(totalComments / limit),
      totalComments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the comment author
    if (comment.author.toString() !== req.user._id.toString()) {
      // Check if user is the poll author
      const poll = await Poll.findById(comment.poll);
      if (poll.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this comment' });
      }
    }

    // Delete comment and all replies
    await Comment.deleteMany({
      $or: [
        { _id: req.params.id },
        { parentComment: req.params.id },
      ],
    });

    res.json({ message: 'Comment and all replies removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Like/unlike comment
// @route   PUT /api/comments/:id/like
// @access  Private
exports.toggleLikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user has already liked the comment
    const likeIndex = comment.likes.indexOf(req.user._id);
    
    if (likeIndex === -1) {
      // Add like
      comment.likes.push(req.user._id);
      
      // Create notification (if not liking own comment)
      if (comment.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: comment.author,
          sender: req.user._id,
          type: 'comment',
          pollId: comment.poll,
          commentId: comment._id,
          message: `${req.user.username} liked your comment`,
        });
      }
    } else {
      // Remove like
      comment.likes.splice(likeIndex, 1);
    }

    await comment.save();

    res.json({ 
      likes: comment.likes.length, 
      hasLiked: likeIndex === -1, 
      commentId: comment._id 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
