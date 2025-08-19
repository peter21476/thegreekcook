import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_CONFIG } from '../config';
import { Helmet } from 'react-helmet';
import ImageUpload from './ImageUpload';
import analytics from '../utils/analytics';

function SubmitRecipe() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/recipes/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit recipe');
      }

      // Track recipe submission
      analytics.trackRecipeSubmission(formData.title);
      toast.success('Recipe submitted successfully! Waiting for admin approval.');
      navigate('/profile');
    } catch (error) {
      toast.error(error.message || 'Error submitting recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-recipe-container">
      <Helmet>
        <title>Submit Recipe | Zorbas' Kitchen</title>
        <meta name="description" content="Submit your own Greek recipe" />
      </Helmet>

      <div className="container">
        <h2>Submit Your Recipe</h2>
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
                <div className="ingredient-inputs">
                  <div className="input-group">
                    <label htmlFor={`ingredient-name-${index}`}>Ingredient Name</label>
                    <input
                      type="text"
                      id={`ingredient-name-${index}`}
                      placeholder="e.g., Olive Oil"
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor={`ingredient-amount-${index}`}>Amount</label>
                    <input
                      type="text"
                      id={`ingredient-amount-${index}`}
                      placeholder="e.g., 2 tablespoons"
                      value={ingredient.amount}
                      onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                      required
                      className="form-control"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="btn btn-danger"
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
                  placeholder="Step description"
                  value={instruction.description}
                  onChange={(e) => handleInstructionChange(index, e.target.value)}
                  required
                  className="form-control"
                  rows="2"
                />
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="btn btn-danger"
                  disabled={formData.instructions.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addInstruction} className="btn btn-secondary">
              Add Step
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

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Recipe'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SubmitRecipe; 