import React, { useState } from 'react';
import api from '../services/api';
import '../component-css/photo-gallery.css';

export default function PhotoGallery({ 
  campsiteId, 
  photos = [], 
  canDelete = false, 
  onPhotoDeleted,
  getToken 
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleting, setDeleting] = useState(null);

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = React.useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  }, []);

  const nextImage = React.useCallback((e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => 
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  }, [photos.length]);

  const prevImage = React.useCallback((e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  }, [photos.length]);

  const handleDelete = async (e, photoId) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    setDeleting(photoId);
    try {
      await api.photos.delete(campsiteId, photoId, getToken);
      
      if (onPhotoDeleted) {
        onPhotoDeleted(photoId);
      }

      // Close lightbox if we're viewing the deleted photo
      if (lightboxOpen && photos[currentImageIndex]?.id === photoId) {
        closeLightbox();
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete photo');
    } finally {
      setDeleting(null);
    }
  };

  const handleKeyDown = React.useCallback((e) => {
    if (!lightboxOpen) return;
    
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      nextImage(e);
    } else if (e.key === 'ArrowLeft') {
      prevImage(e);
    }
  }, [lightboxOpen, closeLightbox, nextImage, prevImage]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [handleKeyDown]);

  if (!photos || photos.length === 0) {
    return <div className="no-photos">No photos yet</div>;
  }

  return (
    <>
      <div className="photo-gallery">
        {photos.map((photo, index) => (
          <div key={photo.id} className="photo-thumbnail-container">
            <img
              src={photo.thumbnailUrl || photo.url}
              alt={`Campsite ${index + 1}`}
              className="photo-thumbnail"
              onClick={() => openLightbox(index)}
            />
            {canDelete && (
              <button
                className="delete-photo-button"
                onClick={(e) => handleDelete(e, photo.id)}
                disabled={deleting === photo.id}
                aria-label="Delete photo"
              >
                {deleting === photo.id ? '...' : '✕'}
              </button>
            )}
          </div>
        ))}
      </div>

      {lightboxOpen && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            ✕
          </button>
          
          {photos.length > 1 && (
            <>
              <button className="lightbox-prev" onClick={prevImage}>
                ‹
              </button>
              <button className="lightbox-next" onClick={nextImage}>
                ›
              </button>
            </>
          )}

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[currentImageIndex]?.url}
              alt={`Campsite ${currentImageIndex + 1}`}
              className="lightbox-image"
            />
            {photos.length > 1 && (
              <div className="lightbox-counter">
                {currentImageIndex + 1} / {photos.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
