const os = require('os');
const fs = require('fs');
const path = require('path');

// Get local network IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (localhost) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Update app.json with current IP
function updateAppJson() {
  const appJsonPath = path.join(__dirname, 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  const currentIP = getLocalIP();
  const newUrl = `http://${currentIP}:5001`;
  
  if (appJson.expo.extra.apiBaseUrl !== newUrl) {
    appJson.expo.extra.apiBaseUrl = newUrl;
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
    console.log(`✅ Updated API URL to: ${newUrl}`);
  } else {
    console.log(`✓ API URL already set to: ${newUrl}`);
  }
}

try {
  updateAppJson();
} catch (error) {
  console.error('❌ Error updating IP:', error.message);
  process.exit(1);
}
