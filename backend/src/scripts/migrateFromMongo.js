const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { v4: uuidv4 } = require('uuid');
const models = require('../models');

// Map to store MongoDB ObjectId to PostgreSQL UUID mappings
const userIdMap = new Map();
const recipeIdMap = new Map();

// Helper function to parse CSV file
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    bom: true
  });
}

// Helper function to extract nested array data from CSV
function extractArrayData(row, prefix) {
  const items = [];
  let index = 0;
  
  while (true) {
    const nameKey = `${prefix}[${index}].name`;
    const amountKey = `${prefix}[${index}].amount`;
    
    if (row[nameKey] && row[amountKey]) {
      items.push({
        name: row[nameKey],
        amount: row[amountKey],
        order: index
      });
      index++;
    } else {
      break;
    }
  }
  
  return items;
}

// Helper function to extract instructions from CSV
function extractInstructions(row) {
  const instructions = [];
  let index = 0;
  
  while (true) {
    const stepKey = `instructions[${index}].step`;
    const descKey = `instructions[${index}].description`;
    
    if (row[stepKey] && row[descKey]) {
      instructions.push({
        step: parseInt(row[stepKey]) || index + 1,
        description: row[descKey]
      });
      index++;
    } else {
      break;
    }
  }
  
  return instructions;
}

// Helper function to extract favorites from CSV
function extractFavorites(row) {
  const favorites = [];
  let index = 0;
  
  while (true) {
    const recipeIdKey = `favorites[${index}].recipeId`;
    const titleKey = `favorites[${index}].title`;
    const imageKey = `favorites[${index}].image`;
    
    if (row[recipeIdKey]) {
      favorites.push({
        recipeId: row[recipeIdKey],
        title: row[titleKey] || null,
        image: row[imageKey] || null
      });
      index++;
    } else {
      break;
    }
  }
  
  return favorites;
}

async function migrateUsers() {
  console.log('Migrating users...');
  const csvPath = path.join(require('os').homedir(), 'Documents/data from mongo db/test.users.csv');
  const rows = parseCSV(csvPath);
  
  for (const row of rows) {
    try {
      const newUserId = uuidv4();
      userIdMap.set(row._id, newUserId);
      
      const user = await models.User.create({
        id: newUserId,
        username: row.username,
        email: row.email,
        password: row.password, // Already hashed
        profilePicture: row.profilePicture || null,
        about: row.about || null,
        isAdmin: row.isAdmin === 'true' || row.isAdmin === true,
        resetPasswordToken: row.resetPasswordToken || null,
        resetPasswordExpires: row.resetPasswordExpires ? new Date(row.resetPasswordExpires) : null,
        createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
        updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date()
      });
      
      // Migrate favorites
      const favorites = extractFavorites(row);
      for (const favorite of favorites) {
        await models.UserFavorite.create({
          userId: newUserId,
          recipeId: favorite.recipeId,
          title: favorite.title,
          image: favorite.image,
          createdAt: new Date()
        });
      }
      
      console.log(`Migrated user: ${row.username}`);
    } catch (error) {
      console.error(`Error migrating user ${row.username}:`, error.message);
    }
  }
  
  console.log(`Migrated ${rows.length} users`);
}

async function migrateRecipes() {
  console.log('Migrating recipes...');
  const csvPath = path.join(require('os').homedir(), 'Documents/data from mongo db/test.recipes.csv');
  const rows = parseCSV(csvPath);
  
  for (const row of rows) {
    try {
      const newRecipeId = uuidv4();
      recipeIdMap.set(row._id, newRecipeId);
      
      // Get the new user ID
      const submittedByUserId = userIdMap.get(row.submittedBy);
      if (!submittedByUserId) {
        console.warn(`User ${row.submittedBy} not found for recipe ${row.title}`);
        continue;
      }
      
      const approvedByUserId = row.approvedBy ? userIdMap.get(row.approvedBy) : null;
      
      const recipe = await models.Recipe.create({
        id: newRecipeId,
        title: row.title,
        description: row.description,
        servings: parseInt(row.servings) || 1,
        prepTime: parseInt(row.prepTime) || 0,
        cookTime: parseInt(row.cookTime) || 0,
        image: row.image,
        submittedBy: submittedByUserId,
        status: row.status || 'pending',
        approvedBy: approvedByUserId,
        approvedAt: row.approvedAt ? new Date(row.approvedAt) : null,
        rejectionReason: row.rejectionReason || null,
        createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
        updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date()
      });
      
      // Migrate ingredients
      const ingredients = extractArrayData(row, 'ingredients');
      for (const ingredient of ingredients) {
        await models.RecipeIngredient.create({
          recipeId: newRecipeId,
          name: ingredient.name,
          amount: ingredient.amount,
          order: ingredient.order
        });
      }
      
      // Migrate instructions
      const instructions = extractInstructions(row);
      for (const instruction of instructions) {
        await models.RecipeInstruction.create({
          recipeId: newRecipeId,
          step: instruction.step,
          description: instruction.description
        });
      }
      
      // Migrate internal likes (from likes array in recipe)
      if (row['likes[0].user']) {
        let likeIndex = 0;
        while (row[`likes[${likeIndex}].user`]) {
          const likedByUserId = userIdMap.get(row[`likes[${likeIndex}].user`]);
          if (likedByUserId) {
            await models.RecipeLikeInternal.create({
              recipeId: newRecipeId,
              userId: likedByUserId,
              createdAt: row[`likes[${likeIndex}].likedAt`] ? new Date(row[`likes[${likeIndex}].likedAt`]) : new Date()
            });
          }
          likeIndex++;
        }
      }
      
      console.log(`Migrated recipe: ${row.title}`);
    } catch (error) {
      console.error(`Error migrating recipe ${row.title}:`, error.message);
    }
  }
  
  console.log(`Migrated ${rows.length} recipes`);
}

async function migrateRecipeLikes() {
  console.log('Migrating recipe likes (external)...');
  const csvPath = path.join(require('os').homedir(), 'Documents/data from mongo db/test.recipelikes.csv');
  const rows = parseCSV(csvPath);
  
  for (const row of rows) {
    try {
      const userId = userIdMap.get(row.user);
      if (!userId) {
        console.warn(`User ${row.user} not found for like ${row._id}`);
        continue;
      }
      
      await models.RecipeLike.create({
        recipeId: row.recipeId,
        isExternalRecipe: row.isExternalRecipe === 'true' || row.isExternalRecipe === true,
        userId: userId,
        createdAt: row.likedAt ? new Date(row.likedAt) : new Date(),
        updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date()
      });
      
      console.log(`Migrated like for recipe ${row.recipeId}`);
    } catch (error) {
      console.error(`Error migrating like ${row._id}:`, error.message);
    }
  }
  
  console.log(`Migrated ${rows.length} recipe likes`);
}

async function main() {
  try {
    // Test database connection
    await models.sequelize.authenticate();
    console.log('Database connection established.');
    
    // Sync all models (create tables)
    console.log('Creating database tables...');
    await models.sequelize.sync({ force: false }); // Set to true to drop existing tables
    
    // Run migrations
    await migrateUsers();
    await migrateRecipes();
    await migrateRecipeLikes();
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

main();

