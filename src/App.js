import React from 'react';
import Header from './components/header';
import './App.scss';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import RecipeDetails from './components/recipeDetails';
import Home from './components/home';
import Results from './components/results';
import Footer from './components/footer';
import { library } from '../node_modules/@fortawesome/fontawesome-svg-core';
import { fab } from '../node_modules/@fortawesome/free-brands-svg-icons';

library.add(fab);

function App() {
return (
  <div className="main-wrapper">
<Router>
<Header />
    <Switch>
        <Route path="/" exact component={Home}/>
        <Route path="/results/:value" exact component={Results}/>
        <Route path="/result-item/:id" exact component={RecipeDetails}/>
    </Switch>
    <Footer />
</Router>
</div>
)
}

export default App;
