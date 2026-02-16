import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create user profile document in Firestore
  async function createUserProfile(userId, profileData = {}) {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Check if profile already exists
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return userSnap.data();
      }

      // Create new profile with default fields
      const newProfile = {
        email: profileData.email || user?.email || '',
        displayName: profileData.displayName || '',
        username: profileData.username || '',
        name: profileData.name || '',
        bio: profileData.bio || '',
        zipCode: profileData.zipCode || '',
        phone: profileData.phone || '',
        birthday: profileData.birthday || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(userRef, newProfile);
      return newProfile;
    } catch (err) {
      console.error('Error creating user profile:', err);
      setError(err.message);
      throw err;
    }
  }

  // Sign up with email and password
  async function signUp(email, password) {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Auto-create Firestore profile for new user
      await createUserProfile(result.user.uid, { email });
      
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Sign in with email and password
  async function signIn(email, password) {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Sign out
  async function logout() {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Reset password
  async function resetPassword(email) {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Update user profile (display name, photo URL, etc.)
  async function updateUserProfile(profileData) {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    try {
      setError(null);
      await updateProfile(user, profileData);
      // Trigger state update to reflect changes
      setUser({ ...user });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Get Firebase ID token for API calls
  async function getToken() {
    if (user) {
      try {
        return await user.getIdToken();
      } catch (err) {
        setError(err.message);
        throw err;
      }
    }
    return null;
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser: user,
    user,
    loading,
    error,
    signUp,
    signIn,
    logout,
    resetPassword,
    updateUserProfile,
    createUserProfile,
    getToken,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
