const mongoose = require('mongoose');

const recipeLikeSchema = new mongoose.Schema({
  recipeId: {
    type: String,
    required: true,
    index: true
  },
  isExternalRecipe: {
    type: Boolean,
    default: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only like a recipe once
recipeLikeSchema.index({ recipeId: 1, user: 1 }, { unique: true });

// Static method to get like count for a recipe
recipeLikeSchema.statics.getLikeCount = async function(recipeId) {
  return await this.countDocuments({ recipeId });
};

// Static method to check if user has liked a recipe
recipeLikeSchema.statics.hasUserLiked = async function(recipeId, userId) {
  return await this.exists({ recipeId, user: userId });
};

// Static method to toggle like
recipeLikeSchema.statics.toggleLike = async function(recipeId, userId) {
  const existingLike = await this.findOne({ recipeId, user: userId });
  
  if (existingLike) {
    // Unlike: remove the like
    await this.deleteOne({ recipeId, user: userId });
    return false; // Return false to indicate unliked
  } else {
    // Like: add the like
    await this.create({ recipeId, user: userId });
    return true; // Return true to indicate liked
  }
};

module.exports = mongoose.model('RecipeLike', recipeLikeSchema);
