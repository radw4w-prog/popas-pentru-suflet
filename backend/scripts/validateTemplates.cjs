require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const https = require('https');

const TEMPLATES_PATH = path.join(__dirname, '..', 'data', 'templates.json');
const BATCH_SIZE = 10; // Câte verificăm simultan
const TIMEOUT = 8000; // 8 secunde timeout per request

function checkUrl(url) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(false);
    }, TIMEOUT);

    try {
      const req = https.get(url, { timeout: TIMEOUT }, (res) => {
        clearTimeout(timer);
        // 200 = OK, 301/302 = redirect (tot OK pentru Unsplash)
        resolve(res.statusCode >= 200 && res.statusCode < 400);
        res.destroy(); // Nu citim body-ul
      });

      req.on('error', () => {
        clearTimeout(timer);
        resolve(false);
      });

      req.on('timeout', () => {
        clearTimeout(timer);
        req.destroy();
        resolve(false);
      });
    } catch (e) {
      clearTimeout(timer);
      resolve(false);
    }
  });
}

async function processBatch(templates, startIdx) {
  const batch = templates.slice(startIdx, startIdx + BATCH_SIZE);
  const results = await Promise.all(
    batch.map(async (t) => {
      const valid = await checkUrl(t.thumbnail);
      return { template: t, valid };
    })
  );
  return results;
}

async function run() {
  console.log('='.repeat(60));
  console.log('🔍 VALIDARE TEMPLATE-URI');
  console.log('='.repeat(60));

  // Citește fișierul
  if (!fs.existsSync(TEMPLATES_PATH)) {
    console.error('❌ templates.json nu există!');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(TEMPLATES_PATH, 'utf8'));
  const templates = data.templates || [];

  console.log(`\n📊 Total template-uri de verificat: ${templates.length}`);
  console.log(`   Batch size: ${BATCH_SIZE}`);
  console.log(`   Timeout: ${TIMEOUT}ms`);
  console.log(`   Estimare timp: ~${Math.ceil(templates.length / BATCH_SIZE) * 2} secunde\n`);

  const valide = [];
  const invalide = [];
  let processed = 0;

  for (let i = 0; i < templates.length; i += BATCH_SIZE) {
    const results = await processBatch(templates, i);

    for (const { template, valid } of results) {
      processed++;

      if (valid) {
        valide.push(template);
        process.stdout.write(`\r   ✅ ${processed}/${templates.length} verificate | ${valide.length} valide | ${invalide.length} invalide`);
      } else {
        invalide.push(template);
        process.stdout.write(`\r   ❌ ${processed}/${templates.length} verificate | ${valide.length} valide | ${invalide.length} invalide`);
      }
    }

    // Pauză mică între batch-uri
    if (i + BATCH_SIZE < templates.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log('\n');

  // Statistici per categorie
  console.log('📊 Rezultate per categorie:');
  const perCategorie = {};
  const perCategorieInvalide = {};

  valide.forEach(t => {
    perCategorie[t.categorie] = (perCategorie[t.categorie] || 0) + 1;
  });

  invalide.forEach(t => {
    perCategorieInvalide[t.categorie] = (perCategorieInvalide[t.categorie] || 0) + 1;
  });

  const toateCateg = [...new Set([
    ...Object.keys(perCategorie),
    ...Object.keys(perCategorieInvalide)
  ])].sort();

  toateCateg.forEach(cat => {
    const v = perCategorie[cat] || 0;
    const inv = perCategorieInvalide[cat] || 0;
    const bar = '█'.repeat(Math.min(v, 30));
    console.log(`   ${cat.padEnd(15)} ✅ ${String(v).padStart(3)} | ❌ ${String(inv).padStart(2)} | ${bar}`);
  });

  // Afișează template-urile invalide
  if (invalide.length > 0) {
    console.log(`\n❌ Template-uri invalide (${invalide.length}):`);
    invalide.forEach(t => {
      console.log(`   - ${t.id} | ${t.name} | ${t.categorie}`);
    });
  }

  // Salvează doar cele valide
  const outputData = {
    versiune: data.versiune || '3.0',
    total: valide.length,
    format: data.format || 'vertical 1080x1350',
    categorii: [...new Set(valide.map(t => t.categorie))].sort(),
    validat: new Date().toISOString(),
    templates: valide
  };

  // Backup original
  const backupPath = path.join(__dirname, '..', 'data', 'templates_backup.json');
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n💾 Backup salvat: templates_backup.json`);

  // Salvează fișierul curat
  fs.writeFileSync(TEMPLATES_PATH, JSON.stringify(outputData, null, 2), 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log('✅ VALIDARE COMPLETĂ!');
  console.log('='.repeat(60));
  console.log(`   Total verificate:  ${templates.length}`);
  console.log(`   ✅ Valide:         ${valide.length}`);
  console.log(`   ❌ Invalide:       ${invalide.length}`);
  console.log(`   📊 Categorii:      ${outputData.categorii.length}`);
  console.log(`   💾 Salvat în:      templates.json`);
  console.log('='.repeat(60));
}

run().catch(err => {
  console.error('❌ Eroare:', err.message);
  process.exit(1);
});