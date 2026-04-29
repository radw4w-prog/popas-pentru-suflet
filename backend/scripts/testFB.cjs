require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const http = axios.create({ httpsAgent, timeout: 60000 });

const TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;

console.log('Token (20 chars):', TOKEN?.substring(0, 20) + '...');
console.log('Page ID:', PAGE_ID);
console.log();

async function test() {
  // TEST 1 - Text simplu
  console.log('═══ TEST 1: Text simplu ═══');
  try {
    const r = await http.post(
      `https://graph.facebook.com/v18.0/${PAGE_ID}/feed`,
      null,
      {
        params: {
          message: 'Test TEXT din Node.js - Popas pentru Suflet 🕊️\n\n#Test',
          access_token: TOKEN
        }
      }
    );
    console.log('✅ Text OK! Post ID:', r.data.id);
  } catch (e) {
    console.error('❌ Text FAIL:', e.response?.data?.error?.message || e.message);
  }

  console.log();

  // TEST 2 - Imagine URL cu caption
  console.log('═══ TEST 2: Imagine URL + caption ═══');
  try {
    const r = await http.post(
      `https://graph.facebook.com/v18.0/${PAGE_ID}/photos`,
      null,
      {
        params: {
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
          message: 'Test IMAGINE din Node.js - Popas pentru Suflet 🕊️\n\n#Test',
          access_token: TOKEN
        }
      }
    );
    console.log('✅ Imagine URL OK! Post ID:', r.data.id);
  } catch (e) {
    console.error('❌ Imagine URL FAIL:', e.response?.data?.error?.message || e.message);
    console.error('   Cod:', e.response?.data?.error?.code);
  }

  console.log();

  // TEST 3 - Descarca imagine si upload local
  console.log('═══ TEST 3: Download + Upload local ═══');
  try {
    // Descarca
    const imgUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80';
    console.log('   Descarcare imagine...');
    
    const imgResp = await http.get(imgUrl, { responseType: 'arraybuffer' });
    const tempFile = path.join(__dirname, 'test_image.jpg');
    fs.writeFileSync(tempFile, imgResp.data);
    console.log('   Salvat:', (imgResp.data.length / 1024).toFixed(0), 'KB');

    // Upload cu FormData
    const formData = new FormData();
    formData.append('source', fs.createReadStream(tempFile));
    formData.append('message', 'Test UPLOAD LOCAL din Node.js - Popas pentru Suflet 🕊️\n\n#Test');
    formData.append('access_token', TOKEN);

    const r = await http.post(
      `https://graph.facebook.com/v18.0/${PAGE_ID}/photos`,
      formData,
      {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    console.log('✅ Upload local OK! Post ID:', r.data.id);
    
    // Sterge temp
    fs.unlinkSync(tempFile);

  } catch (e) {
    console.error('❌ Upload local FAIL:', e.response?.data?.error?.message || e.message);
    console.error('   Cod:', e.response?.data?.error?.code);
    console.error('   Full error:', JSON.stringify(e.response?.data, null, 2));
  }
}

test();