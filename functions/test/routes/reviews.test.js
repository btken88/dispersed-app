const request = require('supertest');
const express = require('express');
const {
  mockFirestore,
  mockAuth,
  mockCollection,
  resetAllMocks,
  mockAuthenticatedUser
} = require('../helpers/mocks');

describe('Reviews API', () => {
  let app;
  const reviewsRouter = require('../../routes/reviews');

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/campsites', reviewsRouter);
    resetAllMocks();

    // Mock the Firestore transaction
    mockFirestore.runTransaction.mockImplementation(async (callback) => {
      const transaction = {
        get: jest.fn().mockResolvedValue({
          size: 0,
          docs: [],
          forEach: jest.fn()
        }),
        set: jest.fn(),
        update: jest.fn()
      };
      await callback(transaction);
      return Promise.resolve();
    });

    // Mock the collections
    mockFirestore.collection.mockImplementation((name) => {
      if (name === 'campsites') {
        return {
          doc: jest.fn(() => ({
            get: jest.fn().mockResolvedValue({
              exists: true,
              data: () => ({ title: 'Test Campsite', userId: 'owner123' })
            }),
            update: jest.fn().mockResolvedValue({})
          }))
        };
      }
      if (name === 'reviews') {
        return {
          doc: jest.fn(() => ({
            id: 'review-id',
            set: jest.fn().mockResolvedValue({})
          })),
          where: jest.fn(() => ({
            where: jest.fn(function() { return this; }),
            limit: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({
                empty: true,
                docs: []
              })
            })),
            offset: jest.fn(function() { return this; }),
            orderBy: jest.fn(function() { return this; }),
            get: jest.fn().mockResolvedValue({
              size: 0,
              empty: true,
              docs: []
            })
          }))
        };
      }
      if (name === 'ratingLimits') {
        return {
          add: jest.fn().mockResolvedValue({}),
          where: jest.fn(() => ({
            where: jest.fn(function() { return this; }),
            get: jest.fn().mockResolvedValue({
              empty: true,
              docs: []
            })
          }))
        };
      }
      return mockCollection(name);
    });
  });

  describe('POST /api/campsites/:id/reviews', () => {
    it('should create an authenticated review with comment', async () => {
      mockAuthenticatedUser('user123');

      const response = await request(app)
        .post('/api/campsites/campsite1/reviews')
        .set('Authorization', 'Bearer valid-token')
        .send({
          rating: 5,
          comment: 'Great campsite!'
        });

      expect(response.status).toBe(201);
      expect(response.body.reviewId).toBeDefined();
    });

    it('should create anonymous rating without comment', async () => {
      const response = await request(app)
        .post('/api/campsites/campsite1/reviews')
        .send({
          rating: 4
        });

      expect(response.status).toBe(201);
    });

    it('should reject invalid rating', async () => {
      const response = await request(app)
        .post('/api/campsites/campsite1/reviews')
        .send({
          rating: 6
        });

      expect(response.status).toBe(400);
    });

    it('should reject comment from anonymous user', async () => {
      const response = await request(app)
        .post('/api/campsites/campsite1/reviews')
        .send({
          rating: 5,
          comment: 'This should fail'
        });

      expect(response.status).toBe(400);
    });

    it('should reject review for non-existent campsite', async () => {
      mockFirestore.collection.mockImplementation((name) => {
        if (name === 'campsites') {
          return {
            doc: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({
                exists: false
              })
            }))
          };
        }
        return mockCollection(name);
      });

      const response = await request(app)
        .post('/api/campsites/nonexistent/reviews')
        .send({
          rating: 5
        });

      expect(response.status).toBe(404);
    });

    it('should reject comment longer than 1000 characters', async () => {
      mockAuthenticatedUser('user123');

      const longComment = 'a'.repeat(1001);

      const response = await request(app)
        .post('/api/campsites/test/reviews')
        .set('Authorization', 'Bearer valid-token')
        .send({
          rating: 5,
          comment: longComment
        });

      expect(response.status).toBe(400);
    });

    it('should reject non-integer rating', async () => {
      const response = await request(app)
        .post('/api/campsites/test/reviews')
        .send({
          rating: 3.5
        });

      expect(response.status).toBe(400);
    });

    it('should reject rating below 1', async () => {
      const response = await request(app)
        .post('/api/campsites/test/reviews')
        .send({
          rating: 0
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/campsites/:id/reviews', () => {
    beforeEach(() => {
      // Mock auth getUser
      mockAuth.getUser = jest.fn().mockResolvedValue({
        uid: 'user123',
        displayName: 'Test User',
        email: 'test@example.com'
      });
    });

    it('should get reviews for a campsite', async () => {
      mockFirestore.collection.mockImplementation((name) => {
        if (name === 'campsites') {
          return {
            doc: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({
                exists: true,
                data: () => ({ title: 'Test Campsite' })
              })
            }))
          };
        }
        if (name === 'reviews') {
          return {
            where: jest.fn(() => ({
              where: jest.fn(function() { return this; }),
              orderBy: jest.fn(function() { return this; }),
              limit: jest.fn(function() { return this; }),
              offset: jest.fn(function() { return this; }),
              get: jest.fn().mockResolvedValue({
                size: 1,
                docs: [{
                  id: 'review1',
                  data: () => ({
                    rating: 5,
                    comment: 'Great!',
                    userId: 'user123',
                    createdAt: new Date(),
                    updatedAt: new Date()
                  })
                }]
              })
            }))
          };
        }
        return mockCollection(name);
      });

      const response = await request(app)
        .get('/api/campsites/test-id/reviews');

      expect(response.status).toBe(200);
      expect(response.body.reviews).toBeDefined();
      expect(Array.isArray(response.body.reviews)).toBe(true);
    });

    it('should sort reviews by highest rating', async () => {
      mockFirestore.collection.mockImplementation((name) => {
        if (name === 'campsites') {
          return {
            doc: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({
                exists: true,
                data: () => ({ title: 'Test' })
              })
            }))
          };
        }
        if (name === 'reviews') {
          return {
            where: jest.fn(() => ({
              where: jest.fn(function() { return this; }),
              orderBy: jest.fn(function() { return this; }),
              limit: jest.fn(function() { return this; }),
              offset: jest.fn(function() { return this; }),
              get: jest.fn().mockResolvedValue({
                size: 0,
                docs: []
              })
            }))
          };
        }
        return mockCollection(name);
      });

      const response = await request(app)
        .get('/api/campsites/test-id/reviews')
        .query({ sort: 'highest' });

      expect(response.status).toBe(200);
    });

    it('should sort reviews by lowest rating', async () => {
      mockFirestore.collection.mockImplementation((name) => {
        if (name === 'campsites') {
          return {
            doc: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({
                exists: true,
                data: () => ({ title: 'Test' })
              })
            }))
          };
        }
        if (name === 'reviews') {
          return {
            where: jest.fn(() => ({
              where: jest.fn(function() { return this; }),
              orderBy: jest.fn(function() { return this; }),
              limit: jest.fn(function() { return this; }),
              offset: jest.fn(function() { return this; }),
              get: jest.fn().mockResolvedValue({
                size: 0,
                docs: []
              })
            }))
          };
        }
        return mockCollection(name);
      });

      const response = await request(app)
        .get('/api/campsites/test-id/reviews')
        .query({ sort: 'lowest' });

      expect(response.status).toBe(200);
    });

    it('should return 404 for non-existent campsite', async () => {
      mockFirestore.collection.mockImplementation((name) => {
        if (name === 'campsites') {
          return {
            doc: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({
                exists: false
              })
            }))
          };
        }
        return mockCollection(name);
      });

      const response = await request(app)
        .get('/api/campsites/nonexistent/reviews');

      expect(response.status).toBe(404);
    });
  });
});
