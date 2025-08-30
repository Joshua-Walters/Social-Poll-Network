import React, { useState, useEffect } from 'react';
import { getPolls } from '../api';
import PollCard from '../components/polls/PollCard';
import { toast } from 'react-toastify';
import { FaUsers, FaUserFriends, FaFilter } from 'react-icons/fa';

const Home = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibility, setVisibility] = useState('public');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTag, setActiveTag] = useState('');
  
  const popularTags = ['Opinions', 'Friends', 'Life', 'Food', 'Movies', 'Music', 'Sports'];
  
  useEffect(() => {
    fetchPolls();
  }, [visibility, currentPage, activeTag]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const data = await getPolls(currentPage, 10, visibility, activeTag);
      setPolls(data.polls);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Failed to load polls');
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="home-container">
      <div className="feed-container">
        <div className="feed-header">
          <div className="visibility-toggle">
            <button 
              className={`visibility-btn ${visibility === 'public' ? 'active' : ''}`}
              onClick={() => setVisibility('public')}
            >
              <FaUsers /> Public
            </button>
            <button 
              className={`visibility-btn ${visibility === 'friends' ? 'active' : ''}`}
              onClick={() => setVisibility('friends')}
            >
              <FaUserFriends /> Friends
            </button>
          </div>
          
          <div className="tags-filter">
            <p className="tags-title"><FaFilter /> Filter by tags:</p>
            <div className="tags-list">
              <button 
                className={`tag-pill ${activeTag === '' ? 'active' : ''}`}
                onClick={() => setActiveTag('')}
              >
                All
              </button>
              {popularTags.map(tag => (
                <button 
                  key={tag}
                  className={`tag-pill ${activeTag === tag ? 'active' : ''}`}
                  onClick={() => setActiveTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading polls...</p>
          </div>
        ) : polls.length > 0 ? (
          <div className="polls-list">
            {polls.map(poll => (
              <PollCard key={poll._id} poll={poll} />
            ))}
            
            <div className="pagination">
              <button 
                onClick={handlePreviousPage} 
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="page-indicator">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div className="no-polls">
            <h3>No polls available</h3>
            <p>
              {visibility === 'public' 
                ? "No public polls found. Be the first to create one!" 
                : "No polls from your friends yet. Add some friends or switch to public polls."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
