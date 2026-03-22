const request = require('supertest');
const express = require('express');
const {
  resetAllMocks,
  mockSuccessfulElevationAPI
} = require('../helpers/mocks');

describe('Elevation API', () => {
  let app;
  const elevationRouter = require('../../routes/elevation');

  beforeEach(() => {
    app = express();
    app.use('/api/elevation', elevationRouter);
    resetAllMocks();
  });

  describe('GET /api/elevation/:lat/:lng', () => {
    it('should return elevation data for valid coordinates', async () => {
      mockSuccessfulElevationAPI(1000);

      const response = await request(app)
        .get('/api/elevation/40.0/-105.0');

      expect(response.status).toBe(200);
      expect(response.body.elevation).toBeDefined();
      expect(response.body.elevationFeet).toBeDefined();
    });

    it('should reject invalid latitude', async () => {
      const response = await request(app)
        .get('/api/elevation/91/-105.0');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('latitude');
    });

    it('should reject invalid longitude', async () => {
      const response = await request(app)
        .get('/api/elevation/40.0/181');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('longitude');
    });

    it('should handle empty elevation response', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          elevation: []
        })
      });

      const response = await request(app)
        .get('/api/elevation/40.0/-105.0');

      expect(response.status).toBe(500);
    });

    it('should handle API errors', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ message: 'Invalid API key' })
      });

      const response = await request(app)
        .get('/api/elevation/40.0/-105.0');

      expect(response.status).toBe(502);
    });

    it('should handle non-numeric latitude', async () => {
      const response = await request(app)
        .get('/api/elevation/abc/-105.0');

      expect(response.status).toBe(400);
    });

    it('should handle non-numeric longitude', async () => {
      const response = await request(app)
        .get('/api/elevation/40.0/xyz');

      expect(response.status).toBe(400);
    });

    it('should handle missing elevation data', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          elevation: [] // Empty array
        })
      });

      const response = await request(app)
        .get('/api/elevation/40.0/-105.0');

      expect(response.status).toBe(500);
    });

    it('should handle fetch errors', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      const response = await request(app)
        .get('/api/elevation/40.0/-105.0');

      expect(response.status).toBe(500);
    });
  });
});
