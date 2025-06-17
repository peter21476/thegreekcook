import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Auth.scss';
import { API_CONFIG } from '../../config';
import { Helmet } from 'react-helmet';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [submittedRecipes, setSubmittedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('favorites'); // 'favorites' or 'submitted'

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch user profile
      const userResponse = await fetch(`${API_CONFIG.BACKEND_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await userResponse.json();
      setUser(userData);

      // Fetch favorites
      const favoritesResponse = await fetch(`${API_CONFIG.BACKEND_URL}/api/user/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!favoritesResponse.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const favoritesData = await favoritesResponse.json();
      setFavorites(favoritesData);

      // Fetch submitted recipes
      const recipesResponse = await fetch(`${API_CONFIG.BACKEND_URL}/api/recipes/my-recipes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!recipesResponse.ok) {
        throw new Error('Failed to fetch submitted recipes');
      }

      const recipesData = await recipesResponse.json();
      setSubmittedRecipes(recipesData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/login')} className="auth-button">
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Helmet>
        <title>Profile | Zorbas' Kitchen</title>
        <meta name="description" content="Your profile and recipes" />
      </Helmet>

      <h2>Profile</h2>
      {user && (
        <div className="profile-info">
          <div className="profile-section">
            <h3>User Information</h3>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            {user.isAdmin && (
              <p className="admin-badge">Administrator</p>
            )}
          </div>

          <div className="profile-actions">
            <button onClick={() => navigate('/submit-recipe')} className="btn btn-primary">
              Submit New Recipe
            </button>
            {user.isAdmin && (
              <button onClick={() => navigate('/admin/recipes')} className="btn btn-secondary">
                Manage Recipes
              </button>
            )}
          </div>

          <div className="profile-tabs">
            <button
              className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              Favorite Recipes
            </button>
            <button
              className={`tab-button ${activeTab === 'submitted' ? 'active' : ''}`}
              onClick={() => setActiveTab('submitted')}
            >
              My Submitted Recipes
            </button>
          </div>

          {activeTab === 'favorites' ? (
            <div className="profile-section">
              <h3>Favorite Recipes</h3>
              {favorites.length === 0 ? (
                <p>No favorite recipes yet</p>
              ) : (
                <div className="favorites-grid">
                  {favorites.map((recipe) => (
                    <div key={recipe.id} className="favorite-recipe">
                      <img src={recipe.image} alt={recipe.title} />
                      <h4>{recipe.title}</h4>
                      <button
                        onClick={() => navigate(`/result-item/${recipe.recipeId}?from=favorites`)}
                        className="view-recipe-btn"
                      >
                        View Recipe
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="profile-section">
              <h3>My Submitted Recipes</h3>
              {submittedRecipes.length === 0 ? (
                <p>No submitted recipes yet</p>
              ) : (
                <div className="submitted-recipes-grid">
                  {submittedRecipes.map((recipe) => (
                    <div key={recipe._id} className="submitted-recipe">
                      <img src={recipe.image} alt={recipe.title} />
                      <div className="recipe-info">
                        <h4>{recipe.title}</h4>
                        <p className={`status ${recipe.status}`}>
                          Status: {recipe.status.charAt(0).toUpperCase() + recipe.status.slice(1)}
                        </p>
                        {recipe.status === 'rejected' && recipe.rejectionReason && (
                          <p className="rejection-reason">
                            Reason: {recipe.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile; 