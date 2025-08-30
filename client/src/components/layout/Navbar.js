import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaPlusCircle, FaBell, FaHome, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { searchUsers } from '../../api';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim().length > 0) {
      try {
        const users = await searchUsers(searchQuery);
        setSearchResults(users);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    }
  };

  const handleUserClick = (userId) => {
    setShowSearchResults(false);
    setSearchQuery('');
    navigate(`/users/${userId}`);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          PollSocial
        </Link>

        {user ? (
          <>
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                />
                <button type="submit" className="search-button">
                  <FaSearch />
                </button>

                {showSearchResults && (
                  <div className="search-results">
                    {searchResults.length > 0 ? (
                      searchResults.map((user) => (
                        <div
                          key={user._id}
                          className="search-result-item"
                          onClick={() => handleUserClick(user._id)}
                        >
                          <img
                            src={`https://ui-avatars.com/api/?name=${user.fullName}&background=random`}
                            alt={user.username}
                            className="user-avatar-small"
                          />
                          <div>
                            <p className="user-fullname">{user.fullName}</p>
                            <p className="user-username">@{user.username}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-results">No users found</p>
                    )}
                  </div>
                )}
              </div>
            </form>

            <div className="navbar-links">
              <Link to="/" className="navbar-link">
                <FaHome />
                <span className="nav-text">Home</span>
              </Link>
              
              <Link to="/create-poll" className="navbar-link">
                <FaPlusCircle />
                <span className="nav-text">New Poll</span>
              </Link>

              <div className="navbar-user-menu">
                <button
                  className="user-menu-button"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <img
                    src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`}
                    alt={user.username}
                    className="user-avatar"
                  />
                </button>

                {showDropdown && (
                  <div className="dropdown-menu">
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <FaUser />
                      <span>Profile</span>
                    </Link>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="btn-link">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
