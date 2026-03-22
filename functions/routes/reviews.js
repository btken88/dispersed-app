const router = require('express').Router();
const admin = require('firebase-admin');
const { verifyFirebaseToken, optionalAuth } = require('../middleware/auth');

/**
 * POST /api/campsites/:id/reviews
 * Create or update a review for a campsite
 * Supports both authenticated (full review) and anonymous (star-only) ratings
 */
router.post('/:id/reviews', optionalAuth, async (req, res) => {
  try {
    const campsiteId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.user ? req.user.uid : null;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const db = admin.firestore();

    // Validate rating
    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    // Validate comment (only for authenticated users)
    if (comment && !userId) {
      return res.status(400).json({ error: 'Only registered users can submit comments' });
    }

    if (comment && comment.length > 1000) {
      return res.status(400).json({ error: 'Comment must be 1000 characters or less' });
    }

    // Verify campsite exists
    const campsiteRef = db.collection('campsites').doc(campsiteId);
    const campsiteDoc = await campsiteRef.get();

    if (!campsiteDoc.exists) {
      return res.status(404).json({ error: 'Campsite not found' });
    }

    // For anonymous ratings, check IP-based rate limiting
    if (!userId) {
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      
      const rateLimitRef = db.collection('ratingLimits')
        .where('ipAddress', '==', ipAddress)
        .where('campsiteId', '==', campsiteId)
        .where('timestamp', '>', oneDayAgo);
      
      const rateLimitDocs = await rateLimitRef.get();
      
      if (!rateLimitDocs.empty) {
        return res.status(429).json({ error: 'You can only submit one anonymous rating per campsite per 24 hours' });
      }

      // Create rate limit record
      await db.collection('ratingLimits').add({
        ipAddress,
        campsiteId,
        timestamp: now
      });
    }

    let reviewRef;
    let reviewId;
    let isUpdate = false;

    if (userId) {
      // For authenticated users, check if review already exists
      const existingReviewQuery = await db.collection('reviews')
        .where('campsiteId', '==', campsiteId)
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (!existingReviewQuery.empty) {
        // Update existing review
        reviewRef = existingReviewQuery.docs[0].ref;
        reviewId = existingReviewQuery.docs[0].id;
        isUpdate = true;
      } else {
        // Create new review
        reviewRef = db.collection('reviews').doc();
        reviewId = reviewRef.id;
      }
    } else {
      // Create anonymous review
      reviewRef = db.collection('reviews').doc();
      reviewId = reviewRef.id;
    }

    // Prepare review data
    const reviewData = {
      campsiteId,
      userId: userId || null,
      ipAddress: userId ? null : ipAddress,
      rating,
      comment: comment || null,
      flagCount: 0,
      flags: [],
      hidden: false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (!isUpdate) {
      reviewData.createdAt = admin.firestore.FieldValue.serverTimestamp();
    }

    // Use transaction to update review and campsite atomically
    await db.runTransaction(async (transaction) => {
      // Write review
      transaction.set(reviewRef, reviewData, { merge: true });

      // Recalculate average rating and review count
      const allReviewsSnapshot = await transaction.get(
        db.collection('reviews')
          .where('campsiteId', '==', campsiteId)
          .where('hidden', '==', false)
      );

      let totalRating = rating;
      let reviewCount = isUpdate ? allReviewsSnapshot.size : allReviewsSnapshot.size + 1;

      allReviewsSnapshot.forEach(doc => {
        if (doc.id !== reviewId) {
          totalRating += doc.data().rating;
        }
      });

      const averageRating = totalRating / reviewCount;

      // Update campsite
      transaction.update(campsiteRef, {
        averageRating: parseFloat(averageRating.toFixed(2)),
        reviewCount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    console.log(`Review ${isUpdate ? 'updated' : 'created'} for campsite ${campsiteId}`);
    
    res.status(isUpdate ? 200 : 201).json({
      message: isUpdate ? 'Review updated successfully' : 'Review created successfully',
      reviewId
    });
  } catch (error) {
    console.error('Review creation error:', error);
    res.status(500).json({ error: 'Failed to create review', details: error.message });
  }
});

/**
 * GET /api/campsites/:id/reviews
 * Get reviews for a campsite with pagination and sorting
 */
router.get('/:id/reviews', async (req, res) => {
  try {
    const campsiteId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const sort = req.query.sort || 'newest'; // newest, highest, lowest
    const db = admin.firestore();

    // Verify campsite exists
    const campsiteDoc = await db.collection('campsites').doc(campsiteId).get();
    if (!campsiteDoc.exists) {
      return res.status(404).json({ error: 'Campsite not found' });
    }

    // Build query
    let query = db.collection('reviews')
      .where('campsiteId', '==', campsiteId)
      .where('hidden', '==', false);

    // Apply sorting
    switch (sort) {
      case 'highest':
        query = query.orderBy('rating', 'desc').orderBy('createdAt', 'desc');
        break;
      case 'lowest':
        query = query.orderBy('rating', 'asc').orderBy('createdAt', 'desc');
        break;
      case 'newest':
      default:
        query = query.orderBy('createdAt', 'desc');
        break;
    }

    // Get total count
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Apply pagination
    const offset = (page - 1) * limit;
    const reviewsSnapshot = await query.limit(limit).offset(offset).get();

    // Format reviews
    const reviews = await Promise.all(reviewsSnapshot.docs.map(async (doc) => {
      const review = doc.data();
      let userInfo = null;

      if (review.userId) {
        try {
          const userRecord = await admin.auth().getUser(review.userId);
          userInfo = {
            displayName: userRecord.displayName || 'Anonymous',
            email: userRecord.email || null
          };
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }

      return {
        id: doc.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        user: userInfo,
        isAnonymous: !review.userId
      };
    }));

    res.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews', details: error.message });
  }
});

/**
 * PUT /api/campsites/:id/reviews/:reviewId
 * Update own review
 */
router.put('/:id/reviews/:reviewId', verifyFirebaseToken, async (req, res) => {
  try {
    const { id: campsiteId, reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.uid;
    const db = admin.firestore();

    // Validate rating
    if (rating && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    if (comment && comment.length > 1000) {
      return res.status(400).json({ error: 'Comment must be 1000 characters or less' });
    }

    // Get review
    const reviewRef = db.collection('reviews').doc(reviewId);
    const reviewDoc = await reviewRef.get();

    if (!reviewDoc.exists) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const reviewData = reviewDoc.data();

    // Verify ownership
    if (reviewData.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    // Verify campsite match
    if (reviewData.campsiteId !== campsiteId) {
      return res.status(400).json({ error: 'Review does not belong to this campsite' });
    }

    // Update review
    const updates = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (rating !== undefined) updates.rating = rating;
    if (comment !== undefined) updates.comment = comment;

    await reviewRef.update(updates);

    // Recalculate average rating if rating changed
    if (rating !== undefined && rating !== reviewData.rating) {
      const campsiteRef = db.collection('campsites').doc(campsiteId);
      
      await db.runTransaction(async (transaction) => {
        const allReviewsSnapshot = await transaction.get(
          db.collection('reviews')
            .where('campsiteId', '==', campsiteId)
            .where('hidden', '==', false)
        );

        let totalRating = 0;
        let reviewCount = allReviewsSnapshot.size;

        allReviewsSnapshot.forEach(doc => {
          totalRating += doc.id === reviewId ? rating : doc.data().rating;
        });

        const averageRating = totalRating / reviewCount;

        transaction.update(campsiteRef, {
          averageRating: parseFloat(averageRating.toFixed(2)),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
    }

    res.json({ message: 'Review updated successfully' });
  } catch (error) {
    console.error('Review update error:', error);
    res.status(500).json({ error: 'Failed to update review', details: error.message });
  }
});

/**
 * DELETE /api/campsites/:id/reviews/:reviewId
 * Delete own review
 */
router.delete('/:id/reviews/:reviewId', verifyFirebaseToken, async (req, res) => {
  try {
    const { id: campsiteId, reviewId } = req.params;
    const userId = req.user.uid;
    const db = admin.firestore();

    // Get review
    const reviewRef = db.collection('reviews').doc(reviewId);
    const reviewDoc = await reviewRef.get();

    if (!reviewDoc.exists) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const reviewData = reviewDoc.data();

    // Verify ownership
    if (reviewData.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    // Use transaction to delete review and update campsite
    const campsiteRef = db.collection('campsites').doc(campsiteId);
    
    await db.runTransaction(async (transaction) => {
      // Delete review
      transaction.delete(reviewRef);

      // Recalculate average rating
      const allReviewsSnapshot = await transaction.get(
        db.collection('reviews')
          .where('campsiteId', '==', campsiteId)
          .where('hidden', '==', false)
      );

      let totalRating = 0;
      let reviewCount = 0;

      allReviewsSnapshot.forEach(doc => {
        if (doc.id !== reviewId) {
          totalRating += doc.data().rating;
          reviewCount++;
        }
      });

      const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

      transaction.update(campsiteRef, {
        averageRating: reviewCount > 0 ? parseFloat(averageRating.toFixed(2)) : admin.firestore.FieldValue.delete(),
        reviewCount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Review deletion error:', error);
    res.status(500).json({ error: 'Failed to delete review', details: error.message });
  }
});

/**
 * POST /api/campsites/:id/reviews/:reviewId/flag
 * Flag a review for moderation
 */
router.post('/:id/reviews/:reviewId/flag', verifyFirebaseToken, async (req, res) => {
  try {
    const { id: campsiteId, reviewId } = req.params;
    const { reason } = req.body;
    const userId = req.user.uid;
    const db = admin.firestore();

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Flag reason is required' });
    }

    // Get review
    const reviewRef = db.collection('reviews').doc(reviewId);
    const reviewDoc = await reviewRef.get();

    if (!reviewDoc.exists) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const reviewData = reviewDoc.data();

    if (reviewData.campsiteId !== campsiteId) {
      return res.status(400).json({ error: 'Review does not belong to this campsite' });
    }

    // Check if user already flagged this review
    const existingFlags = reviewData.flags || [];
    if (existingFlags.some(flag => flag.userId === userId)) {
      return res.status(400).json({ error: 'You have already flagged this review' });
    }

    // Add flag
    const flag = {
      userId,
      reason: reason.trim(),
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    const newFlagCount = (reviewData.flagCount || 0) + 1;
    const shouldHide = newFlagCount >= 3;

    await reviewRef.update({
      flags: admin.firestore.FieldValue.arrayUnion(flag),
      flagCount: newFlagCount,
      hidden: shouldHide
    });

    // If hiding, recalculate campsite ratings
    if (shouldHide) {
      const campsiteRef = db.collection('campsites').doc(campsiteId);
      
      await db.runTransaction(async (transaction) => {
        const allReviewsSnapshot = await transaction.get(
          db.collection('reviews')
            .where('campsiteId', '==', campsiteId)
            .where('hidden', '==', false)
        );

        let totalRating = 0;
        let reviewCount = 0;

        allReviewsSnapshot.forEach(doc => {
          if (doc.id !== reviewId) {
            totalRating += doc.data().rating;
            reviewCount++;
          }
        });

        const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

        transaction.update(campsiteRef, {
          averageRating: reviewCount > 0 ? parseFloat(averageRating.toFixed(2)) : admin.firestore.FieldValue.delete(),
          reviewCount,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
    }

    res.json({ 
      message: 'Review flagged successfully',
      hidden: shouldHide
    });
  } catch (error) {
    console.error('Review flag error:', error);
    res.status(500).json({ error: 'Failed to flag review', details: error.message });
  }
});

module.exports = router;
