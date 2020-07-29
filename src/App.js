import React, { useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import CustomMapContainer from './components/CustomMapContainer';
import HomePage from './components/HomePage'
import AboutPage from './components/AboutPage'


function App() {
  const [favorites, setFavorites] = useState([])
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path='/'>
            <HomePage />
          </Route>
          <Route exact path="/map">
            <Header />
            <CustomMapContainer />
            <Footer />
          </Route>
          <Route exact path="/about">
            <Header />
            <AboutPage />
            <Footer />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
