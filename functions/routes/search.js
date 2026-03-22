const router = require('express').Router();
const admin = require('firebase-admin');
const geohash = require('geofire-common');

/**
 * GET /api/search/campsites
 * Search and filter public campsites
 * Query parameters:
 * - q: text search (searches title and description)
 * - lat, lng, radius: geographic search in miles
 * - minRating: minimum average rating (1-5)
 * - hasPhotos: boolean - only show sites with photos
 * - sort: rating, newest, distance, reviewCount
 * - page, limit: pagination controls
 */
router.get('/campsites', async (req, res) => {
  try {
    const db = admin.firestore();
    const {
      q, // text search
      lat,
      lng,
      radius, // in miles
      minRating,
      hasPhotos,
      sort = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    const parsedPage = parseInt(page) || 1;
    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const offset = (parsedPage - 1) * parsedLimit;

    // Start with base query - only public campsites
    let query = db.collection('campsites')
      .where('visibility', '==', 'public');

    let results = [];
    let requiresClientFiltering = false;

    // Geographic search using geohashing
    if (lat && lng && radius) {
      const center = [parseFloat(lat), parseFloat(lng)];
      const radiusInM = parseFloat(radius) * 1609.34; // Convert miles to meters

      // Calculate geohash query bounds
      const bounds = geohash.geohashQueryBounds(center, radiusInM);
      const promises = [];

      // Query for each bound
      for (const b of bounds) {
        const q = query
          .orderBy('geohash')
          .startAt(b[0])
          .endAt(b[1]);
        promises.push(q.get());
      }

      // Collect all matching documents
      const snapshots = await Promise.all(promises);
      const matchingDocs = [];

      for (const snap of snapshots) {
        for (const doc of snap.docs) {
          const data = doc.data();
          
          // Calculate actual distance and verify it's within radius
          if (data.location && data.location.latitude && data.location.longitude) {
            const distanceInKm = geohash.distanceBetween(
              [data.location.latitude, data.location.longitude],
              center
            );
            const distanceInMiles = distanceInKm * 0.621371;

            if (distanceInMiles <= parseFloat(radius)) {
              matchingDocs.push({
                id: doc.id,
                ...data,
                distance: distanceInMiles
              });
            }
          }
        }
      }

      results = matchingDocs;
      requiresClientFiltering = true;
    } else {
      // No geographic search - get all public campsites
      const snapshot = await query.get();
      results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      requiresClientFiltering = true;
    }

    // Client-side filtering (Firestore limitations)
    
    // Filter by minimum rating
    if (minRating) {
      const minRatingValue = parseFloat(minRating);
      results = results.filter(campsite => 
        campsite.averageRating && campsite.averageRating >= minRatingValue
      );
    }

    // Filter by photo availability
    if (hasPhotos === 'true' || hasPhotos === true) {
      results = results.filter(campsite => campsite.hasPhotos === true);
    }

    // Text search (simple string matching)
    if (q && q.trim()) {
      const searchTerm = q.trim().toLowerCase();
      results = results.filter(campsite => {
        const title = (campsite.title || '').toLowerCase();
        const description = (campsite.description || '').toLowerCase();
        return title.includes(searchTerm) || description.includes(searchTerm);
      });
    }

    // Sorting
    switch (sort) {
      case 'rating':
        results.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'reviewCount':
        results.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      case 'distance':
        if (lat && lng) {
          results.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        }
        break;
      case 'newest':
      default:
        results.sort((a, b) => {
          const aTime = a.createdAt ? a.createdAt.toMillis() : 0;
          const bTime = b.createdAt ? b.createdAt.toMillis() : 0;
          return bTime - aTime;
        });
        break;
    }

    // Pagination
    const total = results.length;
    const paginatedResults = results.slice(offset, offset + parsedLimit);

    // Format response - remove sensitive data
    const formattedResults = paginatedResults.map(campsite => ({
      id: campsite.id,
      title: campsite.title,
      description: campsite.description,
      location: {
        latitude: campsite.location?.latitude,
        longitude: campsite.location?.longitude
      },
      photos: campsite.photos || [],
      hasPhotos: campsite.hasPhotos || false,
      averageRating: campsite.averageRating || null,
      reviewCount: campsite.reviewCount || 0,
      createdAt: campsite.createdAt,
      distance: campsite.distance || null
    }));

    res.json({
      results: formattedResults,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: total,
        totalPages: Math.ceil(total / parsedLimit)
      },
      filters: {
        textSearch: q || null,
        location: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseFloat(radius) } : null,
        minRating: minRating ? parseFloat(minRating) : null,
        hasPhotos: hasPhotos === 'true' || hasPhotos === true,
        sort
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
});

module.exports = router;
