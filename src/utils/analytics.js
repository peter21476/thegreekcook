// Google Analytics 4 Configuration and Utilities
class Analytics {
  constructor() {
    this.GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
    this.isInitialized = false;
  }

  // Initialize Google Analytics
  init() {
    if (typeof window !== 'undefined' && window.gtag) {
      this.isInitialized = true;
      console.log('Google Analytics initialized');
    } else {
      console.warn('Google Analytics not loaded');
    }
  }

  // Track page views
  trackPageView(pageTitle, pageLocation) {
    if (!this.isInitialized) return;

    window.gtag('config', this.GA_MEASUREMENT_ID, {
      page_title: pageTitle,
      page_location: pageLocation,
    });
  }

  // Track custom events
  trackEvent(eventName, parameters = {}) {
    if (!this.isInitialized) return;

    window.gtag('event', eventName, {
      ...parameters,
      custom_parameter: 'recipe_website'
    });
  }

  // Track recipe searches
  trackRecipeSearch(searchTerm, resultsCount) {
    this.trackEvent('recipe_search', {
      search_term: searchTerm,
      results_count: resultsCount,
      event_category: 'Recipe Search'
    });
  }

  // Track recipe views
  trackRecipeView(recipeTitle, recipeId, isUserRecipe = false) {
    this.trackEvent('recipe_view', {
      recipe_title: recipeTitle,
      recipe_id: recipeId,
      recipe_type: isUserRecipe ? 'user_submitted' : 'api_recipe',
      event_category: 'Recipe Engagement'
    });
  }

  // Track recipe likes
  trackRecipeLike(recipeTitle, recipeId, action = 'like') {
    this.trackEvent('recipe_like', {
      recipe_title: recipeTitle,
      recipe_id: recipeId,
      action: action,
      event_category: 'Recipe Engagement'
    });
  }

  // Track recipe submissions
  trackRecipeSubmission(recipeTitle) {
    this.trackEvent('recipe_submission', {
      recipe_title: recipeTitle,
      event_category: 'Recipe Creation'
    });
  }

  // Track user registration
  trackUserRegistration(method = 'email') {
    this.trackEvent('user_registration', {
      registration_method: method,
      event_category: 'User Engagement'
    });
  }

  // Track user login
  trackUserLogin(method = 'email') {
    this.trackEvent('user_login', {
      login_method: method,
      event_category: 'User Engagement'
    });
  }

  // Track navigation events
  trackNavigation(fromPage, toPage) {
    this.trackEvent('navigation', {
      from_page: fromPage,
      to_page: toPage,
      event_category: 'Navigation'
    });
  }

  // Track time spent on recipe
  trackRecipeTimeSpent(recipeTitle, timeSpent) {
    this.trackEvent('recipe_time_spent', {
      recipe_title: recipeTitle,
      time_spent_seconds: timeSpent,
      event_category: 'Recipe Engagement'
    });
  }

  // Track error events
  trackError(errorType, errorMessage, pageLocation) {
    this.trackEvent('error', {
      error_type: errorType,
      error_message: errorMessage,
      page_location: pageLocation,
      event_category: 'Error Tracking'
    });
  }
}

// Create singleton instance
const analytics = new Analytics();

export default analytics;
