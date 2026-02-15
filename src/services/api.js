/**
 * Centralized API client with authentication token injection
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data.error || data.message || 'Request failed',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error or server unavailable', 0, null);
  }
}

async function authenticatedRequest(endpoint, getToken, options = {}) {
  const token = await getToken();
  
  if (!token) {
    throw new APIError('Authentication required', 401, null);
  }

  return request(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
}

const api = {
  // Campsite endpoints
  campsites: {
    list: (getToken) => {
      if (getToken) {
        return authenticatedRequest('/api/campsites', getToken);
      }
      return request('/api/campsites');
    },
    
    get: (id, getToken) => {
      if (getToken) {
        return authenticatedRequest(`/api/campsites/${id}`, getToken);
      }
      return request(`/api/campsites/${id}`);
    },
    
    create: (data, getToken) => 
      authenticatedRequest('/api/campsites', getToken, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    
    update: (id, data, getToken) => 
      authenticatedRequest(`/api/campsites/${id}`, getToken, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    
    delete: (id, getToken) => 
      authenticatedRequest(`/api/campsites/${id}`, getToken, {
        method: 'DELETE'
      })
  },
  
  // Weather endpoint
  getWeather: (lat, lng) => 
    request(`/api/weather/${lat}/${lng}`),
  
  // Elevation endpoint
  getElevation: (lat, lng) => 
    request(`/api/elevation/${lat}/${lng}`),
  
  // Bug report endpoint
  reportBug: (data) => 
    request('/api/bug', {
      method: 'POST',
      body: JSON.stringify(data)
    })
};

export default api;
export { APIError };
