import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import MapPage from "./components/MapPage";
import HomePage from "./components/HomePage";
import AboutPage from "./components/AboutPage";
import Favorites from "./components/Favorites";
import SignIn from "./components/SignIn";
import { AuthProvider } from "./contexts/AuthContext";
import { CampsiteProvider } from "./contexts/CampsiteContext";

function App() {
  return (
    <AuthProvider>
      <CampsiteProvider>
        <div className="App">
          <Routes>
            <Route path="/map" element={<MapPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </div>
      </CampsiteProvider>
    </AuthProvider>
  );
}

export default App;
