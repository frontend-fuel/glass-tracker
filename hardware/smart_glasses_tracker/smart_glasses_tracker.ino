#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>

// WiFi credentials
const char* ssid = "Cascade";  // Replace with your actual WiFi name
const char* password = "12345678";  // Replace with your actual WiFi password

// ThingSpeak settings
const char* thingSpeakHost = "api.thingspeak.com";
const String writeAPIKey = "GN2J04LOQ42F0VDD";  // Your Write API Key
const String channelID = "2905923";             // Your Channel ID
const String readAPIKey = "CAAB7BWUXN1B8TZP";   // Your Read API Key

// GPS Module settings (connected to Serial2)
const int RXPin = 16; // GPS TX connects to ESP32 RX2 (GPIO 16)
const int TXPin = 17; // GPS RX connects to ESP32 TX2 (GPIO 17)
const int GPSBaud = 9600;

// Buzzer settings
const int buzzerPin = 25; // Connect buzzer to GPIO 25

// Initialize GPS and Serial objects
TinyGPSPlus gps;
HardwareSerial gpsSerial(2); // Use Serial2 for GPS

// Variables for location data
float latitude = 0.0;
float longitude = 0.0;
bool locationValid = false;

// Variables for buzzer control
bool buzzerActive = false;
unsigned long buzzerStartTime = 0;
const unsigned long BUZZER_DURATION = 30000; // 30 seconds

// Variables for timing
unsigned long lastUpdateTime = 0;
const unsigned long UPDATE_INTERVAL = 5000; // Update every 5 seconds

void setup() {
  // Initialize Serial for debugging
  Serial.begin(115200);
  Serial.println("Smart Glasses Tracker Starting...");
  
  // Initialize GPS serial
  gpsSerial.begin(GPSBaud, SERIAL_8N1, RXPin, TXPin);
  Serial.println("GPS initialized");
  
  // Initialize buzzer pin
  pinMode(buzzerPin, OUTPUT);
  digitalWrite(buzzerPin, LOW);
  Serial.println("Buzzer initialized");
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed!");
  }
}

void loop() {
  unsigned long currentTime = millis();
  
  // Read GPS data
  while (gpsSerial.available() > 0) {
    if (gps.encode(gpsSerial.read())) {
      updateGPSData();
    }
  }

  // Check if it's time to update ThingSpeak
  if (currentTime - lastUpdateTime >= UPDATE_INTERVAL) {
    // Check WiFi connection
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("WiFi disconnected. Reconnecting...");
      WiFi.begin(ssid, password);
      delay(1000);
      return;
    }
    
    // Check buzzer status from ThingSpeak
    checkBuzzerStatus();
    
    // Send location to ThingSpeak if valid
    if (locationValid) {
      sendLocationData();
    } else {
      Serial.println("No valid GPS data available");
    }
    
    lastUpdateTime = currentTime;
  }
  
  // Update buzzer state
  updateBuzzer();
  
  // Small delay to prevent overwhelming the GPS
  delay(10);
}

void updateGPSData() {
  if (gps.location.isValid()) {
    latitude = gps.location.lat();
    longitude = gps.location.lng();
    locationValid = true;
    
    Serial.print("Location: ");
    Serial.print(latitude, 6);
    Serial.print(", ");
    Serial.println(longitude, 6);
  } else {
    Serial.println("GPS location not valid");
    locationValid = false;
  }
}

void sendLocationData() {
  HTTPClient http;
  String url = "http://" + String(thingSpeakHost) + "/update?api_key=" + writeAPIKey;
  url += "&field1=" + String(latitude, 6);
  url += "&field2=" + String(longitude, 6);
  
  Serial.print("Sending data to ThingSpeak: ");
  Serial.println(url);
  
  http.begin(url);
  int httpCode = http.GET();
  
  if (httpCode > 0) {
    String response = http.getString();
    Serial.print("ThingSpeak response: ");
    Serial.println(response);
  } else {
    Serial.print("ThingSpeak error: ");
    Serial.println(http.errorToString(httpCode));
  }
  
  http.end();
}

void checkBuzzerStatus() {
  HTTPClient http;
  String url = "http://" + String(thingSpeakHost) + "/channels/" + channelID + "/fields/3/last.json?api_key=" + readAPIKey;
  
  http.begin(url);
  int httpCode = http.GET();
  
  if (httpCode > 0) {
    String response = http.getString();
    Serial.print("Buzzer status response: ");
    Serial.println(response);
    
    // Check if field3 is 1
    if (response.indexOf("\"field3\":\"1\"") > -1) {
      if (!buzzerActive) {
        buzzerActive = true;
        buzzerStartTime = millis();
        Serial.println("Buzzer activated!");
      }
    }
  } else {
    Serial.print("Error checking buzzer status: ");
    Serial.println(http.errorToString(httpCode));
  }
  
  http.end();
}

void updateBuzzer() {
  if (buzzerActive) {
    if (millis() - buzzerStartTime < BUZZER_DURATION) {
      // Toggle buzzer every 500ms for a beeping effect
      digitalWrite(buzzerPin, (millis() / 500) % 2);
    } else {
      // Turn off buzzer after duration
      buzzerActive = false;
      digitalWrite(buzzerPin, LOW);
      
      // Reset field3 to 0
      HTTPClient http;
      String url = "http://" + String(thingSpeakHost) + "/update?api_key=" + writeAPIKey + "&field3=0";
      http.begin(url);
      http.GET();
      http.end();
      
      Serial.println("Buzzer deactivated");
    }
  }
}
