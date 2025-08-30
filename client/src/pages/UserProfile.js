import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserProfile, sendFriendRequest, acceptFriendRequest } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUserPlus, FaUserCheck, FaLock, FaArrowLeft } from 'react-icons/fa';
import PollCard from '../components/polls/PollCard';

const UserProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile(id);
      setProfile(data);
      
      // Check friendship status
      if (user._id === id) {
        // This is the current user
      } else if (user.friends && user.friends.includes(id)) {
        setIsFriend(true);
      } else if (data.friendRequests && data.friendRequests.includes(user._id)) {
        setFriendRequestSent(true);
      } else if (user.friendRequests && user.friendRequests.includes(id)) {
        setHasPendingRequest(true);
      }
    } catch (error) {
      toast.error('Failed to load user profile');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      await sendFriendRequest(id);
      setFriendRequestSent(true);
      toast.success('Friend request sent!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send friend request');
    }
  };

  const handleAcceptFriendRequest = async () => {
    try {
      await acceptFriendRequest(id);
      setIsFriend(true);
      setHasPendingRequest(false);
      toast.success('Friend request accepted!');
    } catch (error) {
      toast.error('Failed to accept friend request');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  // If it's a private profile and we're not friends, show limited info
  const isPrivateAndNotFriend = profile.isPrivate && !isFriend && user._id !== id;

  return (
    <div className="user-profile-container">
      <div className="back-link">
        <Link to="/">
          <FaArrowLeft /> Back
        </Link>
      </div>
      
      <div className="profile-header">
        <div className="profile-avatar">
          <img 
            src={profile.profilePicture || `https://ui-avatars.com/api/?name=${profile.fullName}&background=random&size=200`} 
            alt={profile.username} 
          />
        </div>
        
        <div className="profile-info">
          <h2>{profile.fullName}</h2>
          <p className="username">@{profile.username}</p>
          
          {!isPrivateAndNotFriend && profile.bio && (
            <p className="bio">{profile.bio}</p>
          )}
          
          <div className="profile-meta">
            {profile.isPrivate && (
              <span className="privacy-badge">
                <FaLock /> Private Account
              </span>
            )}
          </div>
          
          {user._id !== id && (
            <div className="friend-actions">
              {isFriend ? (
                <span className="friend-status">
                  <FaUserCheck /> Friends
                </span>
              ) : friendRequestSent ? (
                <span className="friend-status pending">
                  Friend Request Sent
                </span>
              ) : hasPendingRequest ? (
                <button className="accept-friend-btn" onClick={handleAcceptFriendRequest}>
                  Accept Friend Request
                </button>
              ) : (
                <button className="add-friend-btn" onClick={handleSendFriendRequest}>
                  <FaUserPlus /> Add Friend
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {!isPrivateAndNotFriend && (
        <div className="profile-content">
          <h3 className="section-title">
            {profile.fullName}'s Polls
          </h3>
          
          {profile.polls && profile.polls.length > 0 ? (
            <div className="user-polls">
              {profile.polls.map(poll => (
                <PollCard key={poll._id} poll={poll} />
              ))}
            </div>
          ) : (
            <div className="no-polls">
              <p>No polls available.</p>
            </div>
          )}
        </div>
      )}
      
      {isPrivateAndNotFriend && (
        <div className="private-account-message">
          <FaLock size={48} />
          <h3>This account is private</h3>
          <p>Send a friend request to view {profile.fullName}'s polls and activities.</p>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
