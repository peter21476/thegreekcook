import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_CONFIG } from '../config';
import { Helmet } from 'react-helmet';
import ImageUpload from './ImageUpload';

function EditRecipe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: [{ name: '', amount: '' }],
    instructions: [{ step: 1, description: '' }],
    servings: '',
    prepTime: '',
    cookTime: '',
    image: ''
  });

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/recipes/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recipe');
      }

      const recipe = await response.json();
      
      // Check if the current user is the recipe owner or an admin
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const submittedById = typeof recipe.submittedBy === 'object' ? recipe.submittedBy._id : recipe.submittedBy;
      
      if (submittedById !== currentUser._id && !currentUser.isAdmin) {
        toast.error('You can only edit your own recipes');
        navigate('/profile');
        return;
      }

      setFormData({
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        servings: recipe.servings,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        image: recipe.image
      });
    } catch (error) {
      toast.error('Error fetching recipe');
      navigate('/profile');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData({
      ...formData,
      ingredients: newIngredients
    });
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index].description = value;
    setFormData({
      ...formData,
      instructions: newInstructions
    });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', amount: '' }]
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      ingredients: newIngredients
    });
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, { step: formData.instructions.length + 1, description: '' }]
    });
  };

  const removeInstruction = (index) => {
    const newInstructions = formData.instructions.filter((_, i) => i !== index);
    // Update step numbers
    newInstructions.forEach((instruction, i) => {
      instruction.step = i + 1;
    });
    setFormData({
      ...formData,
      instructions: newInstructions
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/recipes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update recipe');
      }

      toast.success('Recipe updated successfully!');
      navigate('/profile');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="loading-container">
        <div className="lds-roller">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p className="loading-text">Loading recipe...</p>
      </div>
    );
  }

  return (
    <div className="edit-recipe-container">
      <Helmet>
        <title>Edit Recipe | Zorbas' Kitchen</title>
        <meta name="description" content="Edit your recipe" />
      </Helmet>

      <div className="container">
        <h2>Edit Recipe</h2>
        <form onSubmit={handleSubmit} className="recipe-form">
          <div className="form-group">
            <label htmlFor="title">Recipe Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="form-control"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Ingredients</label>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-row">
                <input
                  type="text"
                  placeholder="Amount (e.g., 2 cups)"
                  value={ingredient.amount}
                  onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                  required
                  className="form-control ingredient-amount"
                />
                <input
                  type="text"
                  placeholder="Ingredient name"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  required
                  className="form-control ingredient-name"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="btn btn-danger remove-btn"
                  disabled={formData.ingredients.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addIngredient} className="btn btn-secondary">
              Add Ingredient
            </button>
          </div>

          <div className="form-group">
            <label>Instructions</label>
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="instruction-row">
                <span className="step-number">{instruction.step}.</span>
                <textarea
                  placeholder="Instruction description"
                  value={instruction.description}
                  onChange={(e) => handleInstructionChange(index, e.target.value)}
                  required
                  className="form-control instruction-text"
                  rows="3"
                />
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="btn btn-danger remove-btn"
                  disabled={formData.instructions.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addInstruction} className="btn btn-secondary">
              Add Instruction
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="servings">Servings</label>
              <input
                type="number"
                id="servings"
                name="servings"
                value={formData.servings}
                onChange={handleChange}
                required
                min="1"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="prepTime">Prep Time (minutes)</label>
              <input
                type="number"
                id="prepTime"
                name="prepTime"
                value={formData.prepTime}
                onChange={handleChange}
                required
                min="0"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cookTime">Cook Time (minutes)</label>
              <input
                type="number"
                id="cookTime"
                name="cookTime"
                value={formData.cookTime}
                onChange={handleChange}
                required
                min="0"
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="image">Recipe Image</label>
            <ImageUpload
              onImageUpload={(url) => setFormData({ ...formData, image: url })}
              currentImage={formData.image}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Recipe'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/profile')} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditRecipe; 