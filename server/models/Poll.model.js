const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    image: {
      type: String, // URL to uploaded image
    },
    options: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
        },
        image: {
          type: String, // URL to option image
        },
        votes: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
            },
          },
        ],
      },
    ],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    expiresAt: {
      type: Date,
    },
    allowComments: {
      type: Boolean,
      default: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Poll', PollSchema);
