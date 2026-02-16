import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import MapPage from "./components/MapPage";
import HomePage from "./components/HomePage";
import AboutPage from "./components/AboutPage";
import FavoritesRedirect from "./components/FavoritesRedirect";
import MyCampsites from "./components/MyCampsites";
import CampsiteDetail from "./components/CampsiteDetail";
import SearchPage from "./components/SearchPage";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import UserProfile from "./components/UserProfile";
import { AuthProvider } from "./contexts/AuthContext";
import { CampsiteProvider } from "./contexts/CampsiteContext";

function App() {
  return (
    <AuthProvider>
      <CampsiteProvider>
        <div className="App">
          <Routes>
            <Route path="/map" element={<MapPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/favorites" element={<FavoritesRedirect />} />
            <Route path="/campsites" element={<MyCampsites />} />
            <Route path="/campsites/:id" element={<CampsiteDetail />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </div>
      </CampsiteProvider>
    </AuthProvider>
  );
}

export default App;
