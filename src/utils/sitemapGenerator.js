// Sitemap generator utility
export const generateSitemap = (recipes = [], baseUrl = 'https://zorbaskitchen.com') => {
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/submit-recipe', priority: '0.8', changefreq: 'weekly' },
  ];

  const recipePages = recipes.map(recipe => ({
    url: `/result-item/${recipe._id}`,
    priority: '0.9',
    changefreq: 'monthly',
    lastmod: recipe.updatedAt || recipe.createdAt
  }));

  const allPages = [...staticPages, ...recipePages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod ? new Date(page.lastmod).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

// Function to download sitemap
export const downloadSitemap = (sitemapContent, filename = 'sitemap.xml') => {
  const blob = new Blob([sitemapContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
