import React, {useState, useEffect} from 'react';
import ReactHtmlParser from 'react-html-parser';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import {Link} from 'react-router-dom';

function RecipeDetails({match}) {

    let history = useHistory()

    useEffect(() => {
        callItemApi();
    }, []);

    const APP_KEY = "b84bdb70ee5a4becb4f63624084e355d";

    const baseUrl = "https://spoonacular.com/recipeImages/";

    const [recipeItem,
        setRecipeItem] = useState([]);

    const [ingredients,
        setIngedients] = useState([]);

    const [instructions,
        setInstructions] = useState([]);

    const callItemApi = async() => {
        const url = `https://api.spoonacular.com/recipes/${match.params.id}/information?includeNutrition=false&apiKey=${APP_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        setRecipeItem(data);
        setIngedients(data.extendedIngredients);
        setInstructions(data.analyzedInstructions[0].steps);

    }

    return (
        <div className="recipe-details-wrapper">
            <div className="container navigation-item">
            <div className="row">
                    <div className="col-md-12">
                        <nav>
                            <a onClick={() => history.goBack()} className="btn btn-menu" href="#">Back to Results</a>
                            <Link to="/"><button className="btn btn-menu" href="#">Home</button></Link>
                        </nav>
                    </div>
                </div>
            </div>
            <div className="container recipe-details">
                <div className="row">
                    <div className="col-md-12 intro-wrapper">
                        <h3>{recipeItem.title}</h3>
                        <p><FontAwesomeIcon icon={faChartPie} /> Serving: {recipeItem.servings} | <FontAwesomeIcon icon={faClock} /> Ready in {recipeItem.readyInMinutes}
                                min.</p>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <img className="img-fluid" src={recipeItem.image} alt={recipeItem.title}/>
                    </div>
                    <div className="col-md-6 text-center">
                        <p>{ ReactHtmlParser (recipeItem.summary) }</p>
                    </div>
                </div>
                <div className="row ingredients-row">
                    <div className="col-md-12">
                    <h4>Ingredients:</h4>
                    <ul className="cook-list">
                        {ingredients.map(ingedient => (
                            <li key={ingedient.id}>
                                {ingedient.original}
                            </li>
                        ))}
                        </ul>
                    </div>
                </div>
                <div className="row instructions-row">
                    <div className="col-md-12">
                    <h4>Instructions:</h4>
                    <ul className="cook-list">
                        {instructions.map(instruction => (
                            <li key={instruction.number}>
                                {instruction.number}. {instruction.step}
                            </li>
                        ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RecipeDetails;