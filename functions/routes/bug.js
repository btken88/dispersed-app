const router = require('express').Router();

/**
 * POST /api/bug
 * Submit a bug report
 */
router.post('/', async (req, res) => {
  const { name, email, bug } = req.body;

  if (!name || !email || !bug) {
    return res.status(400).json({ error: 'Name, email, and bug details are required' });
  }

  try {
    // In a real implementation, you might:
    // - Send an email notification
    // - Store in database
    // - Create a GitHub issue
    // - Send to a bug tracking system

    console.log('Bug report received:', { name, email, bug, timestamp: new Date().toISOString() });

    // For now, just acknowledge receipt
    res.status(200).json({
      message: 'Bug report received',
      success: true
    });
  } catch (error) {
    console.error('Bug report error:', error);
    res.status(500).json({ error: 'Failed to submit bug report' });
  }
});

module.exports = router;
