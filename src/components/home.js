import React, {useState} from 'react';
import {Link} from 'react-router-dom';


function Home() {

    const [searchValue,
      setSearchValue] = useState('');
  
      function getValue(){
         let getSearchVal = document.getElementById('search-box').value;
        setSearchValue(getSearchVal);
      }
      return (
          <div className="main-wrapper">
              <div className="container">
                  <div className="row">
                      <div className="col-md-12">
                          <div className="search-wrapper">
                              <input type="text" id="search-box" onChange={getValue}/>
                              <Link to={`/results/${searchValue}`}><button className="btn btn-search">Search</button></Link>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }
export default Home;
