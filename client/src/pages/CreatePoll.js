import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPoll, uploadPollImage } from '../api';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaImage, FaTimes } from 'react-icons/fa';
import './CreatePoll.css';

const CreatePoll = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    description: '',
    options: ['', ''],
    isAnonymous: false,
    tags: [],
    visibility: 'public',
    expiresAt: '',
    image: null,
  });
  const [tagInput, setTagInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData({
        ...formData,
        options: [...formData.options, ''],
      });
    } else {
      toast.warning('You can only add up to 10 options.');
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    } else {
      toast.warning('A poll must have at least 2 options.');
    }
  };

  const addTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      if (formData.tags.length < 5) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim()],
        });
        setTagInput('');
      } else {
        toast.warning('You can only add up to 5 tags.');
      }
    }
  };

  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleImageUpload = async (event) => {
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

    setUploadingImage(true);
    try {
      const result = await uploadPollImage(file);
      setFormData({ ...formData, image: result.imageUrl });
      setImagePreview(result.imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.question.trim()) {
      return toast.error('Please enter a question.');
    }
    
    if (formData.options.some(option => !option.trim())) {
      return toast.error('All poll options must have content.');
    }
    
    setLoading(true);
    
    try {
      const poll = await createPoll(formData);
      toast.success('Poll created successfully!');
      navigate(`/polls/${poll._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create poll.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-poll-container">
      <div className="create-poll-card">
        <h2>Create a New Poll</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="question">Question</label>
            <textarea
              id="question"
              name="question"
              value={formData.question}
              onChange={handleChange}
              placeholder="Ask something interesting..."
              rows="3"
              maxLength="300"
              required
            />
            <p className="character-count">
              {formData.question.length}/300 characters
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add more context to your poll..."
              rows="2"
              maxLength="500"
            />
            <p className="character-count">
              {formData.description.length}/500 characters
            </p>
          </div>

          <div className="form-group">
            <label>Poll Image (Optional)</label>
            <div className="image-upload-section">
              {!imagePreview ? (
                <div className="image-upload-area">
                  <input
                    type="file"
                    id="poll-image-input"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="poll-image-input" className="image-upload-button">
                    {uploadingImage ? (
                      <div className="upload-spinner"></div>
                    ) : (
                      <>
                        <FaImage />
                        <span>Add Image</span>
                      </>
                    )}
                  </label>
                </div>
              ) : (
                <div className="image-preview">
                  <img 
                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imagePreview}`} 
                    alt="Poll" 
                  />
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={removeImage}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Options</label>
            {formData.options.map((option, index) => (
              <div key={index} className="option-input-group">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    className="remove-option-btn"
                    onClick={() => removeOption(index)}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            
            {formData.options.length < 10 && (
              <button 
                type="button" 
                className="add-option-btn"
                onClick={addOption}
              >
                <FaPlus /> Add Option
              </button>
            )}
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tag-input-group">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag (press Enter)"
                onKeyPress={(e) => e.key === 'Enter' && addTag(e)}
              />
              <button 
                type="button"
                onClick={addTag}
                className="add-tag-btn"
              >
                Add
              </button>
            </div>
            
            <div className="tags-container">
              {formData.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                  <button
                    type="button"
                    className="remove-tag-btn"
                    onClick={() => removeTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="visibility">Visibility</label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
            >
              <option value="public">Public (Everyone)</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private (Only Me)</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="isAnonymous"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleChange}
            />
            <label htmlFor="isAnonymous">Anonymous voting (hide who voted for what)</label>
          </div>

          <div className="form-group">
            <label htmlFor="expiresAt">Poll Expiry (Optional)</label>
            <input
              type="datetime-local"
              id="expiresAt"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="helper-text">Leave blank if you don't want the poll to expire</p>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePoll;
