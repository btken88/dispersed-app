import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useCampsites } from '../contexts/CampsiteContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * Redirect component for deprecated /favorites route
 * Redirects to:
 * - /campsites if user has campsites
 * - /map if user has no campsites or is not logged in
 */
export default function FavoritesRedirect() {
  const { userCampsites, loading } = useCampsites();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('Redirecting from deprecated /favorites route');
  }, []);

  // Show loading state while fetching campsites
  if (loading && isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to campsites if user has any, otherwise to map
  const destination = (isAuthenticated && userCampsites && userCampsites.length > 0) 
    ? '/campsites' 
    : '/map';

  return <Navigate to={destination} replace />;
}
