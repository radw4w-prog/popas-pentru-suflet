// backend/middleware/sanitize.js
// Sanitizare input — previne XSS și MongoDB injection

const mongoSanitize = require('express-mongo-sanitize');

// ── Sanitizare MongoDB injection ──────────────────────────────
// Elimină caractere $ și . din input care ar putea modifica queries
const sanitizeMongo = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️ MongoDB injection attempt pe câmpul: ${key} de la ${req.ip}`);
  }
});

// ── Sanitizare XSS manuală ────────────────────────────────────
// Elimină taguri HTML periculoase din string-uri
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

function sanitizeObject(obj, depth = 0) {
  if (depth > 5) return obj; // previne recursie infinită
  if (typeof obj === 'string') return escapeHtml(obj);
  if (Array.isArray(obj)) return obj.map(item => sanitizeObject(item, depth + 1));
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const key of Object.keys(obj)) {
      // Nu sanitiza câmpuri care conțin date binare (base64)
      if (key === 'imageBase64' || key === 'videoBase64' || key === 'image') {
        sanitized[key] = obj[key];
      } else {
        sanitized[key] = sanitizeObject(obj[key], depth + 1);
      }
    }
    return sanitized;
  }
  return obj;
}

const sanitizeXss = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};

module.exports = { sanitizeMongo, sanitizeXss };
