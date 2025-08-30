import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, getUserProfile } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaEdit, FaUser, FaLock } from 'react-icons/fa';
import PollCard from '../components/polls/PollCard';

const Profile = () => {
  const { user, updateUserContext } = useAuth();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    fullName: '',
    bio: '',
    isPrivate: false
  });
  const [userPolls, setUserPolls] = useState([]);

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile(user._id);
      setProfileData({
        fullName: data.fullName || '',
        bio: data.bio || '',
        isPrivate: data.isPrivate || false
      });
      setUserPolls(data.polls || []);
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData({
      ...profileData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await updateUserProfile(profileData);
      updateUserContext(updatedUser);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
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

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <img 
            src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.fullName}&background=random&size=200`} 
            alt={user.username} 
          />
        </div>
        
        <div className="profile-info">
          {!editMode ? (
            <>
              <h2>{profileData.fullName}</h2>
              <p className="username">@{user.username}</p>
              {profileData.bio && <p className="bio">{profileData.bio}</p>}
              <div className="profile-meta">
                {profileData.isPrivate && (
                  <span className="privacy-badge">
                    <FaLock /> Private Account
                  </span>
                )}
              </div>
              <button className="edit-profile-btn" onClick={() => setEditMode(true)}>
                <FaEdit /> Edit Profile
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="edit-profile-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  rows="3"
                  maxLength="200"
                />
                <p className="character-count">{profileData.bio.length}/200 characters</p>
              </div>
              
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="isPrivate"
                  name="isPrivate"
                  checked={profileData.isPrivate}
                  onChange={handleChange}
                />
                <label htmlFor="isPrivate">Private account (only friends can see your polls)</label>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <div className="profile-content">
        <h3 className="section-title">
          <FaUser /> Your Polls
        </h3>
        
        {userPolls.length > 0 ? (
          <div className="user-polls">
            {userPolls.map(poll => (
              <PollCard key={poll._id} poll={poll} />
            ))}
          </div>
        ) : (
          <div className="no-polls">
            <p>You haven't created any polls yet.</p>
            <button onClick={() => navigate('/create-poll')} className="create-poll-btn">
              Create Your First Poll
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
