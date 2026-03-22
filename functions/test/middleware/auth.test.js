const request = require('supertest');
const express = require('express');
const {
  mockAuth,
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
  resetAllMocks
} = require('../helpers/mocks');

describe('Auth Middleware', () => {
  const { verifyFirebaseToken, optionalAuth } = require('../../middleware/auth');
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    resetAllMocks();
  });

  describe('verifyFirebaseToken', () => {
    it('should verify valid Firebase tokens', async () => {
      mockAuthenticatedUser('user123', 'test@example.com');

      app.get('/test', verifyFirebaseToken, (req, res) => {
        res.json({ user: req.user });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.user.uid).toBe('user123');
    });

    it('should reject requests without token', async () => {
      app.get('/test', verifyFirebaseToken, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/test');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    it('should reject invalid tokens', async () => {
      mockUnauthenticatedUser();

      app.get('/test', verifyFirebaseToken, (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid or expired token');
    });
  });

  describe('optionalAuth', () => {
    it('should continue without token', async () => {
      app.get('/test', optionalAuth, (req, res) => {
        res.json({ user: req.user });
      });

      const response = await request(app).get('/test');

      expect(response.status).toBe(200);
      expect(response.body.user).toBeNull();
    });

    it('should attach user if valid token provided', async () => {
      mockAuthenticatedUser('user123', 'test@example.com');

      app.get('/test', optionalAuth, (req, res) => {
        res.json({ user: req.user });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.user.uid).toBe('user123');
    });

    it('should continue with null user on invalid token', async () => {
      mockUnauthenticatedUser();

      app.get('/test', optionalAuth, (req, res) => {
        res.json({ user: req.user });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(200);
      expect(response.body.user).toBeNull();
    });
  });
});
