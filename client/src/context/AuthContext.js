import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Set up Axios instance with base URL from env
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on initial render if token exists
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (token) {
          const res = await API.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data);
        }
      } catch (err) {
        console.error('Error loading user:', err);
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      const res = await API.post('/api/auth/login', credentials);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const res = await API.post('/api/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUserContext = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateUserContext,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
