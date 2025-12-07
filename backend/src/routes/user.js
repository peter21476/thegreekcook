const express = require('express');
const auth = require('../middleware/auth');
const { User, UserFavorite } = require('../models');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Get user's favorite recipes
router.get('/favorites', auth, async (req, res) => {
  try {
    const favorites = await UserFavorite.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites' });
  }
});

// Check if a recipe is favorited
router.get('/favorites/check/:recipeId', auth, async (req, res) => {
  try {
    const favorite = await UserFavorite.findOne({
      where: {
        userId: req.user.id,
        recipeId: req.params.recipeId
      }
    });
    res.json({ isFavorite: !!favorite });
  } catch (error) {
    res.status(500).json({ message: 'Error checking favorite status' });
  }
});

// Add recipe to favorites
router.post('/favorites/:recipeId', auth, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { title, image } = req.body;

    // Check if recipe is already favorited
    const existingFavorite = await UserFavorite.findOne({
      where: {
        userId: req.user.id,
        recipeId: recipeId
      }
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Recipe already in favorites' });
    }

    await UserFavorite.create({
      userId: req.user.id,
      recipeId: recipeId,
      title: title,
      image: image
    });

    res.json({ message: 'Recipe added to favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to favorites' });
  }
});

// Remove recipe from favorites
router.delete('/favorites/:recipeId', auth, async (req, res) => {
  try {
    await UserFavorite.destroy({
      where: {
        userId: req.user.id,
        recipeId: req.params.recipeId
      }
    });

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

    const user = await User.findByPk(req.user.id);
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

// Update about description
router.put('/about', auth, async (req, res) => {
  try {
    const { about } = req.body;
    
    if (about && about.length > 500) {
      return res.status(400).json({ message: 'About description must be 500 characters or less' });
    }

    const user = await User.findByPk(req.user.id);
    user.about = about || '';
    await user.save();

    res.json({ 
      message: 'About description updated successfully',
      about: user.about
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating about description' });
  }
});

// Get public user profile by username
router.get('/public/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({
      where: { username },
      attributes: ['id', 'username', 'profilePicture', 'about', 'createdAt']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Get all users (admin only)
router.get('/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'profilePicture', 'about', 'isAdmin', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

module.exports = router;
