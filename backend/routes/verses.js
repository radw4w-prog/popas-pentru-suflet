const express = require('express');
const router = express.Router();
const Verse = require('../models/Verse');

// ═══ HELPER - parsează referință biblică ═══
function parseReference(search) {
  const s = search.trim();
  const pattern = /^([\u00C0-\u024F\w\s]+?)\s+(\d+)(?::(\d+))?$/i;
  const match = s.match(pattern);

  if (match) {
    return {
      carte: match[1].trim(),
      capitol: parseInt(match[2]),
      verset: match[3] ? parseInt(match[3]) : null,
      isReference: true
    };
  }
  return { isReference: false };
}

// ═══════════════════════════════════════
// GET /api/verses/statistici
// ═══════════════════════════════════════
router.get('/statistici', async (req, res) => {
  try {
    const [total, vt, nt, carti] = await Promise.all([
      Verse.countDocuments(),
      Verse.countDocuments({ testament: 'VT' }),
      Verse.countDocuments({ testament: 'NT' }),
      Verse.distinct('carte')
    ]);
    res.json({
      totalVersete: total,
      testamentVechi: vt,
      testamentNou: nt,
      totalCarti: carti.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════
// GET /api/verses/versetul-zilei
// Versete curate de încurajare, se schimbă la 30 min
// ═══════════════════════════════════════
router.get('/versetul-zilei', async (req, res) => {
  try {
    const VERSETE_ZIDIRE = [
      { carte: 'Psalmii', capitol: 23, verset: 1, tema: 'pace' },
      { carte: 'Psalmii', capitol: 23, verset: 4, tema: 'ocrotire' },
      { carte: 'Psalmii', capitol: 27, verset: 1, tema: 'curaj' },
      { carte: 'Psalmii', capitol: 34, verset: 8, tema: 'bunătate' },
      { carte: 'Psalmii', capitol: 46, verset: 1, tema: 'ajutor' },
      { carte: 'Psalmii', capitol: 55, verset: 22, tema: 'sprijin' },
      { carte: 'Psalmii', capitol: 91, verset: 1, tema: 'ocrotire' },
      { carte: 'Psalmii', capitol: 91, verset: 2, tema: 'încredere' },
      { carte: 'Psalmii', capitol: 119, verset: 105, tema: 'lumină' },
      { carte: 'Psalmii', capitol: 121, verset: 1, tema: 'ajutor' },
      { carte: 'Psalmii', capitol: 121, verset: 2, tema: 'ajutor' },
      { carte: 'Isaia', capitol: 40, verset: 29, tema: 'putere' },
      { carte: 'Isaia', capitol: 40, verset: 31, tema: 'putere' },
      { carte: 'Isaia', capitol: 41, verset: 10, tema: 'curaj' },
      { carte: 'Isaia', capitol: 43, verset: 2, tema: 'ocrotire' },
      { carte: 'Ieremia', capitol: 29, verset: 11, tema: 'nădejde' },
      { carte: 'Plângerile lui Ieremia', capitol: 3, verset: 22, tema: 'har' },
      { carte: 'Plângerile lui Ieremia', capitol: 3, verset: 23, tema: 'credincioșie' },
      { carte: 'Matei', capitol: 5, verset: 14, tema: 'lumină' },
      { carte: 'Matei', capitol: 6, verset: 33, tema: 'încredere' },
      { carte: 'Matei', capitol: 11, verset: 28, tema: 'odihnă' },
      { carte: 'Matei', capitol: 11, verset: 29, tema: 'odihnă' },
      { carte: 'Ioan', capitol: 3, verset: 16, tema: 'dragoste' },
      { carte: 'Ioan', capitol: 8, verset: 12, tema: 'lumină' },
      { carte: 'Ioan', capitol: 10, verset: 10, tema: 'viață' },
      { carte: 'Ioan', capitol: 14, verset: 1, tema: 'pace' },
      { carte: 'Ioan', capitol: 14, verset: 6, tema: 'adevăr' },
      { carte: 'Ioan', capitol: 14, verset: 27, tema: 'pace' },
      { carte: 'Ioan', capitol: 15, verset: 5, tema: 'rodire' },
      { carte: 'Ioan', capitol: 16, verset: 33, tema: 'biruință' },
      { carte: 'Romani', capitol: 8, verset: 1, tema: 'har' },
      { carte: 'Romani', capitol: 8, verset: 28, tema: 'nădejde' },
      { carte: 'Romani', capitol: 8, verset: 31, tema: 'curaj' },
      { carte: 'Romani', capitol: 8, verset: 38, tema: 'dragoste' },
      { carte: 'Romani', capitol: 8, verset: 39, tema: 'dragoste' },
      { carte: '1 Corinteni', capitol: 10, verset: 13, tema: 'ajutor' },
      { carte: '2 Corinteni', capitol: 5, verset: 7, tema: 'credință' },
      { carte: 'Galateni', capitol: 2, verset: 20, tema: 'credință' },
      { carte: 'Efeseni', capitol: 2, verset: 8, tema: 'har' },
      { carte: 'Efeseni', capitol: 3, verset: 20, tema: 'putere' },
      { carte: 'Filipeni', capitol: 4, verset: 4, tema: 'bucurie' },
      { carte: 'Filipeni', capitol: 4, verset: 6, tema: 'rugăciune' },
      { carte: 'Filipeni', capitol: 4, verset: 7, tema: 'pace' },
      { carte: 'Filipeni', capitol: 4, verset: 13, tema: 'putere' },
      { carte: 'Coloseni', capitol: 3, verset: 15, tema: 'pace' },
      { carte: '2 Tesaloniceni', capitol: 3, verset: 3, tema: 'ocrotire' },
      { carte: '2 Timotei', capitol: 1, verset: 7, tema: 'curaj' },
      { carte: 'Evrei', capitol: 4, verset: 16, tema: 'har' },
      { carte: 'Evrei', capitol: 11, verset: 1, tema: 'credință' },
      { carte: 'Iacov', capitol: 1, verset: 5, tema: 'înțelepciune' },
      { carte: '1 Petru', capitol: 5, verset: 7, tema: 'sprijin' },
      { carte: '1 Ioan', capitol: 4, verset: 7, tema: 'dragoste' },
      { carte: '1 Ioan', capitol: 4, verset: 8, tema: 'dragoste' },
      { carte: 'Apocalipsa', capitol: 21, verset: 4, tema: 'mângâiere' }
    ];

    const now = new Date();
    const seed = Math.floor(now.getTime() / (30 * 60 * 1000));
    const ref = VERSETE_ZIDIRE[seed % VERSETE_ZIDIRE.length];

    const verset = await Verse.findOne({
      carte: ref.carte,
      capitol: ref.capitol,
      verset: ref.verset
    }).lean();

    if (!verset) {
      return res.status(404).json({
        success: false,
        message: 'Versetul selectat nu a fost găsit.'
      });
    }

    res.json({
      success: true,
      verset,
      tema: ref.tema,
      schimbaLa: new Date(
        (Math.floor(now.getTime() / (30 * 60 * 1000)) + 1) * 30 * 60 * 1000
      ).toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ═══════════════════════════════════════
// GET /api/verses/gandul-zilei
// Gândul zilei + Rugăciunea zilei
// ═══════════════════════════════════════
router.get('/gandul-zilei', async (req, res) => {
  try {
    const ganduri = [
      { text: 'Dumnezeu nu te-a adus până aici ca să te lase singur. Fiecare pas al tău este în grija Lui.', tema: 'încredere' },
      { text: 'Nu trebuie să vezi tot drumul ca să faci următorul pas. Mergi cu credință, nu cu vedere.', tema: 'credință' },
      { text: 'Rugăciunea nu schimbă planul lui Dumnezeu, dar ne schimbă pe noi și ne aliniază cu el.', tema: 'rugăciune' },
      { text: 'Dumnezeu lucrează chiar și în tăcerea Lui. Lipsa unui răspuns nu înseamnă lipsa prezenței Sale.', tema: 'răbdare' },
      { text: 'Harul lui Dumnezeu nu vine pentru că meriți, ci pentru că El iubește. Primește-l cu recunoștință.', tema: 'har' },
      { text: 'Azi e o zi nouă. Lasă în urmă ce a fost și privește înainte — Dumnezeu pregătește ceva frumos.', tema: 'nădejde' },
      { text: 'Când simți că nu mai poți, amintește-ți: puterea lui Dumnezeu se desăvârșește în slăbiciune.', tema: 'putere' },
      { text: 'Fii recunoscător pentru lucrurile mici — ele sunt dovada dragostei mari a lui Dumnezeu.', tema: 'recunoștință' },
      { text: 'Dumnezeu nu întârzie niciodată. Timpul Lui este perfect, chiar când al nostru pare că se termină.', tema: 'răbdare' },
      { text: 'Nu ești definit de greșelile tale, ci de harul care te ridică de fiecare dată.', tema: 'har' },
      { text: 'Pacea nu vine din lipsa problemelor, ci din prezența lui Dumnezeu în mijlocul lor.', tema: 'pace' },
      { text: 'Cel mai puternic lucru pe care îl poți face astăzi este să te oprești și să vorbești cu Dumnezeu.', tema: 'rugăciune' },
      { text: 'Dumnezeu nu te judecă după cât de tare ai căzut, ci după cât de sincer te ridici.', tema: 'iertare' },
      { text: 'Fiecare dimineață este un cadou. Folosește-o pentru a mulțumi, a iubi și a sluji.', tema: 'recunoștință' },
      { text: 'Nu lăsa frica de mâine să îți fure bucuria de azi. Dumnezeu este deja acolo.', tema: 'curaj' },
      { text: 'Dragostea lui Dumnezeu nu depinde de performanța ta. El te iubește exact așa cum ești.', tema: 'dragoste' },
      { text: 'Biblia nu este doar o carte de citit, ci o scrisoare de dragoste de trăit.', tema: 'cuvântul' },
      { text: 'Când nu știi ce să faci, stai liniștit și ascultă. Dumnezeu vorbește în liniște.', tema: 'pace' },
      { text: 'Cel mai mare miracol nu este vindecarea trupului, ci transformarea inimii.', tema: 'transformare' },
      { text: 'Nu ești singur în lupta ta. Dumnezeu merge înaintea ta, lângă tine și în urmă.', tema: 'ocrotire' },
      { text: 'Credința nu elimină furtuna, dar îți dă ancora care te ține pe loc.', tema: 'credință' },
      { text: 'Astăzi, alege să fii lumină. Lumea are nevoie de ceea ce Dumnezeu a pus în tine.', tema: 'lumină' },
      { text: 'Iertarea este cel mai greu dar și cel mai eliberator lucru pe care îl poți face.', tema: 'iertare' },
      { text: 'Dumnezeu nu te cere să fii perfect. Te cere să fii sincer și disponibil.', tema: 'sinceritate' }
    ];

    const rugaciuni = [
      { titlu: 'Rugăciune de dimineață', text: 'Doamne, Îți mulțumesc pentru această zi nouă. Ajută-mă să văd binecuvântările Tale în tot ce fac. Dă-mi înțelepciune în decizii, răbdare în încercări și bucurie în lucrurile simple. Fii cu mine în fiecare pas. Amin.', tema: 'dimineață' },
      { titlu: 'Rugăciune pentru pace', text: 'Tată ceresc, dăruiește-mi pacea Ta care întrece orice pricepere. Liniștește gândurile mele, calmează inima mea și ajută-mă să mă odihnesc în brațele Tale. Încredințez Ție toate grijile mele. Amin.', tema: 'pace' },
      { titlu: 'Rugăciune pentru putere', text: 'Doamne, sunt obosit și simt că nu mai pot. Dar știu că puterea Ta se desăvârșește în slăbiciunea mea. Umple-mă cu tăria Ta, ridică-mă din nou și ajută-mă să merg mai departe cu credință. Amin.', tema: 'putere' },
      { titlu: 'Rugăciune de mulțumire', text: 'Doamne, Îți mulțumesc pentru tot ce mi-ai dat. Pentru viață, pentru dragoste, pentru fiecare răsărit. Ajută-mă să nu iau nimic de-a gata și să văd mâna Ta în toate lucrurile. Amin.', tema: 'recunoștință' },
      { titlu: 'Rugăciune pentru familie', text: 'Tată ceresc, ocrotește familia mea. Dă-ne dragoste unii pentru alții, răbdare în neînțelegeri și bucurie în timpul petrecut împreună. Fii centrul casei noastre. Amin.', tema: 'familie' },
      { titlu: 'Rugăciune pentru credință', text: 'Doamne, mărește credința mea. Când mă îndoiesc, adu-mi aminte de credincioșia Ta. Când nu înțeleg, ajută-mă să am încredere. Când cad, ridică-mă cu harul Tău. Amin.', tema: 'credință' },
      { titlu: 'Rugăciune pentru vindecare', text: 'Doamne, Tu ești Doctorul sufletelor și al trupurilor noastre. Ating cu mâna Ta vindecătoare rănile mele, fie ele ale trupului sau ale sufletului. În Numele lui Isus. Amin.', tema: 'vindecare' },
      { titlu: 'Rugăciune pentru călăuzire', text: 'Tată ceresc, arată-mi calea pe care să merg. Luminează-mi pașii și dă-mi înțelepciunea de a alege drumul Tău, nu al meu. Fii Tu GPS-ul vieții mele. Amin.', tema: 'călăuzire' },
      { titlu: 'Rugăciune pentru iertare', text: 'Doamne, iartă-mă pentru tot ce am greșit. Ajută-mă și pe mine să iert pe cei care m-au rănit. Eliberează-mă de povara amintirilor dureroase și umple-mă cu pacea Ta. Amin.', tema: 'iertare' },
      { titlu: 'Rugăciune de seară', text: 'Doamne, Îți mulțumesc pentru ziua de azi. Pentru fiecare moment, pentru fiecare lecție. Iartă-mi greșelile și acoperă-mă cu harul Tău. Veghează asupra mea și a celor dragi în această noapte. Amin.', tema: 'seară' },
      { titlu: 'Rugăciune pentru curaj', text: 'Doamne, dă-mi curajul să fac lucrurile la care mă chemi. Îndepărtează frica din inima mea și înlocuiește-o cu încredere în Tine. Tu ești cu mine — de cine să mă tem? Amin.', tema: 'curaj' },
      { titlu: 'Rugăciune pentru alții', text: 'Doamne, mă rog pentru cei care suferă, pentru cei singuri, pentru cei fără speranță. Atinge-le inimile, dă-le putere și trimite-le oameni care să le fie lumină. Amin.', tema: 'compasiune' }
    ];

    const now = new Date();
    const dayOfYear = Math.floor(
      (now - new Date(now.getFullYear(), 0, 0)) / 86400000
    );

    const gand = ganduri[dayOfYear % ganduri.length];
    const rugaciune = rugaciuni[dayOfYear % rugaciuni.length];

    res.json({
      success: true,
      gand,
      rugaciune
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ═══════════════════════════════════════
// GET /api/verses/red-letter
// Referințe unde Isus vorbește direct
// ═══════════════════════════════════════
router.get('/red-letter', (req, res) => {
  const RED_LETTER = {
    'Matei': {
      3: [15],
      4: [4,7,10,17,19],
      5: Array.from({length:48}, (_,i) => i+3),
      6: Array.from({length:34}, (_,i) => i+1),
      7: Array.from({length:27}, (_,i) => i+1),
      8: [4,7,10,11,12,13,20,22,26,29,32],
      9: [2,4,5,6,9,12,13,15,22,24,28,29,30,37,38],
      10: Array.from({length:42}, (_,i) => i+1),
      11: [4,5,6,7,8,9,10,11,21,22,23,24,25,26,27,28,29,30],
      12: [3,4,5,6,7,8,11,12,25,26,27,28,29,30,31,32,33,34,35,36,39,44,45,48,49,50],
      13: [11,12,13,14,15,16,17,18,19,20,21,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52],
      14: [16,18,27,29,31],
      15: [3,4,5,6,7,8,9,10,11,13,14,16,17,18,19,20,24,26,28,32,33,34],
      16: [2,3,4,6,8,9,10,11,12,13,15,17,18,19,20,23,24,25,26,27,28],
      17: [7,9,11,12,17,20,22,23,25,26,27],
      18: [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,32,33,34,35],
      19: [4,5,6,8,9,11,12,14,17,18,21,23,24,26,28,29,30],
      20: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,18,19,21,22,23,25,26,27,28,32],
      21: [2,3,4,13,16,21,22,24,25,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44],
      22: [2,3,4,5,6,7,8,9,10,11,12,13,14,18,19,20,21,29,30,31,32,37,38,39,40,41,42,43,44,45],
      23: Array.from({length:39}, (_,i) => i+1),
      24: Array.from({length:51}, (_,i) => i+1),
      25: Array.from({length:46}, (_,i) => i+1),
      26: [2,10,11,12,13,15,18,21,23,24,25,26,27,28,29,31,32,34,36,38,39,40,42,44,45,50,52,53,54,55,56,64],
      27: [11,46],
      28: [9,10,18,19,20]
    },
    'Marcu': {
      1: [15,17,25,38,41,44],
      2: [5,8,9,10,11,14,17,19,20,21,22,23,24,25,27,28],
      3: [3,4,5,23,24,25,26,27,28,29,33,34,35],
      4: [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,39,40],
      5: [8,9,19,30,34,36,39,41],
      6: [4,10,11,31,37,38,50],
      7: [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,27,29,34],
      8: [1,2,3,5,12,15,17,18,19,20,21,29,33,34,35,36,37,38],
      9: [1,12,13,14,15,16,17,18,19,21,23,25,29,31,33,35,36,37,39,40,41,42,43,45,47,49,50],
      10: [3,4,5,6,7,8,9,11,12,14,15,18,19,21,23,24,25,27,29,30,31,32,33,34,36,38,39,40,42,43,44,45,47,49,51,52],
      11: [2,3,6,14,15,17,22,23,24,25,26,29,30,33],
      12: [9,10,11,15,16,17,24,25,26,27,29,30,31,34,35,36,37,38,39,40,43,44],
      13: Array.from({length:37}, (_,i) => i+1),
      14: [6,8,13,14,18,20,21,22,24,25,27,28,30,32,34,36,38,41,42,48,62],
      16: [15,16,17,18]
    },
    'Luca': {
      2: [49],
      4: [4,8,12,18,19,21,23,24,25,26,27,35,43],
      5: [4,10,12,13,20,22,23,24,27,31,32,33,34,35,36,37,38,39],
      6: [3,4,5,8,9,10,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49],
      7: [9,13,14,22,23,24,25,26,27,28,31,32,33,34,35,40,41,42,43,44,45,46,47,48,49,50],
      8: [5,6,7,8,10,11,12,13,14,15,16,17,18,21,22,25,30,39,45,46,48,50,52,54],
      9: [3,4,5,13,14,18,19,20,22,23,24,25,26,27,41,44,48,50,54,55,56,57,58,59,60,61,62],
      10: [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,18,19,20,21,22,23,24,26,28,30,31,32,33,34,35,36,37,41,42],
      11: [2,3,4,5,6,7,8,9,10,11,12,13,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52],
      12: Array.from({length:59}, (_,i) => i+1),
      13: [2,3,4,5,6,7,8,9,12,14,15,16,17,18,19,20,21,23,24,25,26,27,28,29,30,32,33,34,35],
      14: [3,4,5,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35],
      15: [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32],
      16: [9,10,11,12,13,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
      17: [1,2,3,4,6,7,8,9,10,14,17,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,37],
      18: [6,7,8,14,16,17,19,22,24,25,27,29,30,31,32,33,34,37,41,42],
      19: [5,9,10,13,17,22,24,26,27,30,31,40,42,43,44,46],
      20: [8,13,15,16,17,18,23,24,25,34,35,36,37,38,41,42,43,44,45,46],
      21: Array.from({length:36}, (_,i) => i+1),
      22: [10,11,15,16,17,18,19,20,21,22,25,26,27,28,29,30,31,32,33,34,35,36,37,40,42,46,48,51,52,67,68,69,70],
      23: [3,28,29,30,31,34,43,46],
      24: [5,17,19,25,26,27,36,38,39,41,44,45,46,47,48,49]
    },
    'Ioan': {
      1: [38,39,42,43,47,50,51],
      2: [4,7,8,16,19],
      3: [3,5,6,7,8,10,11,12,13,14,15,16,17,18],
      4: [7,10,13,14,16,17,21,22,23,24,26,32,34,35,48,50],
      5: [6,8,10,11,14,17,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47],
      6: [5,10,12,20,26,27,29,32,33,34,35,36,37,38,39,40,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,61,63,64,65,67,70],
      7: [6,7,8,16,17,18,19,20,21,23,24,33,34,37,38],
      8: [7,10,11,12,14,15,16,17,18,19,21,23,24,25,26,28,29,31,32,34,35,36,37,38,39,40,42,43,44,45,46,47,49,50,51,54,55,56,58],
      9: [3,4,5,7,35,37,39,41],
      10: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,25,26,27,28,29,30,32,34,36,37,38],
      11: [4,7,9,10,11,14,15,23,25,26,34,39,40,41,42,43,44],
      12: [7,8,23,24,25,26,27,28,30,32,35,36,44,45,46,47,48,49,50],
      13: [7,8,10,11,12,13,14,15,16,17,18,19,20,21,26,27,31,33,34,35,36,37,38],
      14: Array.from({length:31}, (_,i) => i+1),
      15: Array.from({length:27}, (_,i) => i+1),
      16: Array.from({length:33}, (_,i) => i+1),
      17: Array.from({length:26}, (_,i) => i+1),
      18: [4,5,7,8,9,11,20,21,23,32,34,36,37],
      19: [11,26,27,28,30],
      20: [15,16,17,19,21,22,23,26,27,29],
      21: [5,6,10,12,15,16,17,18,19,20,22,23]
    },
    'Apocalipsa': {
      1: [8,11,17,18,19,20],
      2: Array.from({length:29}, (_,i) => i+1),
      3: Array.from({length:22}, (_,i) => i+1),
      21: [3,5,6,7,8],
      22: [7,10,12,13,16,20]
    }
  };

  res.json({
    success: true,
    redLetter: RED_LETTER
  });
});

// ═══════════════════════════════════════
// GET /api/verses/ordine-biblie
// Returnează ordinea canonică a cărților
// ═══════════════════════════════════════
router.get('/ordine-biblie', (req, res) => {
  const ORDINE = [
    { carte: 'Geneza', ab: 'Gen', ordine: 1, test: 'VT' },
    { carte: 'Exodul', ab: 'Ex', ordine: 2, test: 'VT' },
    { carte: 'Leviticul', ab: 'Lev', ordine: 3, test: 'VT' },
    { carte: 'Numeri', ab: 'Num', ordine: 4, test: 'VT' },
    { carte: 'Deuteronomul', ab: 'Deut', ordine: 5, test: 'VT' },
    { carte: 'Iosua', ab: 'Ios', ordine: 6, test: 'VT' },
    { carte: 'Judecători', ab: 'Jud', ordine: 7, test: 'VT' },
    { carte: 'Rut', ab: 'Rut', ordine: 8, test: 'VT' },
    { carte: '1 Samuel', ab: '1Sam', ordine: 9, test: 'VT' },
    { carte: '2 Samuel', ab: '2Sam', ordine: 10, test: 'VT' },
    { carte: '1 Împărați', ab: '1Imp', ordine: 11, test: 'VT' },
    { carte: '2 Împărați', ab: '2Imp', ordine: 12, test: 'VT' },
    { carte: '1 Cronici', ab: '1Cron', ordine: 13, test: 'VT' },
    { carte: '2 Cronici', ab: '2Cron', ordine: 14, test: 'VT' },
    { carte: 'Ezra', ab: 'Ezra', ordine: 15, test: 'VT' },
    { carte: 'Neemia', ab: 'Neem', ordine: 16, test: 'VT' },
    { carte: 'Estera', ab: 'Est', ordine: 17, test: 'VT' },
    { carte: 'Iov', ab: 'Iov', ordine: 18, test: 'VT' },
    { carte: 'Psalmii', ab: 'Ps', ordine: 19, test: 'VT' },
    { carte: 'Proverbe', ab: 'Prov', ordine: 20, test: 'VT' },
    { carte: 'Eclesiastul', ab: 'Ecl', ordine: 21, test: 'VT' },
    { carte: 'Cântarea Cântărilor', ab: 'Cant', ordine: 22, test: 'VT' },
    { carte: 'Isaia', ab: 'Isa', ordine: 23, test: 'VT' },
    { carte: 'Ieremia', ab: 'Ier', ordine: 24, test: 'VT' },
    { carte: 'Plângerile lui Ieremia', ab: 'Plang', ordine: 25, test: 'VT' },
    { carte: 'Ezechiel', ab: 'Ezec', ordine: 26, test: 'VT' },
    { carte: 'Daniel', ab: 'Dan', ordine: 27, test: 'VT' },
    { carte: 'Osea', ab: 'Osea', ordine: 28, test: 'VT' },
    { carte: 'Ioel', ab: 'Ioel', ordine: 29, test: 'VT' },
    { carte: 'Amos', ab: 'Amos', ordine: 30, test: 'VT' },
    { carte: 'Obadia', ab: 'Obad', ordine: 31, test: 'VT' },
    { carte: 'Iona', ab: 'Iona', ordine: 32, test: 'VT' },
    { carte: 'Mica', ab: 'Mica', ordine: 33, test: 'VT' },
    { carte: 'Naum', ab: 'Naum', ordine: 34, test: 'VT' },
    { carte: 'Habacuc', ab: 'Hab', ordine: 35, test: 'VT' },
    { carte: 'Ţefania', ab: 'Tef', ordine: 36, test: 'VT' },
    { carte: 'Hagai', ab: 'Hag', ordine: 37, test: 'VT' },
    { carte: 'Zaharia', ab: 'Zah', ordine: 38, test: 'VT' },
    { carte: 'Maleahi', ab: 'Mal', ordine: 39, test: 'VT' },
    { carte: 'Matei', ab: 'Mat', ordine: 40, test: 'NT' },
    { carte: 'Marcu', ab: 'Mar', ordine: 41, test: 'NT' },
    { carte: 'Luca', ab: 'Luc', ordine: 42, test: 'NT' },
    { carte: 'Ioan', ab: 'Ioan', ordine: 43, test: 'NT' },
    { carte: 'Faptele Apostolilor', ab: 'Fapt', ordine: 44, test: 'NT' },
    { carte: 'Romani', ab: 'Rom', ordine: 45, test: 'NT' },
    { carte: '1 Corinteni', ab: '1Cor', ordine: 46, test: 'NT' },
    { carte: '2 Corinteni', ab: '2Cor', ordine: 47, test: 'NT' },
    { carte: 'Galateni', ab: 'Gal', ordine: 48, test: 'NT' },
    { carte: 'Efeseni', ab: 'Efes', ordine: 49, test: 'NT' },
    { carte: 'Filipeni', ab: 'Filip', ordine: 50, test: 'NT' },
    { carte: 'Coloseni', ab: 'Col', ordine: 51, test: 'NT' },
    { carte: '1 Tesaloniceni', ab: '1Tes', ordine: 52, test: 'NT' },
    { carte: '2 Tesaloniceni', ab: '2Tes', ordine: 53, test: 'NT' },
    { carte: '1 Timotei', ab: '1Tim', ordine: 54, test: 'NT' },
    { carte: '2 Timotei', ab: '2Tim', ordine: 55, test: 'NT' },
    { carte: 'Tit', ab: 'Tit', ordine: 56, test: 'NT' },
    { carte: 'Filimon', ab: 'Flm', ordine: 57, test: 'NT' },
    { carte: 'Evrei', ab: 'Evr', ordine: 58, test: 'NT' },
    { carte: 'Iacov', ab: 'Iac', ordine: 59, test: 'NT' },
    { carte: '1 Petru', ab: '1Pet', ordine: 60, test: 'NT' },
    { carte: '2 Petru', ab: '2Pet', ordine: 61, test: 'NT' },
    { carte: '1 Ioan', ab: '1Ioan', ordine: 62, test: 'NT' },
    { carte: '2 Ioan', ab: '2Ioan', ordine: 63, test: 'NT' },
    { carte: '3 Ioan', ab: '3Ioan', ordine: 64, test: 'NT' },
    { carte: 'Iuda', ab: 'Iuda', ordine: 65, test: 'NT' },
    { carte: 'Apocalipsa', ab: 'Apoc', ordine: 66, test: 'NT' }
  ];

  res.json({ success: true, ordine: ORDINE });
});

// ═══════════════════════════════════════
// GET /api/verses/random
// ═══════════════════════════════════════
router.get('/random', async (req, res) => {
  try {
    const { testament = '', carte = '' } = req.query;
    const filter = {};
    if (testament) filter.testament = testament;
    if (carte) filter.carte = new RegExp(carte, 'i');
    const count = await Verse.countDocuments(filter);
    if (count === 0) return res.json(null);
    const random = Math.floor(Math.random() * count);
    const verse = await Verse.findOne(filter).skip(random).lean();
    res.json(verse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════
// GET /api/verses/carti
// ═══════════════════════════════════════
router.get('/carti', async (req, res) => {
  try {
    const carti = await Verse.aggregate([
      {
        $group: {
          _id: {
            carte: '$carte',
            abreviere: '$abreviere',
            testament: '$testament'
          },
          totalVersete: { $sum: 1 },
          capitole: { $addToSet: '$capitol' }
        }
      },
      {
        $project: {
          _id: 0,
          carte: '$_id.carte',
          abreviere: '$_id.abreviere',
          testament: '$_id.testament',
          totalVersete: 1,
          totalCapitole: { $size: '$capitole' }
        }
      },
      { $sort: { testament: 1, carte: 1 } }
    ]);
    res.json(carti);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════
// GET /api/verses/capitol/:abrev/:capitol
// ═══════════════════════════════════════
router.get('/capitol/:abrev/:capitol', async (req, res) => {
  try {
    const versete = await Verse.find({
      abreviere: req.params.abrev,
      capitol: parseInt(req.params.capitol)
    }).sort({ verset: 1 }).lean();
    res.json(versete);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════
// GET /api/verses
// ═══════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 24,
      search = '',
      carte = '',
      testament = '',
      capitol = '',
      favorit = ''
    } = req.query;

    const filter = {};

    if (testament && testament !== 'all') filter.testament = testament;
    if (carte && carte !== 'all') filter.carte = carte; // match exact, nu regex
    if (capitol) filter.capitol = parseInt(capitol);
    if (favorit === 'true') filter.favorit = true;

    if (search && search.trim()) {
      const ref = parseReference(search);

      if (ref.isReference) {
        const conditions = [];

        if (ref.verset) {
          conditions.push({
            carte: new RegExp(ref.carte, 'i'),
            capitol: ref.capitol,
            verset: ref.verset
          });
          conditions.push({
            abreviere: new RegExp(ref.carte, 'i'),
            capitol: ref.capitol,
            verset: ref.verset
          });
        }

        conditions.push({
          carte: new RegExp(ref.carte, 'i'),
          capitol: ref.capitol
        });
        conditions.push({
          abreviere: new RegExp(ref.carte, 'i'),
          capitol: ref.capitol
        });
        conditions.push({ referinta: new RegExp(search.trim(), 'i') });
        conditions.push({ text: new RegExp(search.trim(), 'i') });

        filter.$or = conditions;
      } else {
        filter.$or = [
          { text: new RegExp(search.trim(), 'i') },
          { referinta: new RegExp(search.trim(), 'i') },
          { carte: new RegExp(search.trim(), 'i') },
          { abreviere: new RegExp(search.trim(), 'i') }
        ];
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNr = Math.min(parseInt(limit), 500);
    const sortBy = { testament: 1, carte: 1, capitol: 1, verset: 1 };

    const [versete, total] = await Promise.all([
      Verse.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limitNr)
        .lean(),
      Verse.countDocuments(filter)
    ]);

    res.json({
      versete,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limitNr),
      limit: limitNr
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════
// GET /api/verses/:id
// IMPORTANT: DUPĂ toate rutele specifice!
// ═══════════════════════════════════════
router.get('/:id', async (req, res) => {
  try {
    const verse = await Verse.findById(req.params.id).lean();
    if (!verse) return res.status(404).json({ error: 'Nu există' });
    res.json(verse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════
// PUT /api/verses/:id/favorit
// ═══════════════════════════════════════
router.put('/:id/favorit', async (req, res) => {
  try {
    const verse = await Verse.findById(req.params.id);
    if (!verse) return res.status(404).json({ error: 'Nu există' });
    verse.favorit = !verse.favorit;
    await verse.save();
    res.json(verse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;