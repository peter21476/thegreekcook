import React from 'react';
import {Link} from 'react-router-dom';

function recipeModel({title, image, minutes, servings, recipeId, isHomePage, isUserRecipe, submittedBy}) {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    // Handle both string and object submittedBy
    const submittedById = typeof submittedBy === 'object' ? submittedBy._id : submittedBy;
    const isOwner = isUserRecipe && (currentUser._id === submittedById || currentUser.isAdmin);

    return (
        <div className={`${!isHomePage ? 'col-md-4' : ''} recipe-column`}>
            <div className="recipe-wrapper">
                {isUserRecipe && (
                    <div className="user-recipe-badge">
                        <span className="badge">User Recipe</span>
                        {submittedBy && <span className="submitted-by">by {submittedBy}</span>}
                    </div>
                )}
                <div
                    className="recipe-image"
                    style={{
                    backgroundImage: `url(${image})`
                }}></div>
                <div className="recipe-text">
                    <h5>{title}</h5>
                    <p>Ready in {minutes}
                        min.<br />
            Servings: {servings}</p>
                </div>
                <div className="button-link">
                    <Link to={`/result-item/${recipeId}?page=${window.location.pathname.includes('/results/') ? new URLSearchParams(window.location.search).get('page') || 1 : 1}`}>
                        <button className="btn btn-item">View Recipe</button>
                    </Link>
                    {isOwner && (
                        <Link to={`/edit-recipe/${recipeId}`}>
                            <button className="btn btn-edit">Edit</button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
export default recipeModel;
