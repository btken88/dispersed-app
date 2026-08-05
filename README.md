# Dispersed App

## Table of Contents

- [Dispersed App](#dispersed-app)
  - [Table of Contents](#table-of-contents)
  - [General Info](#general-info)
  - [Inspiration](#inspiration)
  - [Demonstration Video](#demonstration-video)
  - [Technologies](#technologies)
  - [Project Structure](#project-structure)
  - [Setup](#setup)
  - [Development](#development)
  - [Testing](#testing)
  - [Deployment](#deployment)
  - [API Endpoints](#api-endpoints)
  - [Example Code](#example-code)
  - [Features](#features)
  - [Status](#status)
  - [Contact](#contact)
  - [License](#license)

## General Info

Dispersed is a full-stack web application that allows users to explore the National Forest system to find and save dispersed camping sites. This monorepo contains both the React frontend and the Firebase Functions API backend, enabling unified development, testing, and deployment.

## Inspiration

Dispersed camping is allowed on most forest service roads open to public use, but map options to find new sites are less than ideal. Generally the only way to explore dispersed camping locations is on a large paper map from the forest service, which is difficult to later locate with GPS mapping.

With Dispersed, you can now find available areas on an interactive map with color-coded road information. You can also get current weather information along with a 5-day forecast and save spots you'd like to visit later.

## Demonstration Video

[Dispersed YouTube Demonstration](https://www.youtube.com/watch?v=G7GKNNk4-Lo)

## Technologies

### Frontend
- **React 18**: Modern React with concurrent features
- **React Router v6**: Client-side routing
- **Firebase Authentication**: Secure user authentication
- **Context API**: Global state management (AuthContext, CampsiteContext)
- **ArcGIS JavaScript API v4.x**: Interactive mapping with esri-loader v3
- **CSS3**: Responsive styling

### Backend (Firebase Functions)
- **Node.js 20**: Server runtime
- **Express.js 4**: REST API framework
- **Firebase Functions (Gen 2)**: Serverless hosting
- **Firebase Admin SDK**: Server-side Firebase operations
- **Firestore**: NoSQL database
- **Cloud Storage**: Photo uploads
- **Helmet.js**: Security headers
- **express-rate-limit**: Rate limiting (100 requests per 15 minutes)
- **express-validator**: Input validation
- **sharp**: Image processing for photo uploads
- **geofire-common**: Geographic search with geohashing

## Project Structure

```
dispersed-app/
├── public/                      # Static assets (index.html, favicon, etc.)
├── src/                         # React frontend source
│   ├── components/              # React components
│   ├── component-css/           # Component stylesheets
│   ├── contexts/                # Context providers (Auth, Campsite)
│   ├── services/                # API client
│   ├── firebase.js              # Firebase SDK initialization
│   ├── App.js                   # Root component with routing
│   └── index.js                 # Entry point
├── functions/                   # Firebase Functions API backend
│   ├── index.js                 # Express app & function export
│   ├── middleware/              # Auth middleware
│   │   └── auth.js              # Firebase token verification
│   ├── routes/                  # API route handlers
│   │   ├── campsites.js         # Campsite CRUD
│   │   ├── weather.js           # Weather data (OpenWeatherMap)
│   │   ├── elevation.js         # Elevation data (Open-Meteo)
│   │   ├── photos.js            # Photo upload/delete
│   │   ├── reviews.js           # Review system
│   │   ├── search.js            # Search & filtering
│   │   └── bug.js               # Bug reports
│   ├── test/                    # API tests (Jest + Supertest)
│   │   ├── helpers/mocks.js     # Shared test mocks
│   │   ├── middleware/          # Middleware tests
│   │   └── routes/              # Route handler tests
│   ├── package.json             # API dependencies
│   └── jest.config.js           # Test configuration
├── firebase.json                # Firebase project configuration
├── firestore.rules              # Firestore security rules
├── firestore.indexes.json       # Firestore composite indexes
├── storage.rules                # Cloud Storage security rules
├── .firebaserc                  # Firebase project alias
├── .env.example                 # Environment variables template
└── package.json                 # Frontend dependencies & monorepo scripts
```

## Setup

### Prerequisites

- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with Authentication, Firestore, and Storage enabled
- ArcGIS Developer account for Web Map

### Installation

1. Clone the repository:
```bash
git clone https://github.com/btken88/dispersed-app.git
cd dispersed-app
```

2. Install all frontend and API dependencies from the repository root:
```bash
npm install
```

3. Copy the environment template and configure:
```bash
cp .env.example .env
cp functions/.env.example functions/.env
```

4. Update `.env` with your credentials:
```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# API Configuration (use emulator URL for local dev)
REACT_APP_API_URL=http://localhost:5001/dispersed/us-central1/api
```

5. Login to Firebase:
```bash
firebase login
firebase use your-project-id
```

## Development

### Start everything with emulators (recommended)

Start the Firebase emulators (API, Firestore, Auth, Storage):
```bash
npm run emulators
```

In a separate terminal, start the React dev server:
```bash
npm start
```

- **Frontend**: http://localhost:3000
- **API**: http://localhost:5001/dispersed/us-central1/api
- **Emulator UI**: http://localhost:4000

### Frontend only

```bash
npm start
```

### API only (with emulators)

```bash
npm run serve:functions
```

## Testing

### All tests
```bash
npm run test:all
```

### Frontend tests only
```bash
npm test
```

### API tests only
```bash
npm run test:functions
```

## Deployment

### Deploy everything
```bash
npm run deploy:all
```

### Deploy individual services
```bash
npm run deploy:hosting     # Frontend only
npm run deploy:functions   # API functions only
npm run deploy:firestore   # Firestore rules and indexes
npm run deploy:storage     # Storage rules
```

### Deploy with Firebase CLI directly
```bash
firebase deploy                    # Everything
firebase deploy --only hosting     # Frontend
firebase deploy --only functions   # API
firebase deploy --only firestore   # Rules + indexes
```

## API Endpoints

### Authentication
All protected endpoints require a Firebase ID token:
```
Authorization: Bearer <firebase-id-token>
```

### Campsites
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/campsites` | Optional | List campsites (public + own if auth) |
| GET | `/api/campsites/:id` | Optional | Get campsite by ID |
| POST | `/api/campsites` | Required | Create campsite |
| PUT | `/api/campsites/:id` | Required | Update campsite (owner only) |
| DELETE | `/api/campsites/:id` | Required | Delete campsite (owner only) |

### Photos
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/campsites/:id/photos` | Required | Upload photo (owner only, max 3) |
| DELETE | `/api/campsites/:id/photos/:photoId` | Required | Delete photo (owner only) |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/campsites/:id/reviews` | None | Get reviews with pagination |
| POST | `/api/campsites/:id/reviews` | Optional | Create review (anonymous or auth) |
| PUT | `/api/campsites/:id/reviews/:reviewId` | Required | Update own review |
| DELETE | `/api/campsites/:id/reviews/:reviewId` | Required | Delete own review |
| POST | `/api/campsites/:id/reviews/:reviewId/flag` | Required | Flag review for moderation |

### Search
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/search/campsites` | None | Search with text, location, filters |

### Weather & Elevation
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/weather/:lat/:lng` | Optional | Weather data for coordinates |
| GET | `/api/elevation/:lat/:lng` | Optional | Elevation data for coordinates |

### Bug Reports
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bug` | None | Submit bug report |

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

### API Route with Auth Middleware

```javascript
const router = require('express').Router();
const admin = require('firebase-admin');
const { verifyFirebaseToken, optionalAuth } = require('../middleware/auth');

// Create campsite (authenticated)
router.post('/', verifyFirebaseToken, async (req, res) => {
  const { latitude, longitude, title, description, visibility } = req.body;
  
  const campsite = {
    userId: req.user.uid,
    latitude, longitude, title, description, visibility,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const docRef = await admin.firestore().collection('campsites').add(campsite);
  res.status(201).json({ id: docRef.id, ...campsite });
});

// List campsites (public + own if authenticated)
router.get('/', optionalAuth, async (req, res) => {
  // Returns public campsites for everyone, plus private ones for the owner
});
```

## Features

Current Features:

- **Full-Stack Monorepo**: Frontend and API in a single repository
- **Modern React 18**: Concurrent rendering, automatic batching
- **Firebase Functions (Gen 2)**: Serverless Express.js API
- **Firebase Authentication**: Email/password auth with token management
- **Interactive Mapping**: ArcGIS-based maps with WebMap portal integration
- **Campsite Management**: Full CRUD with public/private/unlisted visibility
- **Photo Uploads**: Image processing with sharp (resize, thumbnails, compression)
- **Review System**: Authenticated reviews + anonymous star ratings with flagging
- **Search & Filtering**: Text search, geographic radius search, rating filters
- **Real-time Weather**: Current conditions and forecast from OpenWeatherMap
- **Elevation Data**: Accurate elevation from Open-Meteo API
- **Security**: Helmet.js, rate limiting, input validation, Firestore rules
- **Comprehensive Tests**: Jest + Supertest for API, React Testing Library for frontend
- **CI/CD**: GitHub Actions for testing and Firebase deployment
- **Firebase Emulators**: Full local development environment

## Status

The application is fully functional and ready to be enjoyed as is. Future updates and improvements are still a possibility.

## Contact

Created by [Bryce Kennedy](https://www.linkedin.com/in/bryce-kennedy/)

If you have any questions or comments, suggestions, or bug fixes, feel free to reach out to me.

## License

[Click to view](https://github.com/btken88/dispersed-app/blob/master/license.txt)
