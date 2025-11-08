# Troubleshooting Guide

## Connection Issues

### Problem: "Cannot connect to server" error

This happens when your computer's IP address changes (e.g., after reconnecting to WiFi).

#### Quick Fix:
```bash
npm run update-ip
npm start
```

Or manually update the IP in `app.json`:
1. Find your IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
2. Update `app.json` -> `expo.extra.apiBaseUrl` with your IP

#### Automatic Fix:
The app now automatically updates the IP when you run `npm start`

---

## Login Issues

### Correct Test Credentials:
- **Email:** `umut@gmail.com`
- **Password:** `123456` (6 characters, not 10!)

### Common Mistakes:
1. ❌ Using password: `1234567890` (10 chars)
2. ✅ Correct password: `123456` (6 chars)

### Debug Login:
If you're still having issues, use the "Fill Test Credentials" button (only visible in development mode) on the login screen.

---

## Clear Cache

If you're experiencing strange behavior:

```bash
# Clear Expo cache
npm run start:nocache

# Or manually:
rm -rf .expo
rm -rf node_modules/.cache
expo start --clear
```

---

## Check Backend Server

Verify your backend is running:

```bash
# Check if server is responding
curl http://localhost:5001/health

# Or with your IP
curl http://$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1):5001/health
```

Expected response:
```json
{"success":true,"message":"Server is running","timestamp":"..."}
```

---

## Current Configuration

Run this to see your current setup:

```bash
echo "Current IP: $(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)"
echo "App Config: $(grep apiBaseUrl app.json)"
curl -s http://localhost:5001/health | grep success && echo " - Server is running ✓" || echo " - Server is NOT running ✗"
```

---

## Quick Start

1. **Start backend server** (in backend folder)
2. **Start mobile app:**
   ```bash
   npm start
   ```
3. The IP will be automatically updated
4. Scan QR code with Expo Go app

