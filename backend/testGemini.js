// E:\popas-pentru-suflet\backend\testGemini.js
require('dotenv').config();
const axios = require('axios');

const apiKey = process.env.GEMINI_API_KEY;

console.log('\n=== DIAGNOSTIC GEMINI ===\n');
console.log('API Key există:', !!apiKey);
console.log('API Key lungime:', apiKey?.length);
console.log('API Key preview:', apiKey?.substring(0, 20) + '...');
console.log('Starts with AIza:', apiKey?.startsWith('AIza'));
console.log('');

// Verifică caractere invizibile
if (apiKey) {
  console.log('Char codes primele 5:', [...apiKey.substring(0,5)].map(c => c.charCodeAt(0)));
  console.log('Are spații:', apiKey.includes(' '));
  console.log('Are newline:', apiKey.includes('\n'));
  console.log('Are quotes:', apiKey.includes('"') || apiKey.includes("'"));
}

async function testModel(model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey?.trim()}`;
  
  try {
    const r = await axios.post(url, {
      contents: [{ parts: [{ text: 'Spune Salut!' }] }],
      generationConfig: { maxOutputTokens: 50 }
    }, { timeout: 30000 });
    
    const text = r.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log(`✅ ${model}: "${text?.substring(0, 50)}"`);
    return true;
  } catch(e) {
    const status = e.response?.status;
    const msg = e.response?.data?.error?.message || e.message;
    const details = JSON.stringify(e.response?.data?.error || {});
    console.log(`❌ ${model}: [${status}] ${msg}`);
    console.log(`   Details: ${details}`);
    return false;
  }
}

async function run() {
  const models = [
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash-001',
    'gemma-3-12b-it',
    'gemma-3-4b-it',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];
  
  console.log('=== TEST MODELE ===\n');
  for (const model of models) {
    await testModel(model);
    await new Promise(r => setTimeout(r, 1500));
  }
  
  console.log('\n=== DONE ===\n');
}

run();