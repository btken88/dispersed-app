import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import './App.css';
import { createBrowserHistory } from 'history'
import MapPage from './components/MapPage';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import Favorites from './components/Favorites';
import SignIn from './components/SignIn'
import ReactGA from 'react-ga';

const history = createBrowserHistory()

function App() {
  ReactGA.initialize('G-JL1TXETBCN');
  history.listen(location => {
    ReactGA.set({ page: location.pathname }); // Update the user's current page
    ReactGA.pageview(location.pathname); // Record a pageview for the given page
  });

  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path='/'>
            <HomePage />
          </Route>
          <Route exact path="/map">
            <MapPage />
          </Route>
          <Route exact path="/about">
            <AboutPage />
          </Route>
          <Route exact path="/favorites">
            <Favorites />
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
