import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


function Footer() {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="footer-custom">
            <div className="container">
                <div className="row">
                    <div className="col-md-12 text-center">
                        <p>&copy; {currentYear} - Zorba's Kitchen<br />
                        Designed and Developed by Petros Charitopoulos</p>
                        <div className="footer-icons"><FontAwesomeIcon icon={['fab', 'html5']} /> <FontAwesomeIcon icon={['fab', 'css3']} /> <FontAwesomeIcon icon={['fab', 'js']} /> <FontAwesomeIcon icon={['fab', 'react']} /></div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;