import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


function Footer() {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="footer-custom">
            <div className="container">
                <div className="row">
                    <div className="col-md-12 text-center">
                        <p>&copy; {currentYear} - Zorba's Kitchen</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;