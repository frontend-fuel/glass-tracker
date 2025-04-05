const axios = require('axios');

const THINGSPEAK_API = 'https://api.thingspeak.com';

class ThingSpeakAPI {
  constructor() {
    // Initialize without default credentials
    this.channelId = null;
    this.readApiKey = null;
    this.writeApiKey = null;
  }

  setCredentials(channelId, apiKey) {
    this.channelId = channelId;
    this.readApiKey = apiKey;
    this.writeApiKey = apiKey;
  }

  async getLatestLocation() {
    try {
      console.log('Fetching latest location from ThingSpeak...');
      
      // First try to get the last 5 entries to find valid data
      const url = `${THINGSPEAK_API}/channels/${this.channelId}/feeds.json?api_key=${this.readApiKey}&results=5`;
      console.log('ThingSpeak URL:', url);
      
      const response = await axios.get(url);
      console.log('ThingSpeak Response:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.feeds && response.data.feeds.length > 0) {
        // Find the most recent entry with valid data
        const validEntry = response.data.feeds.find(feed => 
          (feed.field1 !== null && feed.field1 !== undefined) || 
          (feed.field2 !== null && feed.field2 !== undefined)
        );
        
        if (validEntry) {
          console.log('Found valid entry:', validEntry);
          const location = {
            latitude: validEntry.field1 ? parseFloat(validEntry.field1) : null,
            longitude: validEntry.field2 ? parseFloat(validEntry.field2) : null,
            timestamp: new Date(validEntry.created_at),
            raw: {
              field1: validEntry.field1,
              field2: validEntry.field2,
              field3: validEntry.field3,
              entry_id: validEntry.entry_id,
              created_at: validEntry.created_at
            }
          };
          console.log('Parsed location:', location);
          return location;
        }
      }
      
      console.log('No valid data found in ThingSpeak response');
      return null;
    } catch (error) {
      console.error('ThingSpeak getLatestLocation error:', error.response ? error.response.data : error.message);
      return null;
    }
  }

  async triggerBuzzer() {
    try {
      console.log('Triggering buzzer via ThingSpeak...');
      const url = `${THINGSPEAK_API}/update?api_key=${this.writeApiKey}&field3=1`;
      console.log('ThingSpeak URL:', url);
      
      const response = await axios.get(url);
      console.log('ThingSpeak Buzzer Response:', response.data);
      
      const success = response.data === 0 ? false : true;
      console.log('Buzzer trigger success:', success);
      return success;
    } catch (error) {
      console.error('ThingSpeak triggerBuzzer error:', error.response ? error.response.data : error.message);
      return false;
    }
  }

  async getLocationHistory(minutes = 60) {
    try {
      console.log(`Fetching location history for last ${minutes} minutes...`);
      const url = `${THINGSPEAK_API}/channels/${this.channelId}/feeds.json?api_key=${this.readApiKey}&minutes=${minutes}`;
      console.log('ThingSpeak URL:', url);
      
      const response = await axios.get(url);
      console.log('ThingSpeak History Response:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.feeds) {
        const locations = response.data.feeds
          .filter(feed => feed.field1 !== null || feed.field2 !== null)
          .map(feed => ({
            latitude: feed.field1 ? parseFloat(feed.field1) : null,
            longitude: feed.field2 ? parseFloat(feed.field2) : null,
            timestamp: new Date(feed.created_at),
            raw: {
              field1: feed.field1,
              field2: feed.field2,
              field3: feed.field3,
              entry_id: feed.entry_id,
              created_at: feed.created_at
            }
          }));
        
        console.log(`Found ${locations.length} location points with data`);
        return locations;
      }
      return [];
    } catch (error) {
      console.error('ThingSpeak getLocationHistory error:', error.response ? error.response.data : error.message);
      return [];
    }
  }
}

module.exports = new ThingSpeakAPI();
