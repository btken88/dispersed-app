const router = require('express').Router();
const admin = require('firebase-admin');
const { check, validationResult } = require('express-validator');
const { verifyFirebaseToken, optionalAuth } = require('../middleware/auth');
const geohash = require('geofire-common');

const db = admin.firestore();
const campsitesRef = db.collection('campsites');

/**
 * GET /api/campsites
 * List campsites visible to the current user
 * Auth: Optional
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    let query = campsitesRef;

    if (req.user) {
      // Authenticated: show public campsites + user's own private/unlisted sites
      // This requires a composite query or multiple queries
      const publicQuery = campsitesRef.where('visibility', '==', 'public').get();
      const userQuery = campsitesRef.where('userId', '==', req.user.uid).get();

      const [publicSnapshot, userSnapshot] = await Promise.all([publicQuery, userQuery]);

      const campsites = [];
      const seenIds = new Set();

      publicSnapshot.forEach(doc => {
        if (!seenIds.has(doc.id)) {
          campsites.push({ id: doc.id, ...doc.data() });
          seenIds.add(doc.id);
        }
      });

      userSnapshot.forEach(doc => {
        if (!seenIds.has(doc.id)) {
          campsites.push({ id: doc.id, ...doc.data() });
          seenIds.add(doc.id);
        }
      });

      return res.json(campsites);
    } else {
      // Unauthenticated: only show public campsites
      const snapshot = await campsitesRef.where('visibility', '==', 'public').get();
      const campsites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json(campsites);
    }
  } catch (error) {
    console.error('Error fetching campsites:', error);
    res.status(500).json({ error: 'Failed to fetch campsites' });
  }
});

/**
 * GET /api/campsites/:id
 * Get a single campsite by ID
 * Auth: Optional
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const doc = await campsitesRef.doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Campsite not found' });
    }

    const campsite = { id: doc.id, ...doc.data() };

    // Check if user can view this campsite
    if (campsite.visibility === 'public') {
      return res.json(campsite);
    }

    if (req.user && campsite.userId === req.user.uid) {
      return res.json(campsite);
    }

    if (campsite.visibility === 'unlisted') {
      return res.json(campsite);
    }

    return res.status(403).json({ error: 'Access denied' });
  } catch (error) {
    console.error('Error fetching campsite:', error);
    res.status(500).json({ error: 'Failed to fetch campsite' });
  }
});

/**
 * POST /api/campsites
 * Create a new campsite
 * Auth: Required
 */
router.post(
  '/',
  verifyFirebaseToken,
  [
    check('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    check('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    check('title').isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
    check('description').optional().isLength({ max: 2000 }).withMessage('Description max 2000 characters'),
    check('visibility').isIn(['private', 'unlisted', 'public']).withMessage('Invalid visibility')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { latitude, longitude, title, description, visibility } = req.body;

    try {
      // Calculate geohash for geographic queries
      const hash = geohash.geohashForLocation([latitude, longitude]);

      const campsite = {
        userId: req.user.uid,
        location: new admin.firestore.GeoPoint(latitude, longitude),
        latitude,
        longitude,
        title,
        description: description || '',
        visibility,
        geohash: hash,
        hasPhotos: false,
        photos: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await campsitesRef.add(campsite);
      const doc = await docRef.get();

      res.status(201).json({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error creating campsite:', error);
      res.status(500).json({ error: 'Failed to create campsite' });
    }
  }
);

/**
 * PUT /api/campsites/:id
 * Update a campsite
 * Auth: Required (must be owner)
 */
router.put(
  '/:id',
  verifyFirebaseToken,
  [
    check('title').optional().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
    check('description').optional().isLength({ max: 2000 }).withMessage('Description max 2000 characters'),
    check('visibility').optional().isIn(['private', 'unlisted', 'public']).withMessage('Invalid visibility')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const docRef = campsitesRef.doc(req.params.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: 'Campsite not found' });
      }

      const campsite = doc.data();

      // Verify ownership
      if (campsite.userId !== req.user.uid) {
        return res.status(403).json({ error: 'You do not have permission to edit this campsite' });
      }

      const updates = {
        ...req.body,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Remove fields that shouldn't be updated
      delete updates.userId;
      delete updates.createdAt;
      delete updates.latitude;
      delete updates.longitude;
      delete updates.location;

      await docRef.update(updates);
      const updatedDoc = await docRef.get();

      res.json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
      console.error('Error updating campsite:', error);
      res.status(500).json({ error: 'Failed to update campsite' });
    }
  }
);

/**
 * DELETE /api/campsites/:id
 * Delete a campsite
 * Auth: Required (must be owner)
 */
router.delete('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const docRef = campsitesRef.doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Campsite not found' });
    }

    const campsite = doc.data();

    // Verify ownership
    if (campsite.userId !== req.user.uid) {
      return res.status(403).json({ error: 'You do not have permission to delete this campsite' });
    }

    await docRef.delete();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting campsite:', error);
    res.status(500).json({ error: 'Failed to delete campsite' });
  }
});

module.exports = router;
