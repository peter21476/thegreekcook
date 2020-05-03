import React from 'react';
import Header from './components/header';
import './App.scss';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import RecipeDetails from './components/recipeDetails';
import Home from './components/home';
import Results from './components/results';

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
</Router>
</div>
)
}

export default App;
