const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecipeLikeInternal = sequelize.define('RecipeLikeInternal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  recipeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'recipes',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  tableName: 'recipe_likes_internal',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['recipeId', 'userId']
    }
  ]
});

module.exports = RecipeLikeInternal;

