import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Auth = ({ mode = 'login' }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    channelId: '',
    apiKey: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (mode === 'register') {
        const result = await register(
          formData.name,
          formData.email,
          formData.password
        );
        if (result.success) {
          navigate('/pair-device');
        } else {
          setError(result.error);
        }
      } else {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-left"></div>
      <div className="auth-right">
        <h2 className="auth-title">Smart Glasses Tracker</h2>
        {error && <div className="error-message">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="login-btn">
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
          <div className="auth-switch">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Link
              to={mode === 'login' ? '/register' : '/login'}
              className="auth-link"
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;