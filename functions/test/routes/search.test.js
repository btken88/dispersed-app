const request = require('supertest');
const express = require('express');
const {
  mockFirestore,
  mockCollection,
  resetAllMocks,
  mockAuthenticatedUser,
  mockCampsiteDoc
} = require('../helpers/mocks');

describe('Search API', () => {
  let app;
  const searchRouter = require('../../routes/search');

  beforeEach(() => {
    app = express();
    app.use('/api/search', searchRouter);
    resetAllMocks();

    // Mock campsites collection for search
    mockFirestore.collection.mockImplementation((name) => {
      if (name === 'campsites') {
        return {
          where: jest.fn(() => ({
            get: jest.fn().mockResolvedValue({
              docs: [
                {
                  id: 'campsite1',
                  data: () => ({
                    title: 'Mountain Campsite',
                    description: 'A great spot',
                    visibility: 'public',
                    location: { latitude: 40.0, longitude: -105.0 },
                    averageRating: 4.5,
                    reviewCount: 10,
                    hasPhotos: true,
                    geohash: 'test-hash',
                    createdAt: { toMillis: () => Date.now() }
                  })
                }
              ]
            }),
            orderBy: jest.fn(function() { return this; }),
            startAt: jest.fn(function() { return this; }),
            endAt: jest.fn(function() { return this; })
          }))
        };
      }
      return mockCollection(name);
    });
  });

  describe('GET /api/search/campsites', () => {
    it('should search campsites with text query', async () => {
      const response = await request(app)
        .get('/api/search/campsites')
        .query({ q: 'mountain' });

      expect(response.status).toBe(200);
      expect(response.body.results).toBeDefined();
      expect(Array.isArray(response.body.results)).toBe(true);
    });

    it('should search campsites by location', async () => {
      const response = await request(app)
        .get('/api/search/campsites')
        .query({
          lat: 40.0,
          lng: -105.0,
          radius: 10
        });

      expect(response.status).toBe(200);
      expect(response.body.results).toBeDefined();
      expect(Array.isArray(response.body.results)).toBe(true);
    });

    it('should filter by minimum rating', async () => {
      const response = await request(app)
        .get('/api/search/campsites')
        .query({ minRating: 4 });

      expect(response.status).toBe(200);
      expect(response.body.results).toBeDefined();
      expect(Array.isArray(response.body.results)).toBe(true);
    });

    it('should filter by hasPhotos', async () => {
      const response = await request(app)
        .get('/api/search/campsites')
        .query({ hasPhotos: 'true' });

      expect(response.status).toBe(200);
      expect(response.body.results).toBeDefined();
      expect(Array.isArray(response.body.results)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/search/campsites')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.results).toBeDefined();
      expect(response.body.pagination).toBeDefined();
      expect(Array.isArray(response.body.results)).toBe(true);
    });

    it('should sort by rating', async () => {
      const response = await request(app)
        .get('/api/search/campsites')
        .query({ sort: 'rating' });

      expect(response.status).toBe(200);
      expect(response.body.results).toBeDefined();
    });

    it('should sort by review count', async () => {
      const response = await request(app)
        .get('/api/search/campsites')
        .query({ sort: 'reviewCount' });

      expect(response.status).toBe(200);
      expect(response.body.results).toBeDefined();
    });

    it('should sort by distance when location provided', async () => {
      const response = await request(app)
        .get('/api/search/campsites')
        .query({
          lat: 40.0,
          lng: -105.0,
          radius: 10,
          sort: 'distance'
        });

      expect(response.status).toBe(200);
      expect(response.body.results).toBeDefined();
    });

    it('should handle Firestore errors', async () => {
      mockFirestore.collection.mockImplementation(() => ({
        where: jest.fn(() => ({
          get: jest.fn().mockRejectedValue(new Error('Database error'))
        }))
      }));

      const response = await request(app)
        .get('/api/search/campsites');

      expect(response.status).toBe(500);
    });
  });
});
