const router = require('express').Router();
const admin = require('firebase-admin');
const multer = require('multer');
const sharp = require('sharp');
const { verifyFirebaseToken } = require('../middleware/auth');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only jpeg, png, and webp
    if (file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/png' || 
        file.mimetype === 'image/webp') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
    }
  }
});

/**
 * POST /api/campsites/:id/photos
 * Upload a photo to a campsite
 * Requires authentication and campsite ownership
 */
router.post('/:id/photos', verifyFirebaseToken, upload.single('photo'), async (req, res) => {
  try {
    const campsiteId = req.params.id;
    const userId = req.user.uid;
    const db = admin.firestore();
    const storage = admin.storage().bucket();

    // Verify campsite exists and user is owner
    const campsiteRef = db.collection('campsites').doc(campsiteId);
    const campsiteDoc = await campsiteRef.get();

    if (!campsiteDoc.exists) {
      return res.status(404).json({ error: 'Campsite not found' });
    }

    const campsiteData = campsiteDoc.data();
    if (campsiteData.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to upload photos to this campsite' });
    }

    // Check current photo count
    const currentPhotos = campsiteData.photos || [];
    if (currentPhotos.length >= 3) {
      return res.status(400).json({ error: 'Maximum 3 photos per campsite' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No photo file provided' });
    }

    // Process image with sharp
    const imageBuffer = req.file.buffer;
    const metadata = await sharp(imageBuffer).metadata();

    // Validate resolution
    if (metadata.width < 480 || metadata.height < 480) {
      return res.status(400).json({ error: 'Image resolution must be at least 480x480' });
    }

    // Resize to max 1080p if needed
    let processedImage = sharp(imageBuffer);
    if (metadata.width > 1920 || metadata.height > 1080) {
      processedImage = processedImage.resize(1920, 1080, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert to JPEG and compress
    const fullSizeBuffer = await processedImage
      .jpeg({ quality: 85 })
      .toBuffer();

    // Create thumbnail (200x200)
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Generate unique filename
    const photoId = db.collection('campsites').doc().id;
    const timestamp = Date.now();
    const fullSizePath = `campsites/${campsiteId}/photos/${photoId}_${timestamp}.jpg`;
    const thumbnailPath = `campsites/${campsiteId}/thumbnails/${photoId}_${timestamp}_thumb.jpg`;

    // Upload to Cloud Storage
    const fullSizeFile = storage.file(fullSizePath);
    const thumbnailFile = storage.file(thumbnailPath);

    await Promise.all([
      fullSizeFile.save(fullSizeBuffer, {
        metadata: {
          contentType: 'image/jpeg',
          metadata: {
            campsiteId: campsiteId,
            uploadedBy: userId,
            uploadedAt: new Date().toISOString()
          }
        }
      }),
      thumbnailFile.save(thumbnailBuffer, {
        metadata: {
          contentType: 'image/jpeg'
        }
      })
    ]);

    // Make files publicly readable
    await Promise.all([
      fullSizeFile.makePublic(),
      thumbnailFile.makePublic()
    ]);

    // Get public URLs
    const fullSizeUrl = `https://storage.googleapis.com/${storage.name}/${fullSizePath}`;
    const thumbnailUrl = `https://storage.googleapis.com/${storage.name}/${thumbnailPath}`;

    // Create photo object
    const photoData = {
      id: photoId,
      url: fullSizeUrl,
      thumbnailUrl: thumbnailUrl,
      uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      uploadedBy: userId,
      width: metadata.width > 1920 ? 1920 : metadata.width,
      height: metadata.height > 1080 ? 1080 : metadata.height
    };

    // Update campsite document
    await campsiteRef.update({
      photos: admin.firestore.FieldValue.arrayUnion(photoData),
      hasPhotos: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Photo uploaded successfully for campsite ${campsiteId}`);
    
    res.status(201).json({
      message: 'Photo uploaded successfully',
      photo: photoData
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    
    if (error.message === 'Only JPEG, PNG, and WebP images are allowed') {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 5MB limit' });
    }
    
    res.status(500).json({ error: 'Failed to upload photo', details: error.message });
  }
});

/**
 * DELETE /api/campsites/:id/photos/:photoId
 * Delete a photo from a campsite
 * Requires authentication and campsite ownership
 */
router.delete('/:id/photos/:photoId', verifyFirebaseToken, async (req, res) => {
  try {
    const campsiteId = req.params.id;
    const photoId = req.params.photoId;
    const userId = req.user.uid;
    const db = admin.firestore();
    const storage = admin.storage().bucket();

    // Verify campsite exists and user is owner
    const campsiteRef = db.collection('campsites').doc(campsiteId);
    const campsiteDoc = await campsiteRef.get();

    if (!campsiteDoc.exists) {
      return res.status(404).json({ error: 'Campsite not found' });
    }

    const campsiteData = campsiteDoc.data();
    if (campsiteData.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete photos from this campsite' });
    }

    // Find the photo
    const photos = campsiteData.photos || [];
    const photo = photos.find(p => p.id === photoId);

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Extract file paths from URLs
    const bucketName = storage.name;
    const fullSizePath = photo.url.replace(`https://storage.googleapis.com/${bucketName}/`, '');
    const thumbnailPath = photo.thumbnailUrl.replace(`https://storage.googleapis.com/${bucketName}/`, '');

    // Delete files from storage
    try {
      await Promise.all([
        storage.file(fullSizePath).delete(),
        storage.file(thumbnailPath).delete()
      ]);
    } catch (storageError) {
      console.error('Error deleting files from storage:', storageError);
      // Continue even if storage deletion fails
    }

    // Remove photo from campsite document
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    await campsiteRef.update({
      photos: updatedPhotos,
      hasPhotos: updatedPhotos.length > 0,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Photo ${photoId} deleted from campsite ${campsiteId}`);
    
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Photo deletion error:', error);
    res.status(500).json({ error: 'Failed to delete photo', details: error.message });
  }
});

module.exports = router;
