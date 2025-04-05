# Smart Glasses Hardware Setup

## Components Required
1. ESP32 Development Board
2. u-blox NEO-6M GPS Module
3. Active Buzzer Module
4. Jumper Wires
5. Power Supply (3.3V)

## Wiring Instructions

### GPS Module (u-blox NEO-6M) to ESP32
- VCC → 3.3V
- GND → GND
- TX → GPIO 16 (RX2)
- RY → GPIO 17 (TX2)

### Buzzer to ESP32
- VCC → GPIO 25
- GND → GND

## ThingSpeak Setup
1. Create a ThingSpeak account at https://thingspeak.com
2. Create a new channel with the following fields:
   - Field 1: Latitude
   - Field 2: Longitude
   - Field 3: Buzzer Control (0/1)
3. Note down your:
   - Channel ID
   - Write API Key
   - Read API Key

## Configuration
1. Open `smart_glasses_tracker.ino`
2. Update the following variables:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   const String writeAPIKey = "YOUR_THINGSPEAK_WRITE_API_KEY";
   const String channelID = "YOUR_CHANNEL_ID";
   const String readAPIKey = "YOUR_THINGSPEAK_READ_API_KEY";
   ```

## Required Libraries
Install the following libraries in Arduino IDE:
1. WiFi (built-in with ESP32 board)
2. HTTPClient (built-in with ESP32 board)
3. TinyGPS++ (by Mikal Hart)

## How It Works
1. The ESP32 connects to WiFi and initializes the GPS module
2. Every 15 seconds, it:
   - Reads GPS coordinates
   - Sends location data to ThingSpeak (fields 1 & 2)
   - Checks if the buzzer should be activated (field 3)
3. When the buzzer is triggered:
   - It beeps for 5 seconds
   - Automatically turns off
   - Resets the buzzer control field in ThingSpeak

## Troubleshooting
1. **No GPS Fix**
   - Make sure the GPS module has a clear view of the sky
   - Wait for up to 5 minutes for first fix
   - Check TX/RX connections

2. **WiFi Connection Issues**
   - Verify WiFi credentials
   - Ensure ESP32 is within range of WiFi network
   - Check serial monitor for connection status

3. **ThingSpeak Issues**
   - Verify API keys and Channel ID
   - Check rate limits (15 seconds between updates)
   - Monitor serial output for HTTP response codes
