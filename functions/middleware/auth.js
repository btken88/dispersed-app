const admin = require('firebase-admin');

/**
 * Middleware to verify Firebase ID token
 * Extracts the token from Authorization header and verifies it
 * Adds decoded user info to req.user
 */
async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified
    };
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional auth middleware - continues even if no valid token
 * Used for endpoints that work for both authenticated and unauthenticated users
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified
    };
  } catch (error) {
    console.error('Token verification error (optional):', error);
    req.user = null;
  }

  next();
}

module.exports = {
  verifyFirebaseToken,
  optionalAuth
};
