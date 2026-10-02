import { supabase } from './supabaseClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Perform an authenticated API request to the backend
 * @param {string} endpoint 
 * @param {RequestInit} [options={}] 
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = {
    ...options.headers,
  };

  // If body is not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Get active session token from Supabase client
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch (err) {
    console.warn('Could not retrieve Supabase session token for request', err);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => {
    const isFormData = body instanceof FormData;
    return apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    });
  },
  put: (endpoint, body, options) => {
    const isFormData = body instanceof FormData;
    return apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
    });
  },
  delete: (endpoint, options) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
