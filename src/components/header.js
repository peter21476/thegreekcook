import React from 'react';
import Logo from '../img/logo.png';
import {Link} from 'react-router-dom';

function headerSection() {

    return (
        <div className="container text-center">
            <div className="row">
                <div className="col-md-12">

                    <Link to="/"><img className="img-fluid" src={Logo} alt="logo"/></Link>

                </div>
            </div>
        </div>
    );
}

export default headerSection;