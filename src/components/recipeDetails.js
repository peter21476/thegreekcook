import React, {useState, useEffect} from 'react';
import ReactHtmlParser from 'react-html-parser';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie, faClock, faHeart, faHeartBroken } from "@fortawesome/free-solid-svg-icons";
import {Link} from 'react-router-dom';
import {Helmet} from 'react-helmet';
import { API_CONFIG } from '../config';

function RecipeDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ingredients, setIngredients] = useState([]);
    const [instructions, setInstructions] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState(null);
    const page = new URLSearchParams(window.location.search).get('page') || 1;
    const searchValue = localStorage.getItem('lastSearchValue') || '';
    const fromFavorites = new URLSearchParams(window.location.search).get('from') === 'favorites';

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        if (token) {
            checkIfFavorite();
        }
        callApi();
        window.scrollTo(0, 0);
    }, []);

    const checkIfFavorite = async () => {
        try {
            const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/user/favorites/check/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setIsFavorite(data.isFavorite);
            }
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const toggleFavorite = async () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        try {
            setError(null);
            const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/user/favorites/${id}`, {
                method: isFavorite ? 'DELETE' : 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: isFavorite ? undefined : JSON.stringify({
                    title: recipe.title,
                    image: recipe.image
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update favorites');
            }

            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
            setError(error.message);
        }
    };

    const callApi = async() => {
        try {
            setLoading(true);
            const url = `${API_CONFIG.API_BASE_URL}/${id}/information?apiKey=${API_CONFIG.APP_KEY}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Clean up summary HTML and add target="_blank" to all links
            if (data.summary) {
                data.summary = data.summary.replace(/<a\s/g, '<a target="_blank" rel="noopener noreferrer" ');
            }
            
            // Set recipe data
            setRecipe(data);
            
            // Set ingredients
            setIngredients(data.extendedIngredients || []);
            
            // Set instructions
            if (data.analyzedInstructions && data.analyzedInstructions[0]) {
                setInstructions(data.analyzedInstructions[0].steps || []);
            } else {
                setInstructions([{
                    number: 1,
                    step: "Instructions are not available for this recipe."
                }]);
            }
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            setRecipe(null);
            setIngredients([]);
            setInstructions([{
                number: 1,
                step: "Failed to load recipe details. Please try again later."
            }]);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>;
    }

    if (!recipe) {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-12 text-center">
                        <h3>Recipe not found</h3>
                        <button onClick={() => navigate(-1)} className="btn btn-menu">Back to Results</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="recipe-details-wrapper">
            <Helmet>
                <title>Zorbas' Kitchen | {recipe.title}</title>
                <meta name="description" content={`Recipe for ${recipe.title}`} />
            </Helmet>
            <div className="container navigation-item">
                <div className="row">
                    <div className="col-md-12">
                        <nav>
                            <button 
                                onClick={() => fromFavorites ? navigate('/profile') : navigate(`/results/${searchValue}?page=${page}`)} 
                                className="btn btn-menu"
                            >
                                {fromFavorites ? 'Back to Favorites' : 'Back to Results'}
                            </button>
                            <Link to="/"><button className="btn btn-menu" href="#">Home</button></Link>
                        </nav>
                    </div>
                </div>
            </div>
            <div className="container recipe-details">
                <div className="row">
                    <div className="col-md-12 intro-wrapper">
                        <h3>{recipe.title}</h3>
                        <p>
                            <FontAwesomeIcon icon={faChartPie} /> Serving: {recipe.servings} | 
                            <FontAwesomeIcon icon={faClock} /> Ready in {recipe.readyInMinutes} min.
                            {isLoggedIn && (
                                <>
                                    <button 
                                        onClick={toggleFavorite} 
                                        className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
                                    >
                                        <FontAwesomeIcon icon={isFavorite ? faHeart : faHeartBroken} />
                                        {isFavorite ? ' Remove from Favorites' : ' Add to Favorites'}
                                    </button>
                                    {error && <div className="error-message">{error}</div>}
                                </>
                            )}
                        </p>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <img className="img-fluid" src={recipe.image} alt={recipe.title}/>
                    </div>
                    <div className="col-md-6 text-center">
                        <p>{ReactHtmlParser(recipe.summary)}</p>
                    </div>
                </div>
                <div className="row ingredients-row">
                    <div className="col-md-12">
                        <h4>Ingredients:</h4>
                        <ul className="cook-list">
                            {ingredients.map(ingredient => (
                                <li key={ingredient.id}>
                                    {ingredient.original}
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
                        {recipe.sourceUrl && (
                            <p className="source-credit">
                                <small>Recipe source: <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">{recipe.sourceName}</a></small>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecipeDetails;