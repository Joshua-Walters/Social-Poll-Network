import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API calls
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Poll API calls
export const createPoll = async (pollData) => {
  const response = await api.post('/polls', pollData);
  return response.data;
};

export const getPolls = async (page = 1, limit = 10, visibility = 'public', tag = '') => {
  const response = await api.get('/polls', { 
    params: { page, limit, visibility, tag } 
  });
  return response.data;
};

export const getPoll = async (pollId) => {
  const response = await api.get(`/polls/${pollId}`);
  return response.data;
};

export const votePoll = async (pollId, optionIndex) => {
  const response = await api.post(`/polls/${pollId}/vote`, { optionIndex });
  return response.data;
};

export const deletePoll = async (pollId) => {
  const response = await api.delete(`/polls/${pollId}`);
  return response.data;
};

// User API calls
export const getUserProfile = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

export const sendFriendRequest = async (userId) => {
  const response = await api.post(`/users/${userId}/friend-request`);
  return response.data;
};

export const acceptFriendRequest = async (userId) => {
  const response = await api.post(`/users/${userId}/accept-friend`);
  return response.data;
};

export const searchUsers = async (query) => {
  const response = await api.get('/users/search', { params: { query } });
  return response.data;
};

// Comment API calls
export const createComment = async (commentData) => {
  const response = await api.post('/comments', commentData);
  return response.data;
};

export const getPollComments = async (pollId, page = 1, limit = 20) => {
  const response = await api.get(`/comments/poll/${pollId}`, { 
    params: { page, limit } 
  });
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};

export const toggleLikeComment = async (commentId) => {
  const response = await api.put(`/comments/${commentId}/like`);
  return response.data;
};

export default api;
