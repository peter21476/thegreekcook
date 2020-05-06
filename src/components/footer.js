import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


function footer() {
    return(
        <div id="footer-section" className="container text-center footer">
            <div className="row">
                <div className="col-md-12">
                    <p>&copy; 2020 - Zorba's Kitchen<br />
                    Designed and Developed by Petros Charitopoulos</p>
                    <div className="footer-icons"><FontAwesomeIcon icon={['fab', 'html5']} /> <FontAwesomeIcon icon={['fab', 'css3']} /> <FontAwesomeIcon icon={['fab', 'js']} /> <FontAwesomeIcon icon={['fab', 'react']} /></div>
                </div>
            </div>
        </div>
    )
}

export default footer;