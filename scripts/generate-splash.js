const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ensure the splash directory exists
const splashDir = path.join(__dirname, '../public/splash');
if (!fs.existsSync(splashDir)) {
  fs.mkdirSync(splashDir, { recursive: true });
}

// iOS device configurations
const devices = [
  {
    name: 'iPhone_14_Pro_Max_landscape',
    width: 932,
    height: 430,
    pixelRatio: 3
  },
  {
    name: 'iPhone_14_Pro_landscape',
    width: 852,
    height: 393,
    pixelRatio: 3
  },
  {
    name: 'iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape',
    width: 926,
    height: 428,
    pixelRatio: 3
  }
];

// Create a splash screen image
async function createSplashScreen(device) {
  const width = device.width * device.pixelRatio;
  const height = device.height * device.pixelRatio;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff8a2c;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ff4d4d;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text x="50%" y="50%" font-family="Arial" font-size="${width/10}px" fill="white" text-anchor="middle" dominant-baseline="middle">RolloRocket</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .resize(width, height)
    .png()
    .toFile(path.join(splashDir, `${device.name}.png`));
}

// Generate splash screens for all devices
async function generateSplashScreens() {
  try {
    for (const device of devices) {
      await createSplashScreen(device);
    }
    console.log('Splash screens generated successfully!');
  } catch (error) {
    console.error('Error generating splash screens:', error);
  }
}

generateSplashScreens(); 