const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecipeLike = sequelize.define('RecipeLike', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  recipeId: {
    type: DataTypes.STRING,
    allowNull: false,
    index: true
  },
  isExternalRecipe: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'recipe_likes',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['recipeId', 'userId']
    }
  ]
});

// Static methods
RecipeLike.getLikeCount = async function(recipeId) {
  return await this.count({ where: { recipeId } });
};

RecipeLike.hasUserLiked = async function(recipeId, userId) {
  const like = await this.findOne({ where: { recipeId, userId } });
  return !!like;
};

RecipeLike.toggleLike = async function(recipeId, userId) {
  const existingLike = await this.findOne({ where: { recipeId, userId } });
  
  if (existingLike) {
    await this.destroy({ where: { recipeId, userId } });
    return false; // Return false to indicate unliked
  } else {
    await this.create({ recipeId, userId, isExternalRecipe: true });
    return true; // Return true to indicate liked
  }
};

module.exports = RecipeLike;
