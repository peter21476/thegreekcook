import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faPinterest } from '@fortawesome/free-brands-svg-icons';

function Footer() {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="footer-custom">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>Zorba's Kitchen</h4>
                        <p>Discover authentic Greek recipes and share your culinary passion with our community.</p>
                    </div>
                    
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul className="footer-links">
                            <li><a href="/">Home</a></li>
                            <li><a href="/submit-recipe">Submit Recipe</a></li>
                            <li><a href="/profile">My Profile</a></li>
                        </ul>
                    </div>
                    
                    <div className="footer-section">
                        <h4>Connect With Us</h4>
                        <div className="social-links">
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faInstagram} />
                            </a>
                            <a href="https://www.pinterest.com/zorbaskitchen/" target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={faPinterest} />
                            </a>
                        </div>
                    </div>
                </div>
                
                <div className="footer-bottom">
                    <p>&copy; {currentYear} Zorba's Kitchen. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;