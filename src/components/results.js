import React, {useState, useEffect} from 'react';
import Recipe from './recipe';
import Pagination from './pagination';
import {Link} from 'react-router-dom';
import { useHistory } from 'react-router-dom';

function RecipesResults( {match} ) {

    let history = useHistory();

    const APP_KEY = "b84bdb70ee5a4becb4f63624084e355d";

    const baseUrl = "https://spoonacular.com/recipeImages/";

    const [recipes,
        setRecipes] = useState([]);

    const [searchValue,
        setSearchValue] = useState('');

    const [loading, setLoading] = useState(true);

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
      },[loading]);

    const callApi = async() => {
        const url = `https://api.spoonacular.com/recipes/search?query=${match.params.value}&cuisine=greek&number=100&apiKey=${APP_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        setRecipes(data.results);
        setLoading(false);
    }

    function getValue() {
        let getSearchVal = document
            .getElementById('search-box')
            .value;
        setSearchValue(getSearchVal);
    }

    function refreshPage() {
        setLoading(true);
        history.push(`/results/${searchValue}`);
    }

    return(
    <div className="container results-wrapper">
        <div className="row navigation-item">
            <div className="col-md-6">
                <nav>
                    <Link to="/"><button className="btn btn-menu" href="#">Home</button></Link>
                </nav>
            </div>
            <div className="col-md-6 text-right">
            <input type="text" id="search-box" onChange={getValue}/>
            <button className="btn btn-search-res" onClick={refreshPage}>Search</button>
            </div>
        </div>
    
        {loading ? <div>loading...</div> :
    
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
}
    </div>
    );
}

export default RecipesResults;