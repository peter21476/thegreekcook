const sequelize = require('../config/database');
const User = require('./User');
const Recipe = require('./Recipe');
const RecipeLike = require('./RecipeLike');
const RecipeIngredient = require('./RecipeIngredient');
const RecipeInstruction = require('./RecipeInstruction');
const UserFavorite = require('./UserFavorite');
const RecipeLikeInternal = require('./RecipeLikeInternal');

// Define associations
User.hasMany(Recipe, { foreignKey: 'submittedBy', as: 'submittedRecipes' });
Recipe.belongsTo(User, { foreignKey: 'submittedBy', as: 'submittedByUser' });

Recipe.hasMany(RecipeIngredient, { foreignKey: 'recipeId', as: 'ingredients' });
RecipeIngredient.belongsTo(Recipe, { foreignKey: 'recipeId', as: 'recipe' });

Recipe.hasMany(RecipeInstruction, { foreignKey: 'recipeId', as: 'instructions' });
RecipeInstruction.belongsTo(Recipe, { foreignKey: 'recipeId', as: 'recipe' });

User.hasMany(UserFavorite, { foreignKey: 'userId', as: 'favorites' });
UserFavorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(RecipeLike, { foreignKey: 'userId', as: 'externalLikes' });
RecipeLike.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(RecipeLikeInternal, { foreignKey: 'userId', as: 'internalLikes' });
RecipeLikeInternal.belongsTo(User, { foreignKey: 'userId', as: 'user' });
RecipeLikeInternal.belongsTo(Recipe, { foreignKey: 'recipeId', as: 'recipe' });

Recipe.hasMany(RecipeLikeInternal, { foreignKey: 'recipeId', as: 'likes' });

module.exports = {
  sequelize,
  User,
  Recipe,
  RecipeLike,
  RecipeIngredient,
  RecipeInstruction,
  UserFavorite,
  RecipeLikeInternal
};

