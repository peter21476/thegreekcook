const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecipeInstruction = sequelize.define('RecipeInstruction', {
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
  step: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'recipe_instructions',
  timestamps: false
});

module.exports = RecipeInstruction;

