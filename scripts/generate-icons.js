const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ensure the icons directory exists
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a simple icon with a gradient background and text
async function createIcon(size) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff8a2c;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ff4d4d;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" rx="20" ry="20"/>
      <text x="50%" y="50%" font-family="Arial" font-size="${size/3}px" fill="white" text-anchor="middle" dominant-baseline="middle">RR</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
}

// Generate icons in different sizes
async function generateIcons() {
  try {
    await createIcon(192);
    await createIcon(512);
    console.log('Icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons(); 