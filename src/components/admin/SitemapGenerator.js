import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { generateSitemap, downloadSitemap } from '../../utils/sitemapGenerator';
import { API_CONFIG } from '../../config';

const SitemapGenerator = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sitemapContent, setSitemapContent] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://yourdomain.com');

  useEffect(() => {
    fetchRecipes();
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

  const generateSitemapContent = () => {
    const content = generateSitemap(recipes, baseUrl);
    setSitemapContent(content);
  };

  const handleDownload = () => {
    if (sitemapContent) {
      downloadSitemap(sitemapContent);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sitemapContent);
    alert('Sitemap content copied to clipboard!');
  };

  return (
    <div className="sitemap-generator-container">
      <Helmet>
        <title>Sitemap Generator | Zorbas' Kitchen</title>
        <meta name="description" content="Generate and manage sitemap for SEO" />
      </Helmet>

      <div className="container">
        <h2>Sitemap Generator</h2>
        <p className="subtitle">Generate XML sitemap for better SEO indexing</p>

        <div className="form-group">
          <label htmlFor="baseUrl">Base URL:</label>
          <input
            type="url"
            id="baseUrl"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="form-control"
            placeholder="https://yourdomain.com"
          />
        </div>

        <div className="stats-section">
          <h4>Current Statistics</h4>
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
            <h4>Sitemap Preview</h4>
            <pre className="sitemap-content">
              {sitemapContent}
            </pre>
          </div>
        )}

        <div className="instructions">
          <h4>Instructions</h4>
          <ol>
            <li>Update the base URL to match your domain</li>
            <li>Click "Generate Sitemap" to create the XML content</li>
            <li>Download the sitemap and upload it to your server root</li>
            <li>Update your robots.txt to include the sitemap URL</li>
            <li>Submit the sitemap to Google Search Console</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SitemapGenerator;
