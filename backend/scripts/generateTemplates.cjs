const fs = require('fs');
const path = require('path');
const https = require('https');

// ═══════════════════════════════════════
// URL-URI UNSPLASH VERIFICATE
// Fiecare ID apare într-o SINGURĂ categorie
// Dacă un ID apare în mai multe categorii,
// scriptul îl păstrează DOAR în prima
// ═══════════════════════════════════════

const PHOTOS = {
  apus: [
    '1506905925346-21bda4d32df4',
    '1495616811223-4d98c6e9c869',
    '1503803548695-c2a7b4a5b875',
    '1500382017468-9049fed747ef',
    '1509316975850-ff9c5deb0cd9',
    '1414609245224-afa02bfb3fda',
    '1507400492013-162706c8c05e',
    '1484291470158-b8f8d608850d',
    '1494548162494-384bba4ab999',
    '1504701954957-2010ec3bcec1',
    '1505765050516-f72dcac9c60e',
    '1493246507139-91e8fad9978e',
    '1501179691627-eeaa65ea017c',
  ],
  rasarit: [
    '1470252649378-9c29740c9fa8',
    '1504608524841-42fe6f032b4b',
    '1500534314209-a25ddb2bd429',
    '1465146344425-f00d5f5c8f07',
    '1513151233558-d860c5398176',
    '1504192010706-dd7f569ee2be',
    '1469474968028-56623f02e42e',
    '1511300636408-a63a89df3482',
    '1490049350474-498de43bc885',
  ],
  cer: [
    '1517483000871-1dbf64a6e1c6',
    '1534088568595-a066f410bcda',
    '1504386106331-3e4e71712b38',
    '1501630834273-4b5604d2ee31',
    '1499346030926-9a72daac6c63',
  ],
  nori: [
    '1536514498073-50e69d39c6cf',
    '1534274988757-a28bf1a57c17',
    '1500740516770-92bd004b996e',
    '1517301539687-79e1d6812883',
    '1513002749550-c59d8dc58b75',
    '1498466233392-17a5cf8fca17',
    '1530908295418-a12e326966ba',
  ],
  stele: [
    '1419242902214-272b3f66ee7a',
    '1462331940025-496dfbfc7564',
    '1506318137071-a8e063b4bec0',
    '1444703686981-a3abbc4d4fe3',
    '1531366936337-7c912a4589a7',
  ],
  luna: [
    '1532693322450-2cb5c511067d',
    '1522030299830-16b8d3d049fe',
    '1508739773434-b26b3484dffb',
    '1509137089247-f8872fba2709',
  ],
  munte: [
    '1464822759023-fed622ff2c3b',
    '1519681393784-d120267933ba',
    '1454496522488-7a8e488e8606',
    '1486870591958-9b9d0d1dda99',
    '1483728642387-6c3bdd6c93e5',
    '1501785888041-af3ef285b470',
    '1439853949127-fa647821eba0',
    '1470071459604-3b5ec3a7fe05',
    '1433086966358-54859d0ed716',
    '1458668383970-12cce0d0b078',
    '1445023086979-26d5fba7caff',
    '1473181488821-2d23949a045a',
  ],
  padure: [
    '1448375240586-882707db888b',
    '1542273917363-3b1817f69a2d',
    '1511497584788-876760111969',
    '1473448912268-2022ce9509d8',
    '1476231682828-37e571bc172f',
    '1441974231531-c6227db76b6e',
    '1518531933037-91b2f5f229cc',
    '1502082553048-f009c37129b9',
    '1473773508845-188df298d2d1',
    '1477346611705-65d1883cee1e',
  ],
  mare: [
    '1505118380757-91f5f5632de0',
    '1505142468610-359e7d316be0',
    '1507525428034-b723cf961d3e',
    '1468581264429-2548ef9eb732',
    '1520116468816-95b69f847357',
    '1518837695005-2083093ee35b',
    '1510414842594-a61c69b5ae57',
    '1471922694854-ff1b63b20054',
    '1480926965749-91b57eb2b7ab',
  ],
  lac: [
    '1500534314209-a25ddb2bd429',
    '1465146344425-f00d5f5c8f07',
    '1437622368342-7a0d73b3e3f5',
    '1501785888041-af3ef285b470',
    '1439853949127-fa647821eba0',
    '1516132006923-6cf348e5dee9',
  ],
  cascada: [
    '1431794062232-2a99a5431c6c',
    '1432405972618-c60b0225b8f9',
    '1494472155656-f34e81b17ddc',
    '1467139701409-4f3e41e2d98a',
    '1446080501695-8e929f879f2b',
  ],
  rau: [
    '1470071459604-3b5ec3a7fe05',
    '1433086966358-54859d0ed716',
    '1536940385103-c729049165e6',
    '1504537913278-fd5d7fba9fcf',
    '1523712999610-f77fbcfc3843',
  ],
  flori: [
    '1468327768560-75b778cbb551',
    '1455659817273-f96807779a8a',
    '1444021465936-c6ca81d39b84',
    '1522383225653-ed111181a951',
    '1469521669194-babb45599def',
    '1487530811176-3780de880c2d',
    '1457089328109-e5d9bd499191',
    '1490750967868-88df5691cc5e',
    '1462275646964-a0e3c11f18a6',
    '1526397751294-331021109fbd',
  ],
  natura: [
    '1500382017468-9049fed747ef',
    '1506744038136-46273834b3fb',
    '1507003211169-0a1dd7228f2d',
    '1426604966848-d7adac402bff',
    '1446329813274-35862012f472',
    '1472214103451-9374bd1c798e',
    '1500829243541-74b677fecc30',
    '1510784722466-f2aa9c52fff6',
    '1475113548554-5a36f1f523d6',
  ],
  dimineata: [
    '1470252649378-9c29740c9fa8',
    '1504608524841-42fe6f032b4b',
    '1465146344425-f00d5f5c8f07',
    '1513151233558-d860c5398176',
    '1504192010706-dd7f569ee2be',
    '1469474968028-56623f02e42e',
    '1500534314209-a25ddb2bd429',
  ],
  ceata: [
    '1485236715568-ddc5ee6ca227',
    '1511497584788-876760111969',
    '1473773508845-188df298d2d1',
    '1448375240586-882707db888b',
    '1513836279160-30b0c7e8e0e1',
    '1516557070061-c3d1653fa646',
  ],
  lumina: [
    '1476231682828-37e571bc172f',
    '1499346030926-9a72daac6c63',
    '1501630834273-4b5604d2ee31',
    '1465056836900-8f1e940b3925',
    '1490750967868-88df5691cc5e',
    '1508615070457-7baeba4003ab',
    '1495616811223-4d98c6e9c869',
  ],
  spiritual: [
    '1445445290350-18a3b86e0b5a',
    '1474649107449-ea4f014b7e9f',
    '1585421514738-01798e348b17',
    '1507036066871-b7e8032b3dea',
    '1492176273113-2d51f47b23b0',
    '1504052434569-70ad5836ab65',
    '1516728778615-2d590ea1855e',
    '1529070538774-1360e8dfa9c7',
  ],
  biserica: [
    '1438032005730-c779502df39b',
    '1490644658840-3f2e3f8c5625',
    '1474649107449-ea4f014b7e9f',
    '1445445290350-18a3b86e0b5a',
    '1585421514738-01798e348b17',
  ],
  minimalist: [
    '1557682250-33bd709cbe85',
    '1558591710-4b4a1ae0f04d',
    '1579546929518-9e396f3cc809',
    '1517999144091-3d9dca6d1e43',
    '1553356084-58ef4a67b2a7',
    '1519638399535-1b036603ac77',
    '1550684376-efcbd6e3f031',
    '1528459801416-a9e53bbf4e17',
  ],
  iarna: [
    '1491002052546-bf38f186af56',
    '1483921020237-2ff51e8e4b22',
    '1457269449834-928af64c684d',
    '1418985991508-e47386d96a71',
    '1519681393784-d120267933ba',
    '1478719170132-87ba73b5e59a',
    '1482003297000-b7663a1673f5',
    '1516483638261-6c1507f39e32',
  ],
  toamna: [
    '1506744038136-46273834b3fb',
    '1507003211169-0a1dd7228f2d',
    '1477346611705-65d1883cee1e',
    '1473773508845-188df298d2d1',
    '1502082553048-f009c37129b9',
    '1476231682828-37e571bc172f',
    '1448375240586-882707db888b',
    '1508193638397-1c4234db14d8',
    '1476610182048-b716b8515aaa',
    '1509408488850-55ec0fba5e28',
  ],
  primavara: [
    '1522383225653-ed111181a951',
    '1444021465936-c6ca81d39b84',
    '1468327768560-75b778cbb551',
    '1455659817273-f96807779a8a',
    '1469521669194-babb45599def',
    '1441974231531-c6227db76b6e',
    '1490750967868-88df5691cc5e',
    '1462275646964-a0e3c11f18a6',
  ],
  vara: [
    '1500382017468-9049fed747ef',
    '1518531933037-91b2f5f229cc',
    '1502082553048-f009c37129b9',
    '1473773508845-188df298d2d1',
    '1476231682828-37e571bc172f',
    '1507525428034-b723cf961d3e',
    '1505118380757-91f5f5632de0',
  ],
};

const NUME_CAT = {
  apus:'Apus',rasarit:'Răsărit',cer:'Cer',nori:'Nori',
  stele:'Stele',luna:'Lună',munte:'Munte',padure:'Pădure',
  mare:'Mare',lac:'Lac',cascada:'Cascadă',rau:'Râu',
  flori:'Flori',natura:'Natură',dimineata:'Dimineață',
  ceata:'Ceață',lumina:'Lumină',spiritual:'Spiritual',
  biserica:'Biserică',minimalist:'Minimalist',iarna:'Iarnă',
  toamna:'Toamnă',primavara:'Primăvară',vara:'Vară'
};

// ═══════════════════════════════════════
// DETECTOR DUPLICATE ÎNTRE CATEGORII
// ═══════════════════════════════════════
function detectDuplicates() {
  const idMap = new Map(); // photoId → [categorie1, categorie2, ...]
  let hasDuplicates = false;

  for (const [cat, ids] of Object.entries(PHOTOS)) {
    for (const id of ids) {
      if (idMap.has(id)) {
        idMap.get(id).push(cat);
      } else {
        idMap.set(id, [cat]);
      }
    }
  }

  console.log('\n🔍 Verificare duplicate între categorii...');

  const duplicates = [];
  for (const [id, cats] of idMap.entries()) {
    if (cats.length > 1) {
      duplicates.push({ id, categorii: cats });
      hasDuplicates = true;
    }
  }

  if (hasDuplicates) {
    console.log(`   ⚠️  ${duplicates.length} ID-uri duplicate găsite:`);
    duplicates.forEach(d => {
      console.log(`   - ${d.id}`);
      console.log(`     apare în: ${d.categorii.map(c => NUME_CAT[c]).join(', ')}`);
      console.log(`     → păstrat doar în: ${NUME_CAT[d.categorii[0]]}`);
    });
  } else {
    console.log('   ✅ Nicio duplicare! Toate ID-urile sunt unice per categorie.');
  }

  return { idMap, duplicates };
}

// ═══════════════════════════════════════
// VERIFICARE URL
// ═══════════════════════════════════════
function checkUrl(url) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), 10000);
    try {
      const req = https.get(url, { timeout: 10000 }, (res) => {
        clearTimeout(timer);
        resolve(res.statusCode >= 200 && res.statusCode < 400);
        res.destroy();
      });
      req.on('error', () => { clearTimeout(timer); resolve(false); });
      req.on('timeout', () => { clearTimeout(timer); req.destroy(); resolve(false); });
    } catch (e) {
      clearTimeout(timer);
      resolve(false);
    }
  });
}

// ═══════════════════════════════════════
// MAIN
// ═══════════════════════════════════════
async function run() {
  console.log('='.repeat(60));
  console.log('🖼️  GENERARE + VALIDARE TEMPLATE-URI');
  console.log('='.repeat(60));

  // 1. Detectează duplicate
  const { duplicates } = detectDuplicates();

  // 2. Generează candidați (fără duplicate — prima apariție câștigă)
  const usedIds = new Set();
  const candidates = [];
  let idx = 1;

  for (const [cat, ids] of Object.entries(PHOTOS)) {
    let catIndex = 1;
    for (const photoId of ids) {
      if (usedIds.has(photoId)) {
        continue; // Skip — deja folosit în altă categorie
      }
      usedIds.add(photoId);

      candidates.push({
        id: `t${String(idx).padStart(4, '0')}`,
        name: `${NUME_CAT[cat]} ${catIndex}`,
        photoId,
        url: `https://images.unsplash.com/photo-${photoId}?w=1080&h=1350&fit=crop&q=80`,
        thumbnail: `https://images.unsplash.com/photo-${photoId}?w=400&h=500&fit=crop&q=60`,
        categorie: cat
      });
      idx++;
      catIndex++;
    }
  }

  console.log(`\n📊 Candidați unici: ${candidates.length}`);

  // 3. Statistici pre-validare
  const preCat = {};
  candidates.forEach(c => {
    preCat[c.categorie] = (preCat[c.categorie] || 0) + 1;
  });
  console.log('\n📋 Per categorie (pre-validare):');
  Object.entries(preCat).forEach(([c, n]) => {
    console.log(`   ${(NUME_CAT[c] || c).padEnd(15)} ${n}`);
  });

  // 4. Validare URL-uri
  console.log('\n🔍 Validare URL-uri...\n');

  const valide = [];
  const invalide = [];
  const BATCH = 5;

  for (let i = 0; i < candidates.length; i += BATCH) {
    const batch = candidates.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(async (t) => {
        const ok = await checkUrl(t.thumbnail);
        return { template: t, valid: ok };
      })
    );

    for (const { template, valid } of results) {
      if (valid) {
        valide.push(template);
      } else {
        invalide.push(template);
      }
      process.stdout.write(
        `\r   ✅ ${valide.length} valide | ❌ ${invalide.length} invalide | ${valide.length + invalide.length}/${candidates.length}`
      );
    }

    if (i + BATCH < candidates.length) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  console.log('\n');

  // 5. Statistici post-validare
  console.log('📊 Per categorie (post-validare):');
  const postCat = {};
  valide.forEach(t => { postCat[t.categorie] = (postCat[t.categorie] || 0) + 1; });

  const emptyCats = [];
  Object.keys(PHOTOS).forEach(cat => {
    const count = postCat[cat] || 0;
    const bar = '█'.repeat(Math.min(count, 20));
    console.log(`   ${(NUME_CAT[cat] || cat).padEnd(15)} ${String(count).padStart(3)} ${bar}`);
    if (count === 0) emptyCats.push(cat);
  });

  if (emptyCats.length > 0) {
    console.log(`\n   ⚠️  Categorii goale: ${emptyCats.map(c => NUME_CAT[c]).join(', ')}`);
  }

  // 6. Afișează invalide
  if (invalide.length > 0) {
    console.log(`\n❌ Invalide (${invalide.length}):`);
    invalide.forEach(t => {
      console.log(`   - ${t.photoId} (${NUME_CAT[t.categorie]})`);
    });
  }

  // 7. Salvare
  const output = {
    versiune: '4.0',
    total: valide.length,
    format: 'vertical 1080x1350',
    categorii: [...new Set(valide.map(t => t.categorie))].sort(),
    validat: new Date().toISOString(),
    duplicateDetectate: duplicates.length,
    templates: valide.map(t => ({
      id: t.id,
      name: t.name,
      url: t.url,
      thumbnail: t.thumbnail,
      categorie: t.categorie
    }))
  };

  // Backup
  const backupPath = path.join(__dirname, '..', 'data', 'templates_backup.json');
  const currentPath = path.join(__dirname, '..', 'data', 'templates.json');

  if (fs.existsSync(currentPath)) {
    fs.copyFileSync(currentPath, backupPath);
    console.log(`\n💾 Backup: templates_backup.json`);
  }

  fs.writeFileSync(currentPath, JSON.stringify(output, null, 2), 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log('✅ GENERARE COMPLETĂ!');
  console.log('='.repeat(60));
  console.log(`   Total candidați:     ${candidates.length}`);
  console.log(`   ✅ Valide:           ${valide.length}`);
  console.log(`   ❌ Invalide:         ${invalide.length}`);
  console.log(`   ⚠️  Duplicate skip:  ${duplicates.length}`);
  console.log(`   📊 Categorii:        ${output.categorii.length}`);
  console.log(`   💾 Salvat:           templates.json`);
  console.log('='.repeat(60));
}

run().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});