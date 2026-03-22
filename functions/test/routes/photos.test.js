const request = require('supertest');
const express = require('express');
const {
  mockFirestore,
  mockCollection,
  resetAllMocks,
  mockAuthenticatedUser
} = require('../helpers/mocks');

describe('Photos API', () => {
  let app;
  const photosRouter = require('../../routes/photos');

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/campsites', photosRouter);
    resetAllMocks();

    // Mock campsites collection
    mockFirestore.collection.mockImplementation((name) => {
      if (name === 'campsites') {
        return {
          doc: jest.fn(() => ({
            get: jest.fn().mockResolvedValue({
              exists: true,
              data: () => ({
                userId: 'user123',
                photos: []
              })
            }),
            update: jest.fn().mockResolvedValue({})
          }))
        };
      }
      return mockCollection(name);
    });
  });

  describe('POST /api/campsites/:id/photos', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/campsites/campsite1/photos');

      expect(response.status).toBe(401);
    });

    it('should reject upload to non-existent campsite', async () => {
      mockAuthenticatedUser('user123');

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
        .post('/api/campsites/nonexistent/photos')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
    });

    it('should reject upload by non-owner', async () => {
      mockAuthenticatedUser('different-user');

      const response = await request(app)
        .post('/api/campsites/campsite1/photos')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(403);
    });

    it('should reject photo upload when campsite has 3 photos', async () => {
      mockAuthenticatedUser('user123');

      mockFirestore.collection.mockImplementation(() => ({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              userId: 'user123',
              photos: [{ id: '1' }, { id: '2' }, { id: '3' }]
            })
          })
        }))
      }));

      const response = await request(app)
        .post('/api/campsites/test-id/photos')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/campsites/:id/photos/:photoId', () => {
    it('should delete photo by owner', async () => {
      mockAuthenticatedUser('user123');

      mockFirestore.collection.mockImplementation(() => ({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              userId: 'user123',
              photos: [{
                id: 'photo1',
                url: 'https://storage.googleapis.com/test-bucket/path/photo.jpg',
                thumbnailUrl: 'https://storage.googleapis.com/test-bucket/path/thumb.jpg'
              }]
            })
          }),
          update: jest.fn().mockResolvedValue({})
        }))
      }));

      const response = await request(app)
        .delete('/api/campsites/test-id/photos/photo1')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
    });

    it('should reject photo deletion by non-owner', async () => {
      mockAuthenticatedUser('different-user');

      mockFirestore.collection.mockImplementation(() => ({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              userId: 'user123',
              photos: [{ id: 'photo1' }]
            })
          })
        }))
      }));

      const response = await request(app)
        .delete('/api/campsites/test-id/photos/photo1')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent photo', async () => {
      mockAuthenticatedUser('user123');

      mockFirestore.collection.mockImplementation(() => ({
        doc: jest.fn(() => ({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              userId: 'user123',
              photos: []
            })
          })
        }))
      }));

      const response = await request(app)
        .delete('/api/campsites/test-id/photos/nonexistent')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
    });
  });
});
