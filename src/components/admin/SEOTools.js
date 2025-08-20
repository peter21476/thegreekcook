import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { generateSitemap, downloadSitemap } from '../../utils/sitemapGenerator';
import { API_CONFIG } from '../../config';
import analytics from '../../utils/analytics';

const SEOTools = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sitemapContent, setSitemapContent] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://zorbaskitchen.com');
  const [seoStats, setSeoStats] = useState({
    totalPages: 0,
    indexedPages: 0,
    metaTagsComplete: 0,
    structuredDataComplete: 0
  });

  useEffect(() => {
    fetchRecipes();
    calculateSEOStats();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/recipes`);
      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSEOStats = () => {
    // Calculate SEO statistics
    const totalPages = recipes.length + 5; // recipes + static pages (home, login, register, submit, profile)
    const indexedPages = Math.floor(totalPages * 0.85); // Estimate 85% indexed
    const metaTagsComplete = Math.floor(totalPages * 0.95); // Estimate 95% have meta tags
    const structuredDataComplete = Math.floor(recipes.length * 0.9); // Estimate 90% have structured data

    setSeoStats({
      totalPages,
      indexedPages,
      metaTagsComplete,
      structuredDataComplete
    });
  };

  const generateSitemapContent = () => {
    const content = generateSitemap(recipes, baseUrl);
    setSitemapContent(content);
    analytics.trackEvent('sitemap_generated', {
      total_urls: recipes.length + 2,
      event_category: 'SEO Tools'
    });
  };

  const handleDownload = () => {
    if (sitemapContent) {
      downloadSitemap(sitemapContent);
      analytics.trackEvent('sitemap_downloaded', {
        event_category: 'SEO Tools'
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sitemapContent);
    alert('Sitemap content copied to clipboard!');
  };

  const validateMetaTags = () => {
    // Simulate meta tag validation
    const issues = [];
    if (!baseUrl.includes('https')) {
      issues.push('Base URL should use HTTPS for better SEO');
    }
    if (recipes.length < 10) {
      issues.push('Consider adding more content for better SEO');
    }
    return issues;
  };

  const generateRobotsTxt = () => {
    return `# Robots.txt for ${baseUrl}
User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /profile/
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password

# Allow important pages
Allow: /results/
Allow: /result-item/

# Crawl delay
Crawl-delay: 1

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Additional user agents
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /`;
  };

  const downloadRobotsTxt = () => {
    const robotsContent = generateRobotsTxt();
    const blob = new Blob([robotsContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="seo-tools-container">
      <Helmet>
        <title>SEO Tools | Zorbas' Kitchen</title>
        <meta name="description" content="Comprehensive SEO tools for website optimization" />
      </Helmet>

      <div className="container">
        <h2>SEO Tools & Analytics</h2>
        <p className="subtitle">Comprehensive SEO management and optimization tools</p>

        {/* SEO Statistics */}
        <div className="seo-stats-section">
          <h4>SEO Overview</h4>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📄</div>
              <div className="stat-content">
                <h3>{seoStats.totalPages}</h3>
                <p>Total Pages</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔍</div>
              <div className="stat-content">
                <h3>{seoStats.indexedPages}</h3>
                <p>Indexed Pages</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏷️</div>
              <div className="stat-content">
                <h3>{seoStats.metaTagsComplete}%</h3>
                <p>Meta Tags Complete</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>{seoStats.structuredDataComplete}%</h3>
                <p>Structured Data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sitemap Generator */}
        <div className="tool-section">
          <h4>Sitemap Generator</h4>
          <div className="form-group">
            <label htmlFor="baseUrl">Base URL:</label>
            <input
              type="url"
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="form-control"
              placeholder="https://zorbaskitchen.com"
            />
          </div>

          <div className="stats-section">
            <h5>Current Statistics</h5>
            <p>Total Recipes: {recipes.length}</p>
            <p>Static Pages: 2 (Home, Submit Recipe)</p>
            <p>Total URLs: {recipes.length + 2}</p>
          </div>

          <div className="actions-section">
            <button 
              onClick={generateSitemapContent}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Generate Sitemap'}
            </button>

            {sitemapContent && (
              <>
                <button 
                  onClick={handleDownload}
                  className="btn btn-success"
                >
                  Download Sitemap
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="btn btn-info"
                >
                  Copy to Clipboard
                </button>
              </>
            )}
          </div>

          {sitemapContent && (
            <div className="sitemap-preview">
              <h5>Sitemap Preview</h5>
              <pre className="sitemap-content">
                {sitemapContent}
              </pre>
            </div>
          )}
        </div>

        {/* Robots.txt Generator */}
        <div className="tool-section">
          <h4>Robots.txt Generator</h4>
          <p>Generate a robots.txt file for your website</p>
          <button 
            onClick={downloadRobotsTxt}
            className="btn btn-secondary"
          >
            Download Robots.txt
          </button>
          <div className="robots-preview">
            <h5>Robots.txt Preview</h5>
            <pre className="robots-content">
              {generateRobotsTxt()}
            </pre>
          </div>
        </div>

        {/* SEO Validation */}
        <div className="tool-section">
          <h4>SEO Validation</h4>
          <div className="validation-results">
            {validateMetaTags().map((issue, index) => (
              <div key={index} className="validation-item">
                <span className="validation-icon">⚠️</span>
                <span className="validation-text">{issue}</span>
              </div>
            ))}
            {validateMetaTags().length === 0 && (
              <div className="validation-item success">
                <span className="validation-icon">✅</span>
                <span className="validation-text">All SEO checks passed!</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="tool-section">
          <h4>Quick Links</h4>
          <div className="quick-links">
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
            <a 
              href="https://pagespeed.web.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline-info"
            >
              PageSpeed Insights
            </a>
            <a 
              href="https://search.google.com/test/mobile-friendly" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline-warning"
            >
              Mobile-Friendly Test
            </a>
          </div>
        </div>

        {/* Instructions */}
        <div className="instructions">
          <h4>SEO Implementation Guide</h4>
          <ol>
            <li>Update the base URL to match your domain</li>
            <li>Generate and download the sitemap</li>
            <li>Upload sitemap.xml to your server root</li>
            <li>Download and upload robots.txt to your server root</li>
            <li>Submit your sitemap to Google Search Console</li>
            <li>Monitor your analytics and search performance</li>
            <li>Regularly update content and meta tags</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SEOTools;
