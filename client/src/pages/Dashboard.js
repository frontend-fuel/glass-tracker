import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Settings as SettingsIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [isMapExpanded, setIsMapExpanded] = React.useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!token) {
      navigate('/login');
      return;
    }
  }, [token, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleBuzzer = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/devices/buzzer',
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('Buzzer activated!');
    } catch (error) {
      console.error('Error activating buzzer:', error);
      alert('Failed to activate buzzer');
    }
  };

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      // Initialize Map
      mapInstanceRef.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5);

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ''
      }).addTo(mapInstanceRef.current);
    }

    // Function to update location
    const updateLocation = async () => {
      try {
        const channelID = '2905923';
        const apiKey = 'CAAB7BWUXN1B8TZP';
        const url = `https://api.thingspeak.com/channels/${channelID}/feeds.json?api_key=${apiKey}&results=1`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.feeds && data.feeds.length > 0) {
          const latestEntry = data.feeds[0];
          const lat = parseFloat(latestEntry.field1);
          const lon = parseFloat(latestEntry.field2);

          if (!isNaN(lat) && !isNaN(lon)) {
            mapInstanceRef.current.setView([lat, lon], 15);
            
            // Remove previous marker if exists
            if (markerRef.current) {
              markerRef.current.remove();
            }

            // Add new marker
            markerRef.current = L.marker([lat, lon])
              .addTo(mapInstanceRef.current)
              .bindPopup("Spectacles Location")
              .openPopup();
          }
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    // Initial update
    updateLocation();

    // Set interval for updates
    const interval = setInterval(updateLocation, 10000);

    // Cleanup
    return () => {
      clearInterval(interval);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [token]);

  const handleMapClick = () => {
    setIsMapExpanded(!isMapExpanded);
  };

  return (
    <div className="dashboard-container">
      <div className="top-nav">
        <h1>Live GPS Location of Spectacles</h1>
        <div className="nav-right">
          <button className="username-btn" onClick={handleSettings}>
            {user?.name || 'User'}
            <SettingsIcon className="settings-icon" />
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <div className={`map-container ${isMapExpanded ? 'expanded' : ''}`} onClick={handleMapClick}>
        <div className="map-container-header">
          Location of Spectacles
          <ExpandMoreIcon className="expand-icon" />
        </div>
        <div ref={mapRef} className="map" />
      </div>
      <button className="find-btn" onClick={handleBuzzer}>
        Find Spectacles
      </button>
    </div>
  );
};

export default Dashboard;
