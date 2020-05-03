import React from 'react';
import {Link} from 'react-router-dom';

function recipeModel({title, image, minutes, servings, recipeId}) {



    return (
        <div className="col-md-4 recipe-column">

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
                        <Link to={`/result-item/${recipeId}`}>More Details...</Link>
                </div>
            </div>
        </div>
    )
}
export default recipeModel;
