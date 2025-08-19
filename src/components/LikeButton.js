import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../config';

const LikeButton = ({ recipeId, initialLikeCount = 0, onLikeChange }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    if (isLoggedIn && recipeId) {
      checkLikeStatus();
    }
  }, [recipeId, isLoggedIn]);

  const checkLikeStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/recipes/${recipeId}/like-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.isLiked);
        setLikeCount(data.likeCount);
      } else {
        console.error('Failed to check like status:', response.status);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLikeToggle = async () => {
    if (!isLoggedIn) {
      // Redirect to login or show login prompt
      window.location.href = '/login';
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/recipes/${recipeId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.isLiked);
        setLikeCount(data.likeCount);
        
        // Call the callback if provided
        if (onLikeChange) {
          onLikeChange(data.isLiked, data.likeCount);
        }
      } else {
        // Try to get error message from response
        let errorMessage = 'Error toggling like';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Could not parse error response
        }
        
        console.error('Like toggle failed:', response.status, errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setError(error.message || 'Error toggling like');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="like-button-container">
      <button
        onClick={handleLikeToggle}
        disabled={loading}
        className={`like-button ${isLiked ? 'liked' : ''} ${loading ? 'loading' : ''}`}
        title={isLoggedIn ? (isLiked ? 'Unlike this recipe' : 'Like this recipe') : 'Login to like recipes'}
      >
        <span className="like-icon">
          {isLiked ? '❤️' : '🤍'}
        </span>
        <span className="like-count">{likeCount}</span>
        {loading && <span className="loading-spinner">⏳</span>}
      </button>
      {error && <div className="like-error">{error}</div>}
    </div>
  );
};

export default LikeButton;
