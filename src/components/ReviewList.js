import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import api from '../services/api';
import '../component-css/review-list.css';

export default function ReviewList({ campsiteId }) {
  const { getToken, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [campsiteId, sortBy]);

  async function fetchReviews(append = false) {
    try {
      setLoading(true);
      setError(null);

      const options = {
        sort: sortBy,
        limit: 10
      };

      if (append && lastDoc) {
        options.startAfter = lastDoc;
      }

      const data = await api.reviews.list(campsiteId, options);

      if (append) {
        setReviews([...reviews, ...data.reviews]);
      } else {
        setReviews(data.reviews);
      }

      setHasMore(data.hasMore);
      setLastDoc(data.lastDoc);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }

  function handleSortChange(newSort) {
    setSortBy(newSort);
    setLastDoc(null);
  }

  function handleLoadMore() {
    fetchReviews(true);
  }

  async function handleDelete(reviewId) {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await api.reviews.delete(campsiteId, reviewId, getToken);
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete review');
    }
  }

  async function handleFlag(reviewId, reason) {
    try {
      await api.reviews.flag(campsiteId, reviewId, { reason }, getToken);
      alert('Review has been flagged for moderation');
    } catch (err) {
      console.error('Flag error:', err);
      alert(err.message || 'Failed to flag review');
    }
  }

  function handleEdit(review) {
    setEditingReview(review);
  }

  function handleCancelEdit() {
    setEditingReview(null);
  }

  function handleReviewUpdated() {
    setEditingReview(null);
    fetchReviews();
  }

  function isUserReview(review) {
    return user && review.userId === user.uid;
  }

  if (editingReview) {
    return (
      <ReviewForm
        campsiteId={campsiteId}
        existingReview={editingReview}
        onReviewSubmitted={handleReviewUpdated}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className="review-list">
      <div className="review-list-header">
        <h3>Reviews ({reviews.length})</h3>
        <div className="sort-controls">
          <label htmlFor="sort">Sort by:</label>
          <select 
            id="sort" 
            value={sortBy} 
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      </div>

      {error && <div className="review-list-error">{error}</div>}

      {loading && reviews.length === 0 && (
        <div className="loading-reviews">Loading reviews...</div>
      )}

      {!loading && reviews.length === 0 && (
        <div className="no-reviews">
          No reviews yet. Be the first to review this campsite!
        </div>
      )}

      <div className="reviews">
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="review-author">
                <strong>{review.displayName || 'Anonymous'}</strong>
                <StarRating rating={review.rating} size="small" />
              </div>
              <div className="review-date">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>

            {review.comment && (
              <div className="review-comment">{review.comment}</div>
            )}

            <div className="review-actions">
              {isUserReview(review) && (
                <>
                  <button 
                    onClick={() => handleEdit(review)}
                    className="edit-review-button"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(review.id)}
                    className="delete-review-button"
                  >
                    Delete
                  </button>
                </>
              )}
              {!isUserReview(review) && user && (
                <button 
                  onClick={() => handleFlag(review.id, 'inappropriate')}
                  className="flag-review-button"
                >
                  🚩 Report
                </button>
              )}
            </div>

            {review.flagCount > 0 && user && (
              <div className="flag-notice">
                This review has been flagged {review.flagCount} time(s)
              </div>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <button 
          onClick={handleLoadMore} 
          disabled={loading}
          className="load-more-button"
        >
          {loading ? 'Loading...' : 'Load More Reviews'}
        </button>
      )}
    </div>
  );
}
