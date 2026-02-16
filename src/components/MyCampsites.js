import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCampsites } from '../contexts/CampsiteContext';
import CampsiteForm from './CampsiteForm';
import PhotoGallery from './PhotoGallery';
import ShareButton from './ShareButton';
import SEO from './SEO';
import Header from './Header';
import Footer from './Footer';
import '../component-css/my-campsites.css';

export default function MyCampsites() {
  const navigate = useNavigate();
  const { getToken, isAuthenticated } = useAuth();
  const { userCampsites, loading, error, deleteCampsite, fetchCampsites } = useCampsites();
  const [editingCampsite, setEditingCampsite] = useState(null);
  const [expandedCampsite, setExpandedCampsite] = useState(null);

  React.useEffect(() => {
    document.title = "Dispersed - My Campsites";
  }, []);

  async function handleDelete(campsiteId) {
    if (!window.confirm('Are you sure you want to delete this campsite? This will also delete all photos and reviews.')) {
      return;
    }

    try {
      await deleteCampsite(campsiteId);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete campsite');
    }
  }

  function handleEdit(campsite) {
    setEditingCampsite(campsite);
  }

  function handleEditClose() {
    setEditingCampsite(null);
    fetchCampsites(); // Refresh the list
  }

  function toggleExpand(campsiteId) {
    setExpandedCampsite(expandedCampsite === campsiteId ? null : campsiteId);
  }

  function getVisibilityBadge(visibility) {
    const badges = {
      private: { text: 'Private', class: 'badge-private' },
      unlisted: { text: 'Unlisted', class: 'badge-unlisted' },
      public: { text: 'Public', class: 'badge-public' }
    };
    const badge = badges[visibility] || badges.private;
    return <span className={`visibility-badge ${badge.class}`}>{badge.text}</span>;
  }

  if (!isAuthenticated) {
    return (
      <div className="my-campsites">
        <Header />
        <div className="auth-required">
          <h2>You must be logged in to view this page</h2>
        </div>
        <Footer />
      </div>
    );
  }

  if (editingCampsite) {
    return (
      <div className="my-campsites">
        <Header />
        <CampsiteForm
          campsiteId={editingCampsite.id}
          initialData={editingCampsite}
          onClose={handleEditClose}
          onSave={handleEditClose}
        />
        <Footer />
      </div>
    );
  }

  return (
    <div className="my-campsites">      <SEO 
        title="My Campsites - Dispersed"
        description="Manage your dispersed camping sites. Create, edit, and share your favorite camping locations with the community."
      />      <Header />
      
      <div className="campsites-container">
        <h1>My Campsites</h1>

        {error && <div className="error-message">{error}</div>}

        {loading && <div className="loading-message">Loading campsites...</div>}

        {!loading && userCampsites.length === 0 && (
          <div className="empty-state">
            <p>You haven't created any campsites yet.</p>
            <p>Click on the map to create your first campsite!</p>
          </div>
        )}

        {!loading && userCampsites.length > 0 && (
          <div className="campsites-list">
            {userCampsites.map((campsite) => (
              <div key={campsite.id} className="campsite-card">
                <div className="campsite-header">
                  <h3>{campsite.title || 'Untitled Campsite'}</h3>
                  {getVisibilityBadge(campsite.visibility)}
                </div>

                <div className="campsite-location">
                  📍 {campsite.latitude.toFixed(4)}, {campsite.longitude.toFixed(4)}
                </div>

                {campsite.description && (
                  <p className="campsite-description">{campsite.description}</p>
                )}

                {campsite.photos && campsite.photos.length > 0 && (
                  <div className="campsite-photos">
                    <PhotoGallery
                      campsiteId={campsite.id}
                      photos={campsite.photos}
                      canDelete={false}
                      getToken={getToken}
                    />
                  </div>
                )}

                {campsite.averageRating && (
                  <div className="campsite-rating">
                    ⭐ {campsite.averageRating.toFixed(1)} ({campsite.reviewCount} reviews)
                  </div>
                )}

                {(campsite.visibility === 'public' || campsite.visibility === 'unlisted') && (
                  <div className="campsite-share">
                    <ShareButton
                      url={`${window.location.origin}/campsites/${campsite.id}`}
                      title={campsite.title || 'Check out this campsite!'}
                      description={campsite.description || 'I found this great campsite on Dispersed'}
                    />
                  </div>
                )}

                <div className="campsite-actions">
                  <button onClick={() => navigate(`/campsites/${campsite.id}`)} className="view-button">
                    View
                  </button>
                  <button onClick={() => handleEdit(campsite)} className="edit-button">
                    Edit
                  </button>
                  <button onClick={() => toggleExpand(campsite.id)} className="details-button">
                    {expandedCampsite === campsite.id ? 'Hide Details' : 'Show Details'}
                  </button>
                  <a 
                    href={`https://www.google.com/maps/dir/''/${campsite.latitude},${campsite.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="directions-link"
                  >
                    Get Directions
                  </a>
                  <button onClick={() => handleDelete(campsite.id)} className="delete-button">
                    Delete
                  </button>
                </div>

                {expandedCampsite === campsite.id && (
                  <div className="campsite-details">
                    <div className="detail-row">
                      <strong>Created:</strong> {new Date(campsite.createdAt).toLocaleDateString()}
                    </div>
                    {campsite.updatedAt && (
                      <div className="detail-row">
                        <strong>Updated:</strong> {new Date(campsite.updatedAt).toLocaleDateString()}
                      </div>
                    )}
                    <div className="detail-row">
                      <strong>Photos:</strong> {campsite.photos?.length || 0} / 3
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
