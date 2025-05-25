import React, {useState, useEffect} from 'react';
import Recipe from './recipe';
import Pagination from './pagination';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {Helmet} from 'react-helmet';
import ImagePlaceholder from '../img/recipe-placeholder.jpg';
import { API_CONFIG } from '../config';

function RecipesResults() {
    const navigate = useNavigate();
    const { value } = useParams();
    const page = new URLSearchParams(window.location.search).get('page') || 1;

    const [recipes, setRecipes] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(parseInt(page));
    const [postsPerPage] = useState(9);

    // Get current posts
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = recipes.slice(indexOfFirstPost, indexOfLastPost);

    // Change page
    function paginate(pageNumber) {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
        // Update URL with new page number
        navigate(`/results/${value}?page=${pageNumber}`, { replace: true });
    }

    useEffect(() => {
        callApi();
        // Store the search value in localStorage
        localStorage.setItem('lastSearchValue', value);
    }, [loading]);

    const callApi = async() => {
        const url = `${API_CONFIG.API_BASE_URL}/search?query=${value}&cuisine=greek&number=100&apiKey=${API_CONFIG.APP_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        if (data.results.length < 1) {
            setErrorMessage('Sorry, No Recipe Found. Please try a different ingredient.');
        } else {
            setErrorMessage(null);
        }
        setRecipes(data.results);
        setTimeout(function() {
            setLoading(false);
        }, 2000);
    }

    function getValue() {
        let getSearchVal = document
            .getElementById('search-box')
            .value;
        setSearchValue(getSearchVal);
    }

    function refreshPage() {
        setLoading(true);
        navigate(`/results/${searchValue}`);
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            let getButton = document.querySelector('.btn-search-res');
            getButton.click();
        }
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="lds-roller">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                <p className="loading-text">Searching for delicious Greek recipes...</p>
            </div>
        );
    }

    return(
        <div className="container results-wrapper">
            <Helmet>
                <title>Zorbas' Kitchen | Results</title>
                <meta name="description" content="Please find your results" />
            </Helmet>
            <div className="row navigation-item">
                <div className="col-lg-6 col-md-2 menu-home">
                    <nav>
                        <Link to="/"><button className="btn btn-menu" href="#">Home</button></Link>
                    </nav>
                </div>
                <div className="col-lg-6 col-md-10 text-right menu-search">
                    <input placeholder="Add ingredients..." type="text" id="search-box" onChange={getValue} onKeyDown={handleKeyDown}/>
                    <button className="btn btn-search-res" onClick={refreshPage}>Search</button>
                </div>
            </div>
        
            <div className="fade-in">
                <div className="row row-eq-height-xs">
                    {currentPosts.map(recipe => (
                        <Recipe
                            key={recipe.id}
                            title={recipe.title}
                            image={recipe.image ? API_CONFIG.BASE_URL + recipe.image : ImagePlaceholder}
                            minutes={recipe.readyInMinutes}
                            servings={recipe.servings}
                            recipeId={recipe.id}
                        />
                    ))}
                </div>
                <div className="error-message">
                    {errorMessage}
                </div>
                <Pagination
                    postsPerPage={postsPerPage}
                    totalPosts={recipes.length}
                    paginate={paginate}
                    currentPage={currentPage}
                />
            </div>
        </div>
    );
}

export default RecipesResults;