import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPoll, votePoll, deletePoll } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaTrash, FaChartBar, FaRegClock } from 'react-icons/fa';
import CommentSection from '../components/comments/CommentSection';
import moment from 'moment';

const PollDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userVoted, setUserVoted] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  useEffect(() => {
    fetchPollData();
  }, [id]);

  const fetchPollData = async () => {
    try {
      setLoading(true);
      const data = await getPoll(id);
      setPoll(data);
      
      // Check if user has already voted
      const hasVoted = data.options.some(option => 
        option.votes.some(vote => vote.user === user._id)
      );
      
      setUserVoted(hasVoted);
    } catch (error) {
      toast.error('Failed to load poll');
      console.error('Error fetching poll:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (selectedOption === null) {
      return toast.warning('Please select an option to vote');
    }
    
    try {
      const updatedPoll = await votePoll(poll._id, selectedOption);
      setPoll(updatedPoll);
      setUserVoted(true);
      toast.success('Vote recorded!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record vote');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePoll(poll._id);
      toast.success('Poll deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete poll');
    }
  };

  // Calculate total votes and percentages
  const getTotalVotes = () => {
    if (!poll) return 0;
    return poll.options.reduce((total, option) => total + option.votes.length, 0);
  };

  const getVotePercentage = (optionVotes) => {
    const totalVotes = getTotalVotes();
    if (totalVotes === 0) return 0;
    return Math.round((optionVotes.length / totalVotes) * 100);
  };

  // Check if poll has expired
  const isPollExpired = () => {
    if (!poll?.expiresAt) return false;
    return new Date(poll.expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading poll...</p>
      </div>
    );
  }

  return (
    <div className="poll-detail-container">
      <div className="back-link">
        <Link to="/">
          <FaArrowLeft /> Back to polls
        </Link>
      </div>
      
      <div className="poll-card">
        <div className="poll-header">
          <div className="poll-author">
            <img 
              src={poll.author.profilePicture || `https://ui-avatars.com/api/?name=${poll.author.username}`} 
              alt={poll.author.username} 
              className="author-avatar"
            />
            <div>
              <Link to={`/users/${poll.author._id}`} className="author-name">
                {poll.isAnonymous ? "Anonymous" : poll.author.username}
              </Link>
              <p className="poll-timestamp">{moment(poll.createdAt).fromNow()}</p>
            </div>
          </div>
          
          {poll.author._id === user._id && (
            <div className="poll-actions">
              {!deleteConfirm ? (
                <button 
                  className="delete-btn" 
                  onClick={() => setDeleteConfirm(true)}
                >
                  <FaTrash /> Delete
                </button>
              ) : (
                <div className="delete-confirm">
                  <p>Are you sure?</p>
                  <button onClick={handleDelete} className="confirm-yes">Yes</button>
                  <button onClick={() => setDeleteConfirm(false)} className="confirm-no">No</button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <h2 className="poll-question">{poll.question}</h2>
        
        {poll.tags.length > 0 && (
          <div className="poll-tags">
            {poll.tags.map(tag => (
              <span key={tag} className="poll-tag">{tag}</span>
            ))}
          </div>
        )}
        
        {isPollExpired() && (
          <div className="poll-expired">
            <FaRegClock /> This poll has expired
          </div>
        )}
        
        <div className="poll-options">
          {poll.options.map((option, index) => (
            <div 
              key={index} 
              className={`poll-option ${userVoted ? 'voted' : ''} ${selectedOption === index ? 'selected' : ''}`}
              onClick={() => !userVoted && !isPollExpired() && setSelectedOption(index)}
            >
              <div className="option-content">
                <div className="option-text">{option.text}</div>
                {userVoted && (
                  <div className="vote-stats">
                    <div className="vote-count">{option.votes.length} votes</div>
                    <div className="vote-percentage">{getVotePercentage(option.votes)}%</div>
                  </div>
                )}
              </div>
              
              {userVoted && (
                <div 
                  className="vote-bar" 
                  style={{ width: `${getVotePercentage(option.votes)}%` }}
                ></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="poll-footer">
          {!userVoted && !isPollExpired() ? (
            <button onClick={handleVote} className="vote-btn">Vote Now</button>
          ) : (
            <div className="total-votes">
              <FaChartBar /> {getTotalVotes()} total votes
            </div>
          )}
        </div>
      </div>
      
      {poll.allowComments && (
        <CommentSection pollId={poll._id} />
      )}
    </div>
  );
};

export default PollDetail;
