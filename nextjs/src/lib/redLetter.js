// Red-letter (cuvintele Domnului Isus) — colorare corecta.
//
// Sursa adevarului: src/data/redLetter.js — lista versetelor in care vorbeste Isus,
// extrasa din marcajele \wj (words of Jesus) ale World English Bible (domeniu public).
//
// Spre deosebire de vechea euristica (care colora ORICE text intre ghilimele, inclusiv
// vorbirea altor persoane precum Ioan Botezatorul sau Nicodim), aceasta abordare:
//   1. coloreaza DOAR versetele in care Isus vorbeste efectiv;
//   2. respecta ghilimelele Cornilescu — cand un discurs incepe ("Isus a zis: „..."),
//      partea de naratiune dinaintea ghilimelelor ramane neagra, iar restul devine rosu;
//   3. trateaza corect discursurile pe mai multe versete (ghilimelele se inchid abia
//      la finalul discursului).

import { redLetterVerses } from '@/data/redLetter';

const QUOTE_OPEN = ['\u201E', '\u201C', '"']; // „  "  "
const QUOTE_CLOSE = ['\u201D', '"'];          // ”  "

function firstIndexOfAny(text, chars) {
  let idx = -1;
  for (const ch of chars) {
    const i = text.indexOf(ch);
    if (i >= 0 && (idx === -1 || i < idx)) idx = i;
  }
  return idx;
}

function lastIndexOfAny(text, chars) {
  let idx = -1;
  for (const ch of chars) {
    const i = text.lastIndexOf(ch);
    if (i > idx) idx = i;
  }
  return idx;
}

// Grupeaza numere consecutive in intervale: [3,5,6,7,10] -> [[3,3],[5,7],[10,10]]
function findRuns(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const runs = [];
  if (sorted.length === 0) return runs;
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const n = sorted[i];
    if (n === prev + 1) {
      prev = n;
    } else {
      runs.push([start, prev]);
      start = prev = n;
    }
  }
  runs.push([start, prev]);
  return runs;
}

/**
 * Calculeaza segmentele colorate pentru toate versetele unui capitol.
 * @param {string} bookName - numele cartii (ex: "Ioan")
 * @param {number|string} chapter - numarul capitolului
 * @param {Array<{verset:number, text:string}>} verses - versetele capitolului
 * @returns {Object} map verset -> Array<{text:string, red:boolean}>
 */
export function buildRedLetterSegments(bookName, chapter, verses) {
  const result = {};
  for (const v of verses) {
    result[v.verset] = [{ text: v.text, red: false }];
  }

  const book = redLetterVerses[bookName];
  if (!book) return result; // nu e Evanghelie -> nimic rosu

  const chapterVerses = book[chapter] || book[String(chapter)] || book[parseInt(chapter, 10)];
  if (!chapterVerses || chapterVerses.length === 0) return result;

  const jesusSet = new Set(chapterVerses);
  const textMap = {};
  for (const v of verses) textMap[v.verset] = v.text;

  const present = verses.map((v) => v.verset).filter((n) => jesusSet.has(n));
  const runs = findRuns(present);

  for (const [a, b] of runs) {
    if (a === b) {
      const t = textMap[a];
      if (t === undefined) continue;
      const oi = firstIndexOfAny(t, QUOTE_OPEN);
      const ci = lastIndexOfAny(t, QUOTE_CLOSE);
      if (oi >= 0 && ci > oi) {
        result[a] = [
          { text: t.slice(0, oi), red: false },
          { text: t.slice(oi, ci + 1), red: true },
          { text: t.slice(ci + 1), red: false },
        ].filter((s) => s.text.length > 0);
      } else if (oi >= 0) {
        // ghilimele deschise dar neinchise pe acelasi verset (rar) -> coloreaza de la deschidere
        result[a] = [
          { text: t.slice(0, oi), red: false },
          { text: t.slice(oi), red: true },
        ].filter((s) => s.text.length > 0);
      } else {
        result[a] = [{ text: t, red: true }];
      }
    } else {
      // Discurs pe mai multe versete.
      // Primul verset: naratiunea ramane neagra pana la prima ghilimea.
      const tFirst = textMap[a];
      if (tFirst !== undefined) {
        const oi = firstIndexOfAny(tFirst, QUOTE_OPEN);
        if (oi >= 0) {
          result[a] = [
            { text: tFirst.slice(0, oi), red: false },
            { text: tFirst.slice(oi), red: true },
          ].filter((s) => s.text.length > 0);
        } else {
          result[a] = [{ text: tFirst, red: true }];
        }
      }
      // Versetele din mijloc: complet rosii.
      for (let m = a + 1; m < b; m++) {
        if (textMap[m] !== undefined) result[m] = [{ text: textMap[m], red: true }];
      }
      // Ultimul verset: rosu pana la ghilimeaua de inchidere, apoi negru.
      const tLast = textMap[b];
      if (tLast !== undefined) {
        const ci = lastIndexOfAny(tLast, QUOTE_CLOSE);
        if (ci >= 0) {
          result[b] = [
            { text: tLast.slice(0, ci + 1), red: true },
            { text: tLast.slice(ci + 1), red: false },
          ].filter((s) => s.text.length > 0);
        } else {
          result[b] = [{ text: tLast, red: true }];
        }
      }
    }
  }

  return result;
}

export default { buildRedLetterSegments };
