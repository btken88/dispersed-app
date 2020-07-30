import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import './App.css';
import MapPage from './components/MapPage';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import Favorites from './components/Favorites';
import SignIn from './components/SignIn'

function App() {
  const [favorites, setFavorites] = useState([])
  useEffect(() => {
    fetch('http://localhost:5000/favorites')
      .then(response => response.json())
      .then(setFavorites)
  }, [])

  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path='/'>
            <HomePage />
          </Route>
          <Route exact path="/map">
            <MapPage setFavorites={setFavorites} favorites={favorites} />
          </Route>
          <Route exact path="/about">
            <AboutPage />
          </Route>
          <Route exact path="/favorites">
            <Favorites favorites={favorites} />
          </Route>
          <Route exact path="/login">
            <SignIn />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
