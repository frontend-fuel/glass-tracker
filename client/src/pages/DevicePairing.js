import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const DevicePairing = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [channelId, setChannelId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/devices', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.length > 0) {
          const device = response.data[0];
          setChannelId(device.channelId);
          setApiKey(device.apiKey);
          setName(device.name);
        }
      } catch (err) {
        console.error('Error fetching device info:', err);
        setError('Failed to fetch device information');
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceInfo();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post(
        'http://localhost:5000/api/devices',
        { channelId, apiKey, name },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to pair device');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Show simplified view if device is already paired
  if (channelId && apiKey) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
              Device Already Paired
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 3 }}>
              Your Smart Glasses are already configured and ready to use.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => navigate('/dashboard')}
              sx={{ mt: 2 }}
            >
              Connect to Dashboard
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Pair Your Smart Glasses
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Channel ID"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              margin="normal"
              required
              helperText="Enter the numeric Channel ID from your device"
            />
            <TextField
              fullWidth
              label="API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              margin="normal"
              required
              helperText="Enter the alphanumeric API Key from your device"
            />
            <TextField
              fullWidth
              label="Device Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              placeholder="My Smart Glasses"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
            >
              Update Settings
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="info"
              sx={{ mt: 2 }}
              onClick={() => window.open(`https://thingspeak.com/channels/${channelId}`, '_blank')}
            >
              View Device Configuration
            </Button>
          </form>
          <Box sx={{ mt: 4, pt: 4, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              Current Device Information
            </Typography>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Channel ID
                </Typography>
                <Typography variant="body1">
                  {channelId || 'Not configured'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  API Key
                </Typography>
                <Typography variant="body1">
                  {apiKey || 'Not configured'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Device Name
                </Typography>
                <Typography variant="body1">
                  {name || 'Not configured'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default DevicePairing;
