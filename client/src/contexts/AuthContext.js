import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const isAuthenticated = !!token;

  const updateUser = useCallback(async () => {
    if (token) {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token: authToken, user: userData } = response.data;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('token', authToken);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to login'
      };
    }
  };

  const updateUserProfile = async (userData) => {
    try {
      const response = await axios.put(
        'http://localhost:5000/api/auth/profile',
        userData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUser(response.data);
      return { success: true };
    } catch (error) {
      console.error('Update error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password
      });
      
      const { token: authToken, user: userData } = response.data;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('token', authToken);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to register'
      };
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    register,
    isAuthenticated,
    updateUser,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
