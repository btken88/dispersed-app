import React from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import CustomMapContainer from './components/CustomMapContainer';

function App() {
  return (
    <div className="App">
      <Header />
      {/* <MapContainer /> */}
      <CustomMapContainer />
      <Footer />
    </div>
  );
}

export default App;
