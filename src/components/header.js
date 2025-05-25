import React, { useState, useEffect } from 'react';
import Logo from '../img/logo.png';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
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