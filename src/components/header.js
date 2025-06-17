import React, { useState, useEffect } from 'react';
import Logo from '../img/logo.png';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    const checkLoginStatus = () => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    };

    useEffect(() => {
        // Check initial login status
        checkLoginStatus();

        // Listen for storage events (in case token is changed in another tab)
        const handleStorageChange = (e) => {
            if (e.key === 'token') {
                checkLoginStatus();
            }
        };

        // Listen for custom login/logout events
        const handleAuthEvent = () => {
            checkLoginStatus();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('login', handleAuthEvent);
        window.addEventListener('logout', handleAuthEvent);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('login', handleAuthEvent);
            window.removeEventListener('logout', handleAuthEvent);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
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
                        <Link to="/profile" className="auth-link">Profile</Link>
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