import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { API_CONFIG } from '../../config';

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState({
    totalRecipes: 0,
    totalUsers: 0,
    totalLikes: 0,
    pendingRecipes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Fetch basic stats from backend
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        const errorData = await response.json();
        setError(`Failed to fetch statistics: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Error fetching statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-dashboard-container">
        <div className="loading-container">
          <div className="lds-roller">
            <div></div><div></div><div></div><div></div>
            <div></div><div></div><div></div><div></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-dashboard-container">
        <div className="error-message">
          <h3>Error Loading Analytics</h3>
          <p>{error}</p>
          <button onClick={fetchStats} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard-container">
      <Helmet>
        <title>Analytics Dashboard | Zorbas' Kitchen</title>
        <meta name="description" content="Website analytics and statistics" />
      </Helmet>

      <div className="container">
        <h2>Analytics Dashboard</h2>
        <p className="subtitle">Website statistics and performance metrics</p>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{stats.totalRecipes}</h3>
              <p>Total Recipes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{stats.totalUsers}</h3>
              <p>Registered Users</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-content">
              <h3>{stats.totalLikes}</h3>
              <p>Total Likes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{stats.pendingRecipes}</h3>
              <p>Pending Approvals</p>
            </div>
          </div>
        </div>

        <div className="analytics-info">
          <h4>Google Analytics Integration</h4>
          <p>
            This website is integrated with Google Analytics 4 to track user behavior, 
            recipe engagement, and website performance. Key metrics include:
          </p>
          
          <ul>
            <li><strong>Recipe Searches:</strong> Track what ingredients users are searching for</li>
            <li><strong>Recipe Views:</strong> Monitor which recipes are most popular</li>
            <li><strong>User Engagement:</strong> Track registrations, logins, and recipe submissions</li>
            <li><strong>Like Activity:</strong> Monitor user interactions with recipes</li>
          </ul>

          <div className="analytics-links">
            <h5>External Analytics Tools:</h5>
            <div className="link-buttons">
              <a 
                href="https://analytics.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline-primary"
              >
                Google Analytics
              </a>
              <a 
                href="https://search.google.com/search-console" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline-secondary"
              >
                Search Console
              </a>
            </div>
          </div>
        </div>

        <div className="refresh-section">
          <button onClick={fetchStats} className="btn btn-primary">
            Refresh Statistics
          </button>
          <small className="text-muted">
            Last updated: {new Date().toLocaleString()}
          </small>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
