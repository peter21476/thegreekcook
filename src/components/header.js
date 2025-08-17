import React, { useState, useEffect } from 'react';
import Logo from '../img/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config';

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const checkLoginStatus = () => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    };

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    useEffect(() => {
        // Check initial login status
        checkLoginStatus();

        // Fetch user profile if logged in
        if (isLoggedIn) {
            fetchUserProfile();
        }

        // Listen for storage events (in case token is changed in another tab)
        const handleStorageChange = (e) => {
            if (e.key === 'token') {
                checkLoginStatus();
                if (localStorage.getItem('token')) {
                    fetchUserProfile();
                } else {
                    setUser(null);
                }
            }
        };

        // Listen for custom login/logout events
        const handleAuthEvent = () => {
            checkLoginStatus();
            if (localStorage.getItem('token')) {
                fetchUserProfile();
            } else {
                setUser(null);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('login', handleAuthEvent);
        window.addEventListener('logout', handleAuthEvent);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('login', handleAuthEvent);
            window.removeEventListener('logout', handleAuthEvent);
        };
    }, [isLoggedIn]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
        // Dispatch logout event
        window.dispatchEvent(new Event('logout'));
        navigate('/login');
    };

    return (
        <div className="header-wrapper">
            <div className="container text-center header-section">
                <div className="row">
                    <div className="col-md-12">
                        <Link to="/"><img className="img-fluid" src={Logo} alt="logo"/></Link>
                        <p>Turn your fridge into a Greek taverna—cook with whatever you've got!</p>
                    </div>
                </div>
            </div>
            <div className="auth-links">
                <Link to="/" className="auth-link">Home</Link>
                {isLoggedIn ? (
                    <>
                        <Link to="/profile" className="auth-link profile-link">
                            {user?.profilePicture ? (
                                <img 
                                    src={user.profilePicture} 
                                    alt="Profile" 
                                    className="header-profile-picture"
                                />
                            ) : (
                                <span className="header-profile-icon">👤</span>
                            )}
                            Profile
                        </Link>
                        <button onClick={handleLogout} className="auth-link logout-btn">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="auth-link">Login</Link>
                        <Link to="/register" className="auth-link">Register</Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default Header;