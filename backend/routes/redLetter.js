// backend/routes/redLetter.js
//
// Expune lista versetelor in care vorbeste Domnul Isus (red-letter), din cele 4 Evanghelii.
// Sursa: World English Bible (marcaje \wj, words of Jesus), domeniu public.
//
// Endpoints:
//   GET /api/red-letter                         -> tot setul { "Carte": { capitol: [versete] } }
//   GET /api/red-letter?carte=Ioan&capitol=3    -> { carte, capitol, versete: [3,5,6,...] }

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

let RED_LETTER = {};
try {
  const dataPath = path.join(__dirname, '..', 'data', 'redLetter.json');
  RED_LETTER = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
} catch (err) {
  console.error('redLetter.json nu a putut fi incarcat:', err.message);
}

router.get('/', (req, res) => {
  const { carte, capitol } = req.query;

  if (carte && capitol) {
    const book = RED_LETTER[carte];
    const versete = (book && (book[capitol] || book[String(capitol)])) || [];
    return res.json({ success: true, carte, capitol: parseInt(capitol, 10), versete });
  }

  if (carte) {
    const book = RED_LETTER[carte] || {};
    return res.json({ success: true, carte, capitole: book });
  }

  return res.json({ success: true, data: RED_LETTER });
});

module.exports = router;
