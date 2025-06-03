const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const UNITY_BUILD_DIR = path.join(__dirname, '../unity-build'); // Your Unity build output directory
const PUBLIC_GAME_DIR = path.join(__dirname, '../public/game'); // Where the game files will be copied
const VERSION_FILE = path.join(__dirname, '../public/game-version.json');

// Ensure directories exist
if (!fs.existsSync(PUBLIC_GAME_DIR)) {
  fs.mkdirSync(PUBLIC_GAME_DIR, { recursive: true });
}

// Generate version info
const generateVersionInfo = () => {
  const timestamp = new Date().toISOString();
  const buildHash = crypto.createHash('md5')
    .update(timestamp)
    .digest('hex')
    .substring(0, 8);

  return {
    version: buildHash,
    buildDate: timestamp,
    files: {}
  };
};

// Calculate file hashes
const calculateFileHashes = (versionInfo) => {
  const files = fs.readdirSync(UNITY_BUILD_DIR);
  
  files.forEach(file => {
    const filePath = path.join(UNITY_BUILD_DIR, file);
    if (fs.statSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath);
      const hash = crypto.createHash('md5')
        .update(content)
        .digest('hex')
        .substring(0, 8);
      
      versionInfo.files[file] = hash;
    }
  });
};

// Copy files with version in filename
const copyFiles = (versionInfo) => {
  const files = fs.readdirSync(UNITY_BUILD_DIR);
  
  files.forEach(file => {
    const sourcePath = path.join(UNITY_BUILD_DIR, file);
    const ext = path.extname(file);
    const baseName = path.basename(file, ext);
    const newFileName = `${baseName}.${versionInfo.version}${ext}`;
    const destPath = path.join(PUBLIC_GAME_DIR, newFileName);
    
    fs.copyFileSync(sourcePath, destPath);
  });
};

// Main build process
const build = () => {
  console.log('Starting game build process...');
  
  // Generate version info
  const versionInfo = generateVersionInfo();
  console.log(`Generated version: ${versionInfo.version}`);
  
  // Calculate file hashes
  calculateFileHashes(versionInfo);
  console.log('Calculated file hashes');
  
  // Copy files
  copyFiles(versionInfo);
  console.log('Copied game files');
  
  // Save version info
  fs.writeFileSync(VERSION_FILE, JSON.stringify(versionInfo, null, 2));
  console.log('Saved version info');
  
  console.log('Build completed successfully!');
};

// Run build
build(); 