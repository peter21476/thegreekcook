import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import Recipe from './recipe';
import {Helmet} from 'react-helmet';
import ImagePlaceholder from '../img/recipe-placeholder.jpg';
import { API_CONFIG } from '../config';
import LoginBox from './auth/LoginBox';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Home() {
    const [searchValue, setSearchValue] = useState('');
    const [suggestedDish, setSuggestedDish] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        callApi();
    }, []);

    const callApi = async() => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Fetch user recipes first
            const userRecipesResponse = await fetch(`${API_CONFIG.BACKEND_URL}/api/recipes/approved`);
            const userRecipes = userRecipesResponse.ok ? await userRecipesResponse.json() : [];
            
            // Transform user recipes to match API format
            const transformedUserRecipes = userRecipes.slice(0, 2).map(recipe => ({
                ...recipe,
                id: recipe._id,
                readyInMinutes: recipe.prepTime + recipe.cookTime,
                isUserRecipe: true,
                submittedBy: recipe.submittedBy, // Keep the full object instead of just username
                likeCount: recipe.likeCount || 0
            }));
            
            // Fetch API recipes
            const apiUrl = `${API_CONFIG.API_BASE_URL}/complexSearch?cuisine=greek&number=3&apiKey=${API_CONFIG.APP_KEY}&addRecipeInformation=true&instructionsRequired=true&fillIngredients=true`;
            const apiResponse = await fetch(apiUrl);
            
            if (!apiResponse.ok) {
                const errorText = await apiResponse.text();
                console.error('API Error Response:', errorText);
                throw new Error(`HTTP error! status: ${apiResponse.status}`);
            }
            
            const apiData = await apiResponse.json();
            const transformedApiRecipes = (apiData.results || []).map(recipe => ({
                ...recipe,
                isUserRecipe: false,
                likeCount: 0 // Will be updated below
            }));

            // Get like counts for external recipes if user is logged in
            const token = localStorage.getItem('token');
            if (token && transformedApiRecipes.length > 0) {
                try {
                    const externalRecipeIds = transformedApiRecipes.map(recipe => recipe.id.toString());
                    const likeCountsResponse = await fetch(`${API_CONFIG.BACKEND_URL}/api/recipes/like-counts`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ recipeIds: externalRecipeIds })
                    });

                    if (likeCountsResponse.ok) {
                        const likeCountsData = await likeCountsResponse.json();
                        
                        // Update external recipes with like counts
                        transformedApiRecipes.forEach(recipe => {
                            recipe.likeCount = likeCountsData.likeCounts[recipe.id] || 0;
                        });
                    }
                } catch (error) {
                    console.error('Error fetching like counts:', error);
                    // Continue without like counts if there's an error
                }
            }
            
            // Combine recipes: user recipes first, then API recipes
            const combinedRecipes = [...transformedUserRecipes, ...transformedApiRecipes];
            
            setSuggestedDish(combinedRecipes);
        } catch (err) {
            console.error('Error fetching suggested recipes:', err);
            setError('Failed to load suggested recipes. Please try again later.');
            setSuggestedDish([]);
        } finally {
            setIsLoading(false);
        }
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

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        arrows: true,
        adaptiveHeight: true
    };

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
                            <input 
                                placeholder="Add one more ingredients..." 
                                type="text" 
                                id="search-box" 
                                onKeyDown={handleKeyDown} 
                                onChange={getValue}
                            />
                            <Link to={createLink}>
                                <button className="btn btn-search">Search</button>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="row suggested-row">
                    <div className="col-md-12">
                        <h2>Suggested Recipes</h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-7">
                        {isLoading ? (
                            <div className="row justify-content-center">
                                <div className="col-md-12 text-center">
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
                                        <p className="loading-text">Loading delicious Greek recipes...</p>
                                    </div>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="row justify-content-center">
                                <div className="col-md-12 text-center">
                                    <p className="text-danger">{error}</p>
                                </div>
                            </div>
                        ) : suggestedDish && suggestedDish.length > 0 ? (
                            <div className="suggested-recipes">
                                <Slider {...sliderSettings}>
                                    {suggestedDish.map(recipe => (
                                        <div key={recipe.id}>
                                            <Recipe
                                                title={recipe.title}
                                                image={recipe.isUserRecipe ? recipe.image : (recipe.image ? recipe.image : ImagePlaceholder)}
                                                minutes={recipe.readyInMinutes}
                                                servings={recipe.servings}
                                                recipeId={recipe.id}
                                                isHomePage={true}
                                                isUserRecipe={recipe.isUserRecipe}
                                                submittedBy={recipe.submittedBy}
                                            />
                                        </div>
                                    ))}
                                </Slider>
                            </div>
                        ) : (
                            <div className="row justify-content-center">
                                <div className="col-md-12 text-center">
                                    <p>No suggested recipes available.</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="col-md-5">
                        <LoginBox />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
