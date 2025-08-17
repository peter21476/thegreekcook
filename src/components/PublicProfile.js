import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { API_CONFIG } from '../config';
import Recipe from './recipe';

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('recipes'); // 'recipes' or 'about'

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const userResponse = await fetch(`${API_CONFIG.BACKEND_URL}/api/user/public/${username}`);
      
      if (!userResponse.ok) {
        if (userResponse.status === 404) {
          setError('User not found');
        } else {
          throw new Error('Failed to fetch user profile');
        }
        return;
      }

      const userData = await userResponse.json();
      setUser(userData);

      // Fetch user's approved recipes
      const recipesResponse = await fetch(`${API_CONFIG.BACKEND_URL}/api/recipes/user/${username}`);
      
      if (recipesResponse.ok) {
        const recipesData = await recipesResponse.json();
        setRecipes(recipesData);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="public-profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-profile-container">
        <div className="error-message">
          <h3>Profile Not Found</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-profile-container">
      <Helmet>
        <title>{user?.username} | Zorbas' Kitchen</title>
        <meta name="description" content={`View ${user?.username}'s recipes and profile on Zorbas' Kitchen`} />
      </Helmet>

      <div className="profile-header">
        <div className="profile-avatar">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt={user.username} />
          ) : (
            <div className="profile-placeholder">
              <span>👤</span>
            </div>
          )}
        </div>
        <div className="profile-info">
          <h1>{user?.username}</h1>
          <p className="member-since">
            Member since {new Date(user?.createdAt).toLocaleDateString()}
          </p>
          <div className="stats">
            <div className="stat">
              <span className="stat-number">{recipes.length}</span>
              <span className="stat-label">Recipes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'recipes' ? 'active' : ''}`}
          onClick={() => setActiveTab('recipes')}
        >
          Recipes ({recipes.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
      </div>

      {activeTab === 'recipes' ? (
        <div className="recipes-section">
          {recipes.length === 0 ? (
            <div className="no-recipes">
              <p>No recipes shared yet</p>
              <p className="subtitle">This user hasn't shared any recipes yet.</p>
            </div>
          ) : (
            <div className="recipes-grid">
              {recipes.map((recipe) => (
                <Recipe
                  key={recipe._id}
                  title={recipe.title}
                  image={recipe.image}
                  minutes={recipe.prepTime + recipe.cookTime}
                  servings={recipe.servings}
                  recipeId={recipe._id}
                  isUserRecipe={true}
                  submittedBy={user}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="about-section">
          <div className="about-card">
            <h3>About {user?.username}</h3>
            {user?.about ? (
              <div className="about-content">
                <p>{user.about}</p>
              </div>
            ) : (
              <p className="no-about">This user hasn't added an about description yet.</p>
            )}
            <div className="about-stats">
              <p><strong>Recipes shared:</strong> {recipes.length}</p>
              <p><strong>Member since:</strong> {new Date(user?.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfile;
