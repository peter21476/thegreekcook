const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const { Sequelize } = require('sequelize');

// Get database URL from environment (Heroku Postgres provides DATABASE_URL)
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
}

// Parse the database URL
// Heroku Postgres requires SSL
const isHeroku = databaseUrl.includes('amazonaws.com') || databaseUrl.includes('heroku');
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: isHeroku ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;

