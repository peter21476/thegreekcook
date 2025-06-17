import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_CONFIG } from '../../config';
import { Helmet } from 'react-helmet';

function RecipeApproval() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    fetchPendingRecipes();
  }, []);

  const fetchPendingRecipes = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/recipes/pending`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending recipes');
      }

      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (recipeId) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/recipes/approve/${recipeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve recipe');
      }

      toast.success('Recipe approved successfully');
      fetchPendingRecipes();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReject = async (recipeId) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/recipes/reject/${recipeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason })
      });

      if (!response.ok) {
        throw new Error('Failed to reject recipe');
      }

      toast.success('Recipe rejected successfully');
      setRejectionReason('');
      setSelectedRecipe(null);
      fetchPendingRecipes();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="lds-roller">
          <div></div><div></div><div></div><div></div>
          <div></div><div></div><div></div><div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-approval-container">
      <Helmet>
        <title>Recipe Approval | Zorbas' Kitchen</title>
        <meta name="description" content="Approve or reject submitted recipes" />
      </Helmet>

      <div className="container">
        <h2>Pending Recipe Submissions</h2>
        
        {recipes.length === 0 ? (
          <p className="no-recipes">No pending recipes to review</p>
        ) : (
          <div className="recipes-grid">
            {recipes.map(recipe => (
              <div key={recipe._id} className="recipe-card">
                <img src={recipe.image} alt={recipe.title} className="recipe-image" />
                <div className="recipe-content">
                  <h3>{recipe.title}</h3>
                  <p className="submitted-by">Submitted by: {recipe.submittedBy.username}</p>
                  <p className="description">{recipe.description}</p>
                  
                  <div className="recipe-details">
                    <p><strong>Servings:</strong> {recipe.servings}</p>
                    <p><strong>Prep Time:</strong> {recipe.prepTime} minutes</p>
                    <p><strong>Cook Time:</strong> {recipe.cookTime} minutes</p>
                  </div>

                  <div className="ingredients">
                    <h4>Ingredients:</h4>
                    <ul>
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index}>
                          {ingredient.amount} {ingredient.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="instructions">
                    <h4>Instructions:</h4>
                    <ol>
                      {recipe.instructions.map((instruction, index) => (
                        <li key={index}>{instruction.description}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="approval-actions">
                    <button
                      onClick={() => handleApprove(recipe._id)}
                      className="btn btn-success"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setSelectedRecipe(recipe)}
                      className="btn btn-danger"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedRecipe && (
          <div className="rejection-modal">
            <div className="modal-content">
              <h3>Reject Recipe</h3>
              <p>Please provide a reason for rejecting this recipe:</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows="4"
                className="form-control"
              />
              <div className="modal-actions">
                <button
                  onClick={() => handleReject(selectedRecipe._id)}
                  className="btn btn-danger"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setSelectedRecipe(null);
                    setRejectionReason('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeApproval; 