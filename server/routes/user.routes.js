const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  sendFriendRequest,
  acceptFriendRequest,
  searchUsers
} = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/search', protect, searchUsers);
router.put('/profile', protect, updateUserProfile);
router.get('/:id', protect, getUserProfile);
router.post('/:id/friend-request', protect, sendFriendRequest);
router.post('/:id/accept-friend', protect, acceptFriendRequest);

module.exports = router;
