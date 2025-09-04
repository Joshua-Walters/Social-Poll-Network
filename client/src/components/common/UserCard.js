import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaUserPlus, FaLock } from 'react-icons/fa';
import './UserCard.css';

const UserCard = ({ user, onFriendRequest }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/users/${user._id}`);
  };

  const handleFriendRequest = (e) => {
    e.stopPropagation();
    if (onFriendRequest) {
      onFriendRequest(user._id);
    }
  };

  const getImageSrc = () => {
    if (user.profilePicture && user.profilePicture.startsWith('/uploads/')) {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.profilePicture}`;
    }
    return user.profilePicture || `https://ui-avatars.com/api/?name=${user.fullName}&background=random&size=120`;
  };

  return (
    <div className="user-card" onClick={handleViewProfile}>
      <div className="user-avatar">
        <img 
          src={getImageSrc()} 
          alt={user.fullName}
        />
        {user.isPrivate && (
          <div className="privacy-indicator">
            <FaLock />
          </div>
        )}
      </div>
      
      <div className="user-info">
        <h4 className="user-name">{user.fullName}</h4>
        <p className="username">@{user.username}</p>
        {user.bio && (
          <p className="user-bio">{user.bio}</p>
        )}
      </div>

      <div className="user-actions">
        <button 
          className="view-profile-btn"
          onClick={handleViewProfile}
        >
          <FaUser />
          View Profile
        </button>
        {onFriendRequest && (
          <button 
            className="friend-request-btn"
            onClick={handleFriendRequest}
          >
            <FaUserPlus />
            Add Friend
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;