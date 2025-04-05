import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import './Auth.css';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    if (result.success) {
      navigate('/pair-device');
    } else {
      setError(result.error);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-left"></div>
      <div className="auth-right">
        <Typography variant="h4" align="center" className="auth-title">
          Smart Glasses Tracker
        </Typography>
        <Typography variant="h6" align="center" gutterBottom sx={{ color: '#00f0ff', mb: 3 }}>
          Welcome back! Please sign in to continue
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            variant="outlined"
            sx={{ mb: 2, '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#00f0ff55' },
              '&:hover fieldset': { borderColor: '#00f0ff' },
              '&.Mui-focused fieldset': { borderColor: '#00f0ff' },
            }, '& .MuiInputLabel-root': { color: '#00f0ff' },
            '& .MuiOutlinedInput-input': { color: '#00f0ff' } }}
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                    sx={{ color: '#00f0ff' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#00f0ff55' },
              '&:hover fieldset': { borderColor: '#00f0ff' },
              '&.Mui-focused fieldset': { borderColor: '#00f0ff' },
            }, '& .MuiInputLabel-root': { color: '#00f0ff' },
            '& .MuiOutlinedInput-input': { color: '#00f0ff' } }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, bgcolor: '#00f0ff', color: '#000',
              '&:hover': { bgcolor: '#00d6e6', boxShadow: '0 0 20px #00f0ff' } }}
          >
            Sign In
          </Button>
          <Typography align="center" variant="body1" sx={{ color: '#00f0ff' }}>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Sign Up
            </Link>
          </Typography>
        </form>
      </div>
    </div>
  );
};

export default Login;
