import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StarRating from './StarRating';
import SEO from './SEO';
import Header from './Header';
import Footer from './Footer';
import api from '../services/api';
import '../component-css/search-page.css';

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Search parameters
  const [searchText, setSearchText] = useState(searchParams.get('q') || '');
  const [latitude, setLatitude] = useState(searchParams.get('lat') || '');
  const [longitude, setLongitude] = useState(searchParams.get('lng') || '');
  const [radius, setRadius] = useState(searchParams.get('radius') || '25');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [hasPhotos, setHasPhotos] = useState(searchParams.get('hasPhotos') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  
  // Results
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const debouncedSearchText = useDebounce(searchText, 500);

  useEffect(() => {
    document.title = "Search Campsites - Dispersed";
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = {};
    if (searchText) params.q = searchText;
    if (latitude) params.lat = latitude;
    if (longitude) params.lng = longitude;
    if (radius !== '25') params.radius = radius;
    if (minRating) params.minRating = minRating;
    if (hasPhotos) params.hasPhotos = 'true';
    if (sortBy !== 'newest') params.sort = sortBy;
    
    setSearchParams(params);
  }, [searchText, latitude, longitude, radius, minRating, hasPhotos, sortBy, setSearchParams]);

  const performSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const params = {
        sort: sortBy
      };

      if (debouncedSearchText) {
        params.q = debouncedSearchText;
      }

      if (latitude && longitude) {
        params.latitude = parseFloat(latitude);
        params.longitude = parseFloat(longitude);
        params.radius = parseFloat(radius);
      }

      if (minRating) {
        params.minRating = parseFloat(minRating);
      }

      if (hasPhotos) {
        params.hasPhotos = true;
      }

      const data = await api.search(params);
      setResults(data.campsites || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchText, latitude, longitude, radius, minRating, hasPhotos, sortBy]);

  // Search when filters change
  useEffect(() => {
    if (debouncedSearchText || latitude || minRating || hasPhotos || searched) {
      performSearch();
    }
  }, [performSearch, debouncedSearchText, latitude, minRating, hasPhotos, searched]);

  function useCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(4));
          setLongitude(position.coords.longitude.toFixed(4));
        },
        (error) => {
          alert('Unable to get your location: ' + error.message);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  }

  function clearFilters() {
    setSearchText('');
    setLatitude('');
    setLongitude('');
    setRadius('25');
    setMinRating('');
    setHasPhotos(false);
    setSortBy('newest');
    setResults([]);
    setSearched(false);
  }

  return (
    <div className="search-page">
      <SEO 
        title="Search Campsites - Dispersed"
        description="Search for dispersed camping sites by location, amenities, and distance. Find the perfect spot for your next camping adventure."
      />
      <Header />

      <div className="search-container">
        <h1>Search Campsites</h1>

        <div className="search-filters">
          {/* Text Search */}
          <div className="filter-group">
            <label htmlFor="search-text">Search</label>
            <input
              type="text"
              id="search-text"
              placeholder="Search by title or description..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {/* Location Search */}
          <div className="filter-group location-group">
            <label>Location</label>
            <div className="location-inputs">
              <input
                type="number"
                placeholder="Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                step="any"
              />
              <input
                type="number"
                placeholder="Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                step="any"
              />
              <button onClick={useCurrentLocation} className="location-button">
                📍 Use My Location
              </button>
            </div>
          </div>

          {/* Radius */}
          {latitude && longitude && (
            <div className="filter-group">
              <label htmlFor="radius">
                Radius: {radius} miles
              </label>
              <input
                type="range"
                id="radius"
                min="1"
                max="100"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
              />
            </div>
          )}

          {/* Rating Filter */}
          <div className="filter-group">
            <label htmlFor="min-rating">Minimum Rating</label>
            <select
              id="min-rating"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            >
              <option value="">Any Rating</option>
              <option value="1">1+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>

          {/* Photos Filter */}
          <div className="filter-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={hasPhotos}
                onChange={(e) => setHasPhotos(e.target.checked)}
              />
              Only show campsites with photos
            </label>
          </div>

          {/* Sort */}
          <div className="filter-group">
            <label htmlFor="sort">Sort By</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="rating">Highest Rated</option>
              <option value="reviewCount">Most Reviewed</option>
              {latitude && longitude && <option value="distance">Distance</option>}
            </select>
          </div>

          <div className="filter-actions">
            <button onClick={performSearch} disabled={loading} className="search-button">
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button onClick={clearFilters} className="clear-button">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="search-results">
          {error && <div className="error-message">{error}</div>}

          {loading && <div className="loading-message">Searching...</div>}

          {!loading && searched && results.length === 0 && (
            <div className="no-results">
              No campsites found matching your criteria. Try adjusting your filters.
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div className="results-count">
                Found {results.length} campsite{results.length !== 1 ? 's' : ''}
              </div>
              
              <div className="results-grid">
                {results.map((campsite) => (
                  <div 
                    key={campsite.id} 
                    className="campsite-result-card"
                    onClick={() => navigate(`/campsites/${campsite.id}`)}
                  >
                    {campsite.photos && campsite.photos.length > 0 && (
                      <div className="result-photo">
                        <img src={campsite.photos[0].thumbnailUrl || campsite.photos[0].url} alt={campsite.title} />
                      </div>
                    )}
                    
                    <div className="result-content">
                      <h3>{campsite.title || 'Untitled Campsite'}</h3>
                      
                      {campsite.averageRating > 0 && (
                        <div className="result-rating">
                          <StarRating rating={campsite.averageRating} size="small" />
                          <span className="review-count">
                            ({campsite.reviewCount})
                          </span>
                        </div>
                      )}

                      {campsite.description && (
                        <p className="result-description">
                          {campsite.description.substring(0, 120)}
                          {campsite.description.length > 120 ? '...' : ''}
                        </p>
                      )}

                      <div className="result-meta">
                        📍 {campsite.latitude.toFixed(4)}, {campsite.longitude.toFixed(4)}
                        {campsite.distance && (
                          <span className="distance">
                            • {campsite.distance.toFixed(1)} miles away
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
