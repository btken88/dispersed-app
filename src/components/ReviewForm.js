import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StarRating from './StarRating';
import api from '../services/api';
import '../component-css/review-form.css';

export default function ReviewForm({ 
  campsiteId, 
  existingReview = null,
  onReviewSubmitted,
  onCancel 
}) {
  const { getToken, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!existingReview;
  const canAddComment = isAuthenticated;

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length > 1000) {
      setError('Comment must be 1000 characters or less');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const reviewData = {
        rating,
        comment: comment.trim()
      };

      let result;
      if (isEditing) {
        result = await api.reviews.update(
          campsiteId,
          existingReview.id,
          reviewData,
          getToken
        );
      } else {
        result = await api.reviews.create(
          campsiteId,
          reviewData,
          isAuthenticated ? getToken : null
        );
      }

      if (onReviewSubmitted) {
        onReviewSubmitted(result);
      }

      // Reset form if not editing
      if (!isEditing) {
        setRating(0);
        setComment('');
      }
    } catch (err) {
      console.error('Review submission error:', err);
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="review-form">
      <h3>{isEditing ? 'Edit Your Review' : 'Write a Review'}</h3>

      {error && <div className="review-form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Your Rating *</label>
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            interactive={true}
            size="large"
          />
        </div>

        {canAddComment && (
          <div className="form-group">
            <label htmlFor="comment">
              Your Review {isAuthenticated ? '' : '(optional)'}
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience at this campsite..."
              rows="5"
              maxLength="1000"
              disabled={submitting}
            />
            <div className="character-count">
              {comment.length} / 1000 characters
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <div className="anonymous-notice">
            You're submitting an anonymous rating. Sign in to leave a detailed review.
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={submitting || rating === 0}
            className="submit-button"
          >
            {submitting ? 'Submitting...' : (isEditing ? 'Update Review' : 'Submit Review')}
          </button>
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              disabled={submitting}
              className="cancel-button"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
