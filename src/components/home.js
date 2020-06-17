import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import Recipe from './recipe';
import {Helmet} from 'react-helmet';
import ImagePlaceholder from '../img/recipe-placeholder.jpg';

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
    }

    function getValue() {
        let getSearchVal = document
            .getElementById('search-box')
            .value;
        setSearchValue(getSearchVal);
    }

    let createLink = `/results/${searchValue}`;


    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            let getButton = document.querySelector('.btn-search');
            getButton.click();
          }
    }

    return (
        <div className="main-wrapper">
        <Helmet>
            <title>Zorbas' Kitchen | Home Page</title>
            <meta name="description" content="Welcome to Zorbas' Kitchen!" />
        </Helmet>
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="search-wrapper">
                            <input placeholder="Add one more ingredients..." type="text" id="search-box" onKeyDown={handleKeyDown} onChange={getValue}/>
                            <Link to={createLink}>
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
                        image={recipe.image ? recipe.image : ImagePlaceholder }
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
