import React, { useState, useEffect } from 'react';
import { searchUsers, getPolls } from '../../api';
import { toast } from 'react-toastify';
import { FaSearch, FaUser, FaPoll, FaTags, FaFire } from 'react-icons/fa';
import PollCard from '../polls/PollCard';
import UserCard from './UserCard';
import './SearchDiscovery.css';

const SearchDiscovery = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all'); // all, users, polls, tags
  const [searchResults, setSearchResults] = useState({
    users: [],
    polls: [],
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [trendingTags, setTrendingTags] = useState([
    'Opinion', 'Fun', 'Life', 'Food', 'Movies', 'Music', 'Sports', 'Tech'
  ]);
  const [popularPolls, setPopularPolls] = useState([]);

  useEffect(() => {
    fetchPopularPolls();
  }, []);

  const fetchPopularPolls = async () => {
    try {
      const data = await getPolls(1, 6, 'public');
      setPopularPolls(data.polls || []);
    } catch (error) {
      console.error('Error fetching popular polls:', error);
    }
  };

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) {
      setSearchResults({ users: [], polls: [], tags: [] });
      return;
    }

    setLoading(true);
    try {
      const results = { users: [], polls: [], tags: [] };

      if (searchType === 'all' || searchType === 'users') {
        const userResults = await searchUsers(query);
        results.users = userResults.users || [];
      }

      if (searchType === 'all' || searchType === 'polls') {
        const pollResults = await getPolls(1, 10, 'public', '', query);
        results.polls = pollResults.polls || [];
      }

      if (searchType === 'all' || searchType === 'tags') {
        // Filter trending tags based on query
        results.tags = trendingTags.filter(tag => 
          tag.toLowerCase().includes(query.toLowerCase())
        );
      }

      setSearchResults(results);
    } catch (error) {
      toast.error('Search failed');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    if (query.trim()) {
      const timeoutId = setTimeout(() => handleSearch(query), 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults({ users: [], polls: [], tags: [] });
    }
  };

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
    setSearchType('polls');
    handleSearch(tag);
  };

  const getResultCount = () => {
    return searchResults.users.length + searchResults.polls.length + searchResults.tags.length;
  };

  return (
    <div className="search-discovery">
      <div className="search-header">
        <h2>
          <FaSearch />
          Discover & Search
        </h2>
        <p>Find users, polls, and trending topics</p>
      </div>

      <div className="search-container">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for users, polls, or topics..."
            value={searchQuery}
            onChange={handleInputChange}
            className="search-input"
          />
        </div>
        
        <div className="search-filters">
          <button 
            className={`filter-btn ${searchType === 'all' ? 'active' : ''}`}
            onClick={() => setSearchType('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${searchType === 'users' ? 'active' : ''}`}
            onClick={() => setSearchType('users')}
          >
            <FaUser /> Users
          </button>
          <button 
            className={`filter-btn ${searchType === 'polls' ? 'active' : ''}`}
            onClick={() => setSearchType('polls')}
          >
            <FaPoll /> Polls
          </button>
          <button 
            className={`filter-btn ${searchType === 'tags' ? 'active' : ''}`}
            onClick={() => setSearchType('tags')}
          >
            <FaTags /> Tags
          </button>
        </div>
      </div>

      {loading && (
        <div className="search-loading">
          <div className="loading-spinner"></div>
          <p>Searching...</p>
        </div>
      )}

      {searchQuery && !loading && (
        <div className="search-results">
          <div className="results-header">
            <h3>Results for "{searchQuery}" ({getResultCount()})</h3>
          </div>

          {searchResults.users.length > 0 && (
            <div className="results-section">
              <h4><FaUser /> Users ({searchResults.users.length})</h4>
              <div className="users-grid">
                {searchResults.users.map(user => (
                  <UserCard key={user._id} user={user} />
                ))}
              </div>
            </div>
          )}

          {searchResults.polls.length > 0 && (
            <div className="results-section">
              <h4><FaPoll /> Polls ({searchResults.polls.length})</h4>
              <div className="polls-grid">
                {searchResults.polls.map(poll => (
                  <PollCard key={poll._id} poll={poll} />
                ))}
              </div>
            </div>
          )}

          {searchResults.tags.length > 0 && (
            <div className="results-section">
              <h4><FaTags /> Tags ({searchResults.tags.length})</h4>
              <div className="tags-grid">
                {searchResults.tags.map(tag => (
                  <div key={tag} className="tag-result" onClick={() => handleTagClick(tag)}>
                    #{tag}
                  </div>
                ))}
              </div>
            </div>
          )}

          {getResultCount() === 0 && (
            <div className="no-results">
              <p>No results found for "{searchQuery}"</p>
              <p>Try different keywords or browse trending content below.</p>
            </div>
          )}
        </div>
      )}

      {!searchQuery && (
        <div className="discovery-content">
          <div className="trending-section">
            <h3>
              <FaFire />
              Trending Topics
            </h3>
            <div className="trending-tags">
              {trendingTags.map(tag => (
                <div 
                  key={tag} 
                  className="trending-tag"
                  onClick={() => handleTagClick(tag)}
                >
                  #{tag}
                </div>
              ))}
            </div>
          </div>

          <div className="popular-section">
            <h3>
              <FaPoll />
              Popular Polls
            </h3>
            <div className="popular-polls">
              {popularPolls.map(poll => (
                <PollCard key={poll._id} poll={poll} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDiscovery;