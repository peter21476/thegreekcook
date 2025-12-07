const express = require('express');
const router = express.Router();
const { Recipe, User, RecipeIngredient, RecipeInstruction } = require('../models');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const LikeService = require('../utils/likeService');
const { Op } = require('sequelize');

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

// Helper function to format recipe with ingredients and instructions
async function formatRecipe(recipe) {
  const recipeData = recipe.toJSON();
  
  // Get ingredients and instructions
  const [ingredients, instructions] = await Promise.all([
    RecipeIngredient.findAll({
      where: { recipeId: recipe.id },
      order: [['order', 'ASC']]
    }),
    RecipeInstruction.findAll({
      where: { recipeId: recipe.id },
      order: [['step', 'ASC']]
    })
  ]);
  
  recipeData.ingredients = ingredients;
  recipeData.instructions = instructions;
  
  // Map submittedByUser to submittedBy for frontend compatibility
  // Also add _id for compatibility with frontend code
  // IMPORTANT: Overwrite submittedBy (UUID) with the user object
  if (recipeData.submittedByUser) {
    // submittedByUser is already included from the query
    recipeData.submittedBy = {
      _id: recipeData.submittedByUser.id,
      id: recipeData.submittedByUser.id,
      username: recipeData.submittedByUser.username,
      profilePicture: recipeData.submittedByUser.profilePicture
    };
    // Keep submittedByUser for backward compatibility
  } else if (recipeData.submittedBy && typeof recipeData.submittedBy === 'string') {
    // If submittedBy is just an ID (UUID string), we need to fetch the user
    const user = await User.findByPk(recipeData.submittedBy, {
      attributes: ['id', 'username', 'profilePicture']
    });
    if (user) {
      recipeData.submittedBy = {
        _id: user.id,
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture
      };
    }
  }
  
  // Also add _id for recipe compatibility with frontend
  recipeData._id = recipeData.id;
  
  // Remove the raw submittedBy UUID if we've replaced it with an object
  // (This ensures only the object version is sent)
  
  return recipeData;
}

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
    const recipe = await Recipe.create({
      title: req.body.title,
      description: req.body.description,
      servings: req.body.servings,
      prepTime: req.body.prepTime,
      cookTime: req.body.cookTime,
      image: req.body.image,
      submittedBy: req.user.id,
      status: 'pending'
    });

    // Add ingredients
    if (req.body.ingredients && Array.isArray(req.body.ingredients)) {
      await Promise.all(req.body.ingredients.map((ing, index) =>
        RecipeIngredient.create({
          recipeId: recipe.id,
          name: ing.name,
          amount: ing.amount,
          order: index
        })
      ));
    }

    // Add instructions
    if (req.body.instructions && Array.isArray(req.body.instructions)) {
      await Promise.all(req.body.instructions.map(inst =>
        RecipeInstruction.create({
          recipeId: recipe.id,
          step: inst.step,
          description: inst.description
        })
      ));
    }

    const formattedRecipe = await formatRecipe(recipe);
    res.status(201).json(formattedRecipe);
  } catch (error) {
    console.error('Error submitting recipe:', error);
    res.status(500).json({ message: 'Error submitting recipe' });
  }
});

// Get all pending recipes (admin only)
router.get('/pending', [auth, isAdmin], async (req, res) => {
  try {
    const recipes = await Recipe.findAll({
      where: { status: 'pending' },
      include: [{
        model: User,
        as: 'submittedByUser',
        attributes: ['id', 'username', 'email', 'profilePicture']
      }],
      order: [['createdAt', 'DESC']]
    });

    const formattedRecipes = await Promise.all(recipes.map(formatRecipe));
    res.json(formattedRecipes);
  } catch (error) {
    console.error('Error fetching pending recipes:', error);
    res.status(500).json({ message: 'Error fetching pending recipes' });
  }
});

// Approve a recipe (admin only)
router.put('/approve/:id', [auth, isAdmin], async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    recipe.status = 'approved';
    recipe.approvedBy = req.user.id;
    recipe.approvedAt = new Date();
    await recipe.save();

    const formattedRecipe = await formatRecipe(recipe);
    res.json(formattedRecipe);
  } catch (error) {
    console.error('Error approving recipe:', error);
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
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    recipe.status = 'rejected';
    recipe.rejectionReason = req.body.rejectionReason;
    await recipe.save();

    const formattedRecipe = await formatRecipe(recipe);
    res.json(formattedRecipe);
  } catch (error) {
    console.error('Error rejecting recipe:', error);
    res.status(500).json({ message: 'Error rejecting recipe' });
  }
});

// Get all approved recipes
router.get('/approved', async (req, res) => {
  try {
    const recipes = await Recipe.findAll({
      where: { status: 'approved' },
      include: [{
        model: User,
        as: 'submittedByUser',
        attributes: ['id', 'username', 'profilePicture']
      }],
      order: [['approvedAt', 'DESC']]
    });

    const formattedRecipes = await Promise.all(recipes.map(formatRecipe));
    res.json(formattedRecipes);
  } catch (error) {
    console.error('Error fetching approved recipes:', error);
    res.status(500).json({ message: 'Error fetching approved recipes' });
  }
});

// Get user's submitted recipes
router.get('/my-recipes', auth, async (req, res) => {
  try {
    const recipes = await Recipe.findAll({
      where: { submittedBy: req.user.id },
      include: [{
        model: User,
        as: 'submittedByUser',
        attributes: ['id', 'username', 'profilePicture']
      }],
      order: [['createdAt', 'DESC']]
    });

    const formattedRecipes = await Promise.all(recipes.map(formatRecipe));
    res.json(formattedRecipes);
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    res.status(500).json({ message: 'Error fetching user recipes' });
  }
});

// Get approved recipes by username (public)
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find user by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get approved recipes by this user
    const recipes = await Recipe.findAll({
      where: {
        submittedBy: user.id,
        status: 'approved'
      },
      include: [{
        model: User,
        as: 'submittedByUser',
        attributes: ['id', 'username', 'profilePicture']
      }],
      order: [['approvedAt', 'DESC']]
    });

    const formattedRecipes = await Promise.all(recipes.map(formatRecipe));
    res.json(formattedRecipes);
  } catch (error) {
    console.error('Error fetching user recipes:', error);
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

    // First, find recipes by title or description
    const recipes = await Recipe.findAll({
      where: {
        status: 'approved',
        [Op.or]: [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } }
        ]
      },
      include: [
        {
          model: User,
          as: 'submittedByUser',
          attributes: ['id', 'username', 'profilePicture']
        },
        {
          model: RecipeIngredient,
          as: 'ingredients',
          attributes: ['name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Filter by ingredient name if needed
    const filteredRecipes = recipes.filter(recipe => {
      const ingredients = recipe.ingredients || [];
      return ingredients.some(ing => 
        ing.name.toLowerCase().includes(query.toLowerCase())
      ) || recipe.title.toLowerCase().includes(query.toLowerCase()) ||
         recipe.description.toLowerCase().includes(query.toLowerCase());
    });

    const formattedRecipes = await Promise.all(filteredRecipes.map(formatRecipe));
    res.json(formattedRecipes);
  } catch (error) {
    console.error('Error searching recipes:', error);
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
    const likeStatus = await LikeService.getLikeStatus(req.params.id, req.user.id);
    res.json(likeStatus);
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ message: 'Error checking like status', error: error.message });
  }
});

// Like a recipe (must come before /:id route)
router.post('/:id/like', auth, async (req, res) => {
  try {
    const wasLiked = await LikeService.toggleLike(req.params.id, req.user.id);
    
    const likeStatus = await LikeService.getLikeStatus(req.params.id, req.user.id);

    const response = {
      message: wasLiked ? 'Recipe liked successfully' : 'Recipe unliked successfully',
      isLiked: wasLiked,
      likeCount: likeStatus.likeCount
    };
    res.json(response);
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Error toggling like', error: error.message });
  }
});

// Get a single recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'submittedByUser',
        attributes: ['id', 'username', 'profilePicture']
      }]
    });
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    const formattedRecipe = await formatRecipe(recipe);
    res.json(formattedRecipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
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
    const recipe = await Recipe.findByPk(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if the user is the original submitter or an admin
    const user = await User.findByPk(req.user.id);
    if (recipe.submittedBy !== req.user.id && !user.isAdmin) {
      return res.status(403).json({ message: 'You can only edit your own recipes' });
    }

    // Update the recipe
    await recipe.update({
      title: req.body.title,
      description: req.body.description,
      servings: req.body.servings,
      prepTime: req.body.prepTime,
      cookTime: req.body.cookTime,
      image: req.body.image
    });

    // Update ingredients
    await RecipeIngredient.destroy({ where: { recipeId: recipe.id } });
    if (req.body.ingredients && Array.isArray(req.body.ingredients)) {
      await Promise.all(req.body.ingredients.map((ing, index) =>
        RecipeIngredient.create({
          recipeId: recipe.id,
          name: ing.name,
          amount: ing.amount,
          order: index
        })
      ));
    }

    // Update instructions
    await RecipeInstruction.destroy({ where: { recipeId: recipe.id } });
    if (req.body.instructions && Array.isArray(req.body.instructions)) {
      await Promise.all(req.body.instructions.map(inst =>
        RecipeInstruction.create({
          recipeId: recipe.id,
          step: inst.step,
          description: inst.description
        })
      ));
    }

    const formattedRecipe = await formatRecipe(recipe);
    res.json(formattedRecipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ message: 'Error updating recipe' });
  }
});

module.exports = router;
