const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const LikeService = require('../utils/likeService');

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

// Submit a new recipe
router.post('/submit', [
  auth,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('ingredients', 'Ingredients are required').isArray({ min: 1 }),
    check('instructions', 'Instructions are required').isArray({ min: 1 }),
    check('servings', 'Servings is required').isNumeric(),
    check('prepTime', 'Prep time is required').isNumeric(),
    check('cookTime', 'Cook time is required').isNumeric(),
    check('image', 'Image URL is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const recipe = new Recipe({
      ...req.body,
      submittedBy: req.user._id
    });

    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting recipe' });
  }
});

// Get all pending recipes (admin only)
router.get('/pending', [auth, isAdmin], async (req, res) => {
  try {
    const recipes = await Recipe.find({ status: 'pending' })
      .populate('submittedBy', 'username email profilePicture')
      .sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending recipes' });
  }
});

// Approve a recipe (admin only)
router.put('/approve/:id', [auth, isAdmin], async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    recipe.status = 'approved';
    recipe.approvedBy = req.user._id;
    recipe.approvedAt = Date.now();
    await recipe.save();

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error approving recipe' });
  }
});

// Reject a recipe (admin only)
router.put('/reject/:id', [
  auth,
  isAdmin,
  check('rejectionReason', 'Rejection reason is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    recipe.status = 'rejected';
    recipe.rejectionReason = req.body.rejectionReason;
    await recipe.save();

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting recipe' });
  }
});

// Get all approved recipes
router.get('/approved', async (req, res) => {
  try {
    const recipes = await Recipe.find({ status: 'approved' })
      .populate('submittedBy', 'username profilePicture')
      .sort({ approvedAt: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching approved recipes' });
  }
});

// Get user's submitted recipes
router.get('/my-recipes', auth, async (req, res) => {
  try {
    const recipes = await Recipe.find({ submittedBy: req.user._id })
      .sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user recipes' });
  }
});

// Get approved recipes by username (public)
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get approved recipes by this user
    const recipes = await Recipe.find({ 
      submittedBy: user._id,
      status: 'approved'
    })
    .populate('submittedBy', 'username profilePicture')
    .sort({ approvedAt: -1 });

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user recipes' });
  }
});

// Search approved recipes by query
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    // First get recipes without population to see the raw data
    const rawRecipes = await Recipe.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'ingredients.name': { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    console.log('Raw recipes before population:', rawRecipes.map(r => ({
      title: r.title,
      submittedBy: r.submittedBy,
      submittedByType: typeof r.submittedBy
    })));

    const recipes = await Recipe.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'ingredients.name': { $regex: query, $options: 'i' } }
      ]
    })
    .populate('submittedBy', 'username profilePicture')
    .sort({ createdAt: -1 });

    // Debug logging
    console.log('Search results after population:', recipes.map(r => ({
      title: r.title,
      submittedBy: r.submittedBy,
      submittedByType: typeof r.submittedBy
    })));

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error searching recipes' });
  }
});

// Get like counts for multiple recipes (for external recipes)
router.post('/like-counts', auth, async (req, res) => {
  try {
    const { recipeIds } = req.body;
    
    if (!Array.isArray(recipeIds)) {
      return res.status(400).json({ message: 'recipeIds must be an array' });
    }

    const likeCounts = {};
    
    // Process each recipe ID
    for (const recipeId of recipeIds) {
      const likeCount = await LikeService.getLikeCount(recipeId);
      likeCounts[recipeId] = likeCount;
    }

    res.json({ likeCounts });
  } catch (error) {
    console.error('Error getting like counts:', error);
    res.status(500).json({ message: 'Error getting like counts', error: error.message });
  }
});

// Check if user has liked a recipe (must come before /:id route)
router.get('/:id/like-status', auth, async (req, res) => {
  try {
    console.log('Like status route called for recipe ID:', req.params.id);
    console.log('User ID:', req.user._id);
    console.log('Is internal recipe:', LikeService.isInternalRecipe(req.params.id));
    
    const likeStatus = await LikeService.getLikeStatus(req.params.id, req.user._id);
    
    console.log('Like status result:', likeStatus);
    res.json(likeStatus);
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ message: 'Error checking like status', error: error.message });
  }
});

// Like a recipe (must come before /:id route)
router.post('/:id/like', auth, async (req, res) => {
  try {
    console.log('Like route called for recipe ID:', req.params.id);
    console.log('User ID:', req.user._id);
    console.log('Is internal recipe:', LikeService.isInternalRecipe(req.params.id));
    
    const wasLiked = await LikeService.toggleLike(req.params.id, req.user._id);
    console.log('Was liked:', wasLiked);
    
    const likeStatus = await LikeService.getLikeStatus(req.params.id, req.user._id);
    console.log('Updated like status:', likeStatus);

    const response = {
      message: wasLiked ? 'Recipe liked successfully' : 'Recipe unliked successfully',
      isLiked: wasLiked,
      likeCount: likeStatus.likeCount
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Error toggling like', error: error.message });
  }
});

// Get a single recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('submittedBy', 'username profilePicture');
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipe' });
  }
});

// Update a recipe (only by the original submitter)
router.put('/:id', [
  auth,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('ingredients', 'Ingredients are required').isArray({ min: 1 }),
    check('instructions', 'Instructions are required').isArray({ min: 1 }),
    check('servings', 'Servings is required').isNumeric(),
    check('prepTime', 'Prep time is required').isNumeric(),
    check('cookTime', 'Cook time is required').isNumeric(),
    check('image', 'Image URL is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if the user is the original submitter or an admin
    const user = await User.findById(req.user._id);
    if (recipe.submittedBy.toString() !== req.user._id.toString() && !user.isAdmin) {
      return res.status(403).json({ message: 'You can only edit your own recipes' });
    }

    // Update the recipe
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    ).populate('submittedBy', 'username');

    res.json(updatedRecipe);
  } catch (error) {
    res.status(500).json({ message: 'Error updating recipe' });
  }
});

module.exports = router; 