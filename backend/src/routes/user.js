const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Get user's favorite recipes
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites' });
  }
});

// Check if a recipe is favorited
router.get('/favorites/check/:recipeId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const isFavorite = user.favorites.some(fav => fav.recipeId === req.params.recipeId);
    res.json({ isFavorite });
  } catch (error) {
    res.status(500).json({ message: 'Error checking favorite status' });
  }
});

// Add recipe to favorites
router.post('/favorites/:recipeId', auth, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { title, image } = req.body;

    const user = await User.findById(req.user._id);
    
    // Check if recipe is already favorited
    if (user.favorites.some(fav => fav.recipeId === recipeId)) {
      return res.status(400).json({ message: 'Recipe already in favorites' });
    }

    user.favorites.push({ recipeId, title, image });
    await user.save();

    res.json({ message: 'Recipe added to favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to favorites' });
  }
});

// Remove recipe from favorites
router.delete('/favorites/:recipeId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.favorites = user.favorites.filter(fav => fav.recipeId !== req.params.recipeId);
    await user.save();

    res.json({ message: 'Recipe removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from favorites' });
  }
});

// Update profile picture
router.put('/profile-picture', auth, async (req, res) => {
  try {
    const { profilePicture } = req.body;
    
    if (!profilePicture) {
      return res.status(400).json({ message: 'Profile picture URL is required' });
    }

    const user = await User.findById(req.user._id);
    user.profilePicture = profilePicture;
    await user.save();

    res.json({ 
      message: 'Profile picture updated successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile picture' });
  }
});

// Get public user profile by username
router.get('/public/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username }).select('username profilePicture createdAt');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

module.exports = router; 