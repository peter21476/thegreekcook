const Recipe = require('../models/Recipe');
const RecipeLike = require('../models/RecipeLike');

class LikeService {
  /**
   * Check if a recipe is internal (stored in our DB) or external (Spoonacular)
   */
  static isInternalRecipe(recipeId) {
    // Internal recipes have MongoDB ObjectId format (24 hex characters)
    return /^[0-9a-fA-F]{24}$/.test(recipeId);
  }

  /**
   * Get like count for a recipe (works for both internal and external)
   */
  static async getLikeCount(recipeId) {
    if (this.isInternalRecipe(recipeId)) {
      // Internal recipe - get from Recipe model
      const recipe = await Recipe.findById(recipeId);
      return recipe ? recipe.likeCount : 0;
    } else {
      // External recipe - get from RecipeLike model
      return await RecipeLike.getLikeCount(recipeId);
    }
  }

  /**
   * Check if user has liked a recipe (works for both internal and external)
   */
  static async hasUserLiked(recipeId, userId) {
    if (this.isInternalRecipe(recipeId)) {
      // Internal recipe - check Recipe model
      const recipe = await Recipe.findById(recipeId);
      return recipe ? recipe.isLikedBy(userId) : false;
    } else {
      // External recipe - check RecipeLike model
      return await RecipeLike.hasUserLiked(recipeId, userId);
    }
  }

  /**
   * Toggle like for a recipe (works for both internal and external)
   */
  static async toggleLike(recipeId, userId) {
    if (this.isInternalRecipe(recipeId)) {
      // Internal recipe - use Recipe model methods
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        throw new Error('Recipe not found');
      }
      
      const wasLiked = recipe.toggleLike(userId);
      await recipe.save();
      return wasLiked;
    } else {
      // External recipe - use RecipeLike model methods
      return await RecipeLike.toggleLike(recipeId, userId);
    }
  }

  /**
   * Get like status and count for a recipe (works for both internal and external)
   */
  static async getLikeStatus(recipeId, userId) {
    const [isLiked, likeCount] = await Promise.all([
      this.hasUserLiked(recipeId, userId),
      this.getLikeCount(recipeId)
    ]);

    return {
      isLiked,
      likeCount
    };
  }
}

module.exports = LikeService;
