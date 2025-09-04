import React from 'react';
import { Link } from 'react-router-dom';
import { FaCommentAlt, FaPoll } from 'react-icons/fa';
import moment from 'moment';
import './PollCard.css';

const PollCard = ({ poll }) => {
  const getTotalVotes = () => {
    return poll.options.reduce((total, option) => total + option.votes.length, 0);
  };

  const isPollExpired = () => {
    if (!poll.expiresAt) return false;
    return new Date(poll.expiresAt) < new Date();
  };

  return (
    <div className="poll-card">
      <div className="poll-card-header">
        <Link to={`/users/${poll.author._id}`} className="poll-author">
          <img 
            src={poll.author.profilePicture || `https://ui-avatars.com/api/?name=${poll.author.username}`} 
            alt={poll.author.username} 
            className="author-avatar"
          />
          <span>{poll.isAnonymous ? 'Anonymous' : poll.author.username}</span>
        </Link>
        <span className="poll-timestamp">{moment(poll.createdAt).fromNow()}</span>
      </div>

      <Link to={`/polls/${poll._id}`} className="poll-card-content">
        <h3 className="poll-question">{poll.question}</h3>
        {poll.description && (
          <p className="poll-description">{poll.description}</p>
        )}
        {poll.image && (
          <div className="poll-image">
            <img 
              src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${poll.image}`}
              alt="Poll"
            />
          </div>
        )}
        <div className="poll-tags">
          {poll.tags.map(tag => (
            <span key={tag} className="poll-tag">#{tag}</span>
          ))}
        </div>
      </Link>

      <div className="poll-card-footer">
        <div className="poll-stats">
          <span className="poll-votes">
            <FaPoll /> {getTotalVotes()} votes
          </span>
          <span className="poll-visibility">
            {poll.visibility === 'public' ? 'Public' : 
             poll.visibility === 'friends' ? 'Friends' : 'Private'}
          </span>
        </div>
        
        <Link to={`/polls/${poll._id}`} className="view-poll-btn">
          {isPollExpired() ? 'View Results' : 'Vote Now'}
        </Link>
      </div>
    </div>
  );
};

export default PollCard;
