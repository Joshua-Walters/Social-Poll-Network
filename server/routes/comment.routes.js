const express = require('express');
const {
  createComment,
  getPollComments,
  deleteComment,
  toggleLikeComment
} = require('../controllers/comment.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', protect, createComment);
router.get('/poll/:pollId', protect, getPollComments);
router.delete('/:id', protect, deleteComment);
router.put('/:id/like', protect, toggleLikeComment);

module.exports = router;
