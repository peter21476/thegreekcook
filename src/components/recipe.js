import React from 'react';
import {Link} from 'react-router-dom';

function recipeModel({title, image, minutes, servings, recipeId, isHomePage}) {

    return (
        <div className={`${!isHomePage ? 'col-md-4' : ''} recipe-column`}>
            <div className="recipe-wrapper">
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
                        <Link to={`/result-item/${recipeId}?page=${window.location.pathname.includes('/results/') ? new URLSearchParams(window.location.search).get('page') || 1 : 1}`}><button className="btn btn-item">View Recipe</button></Link>
                </div>
            </div>
        </div>
    )
}
export default recipeModel;
