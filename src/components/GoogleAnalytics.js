import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import analytics from '../utils/analytics';

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize analytics
    analytics.init();
  }, []);

  useEffect(() => {
    // Track page views when location changes
    if (analytics.isInitialized) {
      const pageTitle = getPageTitle(location.pathname);
      analytics.trackPageView(pageTitle, window.location.href);
    }
  }, [location]);

  // Helper function to get page title based on route
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'Home | Zorbas\' Kitchen';
      case '/submit-recipe':
        return 'Submit Recipe | Zorbas\' Kitchen';
      case '/login':
        return 'Login | Zorbas\' Kitchen';
      case '/register':
        return 'Register | Zorbas\' Kitchen';
      case '/profile':
        return 'Profile | Zorbas\' Kitchen';
      case '/admin/recipes':
        return 'Recipe Approval | Zorbas\' Kitchen';
      case '/admin/users':
        return 'User Management | Zorbas\' Kitchen';
      case '/admin/sitemap':
        return 'Sitemap Generator | Zorbas\' Kitchen';
      default:
        if (pathname.startsWith('/results/')) {
          return 'Search Results | Zorbas\' Kitchen';
        }
        if (pathname.startsWith('/result-item/')) {
          return 'Recipe Details | Zorbas\' Kitchen';
        }
        if (pathname.startsWith('/profile/')) {
          return 'User Profile | Zorbas\' Kitchen';
        }
        return 'Zorbas\' Kitchen';
    }
  };

  return null; // This component doesn't render anything
};

export default GoogleAnalytics;
