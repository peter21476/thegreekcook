const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const RecipeLike = require('../models/RecipeLike');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get admin statistics
router.get('/stats', [auth, isAdmin], async (req, res) => {
  try {
    // Get total counts
    const totalRecipes = await Recipe.countDocuments();
    const totalUsers = await User.countDocuments();
    const pendingRecipes = await Recipe.countDocuments({ status: 'pending' });
    
    // Get total likes count
    const totalLikes = await RecipeLike.countDocuments();

    const stats = {
      totalRecipes,
      totalUsers,
      totalLikes,
      pendingRecipes
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

module.exports = router;
