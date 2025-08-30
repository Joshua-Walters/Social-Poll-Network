const express = require('express');
const { 
  createPoll, 
  getPolls, 
  getPollById, 
  votePoll,
  deletePoll
} = require('../controllers/poll.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.route('/')
  .post(protect, createPoll)
  .get(protect, getPolls);

router.route('/:id')
  .get(protect, getPollById)
  .delete(protect, deletePoll);

router.post('/:id/vote', protect, votePoll);

module.exports = router;
