const request = require('supertest');
const express = require('express');
const { resetAllMocks } = require('../helpers/mocks');

describe('Bug Report API', () => {
  let app;
  const bugRouter = require('../../routes/bug');

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/bug', bugRouter);
    resetAllMocks();
  });

  describe('POST /api/bug', () => {
    it('should accept valid bug report', async () => {
      const response = await request(app)
        .post('/api/bug')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          bug: 'This is a bug description'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject bug report without name', async () => {
      const response = await request(app)
        .post('/api/bug')
        .send({
          email: 'test@example.com',
          bug: 'This is a bug description'
        });

      expect(response.status).toBe(400);
    });

    it('should reject bug report without email', async () => {
      const response = await request(app)
        .post('/api/bug')
        .send({
          name: 'Test User',
          bug: 'This is a bug description'
        });

      expect(response.status).toBe(400);
    });

    it('should reject bug report without bug description', async () => {
      const response = await request(app)
        .post('/api/bug')
        .send({
          name: 'Test User',
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
    });
  });
});
