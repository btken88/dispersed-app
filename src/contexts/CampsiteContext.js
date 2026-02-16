import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const CampsiteContext = createContext();

export function useCampsites() {
  const context = useContext(CampsiteContext);
  if (!context) {
    throw new Error('useCampsites must be used within CampsiteProvider');
  }
  return context;
}

export function CampsiteProvider({ children }) {
  const [campsites, setCampsites] = useState([]);
  const [userCampsites, setUserCampsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken, user } = useAuth();

  // Fetch all visible campsites
  async function fetchCampsites() {
    try {
      setLoading(true);
      setError(null);

      const data = await api.campsites.list(getToken);
      setCampsites(data);

      // Filter user's own campsites
      if (user) {
        setUserCampsites(data.filter(c => c.userId === user.uid));
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Add a new campsite
  async function addCampsite(campsiteData) {
    try {
      setLoading(true);
      setError(null);

      const newCampsite = await api.campsites.create(campsiteData, getToken);
      setCampsites([...campsites, newCampsite]);
      setUserCampsites([...userCampsites, newCampsite]);

      return newCampsite;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Update a campsite
  async function updateCampsite(id, updates) {
    try {
      setLoading(true);
      setError(null);

      const updatedCampsite = await api.campsites.update(id, updates, getToken);

      setCampsites(campsites.map(c => c.id === id ? updatedCampsite : c));
      setUserCampsites(userCampsites.map(c => c.id === id ? updatedCampsite : c));

      return updatedCampsite;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Delete a campsite
  async function deleteCampsite(id) {
    try {
      setLoading(true);
      setError(null);

      await api.campsites.delete(id, getToken);

      setCampsites(campsites.filter(c => c.id !== id));
      setUserCampsites(userCampsites.filter(c => c.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Refresh campsites when user changes
  useEffect(() => {
    fetchCampsites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const value = {
    campsites,
    userCampsites,
    loading,
    error,
    fetchCampsites,
    addCampsite,
    updateCampsite,
    deleteCampsite
  };

  return (
    <CampsiteContext.Provider value={value}>
      {children}
    </CampsiteContext.Provider>
  );
}
