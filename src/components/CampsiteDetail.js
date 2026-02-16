import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PhotoGallery from './PhotoGallery';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import StarRating from './StarRating';
import ShareButton from './ShareButton';
import SEO from './SEO';
import Header from './Header';
import Footer from './Footer';
import api from '../services/api';
import '../component-css/campsite-detail.css';

export default function CampsiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken, user } = useAuth();
  const [campsite, setCampsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const fetchCampsite = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.campsites.get(id, getToken);
      setCampsite(data);
      document.title = `${data.title || 'Campsite'} - Dispersed`;
    } catch (err) {
      console.error('Failed to fetch campsite:', err);
      setError(err.message || 'Failed to load campsite');
    } finally {
      setLoading(false);
    }
  }, [id, getToken]);

  useEffect(() => {
    fetchCampsite();
  }, [fetchCampsite]);

  function handleReviewSubmitted() {
    setShowReviewForm(false);
    fetchCampsite(); // Refresh to get updated rating
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

  const isOwner = user && campsite && campsite.userId === user.uid;
  const canShare = campsite && (campsite.visibility === 'public' || campsite.visibility === 'unlisted');
  const shareUrl = window.location.href;

  if (loading) {
    return (
      <div className="campsite-detail">
        <Header />
        <div className="loading-detail">Loading campsite...</div>
        <Footer />
      </div>
    );
  }

  if (error || !campsite) {
    return (
      <div className="campsite-detail">
        <Header />
        <div className="error-detail">
          <h2>{error || 'Campsite not found'}</h2>
          <button onClick={() => navigate('/map')}>Back to Map</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="campsite-detail">      <SEO 
        title={campsite ? `${campsite.name} - Dispersed` : 'Campsite - Dispersed'}
        description={campsite ? campsite.description : 'View dispersed camping site details, photos, and reviews.'}
        image={campsite?.photos?.[0]}
      />      <Header />

      <div className="detail-container">
        <div className="detail-header">
          <div>
            <h1>{campsite.title || 'Untitled Campsite'}</h1>
            <div className="header-badges">
              {getVisibilityBadge(campsite.visibility)}
              {campsite.visibility === 'unlisted' && (
                <span className="unlisted-notice">
                  Only people with the link can see this campsite
                </span>
              )}
            </div>
          </div>
          <div className="header-actions">
            {canShare && (
              <ShareButton
                url={shareUrl}
                title={campsite.title || 'Check out this campsite!'}
                description={campsite.description || 'I found this great campsite on Dispersed'}
              />
            )}
            {isOwner && (
              <button 
                onClick={() => navigate(`/campsites`)}
                className="edit-campsite-button"
              >
                Manage Campsite
              </button>
            )}
          </div>
        </div>

        <div className="detail-location">
          📍 {campsite.latitude.toFixed(4)}, {campsite.longitude.toFixed(4)}
          <a 
            href={`https://www.google.com/maps/dir/''/${campsite.latitude},${campsite.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="directions-link"
          >
            Get Directions
          </a>
        </div>

        {campsite.averageRating > 0 && (
          <div className="detail-rating">
            <StarRating rating={campsite.averageRating} size="medium" />
            <span className="review-count">
              {campsite.reviewCount} {campsite.reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        )}

        {campsite.description && (
          <div className="detail-description">
            <h2>About This Campsite</h2>
            <p>{campsite.description}</p>
          </div>
        )}

        {campsite.photos && campsite.photos.length > 0 && (
          <div className="detail-photos">
            <h2>Photos</h2>
            <PhotoGallery
              campsiteId={campsite.id}
              photos={campsite.photos}
              canDelete={false}
              getToken={getToken}
            />
          </div>
        )}

        <div className="detail-reviews">
          <div className="reviews-header">
            <h2>Reviews</h2>
            {!showReviewForm && (
              <button 
                onClick={() => setShowReviewForm(true)}
                className="add-review-button"
              >
                Write a Review
              </button>
            )}
          </div>

          {showReviewForm && (
            <ReviewForm
              campsiteId={campsite.id}
              onReviewSubmitted={handleReviewSubmitted}
              onCancel={() => setShowReviewForm(false)}
            />
          )}

          <ReviewList campsiteId={campsite.id} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
