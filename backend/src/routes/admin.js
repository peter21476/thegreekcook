const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { User, Recipe, RecipeLike } = require('../models');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
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
    const totalRecipes = await Recipe.count();
    const totalUsers = await User.count();
    const pendingRecipes = await Recipe.count({ where: { status: 'pending' } });
    
    // Get total likes count (external + internal)
    const totalExternalLikes = await RecipeLike.count();
    // Note: Internal likes would need to be counted separately if needed
    // For now, we'll use external likes as the main metric

    const stats = {
      totalRecipes,
      totalUsers,
      totalLikes: totalExternalLikes, // You may want to add internal likes count
      pendingRecipes
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

module.exports = router;
