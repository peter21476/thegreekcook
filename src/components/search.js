import React, {useState} from 'react';

const [searchValue,
    setSearchValue] = useState('');

function getValue() {
    let getSearchVal = document
        .getElementById('search-box')
        .value;
    setSearchValue(getSearchVal);
}

function Search(props) {

    <input placeholder="Add one more ingredients..." type="text" id="search-box" onChange={props}/>
    
}