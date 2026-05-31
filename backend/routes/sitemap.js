// backend/routes/sitemap.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const baseUrl = 'https://popas-pentru-suflet.vercel.app';
  const azi = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>${baseUrl}/landing</loc>
    <lastmod>${azi}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>${baseUrl}/dashboard</loc>
    <lastmod>${azi}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/devotional</loc>
    <lastmod>${azi}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/biblia</loc>
    <lastmod>${azi}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/audio</loc>
    <lastmod>${azi}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${baseUrl}/reading</loc>
    <lastmod>${azi}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>${baseUrl}/generate</loc>
    <lastmod>${azi}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>${baseUrl}/rugaciuni</loc>
    <lastmod>${azi}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(xml);
});

module.exports = router;
