# Dispersed App

## Table of Contents

- [Dispersed App](#dispersed-app)
  - [Table of Contents](#table-of-contents)
  - [General Info](#general-info)
  - [Inspiration](#inspiration)
  - [Demonstration Video](#demonstration-video)
  - [Technologies](#technologies)
  - [Setup](#setup)
  - [Development](#development)
  - [Deployment](#deployment)
  - [Example Code](#example-code)
  - [Features](#features)
  - [Status](#status)
  - [Contact](#contact)
  - [License](#license)

## General Info

Dispersed is a modern React web application that allows users to explore the National Forest system to find and save dispersed camping sites. Built with React 18, Firebase Authentication, and Context API for state management, it provides a seamless experience for discovering and managing camping locations.

## Inspiration

Dispersed camping is allowed on most forest service roads open to public use, but map options to find new sites are less than ideal. Generally the only way to explore dispersed camping locations is on a large paper map from the forest service, which is difficult to later locate with GPS mapping.

With Dispersed, you can now find available areas on an interactive map with color-coded road information. You can also get current weather information along with a 5-day forecast and save spots you'd like to visit later.

## Demonstration Video

[Dispersed YouTube Demonstration](https://www.youtube.com/watch?v=G7GKNNk4-Lo)

## Technologies

- **React 18**: Modern React with concurrent features
- **React Router v6**: Client-side routing
- **Firebase Authentication**: Secure user authentication
- **Context API**: Global state management (AuthContext, CampsiteContext)
- **ArcGIS JavaScript API v4.x**: Interactive mapping with esri-loader v3
- **Axios**: HTTP client for API communication
- **CSS3**: Responsive styling

## Setup

### Prerequisites

- Node.js 18+
- Firebase project with Authentication and Firestore enabled
- ArcGIS Developer account for Web Map

### Installation

1. Clone the repository and navigate to the app directory:
```bash
cd dispersed-app
npm install
```

2. Copy the environment template and configure:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# API Configuration
REACT_APP_API_URL=http://localhost:5001/your-project-id/us-central1/api

# ArcGIS Configuration
REACT_APP_ARCGIS_WEBMAP_ID=your_webmap_id
```

## Development

Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## Deployment

Build for production:
```bash
npm run build
```

Deploy to Firebase Hosting:
```bash
firebase deploy --only hosting
```

## Example Code

### Firebase Authentication with Context API

```javascript
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signUp = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const getToken = async () => {
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, logout, getToken }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

### Centralized API Service with Auth Token Injection

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const authenticatedRequest = async (method, endpoint, data = null, getToken) => {
  try {
    const token = await getToken();
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };
    
    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw new APIError(
      error.response?.data?.error || 'An error occurred',
      error.response?.status
    );
  }
};

export const api = {
  campsites: {
    getAll: (getToken) => authenticatedRequest('GET', '/campsites', null, getToken),
    getById: (id, getToken) => authenticatedRequest('GET', `/campsites/${id}`, null, getToken),
    create: (data, getToken) => authenticatedRequest('POST', '/campsites', data, getToken),
    update: (id, data, getToken) => authenticatedRequest('PUT', `/campsites/${id}`, data, getToken),
    delete: (id, getToken) => authenticatedRequest('DELETE', `/campsites/${id}`, null, getToken)
  },
  getWeather: (lat, lng) => authenticatedRequest('GET', `/weather/${lat}/${lng}`, null, () => null),
  getElevation: (lat, lng) => authenticatedRequest('GET', `/elevation/${lat}/${lng}`, null, () => null)
};
```

### React Router v6 with Context Providers

```javascript
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CampsiteProvider } from './contexts/CampsiteContext';
import HomePage from './components/HomePage';
import MapPage from './components/MapPage';
import SignIn from './components/SignIn';
import Favorites from './components/Favorites';

function App() {
  return (
    <AuthProvider>
      <CampsiteProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </CampsiteProvider>
    </AuthProvider>
  );
}
```

## Features

Current Features:

- **Modern React 18**: Concurrent rendering, automatic batching, and improved performance
- **Firebase Authentication**: Secure email/password authentication with automatic token management
- **Interactive Mapping**: ArcGIS-based maps with WebMap portal integration
- **Context API State Management**: Global state for authentication and campsite data
- **Campsite Management**: Create, read, update, and delete campsites with public/private visibility
- **Real-time Weather**: Current conditions and 5-day forecast from OpenWeatherMap
- **Elevation Data**: Accurate elevation information for any location
- **Error Boundaries**: Graceful error handling to prevent app crashes
- **Responsive Design**: Mobile-friendly interface
- **Centralized API Layer**: Single source for all API communication with automatic auth token injection
- **Environment Configuration**: Easy deployment with environment variables

Future Features:

- Photo uploads for campsites and road conditions
- User reviews and ratings for campsites
- Social features (following users, sharing favorite spots)
- Advanced search and filtering
- Forest service alerts and road closures
- Offline mode with cached maps
- Mobile app (React Native)
- User profile management
- Campsite amenities and features tagging

## Status

The application is fully functional and ready to be enjoyed as is. Future updates and improvements are still a possibility.

## Contact

Created by [Bryce Kennedy](https://www.linkedin.com/in/bryce-kennedy/)

If you have any questions or comments, suggestions, or bug fixes, feel free to reach out to me.

## License

[Click to view](https://github.com/btken88/dispersed-app/blob/master/license.txt)
