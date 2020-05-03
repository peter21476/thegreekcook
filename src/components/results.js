import React, {useState, useEffect} from 'react';
import Recipe from './recipe';
import Pagination from './pagination';

function RecipesResults( {match} ) {
    const APP_KEY = "b84bdb70ee5a4becb4f63624084e355d";

    const baseUrl = "https://spoonacular.com/recipeImages/";

    const [recipes,
        setRecipes] = useState([]);

    const [numResults,
        setResults] = useState([]);

    const [currentPage,
        setCurrentPage] = useState(1);
    const [postsPerPage] = useState(9);

    // Get current posts
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = recipes.slice(indexOfFirstPost, indexOfLastPost);

    // Change page
    const paginate = pageNumber => setCurrentPage(pageNumber);

    useEffect(() => {
        callApi();
      }, []);

    const callApi = async() => {
        const url = `https://api.spoonacular.com/recipes/search?query=${match.params.value}&cuisine=greek&number=100&apiKey=${APP_KEY}`;
        console.log(url);
        const response = await fetch(url);
        const data = await response.json();
        setRecipes(data.results);
        setResults(data.number);
        document
            .getElementById('results-col')
            .style
            .display = "block";
    }

    return(
        <div className="container results-wrapper">
        <div className="row">
        <div className="col-md-12" id="results-col">
            <h4>Results: {numResults}
            </h4>
        </div >
    </div>
    <div className="row row-eq-height-xs">
        {currentPosts.map(recipe => (<Recipe
            title={recipe.title}
            image={baseUrl + recipe.image}
            minutes={recipe.readyInMinutes}
            servings={recipe.servings}
            key={recipe.id}
            recipeId={recipe.id}/>))}
        <Pagination
            postsPerPage={postsPerPage}
            totalPosts={recipes.length}
            paginate={paginate}/>
    </div>
    </div>
    );
}

export default RecipesResults;