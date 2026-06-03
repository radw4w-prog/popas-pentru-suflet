// Cross-reference helper (local, offline).
// Sursa datelor: openbible.info — Treasury of Scripture Knowledge (CC-BY).
// Datele sunt stocate compact in src/data/crossReferences.json:
//   { books: ["Geneza", ...], refs: { "bookCode.capitol.verset": [[bookCode, capitol, versetStart, versetEnd], ...] } }
//
// Expune doua functii:
//   getChapterCrossRefs(carte, capitol) -> { [verset]: [{carte, capitol, versetStart, versetEnd, referinta}] }
//   getVerseCrossRefs(carte, capitol, verset) -> [{...}]

import crossRefData from '@/data/crossReferences.json';

const BOOKS = crossRefData.books;
const REFS = crossRefData.refs;

// name -> index (cod)
const BOOK_CODE = {};
BOOKS.forEach((name, i) => { BOOK_CODE[name] = i; });

function formatReferinta(carte, capitol, versetStart, versetEnd) {
  if (!versetEnd || versetEnd === versetStart) {
    return `${carte} ${capitol}:${versetStart}`;
  }
  return `${carte} ${capitol}:${versetStart}-${versetEnd}`;
}

function decodeRef(arr) {
  const [bookCode, capitol, versetStart, versetEnd] = arr;
  const carte = BOOKS[bookCode];
  if (!carte) return null;
  return {
    carte,
    capitol,
    versetStart,
    versetEnd: versetEnd || versetStart,
    referinta: formatReferinta(carte, capitol, versetStart, versetEnd),
  };
}

export function getVerseCrossRefs(carte, capitol, verset) {
  const code = BOOK_CODE[carte];
  if (code === undefined) return [];
  const key = `${code}.${capitol}.${verset}`;
  const list = REFS[key];
  if (!list) return [];
  return list.map(decodeRef).filter(Boolean);
}

export function getChapterCrossRefs(carte, capitol) {
  const code = BOOK_CODE[carte];
  if (code === undefined) return {};
  const prefix = `${code}.${capitol}.`;
  const map = {};
  for (const key in REFS) {
    if (key.startsWith(prefix)) {
      const verset = parseInt(key.slice(prefix.length), 10);
      map[verset] = REFS[key].map(decodeRef).filter(Boolean);
    }
  }
  return map;
}

export default { getVerseCrossRefs, getChapterCrossRefs };
