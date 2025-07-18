import React from 'react';
import Header from './components/header';
import './App.scss';
import 'react-animated-css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RecipeDetails from './components/recipeDetails';
import Home from './components/home';
import Results from './components/results';
import Footer from './components/footer';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Profile from './components/auth/Profile';
import SubmitRecipe from './components/SubmitRecipe';
import RecipeApproval from './components/admin/RecipeApproval';
import EditRecipe from './components/EditRecipe';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';

library.add(fab);

function App() {
  return (
    <div className="main-wrapper">
      <Router>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results/:value" element={<Results />} />
            <Route path="/result-item/:id" element={<RecipeDetails />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/submit-recipe" element={<SubmitRecipe />} />
            <Route path="/edit-recipe/:id" element={<EditRecipe />} />
            <Route path="/admin/recipes" element={<RecipeApproval />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer />
      </Router>
    </div>
  );
}

export default App;
