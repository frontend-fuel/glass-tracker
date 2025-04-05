import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { user, token, updateUser, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    deviceId: '',
    channelId: '',
    apiKey: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Load user data
    updateUser();
  }, [token, navigate, updateUser]);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.name || '',
        email: user.email || '',
        deviceId: user.deviceName || '',
        channelId: user.deviceChannelId || '',
        apiKey: user.deviceApiKey || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const result = await updateUserProfile(formData);
      if (result.success) {
        setSuccess('Settings saved successfully!');
        updateUser(); // Refresh user data
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to save changes');
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button className="back-btn" onClick={handleBack}>
          Back to Dashboard
        </button>
        <h1>User Settings</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <h2>User Information</h2>
          <div className="form-field">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
            />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              disabled
            />
          </div>
        </div>

        <div className="form-group">
          <h2>Device Settings</h2>
          <div className="form-field">
            <label>Device ID</label>
            <input
              type="text"
              name="deviceId"
              value={formData.deviceId}
              onChange={handleChange}
              placeholder="Enter device ID"
            />
          </div>
          <div className="form-field">
            <label>ThingSpeak Channel ID</label>
            <input
              type="text"
              name="channelId"
              value={formData.channelId}
              onChange={handleChange}
              placeholder="Enter ThingSpeak channel ID"
            />
          </div>
          <div className="form-field">
            <label>ThingSpeak API Key</label>
            <input
              type="text"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleChange}
              placeholder="Enter ThingSpeak API key"
            />
          </div>
        </div>

        <button type="submit" className="save-btn">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Settings;
