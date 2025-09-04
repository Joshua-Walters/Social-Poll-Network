const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { upload, processImage, processProfilePicture } = require('../middlewares/upload.middleware');
const User = require('../models/User.model');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// @desc    Upload profile picture
// @route   POST /api/upload/profile-picture
// @access  Private
router.post('/profile-picture', protect, upload.single('profilePicture'), processProfilePicture, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Update user's profile picture in database
    const imageUrl = `/uploads/profile-pics/${req.file.filename}`;
    
    const user = await User.findById(req.user._id);
    
    // Delete old profile picture if it exists and is not default
    if (user.profilePicture && user.profilePicture !== 'default-avatar.png' && user.profilePicture.startsWith('/uploads/')) {
      const oldImagePath = path.join(__dirname, '../', user.profilePicture);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    user.profilePicture = imageUrl;
    await user.save();

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: imageUrl,
      user: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
        isPrivate: user.isPrivate,
      }
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Upload poll image
// @route   POST /api/upload/poll-image
// @access  Private
router.post('/poll-image', protect, upload.single('pollImage'), processImage, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = `/uploads/poll-images/${req.file.filename}`;
    
    res.json({
      message: 'Poll image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Poll image upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:type/:filename
// @access  Private
router.delete('/:type/:filename', protect, async (req, res) => {
  try {
    const { type, filename } = req.params;
    let filePath;
    
    if (type === 'profile-pics') {
      filePath = path.join(__dirname, '../uploads/profile-pics', filename);
    } else if (type === 'poll-images') {
      filePath = path.join(__dirname, '../uploads/poll-images', filename);
    } else {
      return res.status(400).json({ message: 'Invalid file type' });
    }
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;