import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import Footer from './Footer';
import SEO from './SEO';
import '../component-css/user-profile.css';

export default function UserProfile() {
  const { currentUser, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
    }
  }, [currentUser]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await updateUserProfile({ displayName });
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setDisplayName(currentUser?.displayName || '');
    setIsEditing(false);
    setMessage('');
  }

  if (!currentUser) {
    return (
      <div className="user-profile-page">
        <SEO 
          title="User Profile - Dispersed"
          description="Manage your user profile and account settings."
        />
        <Header />
        <div className="profile-container">
          <h2>Please sign in to view your profile</h2>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <SEO 
        title="My Profile - Dispersed"
        description="Manage your user profile and account settings."
      />
      <Header />
      
      <div className="profile-container">
        <h2>My Profile</h2>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="profile-info">
          <div className="info-row">
            <label>Email:</label>
            <span>{currentUser.email}</span>
          </div>

          <div className="info-row">
            <label>Account Created:</label>
            <span>
              {currentUser.metadata?.creationTime 
                ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>

          <div className="info-row">
            <label>Display Name:</label>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="edit-form">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                  maxLength="50"
                  required
                />
                <div className="button-group">
                  <button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCancel} 
                    disabled={loading}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <span>{currentUser.displayName || <em>Not set</em>}</span>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="edit-btn"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>

        <div className="profile-stats">
          <h3>Account Statistics</h3>
          <p className="note">
            View your campsites and reviews from the navigation menu.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
