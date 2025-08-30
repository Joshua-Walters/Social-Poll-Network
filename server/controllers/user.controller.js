const User = require('../models/User.model');
const Poll = require('../models/Poll.model');
const Notification = require('../models/Notification.model');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -__v')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is private and not a friend
    if (
      user.isPrivate &&
      req.user._id.toString() !== user._id.toString() &&
      !user.friends.some(friend => friend.toString() === req.user._id.toString())
    ) {
      return res.json({
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        isPrivate: user.isPrivate,
      });
    }

    // Get user's polls
    const polls = await Poll.find({ 
      author: user._id,
      $or: [
        { visibility: 'public' },
        { 
          visibility: 'friends', 
          author: { 
            $in: user.friends.some(friend => friend.toString() === req.user._id.toString()) ? [user._id] : [] 
          }
        },
        { 
          visibility: 'private', 
          author: req.user._id.toString() === user._id.toString() ? [user._id] : [] 
        }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      ...user,
      polls,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const { fullName, bio, isPrivate } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.fullName = fullName || user.fullName;
    user.bio = bio !== undefined ? bio : user.bio;
    user.isPrivate = isPrivate !== undefined ? isPrivate : user.isPrivate;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      bio: updatedUser.bio,
      profilePicture: updatedUser.profilePicture,
      isPrivate: updatedUser.isPrivate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send friend request
// @route   POST /api/users/:id/friend-request
// @access  Private
exports.sendFriendRequest = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    if (targetUser.friends.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    // Check if friend request already sent
    if (targetUser.friendRequests.includes(req.user._id)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Add friend request
    targetUser.friendRequests.push(req.user._id);
    await targetUser.save();

    // Create notification
    await Notification.create({
      recipient: targetUser._id,
      sender: req.user._id,
      type: 'friend_request',
      message: `${currentUser.username} sent you a friend request`,
    });

    res.json({ message: 'Friend request sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Accept friend request
// @route   POST /api/users/:id/accept-friend
// @access  Private
exports.acceptFriendRequest = async (req, res) => {
  try {
    const requestUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!requestUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if friend request exists
    if (!currentUser.friendRequests.includes(req.params.id)) {
      return res.status(400).json({ message: 'No friend request from this user' });
    }

    // Add to friends list for both users
    currentUser.friends.push(req.params.id);
    requestUser.friends.push(req.user._id);

    // Remove from friend requests
    currentUser.friendRequests = currentUser.friendRequests.filter(
      id => id.toString() !== req.params.id
    );

    await currentUser.save();
    await requestUser.save();

    // Create notification
    await Notification.create({
      recipient: requestUser._id,
      sender: req.user._id,
      type: 'friend_request',
      message: `${currentUser.username} accepted your friend request`,
    });

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
      ],
    })
      .select('username fullName profilePicture isPrivate')
      .limit(20)
      .lean();

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
