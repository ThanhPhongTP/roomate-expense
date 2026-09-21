import axios from 'axios';

/**
 * Pre-configured Axios HTTP Client for future backend integrations
 * (Google Apps Script / Firebase Functions / Node.js Express / NestJS API)
 */
export const apiClient = axios.create({
  baseURL: 'https://api.example.com/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Client Error:', error);
    return Promise.reject(error);
  }
);
