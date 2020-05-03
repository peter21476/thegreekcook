import React, {useState, useEffect} from 'react';

function RecipeDetails({match}) {

    useEffect(() => {
        callItemApi();
      }, []);

    const APP_KEY = "b84bdb70ee5a4becb4f63624084e355d";

    const baseUrl = "https://spoonacular.com/recipeImages/";

    const [recipeItem,
        setRecipeItem] = useState([]);

    const callItemApi = async() => {
        const url = `https://api.spoonacular.com/recipes/${match.params.id}/analyzedInstructions?apiKey=${APP_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        setRecipeItem(data[0].steps);
    }

    return (
        <div className="recipe-details-wrapper">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <ul className="list-group">
                            {recipeItem.map(item => (
                <li className="list-group-item" key={item.number}>{item.step}</li>
                ))}
                            </ul>
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default RecipeDetails;