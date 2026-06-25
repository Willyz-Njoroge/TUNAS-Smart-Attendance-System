/**
 * Security & Validation Utilities
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Minimum 8 characters, at least one uppercase, one lowercase, one number
 */
export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Check if user session is still valid
 */
export const isSessionValid = (session) => {
  if (!session || !session.user) return false;

  // Check if session exists and user is authenticated
  return !!session.user.id;
};

/**
 * Get auth token from session
 */
export const getAuthToken = (session) => {
  return session?.access_token || null;
};

/**
 * Check if user has required role
 */
export const hasRole = (userDetails, requiredRole) => {
  if (!userDetails) return false;
  return userDetails.role === requiredRole || userDetails.role === 'admin';
};

/**
 * Rate limiting helper - returns true if action is allowed
 */
export const checkRateLimit = (key, maxRequests = 5, windowMs = 60000) => {
  const store = JSON.parse(localStorage.getItem('rateLimitStore') || '{}');
  const now = Date.now();

  if (!store[key]) {
    store[key] = [];
  }

  // Remove old requests outside the time window
  store[key] = store[key].filter((timestamp) => now - timestamp < windowMs);

  if (store[key].length < maxRequests) {
    store[key].push(now);
    localStorage.setItem('rateLimitStore', JSON.stringify(store));
    return true;
  }

  return false;
};

/**
 * Encrypt sensitive data (basic - should use proper encryption in production)
 */
export const encryptData = (data) => {
  // In production, use proper encryption library like crypto-js
  return btoa(JSON.stringify(data));
};

/**
 * Decrypt sensitive data (basic - should use proper decryption in production)
 */
export const decryptData = (encryptedData) => {
  try {
    return JSON.parse(atob(encryptedData));
  } catch {
    return null;
  }
};
