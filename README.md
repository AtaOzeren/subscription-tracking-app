# Subscription Tracking App

A React Native application for tracking personal subscriptions, built with Expo.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or later)
- Expo CLI
- iOS Simulator or Android Emulator (or physical device with Expo Go app)
- Backend server running

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd subscription-tracking-app
```

2. Install dependencies:
```bash
npm install
```

3. **Update `app.json` with your IP:**

   ```bash
   # Find your IP first
   ifconfig | grep "inet " | grep -v 127.0.0.1  # macOS/Linux
   # or
   ipconfig  # Windows
   ```
   
   Then edit `app.json`:
   ```json
   {
     "expo": {
       "extra": {
         "apiBaseUrl": "http://YOUR_IP:5001"
       }
     }
   }
   ```

4. Start:
```bash
npm start
```

5. Scan the QR code with Expo Go app (iOS/Android) or press `i` for iOS simulator / `a` for Android emulator.

## 📱 Available Scripts

- `npm start` - Start Expo development server
- `npm run ios` - Start on iOS simulator
- `npm run android` - Start on Android emulator
- `npm run update-ip` - Auto-update API URL with current local IP
- `npm run gen` - Regenerate API client from Swagger

## 🔧 Configuration

### Environment Setup

**Simple Configuration:**
- Update `app.json` → `extra.apiBaseUrl` with your IP
- All API calls automatically use this URL (via `tracking-api.ts`)
- When IP changes, just update `app.json` and restart

### Troubleshooting

**Connection Timeout or Network Error:**
1. Update `app.json` → `extra.apiBaseUrl` with your current IP
2. Restart Expo: `npm start`
3. Make sure your phone and computer are on the same WiFi network
4. Verify backend is running: `http://YOUR_IP:5001/health`

**Changes Not Reflecting:**
```bash
npm start
```

## 🏗️ Project Structure

```
subscription-tracking-app/
├── app.json              # API configuration (extra.apiBaseUrl)
├── src/
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React contexts (Auth, Language)
│   ├── hooks/            # Custom React hooks
│   ├── locales/          # Internationalization
│   ├── navigation/       # Navigation setup
│   ├── screens/          # Screen components
│   ├── services/         # API services (uses tracking-api)
│   ├── types/            # TypeScript definitions
│   └── utils/            # Utility functions
└── app.json             # Expo configuration
```

## 🌍 Internationalization

The app supports multiple languages:
- English (en)
- Turkish (tr)
- German (de)
- French (fr)
- Italian (it)
- Russian (ru)

Language files are located in `src/locales/`.

## 🔒 Authentication

The app uses JWT-based authentication:
- Login/Register flows
- Token storage with AsyncStorage
- Automatic token validation
- Protected routes

## 📝 API Integration

- Auto-generated TypeScript API client from Swagger
- Centralized service layer (`authService`, `referenceService`)
- Environment-aware API URLs
- Automatic token management

## 🎨 Styling

- NativeWind (Tailwind CSS for React Native)
- Custom components with Apple-style design
- Responsive layouts

## 📄 License

[Your License Here]

## 🤝 Contributing

[Your Contributing Guidelines Here]
