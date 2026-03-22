/**
 * Shared test mocks and utilities
 * This file provides reusable mock configurations for Firebase and external APIs
 */

// Mock Firebase Admin Auth
const mockAuth = {
  verifyIdToken: jest.fn(),
  getUser: jest.fn()
};

// Mock Firestore collection helper
const mockCollection = (collectionName) => ({
  doc: jest.fn((id) => ({
    get: jest.fn().mockResolvedValue({
      exists: false,
      id: id || 'test-id',
      data: () => null
    }),
    set: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({})
  })),
  add: jest.fn().mockResolvedValue({
    id: 'new-id',
    get: jest.fn().mockResolvedValue({
      exists: true,
      id: 'new-id',
      data: () => ({})
    })
  }),
  where: jest.fn(() => ({
    get: jest.fn().mockResolvedValue({
      docs: [],
      empty: true,
      forEach: jest.fn()
    }),
    where: jest.fn(function() { return this; }),
    limit: jest.fn(function() { return this; }),
    offset: jest.fn(function() { return this; }),
    orderBy: jest.fn(function() { return this; }),
    startAt: jest.fn(function() { return this; }),
    endAt: jest.fn(function() { return this; })
  }))
});

// Mock Firestore
const mockFirestore = {
  collection: jest.fn(mockCollection),
  runTransaction: jest.fn((callback) => {
    const transaction = {
      get: jest.fn().mockResolvedValue({ 
        docs: [], 
        empty: true,
        size: 0,
        forEach: jest.fn()
      }),
      set: jest.fn(),
      update: jest.fn()
    };
    return callback(transaction);
  }),
  FieldValue: {
    serverTimestamp: jest.fn(() => new Date()),
    arrayUnion: jest.fn((val) => [val])
  },
  GeoPoint: jest.fn((lat, lng) => ({ latitude: lat, longitude: lng }))
};

// Mock Storage
const mockStorage = {
  bucket: jest.fn(() => ({
    file: jest.fn(() => ({
      save: jest.fn().mockResolvedValue({}),
      makePublic: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({})
    })),
    name: 'test-bucket'
  }))
};

// Setup Firebase Admin mock
const mockFirestoreFunction = jest.fn(() => mockFirestore);
mockFirestoreFunction.FieldValue = mockFirestore.FieldValue;
mockFirestoreFunction.GeoPoint = mockFirestore.GeoPoint;

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: mockFirestoreFunction,
  auth: jest.fn(() => mockAuth),
  storage: jest.fn(() => mockStorage)
}));

// Mock global fetch for external APIs
global.fetch = jest.fn();

/**
 * Helper to create authenticated user mock
 */
function mockAuthenticatedUser(uid = 'user123', email = 'test@example.com') {
  mockAuth.verifyIdToken.mockResolvedValue({
    uid,
    email,
    email_verified: true
  });
}

/**
 * Helper to create unauthenticated request (no token or invalid token)
 */
function mockUnauthenticatedUser() {
  mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));
}

/**
 * Helper to reset all mocks
 */
function resetAllMocks() {
  jest.clearAllMocks();
  mockAuth.verifyIdToken.mockReset();
  mockAuth.getUser.mockReset();
  mockFirestore.collection.mockImplementation(mockCollection);
  global.fetch.mockReset();
}

/**
 * Helper to create a mock campsite document
 */
function mockCampsiteDoc(data = {}) {
  const defaultData = {
    title: 'Test Campsite',
    visibility: 'public',
    userId: 'user123',
    latitude: 40.0,
    longitude: -105.0,
    description: 'Test description',
    photos: [],
    hasPhotos: false
  };
  
  return {
    exists: true,
    id: data.id || 'campsite-id',
    data: () => ({ ...defaultData, ...data })
  };
}

/**
 * Helper to mock a Firestore document reference with custom data
 */
function mockDocumentRef(docData = null, docId = 'test-id') {
  const exists = docData !== null;
  return {
    get: jest.fn().mockResolvedValue({
      exists,
      id: docId,
      data: () => exists ? docData : null
    }),
    set: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({})
  };
}

/**
 * Helper to mock Firestore collection with document
 */
function mockCollectionWithDoc(docId, docData) {
  return {
    doc: jest.fn((id) => {
      if (id === docId || !id) {
        return mockDocumentRef(docData, id || docId);
      }
      return mockDocumentRef(null, id);
    }),
    add: jest.fn().mockResolvedValue({
      id: 'new-id',
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: 'new-id',
        data: () => ({})
      })
    }),
    where: jest.fn(() => ({
      get: jest.fn().mockResolvedValue({
        docs: [],
        empty: true,
        forEach: jest.fn()
      }),
      where: jest.fn(function() { return this; }),
      limit: jest.fn(function() { return this; }),
      offset: jest.fn(function() { return this; }),
      orderBy: jest.fn(function() { return this; }),
      startAt: jest.fn(function() { return this; }),
      endAt: jest.fn(function() { return this; })
    }))
  };
}

/**
 * Helper to setup successful external API responses
 */
function mockSuccessfulWeatherAPI(data = { current: { temp: 72 } }) {
  process.env.OPENWEATHER_API_KEY = 'test-api-key';
  global.fetch.mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue(data)
  });
}

function mockSuccessfulElevationAPI(elevationMeters = 1000) {
  process.env.MAPQUEST_API_KEY = 'test-api-key';
  global.fetch.mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({
      elevationProfile: [{ height: elevationMeters }]
    })
  });
}

module.exports = {
  mockAuth,
  mockFirestore,
  mockStorage,
  mockCollection,
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
  resetAllMocks,
  mockCampsiteDoc,
  mockDocumentRef,
  mockCollectionWithDoc,
  mockSuccessfulWeatherAPI,
  mockSuccessfulElevationAPI
};
