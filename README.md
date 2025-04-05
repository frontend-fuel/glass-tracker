# Smart Glasses Tracking App

A full-stack MERN application for tracking smart glasses with GPS functionality and buzzer alerts.

## Features
- User authentication (Sign In/Sign Up)
- Device pairing with Channel ID and API Key
- Real-time GPS tracking using ThingSpeak
- Interactive map display
- Find My Spectacles feature with buzzer alert
- User profile management

## Tech Stack
- Frontend: React.js
- Backend: Node.js with Express.js
- Database: MongoDB
- Hardware: ESP32, u-blox NEO-6M GPS Module, Buzzer

## Project Structure
```
smart-glasses-tracking/
├── client/               # React frontend
├── server/               # Node.js backend
└── hardware/             # ESP32 code
```

## Setup Instructions
1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```
3. Set up environment variables
4. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd ../client
   npm start
   ```
