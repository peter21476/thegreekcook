require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const recipeRoutes = require('./routes/recipe');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const path = require('path');
const { sequelize } = require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to PostgreSQL
sequelize.authenticate()
  .then(() => {
    console.log('Connected to PostgreSQL');
    // Sync models (create tables if they don't exist)
    return sequelize.sync({ alter: false });
  })
  .then(() => {
    console.log('Database models synchronized');
  })
  .catch(err => {
    console.error('PostgreSQL connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, '../../build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 