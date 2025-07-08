export const API_CONFIG = {
    // Replace this with your Spoonacular API key from https://spoonacular.com/food-api
    APP_KEY: process.env.REACT_APP_SPOONACULAR_API_KEY || "YOUR_SPOONACULAR_API_KEY",
    BASE_URL: "https://spoonacular.com/recipeImages/",
    API_BASE_URL: "https://api.spoonacular.com/recipes",
    BACKEND_URL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001'
}; 