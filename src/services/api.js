const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const getAuthHeaders = () => {
  try {
    const savedUser = localStorage.getItem('ems_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user?.token) {
        return { Authorization: `Bearer ${user.token}` };
      }
    }
  } catch (e) {
    console.warn('Error reading auth token', e);
  }
  return {};
};

const api = {
  fetch: async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = response.statusText;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || response.statusText;
        } catch {
          const text = await response.text();
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }

      const text = await response.text();
      if (!text) return {};
      try {
        return JSON.parse(text);
      } catch {
        return { message: text };
      }
    } catch (err) {
      console.warn(`[API Call Failed] ${options.method || 'GET'} ${url}:`, err.message);
      throw err;
    }
  },

  get: (endpoint, options) => api.fetch(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => api.fetch(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (endpoint, body, options) => api.fetch(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),
  patch: (endpoint, body, options) => api.fetch(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options }),
  delete: (endpoint, options) => api.fetch(endpoint, { method: 'DELETE', ...options }),
};

export default api;
