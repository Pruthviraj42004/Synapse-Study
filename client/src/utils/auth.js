/**
 * Helper functions for authentication and token management
 */

// Get the authentication token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Set the authentication token in localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove the authentication token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Check if the user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

// Decode the JWT token
export const decodeToken = (token) => {
  try {
    // JWT tokens are in the format header.payload.signature
    // We need to decode the payload part which is base64 encoded
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

// Check if the token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decoded = decodeToken(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export default {
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
  decodeToken,
  isTokenExpired
};