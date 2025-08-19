import React from 'react';
import {Link} from 'react-router-dom';
import LikeButton from './LikeButton';
import { API_CONFIG } from '../config';

function recipeModel({title, image, minutes, servings, recipeId, isHomePage, isUserRecipe, submittedBy, likeCount = 0}) {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    // Handle both string and object submittedBy
    const submittedById = typeof submittedBy === 'object' ? submittedBy._id : submittedBy;
    const isOwner = isUserRecipe && (currentUser._id === submittedById || currentUser.isAdmin);
    
    // Extract username and profile picture from submittedBy
    const username = typeof submittedBy === 'object' ? submittedBy.username : submittedBy;
    const profilePicture = typeof submittedBy === 'object' ? submittedBy.profilePicture : null;



    // Determine if we're in a grid context (public profile)
    const isInGrid = window.location.pathname.includes('/profile/') && !isHomePage;

    return (
        <div className={`${!isHomePage && !isInGrid ? 'col-md-4' : ''} recipe-column`}>
            <div className="recipe-wrapper">
                {isUserRecipe && (
                    <div className="user-recipe-badge">
                        <span className="badge">User Recipe</span>
                        {username && (
                            <div className="submitted-by">
                                {profilePicture ? (
                                    <img 
                                        src={profilePicture} 
                                        alt={username} 
                                        className="submitter-profile-picture"
                                    />
                                ) : (
                                    <span className="submitter-icon">👤</span>
                                )}
                                <Link to={`/profile/${username}`} className="submitter-name">
                                    by {username}
                                </Link>
                            </div>
                        )}
                    </div>
                )}
                <div
                    className="recipe-image"
                    style={{
                    backgroundImage: `url(${image})`
                }}></div>
                <div className="recipe-text">
                    <div className="recipe-title-section">
                        <h5>{title}</h5>
                        <LikeButton 
                            recipeId={recipeId} 
                            initialLikeCount={likeCount}
                        />
                    </div>
                    <p>Ready in {minutes}
                        min.<br />
            Servings: {servings}</p>
                </div>
                <div className="recipe-actions">
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
        </div>
    )
}
export default recipeModel;
