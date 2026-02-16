import React, { useState, useRef } from 'react';
import api from '../services/api';
import '../component-css/photo-uploader.css';

export default function PhotoUploader({ campsiteId, currentPhotos = [], onUploadComplete, getToken }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_PHOTOS = 3;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const handleFileSelect = (file) => {
    setError(null);

    // Validate photo limit
    if (currentPhotos.length >= MAX_PHOTOS) {
      setError(`Maximum ${MAX_PHOTOS} photos per campsite`);
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);

      await api.photos.upload(campsiteId, formData, getToken);

      // Reset form
      setSelectedFile(null);
      setPreview(null);
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const canUploadMore = currentPhotos.length < MAX_PHOTOS;

  return (
    <div className="photo-uploader">
      {error && <div className="upload-error">{error}</div>}

      {!selectedFile && canUploadMore && (
        <div
          className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
          <div className="upload-icon">📷</div>
          <p>Drag & drop a photo here, or click to select</p>
          <p className="upload-hint">
            JPEG, PNG, or WebP • Max 5MB • {currentPhotos.length}/{MAX_PHOTOS} photos
          </p>
        </div>
      )}

      {!canUploadMore && !selectedFile && (
        <div className="upload-limit-reached">
          Maximum {MAX_PHOTOS} photos reached
        </div>
      )}

      {selectedFile && (
        <div className="upload-preview">
          <img src={preview} alt="Preview" />
          <div className="upload-actions">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="upload-button"
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
            <button
              onClick={handleCancel}
              disabled={uploading}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
