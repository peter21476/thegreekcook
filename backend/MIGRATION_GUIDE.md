# MongoDB to PostgreSQL Migration Guide

This guide will help you migrate your application from MongoDB Atlas to Heroku Postgres.

## Prerequisites

1. Heroku Postgres database created and configured
2. MongoDB data exported to CSV files in the `data from mongo db` folder
3. Node.js and npm installed

## Step 1: Install Dependencies

Run the following command in the `backend` directory:

```bash
npm install
```

This will install the new PostgreSQL dependencies (pg, sequelize, csv-parse, uuid) and remove the need for mongoose.

## Step 2: Configure Environment Variables

Make sure your `.env` file (or Heroku config vars) includes:

- `DATABASE_URL` - Your Heroku Postgres connection string (automatically set by Heroku)
- `JWT_SECRET` - Your JWT secret key
- Other existing environment variables (Cloudinary, email, etc.)

If you're running locally, you can get your Heroku Postgres URL by running:
```bash
heroku config:get DATABASE_URL
```

## Step 3: Run the Migration Script

The migration script will:
1. Create all necessary database tables
2. Import users from `test.users.csv`
3. Import recipes from `test.recipes.csv`
4. Import recipe likes from `test.recipelikes.csv`

To run the migration:

```bash
npm run migrate
```

Or directly:
```bash
node src/scripts/migrateFromMongo.js
```

**Important Notes:**
- The script will create tables if they don't exist
- It will NOT drop existing tables (set `force: true` in the script if you need to start fresh)
- Passwords are already hashed in MongoDB, so they will be preserved as-is
- MongoDB ObjectIds are mapped to PostgreSQL UUIDs

## Step 4: Verify the Migration

After running the migration, verify that:
1. All users were migrated
2. All recipes were migrated with their ingredients and instructions
3. All favorites and likes were migrated

You can check your Heroku Postgres database using:
```bash
heroku pg:psql
```

Then run queries like:
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM recipes;
SELECT COUNT(*) FROM recipe_likes;
```

## Step 5: Update Your Application

The codebase has been updated to use Sequelize instead of Mongoose. Key changes:

- **Models**: Now use Sequelize with PostgreSQL
- **Routes**: Updated to use Sequelize query methods
- **Database Connection**: Now connects to PostgreSQL instead of MongoDB

## Step 6: Deploy to Heroku

1. Commit your changes:
```bash
git add .
git commit -m "Migrate from MongoDB to PostgreSQL"
```

2. Deploy to Heroku:
```bash
git push heroku master
```

3. Run the migration on Heroku:
```bash
heroku run npm run migrate
```

## Troubleshooting

### Migration Script Errors

If you encounter errors during migration:

1. **CSV file not found**: Make sure the CSV files are in `Documents/data from mongo db/`
2. **Database connection error**: Verify your `DATABASE_URL` is correct
3. **Duplicate key errors**: The script handles duplicates, but if you need to restart, you may need to clear existing data first

### Application Errors

If the application doesn't work after migration:

1. Check that all tables were created: `heroku pg:psql` and run `\dt`
2. Verify data was imported: Check row counts in each table
3. Check application logs: `heroku logs --tail`

## Data Structure Changes

### MongoDB to PostgreSQL Mapping

- **ObjectIds** → **UUIDs**: All MongoDB ObjectIds are converted to PostgreSQL UUIDs
- **Nested Arrays**: 
  - `ingredients` → `recipe_ingredients` table
  - `instructions` → `recipe_instructions` table
  - `favorites` → `user_favorites` table
  - `likes` (internal) → `recipe_likes_internal` table
- **Timestamps**: Preserved from MongoDB

### New Tables

- `users` - User accounts
- `recipes` - Recipe main data
- `recipe_ingredients` - Recipe ingredients (one-to-many)
- `recipe_instructions` - Recipe instructions (one-to-many)
- `user_favorites` - User favorite recipes
- `recipe_likes` - External recipe likes (Spoonacular)
- `recipe_likes_internal` - Internal recipe likes

## Rollback Plan

If you need to rollback:

1. Keep your MongoDB Atlas database active until you're confident in the migration
2. The original MongoDB code is still in git history
3. You can switch back by reverting the commit and updating environment variables

## Support

If you encounter issues, check:
- Heroku Postgres logs: `heroku logs --ps postgres`
- Application logs: `heroku logs --tail`
- Database status: `heroku pg:info`

