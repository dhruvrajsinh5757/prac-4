const fs = require('fs');
const path = require('path');

// Define file types for categorization
const fileCategories = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
  documents: ['.pdf', '.docx', '.txt', '.ppt', '.xls'],
  videos: ['.mp4', '.avi', '.mkv', '.mov'],
};

// Function to categorize files based on extensions
function categorizeFile(file) {
  const ext = path.extname(file).toLowerCase();
  
  if (fileCategories.images.includes(ext)) return 'Images';
  if (fileCategories.documents.includes(ext)) return 'Documents';
  if (fileCategories.videos.includes(ext)) return 'Videos';
  
  return 'Others';
}

// Function to create directories if they don't exist
function createDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log(`Created directory: ${dir}`);
  }
}

// Function to move files to appropriate directories
function moveFile(file, fromDir, toDir) {
  const sourcePath = path.join(fromDir, file);
  const destPath = path.join(toDir, file);

  fs.renameSync(sourcePath, destPath);
  console.log(`Moved ${file} to ${toDir}`);
}

// Main function to organize files
function organizeFiles(directoryPath) {
  // Ensure the directory exists
  if (!fs.existsSync(directoryPath)) {
    console.error('The provided directory path does not exist.');
    return;
  }

  const logStream = fs.createWriteStream('summary.txt', { flags: 'a' });

  // Read the files in the directory
  const files = fs.readdirSync(directoryPath);

  // Create category directories (Images, Documents, Videos, Others)
  Object.values(fileCategories).forEach(category => {
    createDirectory(path.join(directoryPath, category));
  });
  
  createDirectory(path.join(directoryPath, 'Others')); // For other files

  // Iterate over the files and move them to the respective directories
  files.forEach(file => {
    const category = categorizeFile(file);
    const targetDir = path.join(directoryPath, category);

    if (fs.statSync(path.join(directoryPath, file)).isFile()) {
      moveFile(file, directoryPath, targetDir);
      logStream.write(`Moved file: ${file} to ${category} directory\n`);
    }
  });

  console.log('File organization complete.');
  logStream.end();
}

// Get the directory path from user input
const userDirPath = process.argv[2];

if (!userDirPath) {
  console.log('Please provide a directory path as an argument.');
} else {
  organizeFiles(userDirPath);
}
