const request = require('supertest');
const express = require('express');
const {
  resetAllMocks,
  mockSuccessfulWeatherAPI
} = require('../helpers/mocks');

describe('Weather API', () => {
  let app;
  const weatherRouter = require('../../routes/weather');

  beforeEach(() => {
    app = express();
    app.use('/api/weather', weatherRouter);
    resetAllMocks();
  });

  describe('GET /api/weather/:lat/:lng', () => {
    it('should return weather data for valid coordinates', async () => {
      mockSuccessfulWeatherAPI();

      const response = await request(app)
        .get('/api/weather/40.0/-105.0');

      expect(response.status).toBe(200);
      expect(response.body.current).toBeDefined();
    });

    it('should reject invalid latitude', async () => {
      const response = await request(app)
        .get('/api/weather/91/-105.0');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('latitude');
    });

    it('should reject invalid longitude', async () => {
      const response = await request(app)
        .get('/api/weather/40.0/181');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('longitude');
    });

    it('should handle missing API key', async () => {
      delete process.env.OPENWEATHER_API_KEY;

      const response = await request(app)
        .get('/api/weather/40.0/-105.0');

      expect(response.status).toBe(503);
    });

    it('should handle API errors', async () => {
      process.env.OPENWEATHER_API_KEY = 'test-api-key';

      global.fetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ message: 'Invalid API key' })
      });

      const response = await request(app)
        .get('/api/weather/40.0/-105.0');

      expect(response.status).toBe(502);
    });

    it('should handle non-numeric latitude', async () => {
      const response = await request(app)
        .get('/api/weather/abc/-105.0');

      expect(response.status).toBe(400);
    });

    it('should handle non-numeric longitude', async () => {
      const response = await request(app)
        .get('/api/weather/40.0/xyz');

      expect(response.status).toBe(400);
    });

    it('should handle fetch errors', async () => {
      process.env.OPENWEATHER_API_KEY = 'test-key';
      global.fetch.mockRejectedValue(new Error('Network error'));

      const response = await request(app)
        .get('/api/weather/40.0/-105.0');

      expect(response.status).toBe(500);
    });
  });
});
