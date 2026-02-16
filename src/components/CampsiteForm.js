import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCampsites } from '../contexts/CampsiteContext';
import PhotoUploader from './PhotoUploader';
import PhotoGallery from './PhotoGallery';
import api from '../services/api';
import '../component-css/campsite-form.css';

export default function CampsiteForm({ 
  campsiteId = null, 
  initialData = null, 
  onClose,
  onSave 
}) {
  const { getToken } = useAuth();
  const { addCampsite, updateCampsite } = useCampsites();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [campsite, setCampsite] = useState(null);

  const [formData, setFormData] = useState({
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    visibility: initialData?.visibility || 'private'
  });

  const fetchCampsite = React.useCallback(async () => {
    try {
      const data = await api.campsites.get(campsiteId, getToken);
      setCampsite(data);
      setFormData({
        latitude: data.latitude,
        longitude: data.longitude,
        title: data.title,
        description: data.description || '',
        visibility: data.visibility
      });
    } catch (err) {
      console.error('Failed to fetch campsite:', err);
      setError('Failed to load campsite details');
    }
  }, [campsiteId, getToken]);

  // Fetch campsite details if editing
  useEffect(() => {
    if (campsiteId) {
      fetchCampsite();
    }
  }, [campsiteId, fetchCampsite]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate coordinates
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }

      if (isNaN(lng) || lng < -180 || lng > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }

      const campsiteData = {
        latitude: lat,
        longitude: lng,
        title: formData.title.trim() || 'Untitled Campsite',
        description: formData.description.trim(),
        visibility: formData.visibility
      };

      let result;
      if (campsiteId) {
        // Update existing campsite
        result = await updateCampsite(campsiteId, campsiteData);
      } else {
        // Create new campsite
        result = await addCampsite(campsiteData);
      }

      if (onSave) {
        onSave(result);
      }

      // If creating new, fetch the full campsite data to get the ID for photos
      if (!campsiteId && result.id) {
        setCampsite(result);
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save campsite');
    } finally {
      setLoading(false);
    }
  }

  async function handlePhotoUploadComplete() {
    // Refresh campsite data to get updated photos
    if (campsiteId || campsite?.id) {
      await fetchCampsite();
    }
  }

  async function handlePhotoDeleted() {
    // Refresh campsite data after photo deletion
    if (campsiteId || campsite?.id) {
      await fetchCampsite();
    }
  }

  const isEditing = !!campsiteId;
  const currentCampsiteId = campsiteId || campsite?.id;
  const canUploadPhotos = currentCampsiteId && formData.visibility === 'public';

  return (
    <div className="campsite-form-container">
      <div className="campsite-form">
        <h2>{isEditing ? 'Edit Campsite' : 'Create New Campsite'}</h2>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="latitude">Latitude *</label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              step="any"
              required
              disabled={loading}
              placeholder="39.8211"
            />
          </div>

          <div className="form-group">
            <label htmlFor="longitude">Longitude *</label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              step="any"
              required
              disabled={loading}
              placeholder="-105.6598"
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
              placeholder="Beautiful mountain campsite"
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              placeholder="Describe this campsite..."
              rows="5"
              maxLength="1000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="visibility">Visibility *</label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="private">Private - Only you can see</option>
              <option value="unlisted">Unlisted - Anyone with link can see</option>
              <option value="public">Public - Visible to everyone</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="save-button">
              {loading ? 'Saving...' : (isEditing ? 'Update Campsite' : 'Create Campsite')}
            </button>
            {onClose && (
              <button type="button" onClick={onClose} disabled={loading} className="cancel-button">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Photo upload section - only show for public campsites */}
        {currentCampsiteId && (
          <div className="photo-section">
            <h3>Photos</h3>
            
            {!canUploadPhotos && (
              <div className="photo-restriction-notice">
                Photos can only be uploaded to public campsites. 
                Change visibility to "Public" to enable photo uploads.
              </div>
            )}

            {campsite?.photos && campsite.photos.length > 0 && (
              <PhotoGallery
                campsiteId={currentCampsiteId}
                photos={campsite.photos}
                canDelete={true}
                onPhotoDeleted={handlePhotoDeleted}
                getToken={getToken}
              />
            )}

            {canUploadPhotos && (
              <PhotoUploader
                campsiteId={currentCampsiteId}
                currentPhotos={campsite?.photos || []}
                onUploadComplete={handlePhotoUploadComplete}
                getToken={getToken}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
