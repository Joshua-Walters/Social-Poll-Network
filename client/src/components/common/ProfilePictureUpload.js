import React, { useState } from 'react';
import { uploadProfilePicture } from '../../api';
import { toast } from 'react-toastify';
import { FaCamera, FaUpload } from 'react-icons/fa';
import './ProfilePictureUpload.css';

const ProfilePictureUpload = ({ currentImage, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const result = await uploadProfilePicture(file);
      toast.success('Profile picture updated successfully!');
      setPreview(null);
      if (onUploadSuccess) {
        onUploadSuccess(result.user);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const getImageSrc = () => {
    if (preview) return preview;
    if (currentImage && currentImage.startsWith('/uploads/')) {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${currentImage}`;
    }
    return currentImage || `https://ui-avatars.com/api/?name=User&background=random&size=200`;
  };

  return (
    <div className="profile-picture-upload">
      <div className="image-container">
        <img 
          src={getImageSrc()} 
          alt="Profile" 
          className="profile-image"
        />
        <div className="upload-overlay">
          <input
            type="file"
            id="profile-pic-input"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          <label htmlFor="profile-pic-input" className="upload-button">
            {uploading ? (
              <div className="upload-spinner"></div>
            ) : (
              <>
                <FaCamera />
                <span>Change Photo</span>
              </>
            )}
          </label>
        </div>
      </div>
      {uploading && (
        <div className="upload-progress">
          <FaUpload />
          <span>Uploading...</span>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload;