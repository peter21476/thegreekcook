import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.scss';
import { API_CONFIG } from '../../config';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Fetch user profile
        const userResponse = await fetch(`${API_CONFIG.BACKEND_URL}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch user profile');
        }

        const userData = await userResponse.json();
        setUser(userData);

        // Fetch user's favorite recipes
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
      } catch (err) {
        console.error('Profile error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

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
      <h2>Profile</h2>
      {user && (
        <div className="profile-info">
          <div className="profile-section">
            <h3>User Information</h3>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>

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
                      onClick={() => navigate(`/result-item/${recipe.recipeId}`)}
                      className="view-recipe-btn"
                    >
                      View Recipe
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile; 