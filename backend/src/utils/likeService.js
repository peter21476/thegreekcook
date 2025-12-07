const { Recipe, RecipeLike, RecipeLikeInternal } = require('../models');
const { Op } = require('sequelize');

class LikeService {
  /**
   * Check if a recipe is internal (stored in our DB) or external (Spoonacular)
   */
  static isInternalRecipe(recipeId) {
    // Internal recipes have UUID format (36 characters with hyphens)
    // External recipes are numeric strings (Spoonacular IDs)
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recipeId);
  }

  /**
   * Get like count for a recipe (works for both internal and external)
   */
  static async getLikeCount(recipeId) {
    if (this.isInternalRecipe(recipeId)) {
      // Internal recipe - get from RecipeLikeInternal model
      return await RecipeLikeInternal.count({ where: { recipeId } });
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
      // Internal recipe - check RecipeLikeInternal model
      const like = await RecipeLikeInternal.findOne({ 
        where: { recipeId, userId } 
      });
      return !!like;
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
      // Internal recipe - use RecipeLikeInternal model
      const existingLike = await RecipeLikeInternal.findOne({ 
        where: { recipeId, userId } 
      });
      
      if (existingLike) {
        await RecipeLikeInternal.destroy({ where: { recipeId, userId } });
        return false; // Return false to indicate unliked
      } else {
        await RecipeLikeInternal.create({ recipeId, userId });
        return true; // Return true to indicate liked
      }
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
