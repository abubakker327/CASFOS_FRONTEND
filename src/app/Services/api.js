// services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'; // Laravel default URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('Starting Request:', request.method, request.url);
  return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('Response:', response.status, response.data);
    return response;
  },
  error => {
    // Enhanced error logging
    if (error.response) {
      // Server responded with error status
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method
      });
    } else if (error.request) {
      // Network error - no response received
      console.error('API Network Error:', {
        message: 'No response received from server',
        url: error.config?.url,
        method: error.config?.method,
        error: error.message
      });
    } else {
      // Other error
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;