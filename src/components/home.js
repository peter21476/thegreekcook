import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import Recipe from './recipe';

function Home() {

    const APP_KEY = "b84bdb70ee5a4becb4f63624084e355d";

    const [searchValue,
        setSearchValue] = useState('');

    const [suggestedDish,
        setSuggestedDish] = useState([]);

    useEffect(() => {
        callSuggestedApi();
    }, []);

    const callSuggestedApi = async() => {
        const url = `https://api.spoonacular.com/recipes/random?number=2&tags=greek&apiKey=${APP_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        setSuggestedDish(data.recipes);
        console.log(data.recipes);

    }

    function getValue() {
        let getSearchVal = document
            .getElementById('search-box')
            .value;
        setSearchValue(getSearchVal);
    }
    return (
        <div className="main-wrapper">
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="search-wrapper">
                            <input placeholder="Add one more ingredients..." type="text" id="search-box" onChange={getValue}/>
                            <Link to={`/results/${searchValue}`}>
                                <button className="btn btn-search">Search</button>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="row suggested-row">
                    <div className="col-md-12 text-center">
                        <h2>Suggested Recipes</h2>
                    </div>
                </div>
                <div className="row row-eq-height-xs justify-content-center">
                    {suggestedDish.map(recipe => (<Recipe
                        title={recipe.title}
                        image={recipe.image}
                        minutes={recipe.readyInMinutes}
                        servings={recipe.servings}
                        key={recipe.id}
                        recipeId={recipe.id}/>))}
                </div>
            </div>
        </div>
    );
}
export default Home;
