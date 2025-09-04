const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
const profilePicsDir = path.join(uploadsDir, 'profile-pics');
const pollImagesDir = path.join(uploadsDir, 'poll-images');

[uploadsDir, profilePicsDir, pollImagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'profilePicture') {
      cb(null, profilePicsDir);
    } else if (file.fieldname === 'pollImage') {
      cb(null, pollImagesDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Image processing middleware
const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const inputPath = req.file.path;
    const outputPath = path.join(path.dirname(inputPath), `processed_${req.file.filename}`);
    
    // Process image with sharp
    await sharp(inputPath)
      .resize(800, 800, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    // Remove original file and replace with processed
    fs.unlinkSync(inputPath);
    fs.renameSync(outputPath, inputPath);

    next();
  } catch (error) {
    console.error('Image processing error:', error);
    next(error);
  }
};

// Profile picture processing middleware
const processProfilePicture = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const inputPath = req.file.path;
    const outputPath = path.join(path.dirname(inputPath), `processed_${req.file.filename}`);
    
    // Process profile picture with sharp - square crop
    await sharp(inputPath)
      .resize(400, 400, { 
        fit: 'cover',
        position: 'center' 
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    // Remove original file and replace with processed
    fs.unlinkSync(inputPath);
    fs.renameSync(outputPath, inputPath);

    next();
  } catch (error) {
    console.error('Profile picture processing error:', error);
    next(error);
  }
};

module.exports = {
  upload,
  processImage,
  processProfilePicture
};