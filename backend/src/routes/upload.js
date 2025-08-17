const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const auth = require('../middleware/auth');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Upload image route
router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'recipes',
      transformation: [
        { width: 800, height: 600, crop: 'fill' },
        { quality: 'auto' }
      ]
    });

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error uploading image',
      error: error.message 
    });
  }
});

// Upload profile picture route
router.post('/profile-picture', auth, upload.single('image'), async (req, res) => {
  console.log('Profile picture upload route hit');
  try {
    if (!req.file) {
      console.log('No file provided');
      return res.status(400).json({ message: 'No image file provided' });
    }

    console.log('File received:', req.file.originalname, req.file.mimetype);

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    console.log('Uploading to Cloudinary...');

    // Upload to Cloudinary with profile-specific transformations
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'profiles',
      transformation: [
        { width: 300, height: 300, crop: 'fill', gravity: 'face' },
        { quality: 'auto' }
      ]
    });

    console.log('Upload successful:', result.secure_url);

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Error uploading profile picture',
      error: error.message 
    });
  }
});

// Delete image route
router.delete('/image/:public_id', auth, async (req, res) => {
  try {
    const { public_id } = req.params;
    
    const result = await cloudinary.uploader.destroy(public_id);
    
    if (result.result === 'ok') {
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(400).json({ message: 'Error deleting image' });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting image',
      error: error.message 
    });
  }
});

module.exports = router; 