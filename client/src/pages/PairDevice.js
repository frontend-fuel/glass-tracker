import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PairDevice.css';

const PairDevice = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    channelId: '',
    apiKey: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // TODO: Implement device pairing logic
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to pair device. Please try again.');
    }
  };

  return (
    <div className="pair-device-container">
      <div className="pair-device-left"></div>
      <div className="pair-device-right">
        <h2 className="pair-device-title">Pair Your Smart Glasses</h2>
        {error && <div className="error-message">{error}</div>}
        <form className="pair-device-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="channelId">Channel ID *</label>
            <input
              type="text"
              id="channelId"
              name="channelId"
              placeholder="Enter your ThingSpeak channel ID"
              value={formData.channelId}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="apiKey">API Key *</label>
            <input
              type="text"
              id="apiKey"
              name="apiKey"
              placeholder="Enter your ThingSpeak API key"
              value={formData.apiKey}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="pair-btn">
            Pair Device
          </button>
        </form>
      </div>
    </div>
  );
};

export default PairDevice;