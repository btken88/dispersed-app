const router = require('express').Router();
const admin = require('firebase-admin');
const { optionalAuth } = require('../middleware/auth');

/**
 * GET /api/weather/:lat/:lng
 * Fetch weather data for coordinates
 * Uses OpenWeatherMap API (or alternative)
 */
router.get('/:lat/:lng', optionalAuth, async (req, res) => {
  const { lat, lng } = req.params;

  // Validate coordinates
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    return res.status(400).json({ error: 'Invalid latitude' });
  }

  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    return res.status(400).json({ error: 'Invalid longitude' });
  }

  try {
    const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

    console.log('Environment check:', {
      hasKey: !!OPENWEATHER_API_KEY,
      keyLength: OPENWEATHER_API_KEY ? OPENWEATHER_API_KEY.length : 0,
      nodeVersion: process.version
    });

    if (!OPENWEATHER_API_KEY) {
      console.error('OPENWEATHER_API_KEY not found in environment');
      return res.status(503).json({ error: 'Weather service not configured', debug: 'API key missing' });
    }

    // Use One Call API 3.0
    const weatherAPI = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&units=imperial&appid=${OPENWEATHER_API_KEY}`;

    console.log('Fetching weather from:', weatherAPI.replace(OPENWEATHER_API_KEY, 'REDACTED'));

    const response = await fetch(weatherAPI);

    console.log('Weather API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Weather API error:', response.status, errorData);
      return res.status(502).json({
        error: 'Weather API request failed',
        details: errorData.message || response.statusText,
        status: response.status
      });
    }

    const data = await response.json();
    console.log('Weather data received successfully');

    res.json(data);
  } catch (error) {
    console.error('Weather API error (full):', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      error: 'Failed to fetch weather data',
      message: error.message,
      type: error.name
    });
  }
});

module.exports = router;
