/**
 * Dynamically detect the frontend URL from request headers or environment
 * @param {Object} req - Express request object
 * @returns {string} The frontend URL
 */
const getFrontendUrl = (req) => {
  // First check if it's set in environment variables
  let frontendUrl = process.env.FRONTEND_URL;
  
  if (frontendUrl) {
    return frontendUrl;
  }

  // Try to detect from request headers
  if (req && req.headers) {
    // Check for Origin header (most reliable for CORS requests)
    if (req.headers.origin) {
      return req.headers.origin;
    }
    
    // Check for Referer header
    if (req.headers.referer) {
      try {
        const url = new URL(req.headers.referer);
        return `${url.protocol}//${url.host}`;
      } catch (error) {
        console.warn('Invalid referer URL:', req.headers.referer);
      }
    }
    
    // Check for Host header (for same-origin requests)
    if (req.headers.host) {
      const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      return `${protocol}://${req.headers.host}`;
    }
  }

  // Fallback to localhost for development
  return 'http://localhost:3000';
};

/**
 * Get the base URL for the current environment
 * @param {Object} req - Express request object (optional)
 * @returns {string} The base URL
 */
const getBaseUrl = (req) => {
  const frontendUrl = getFrontendUrl(req);
  
  // Remove trailing slash if present
  return frontendUrl.endsWith('/') ? frontendUrl.slice(0, -1) : frontendUrl;
};

module.exports = {
  getFrontendUrl,
  getBaseUrl
};
