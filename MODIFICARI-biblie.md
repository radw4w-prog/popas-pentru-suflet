# Corecții Biblie: cuvintele Domnului Isus (roșu) + referințe încrucișate

Acest document descrie cele două corecții făcute în secțiunea Biblia și cum se aplică în producție.

---

## 1. Cuvintele Domnului Isus cu roșu (red-letter) — CORECTAT

### Problema
Vechea logică (`highlightJesusWords` din `BibleReaderClient.jsx`) colora cu roșu:
- **orice** text dintre ghilimele „...", chiar și vorbirea altor persoane;
- **orice** „Eu + cuvânt".

De aceea, de exemplu în **Ioan 3:25-36** (unde vorbește **Ioan Botezătorul**, nu Isus) apăreau colorate greșit „Eu Hristosul", „Eu să" etc.

### Soluția
Colorarea se face acum pe baza unui **set autoritar de versete** în care vorbește efectiv Isus,
extras din marcajele `\wj` (words of Jesus) din **World English Bible** (domeniu public),
pentru cele 4 Evanghelii.

Fișiere noi:
- `nextjs/src/data/redLetter.js` — lista versetelor cu vorbirea lui Isus: `{ "Ioan": { 3: [3,5,6,7,8,10,...,21] } }`
- `nextjs/src/lib/redLetter.js` — funcția `buildRedLetterSegments()` care:
  1. colorează doar versetele în care vorbește Isus;
  2. respectă ghilimelele Cornilescu — partea de narațiune dinaintea ghilimelelor („Isus i-a zis:") rămâne neagră;
  3. tratează corect discursurile pe mai multe versete (ghilimelele se închid abia la final).

Rezultat pe Ioan 3:
- v.3, 5-8, 10-21 → roșu (Isus) ✓
- v.2 (Nicodim), v.27-36 (Ioan Botezătorul) → **negru** ✓

---

## 2. Referințe încrucișate — COMPLETAT

### Problema
- Datele de referințe erau scrise manual și acopereau doar ~30 de capitole (Ioan 3, Romani 8, etc.).
- În plus, frontend-ul avea un **URL greșit de backend** ca fallback:
  `https://popas-pentru-suflet.onrender.com` (fără `-backend`), care returnează **404**.
  De aceea, în multe cazuri se ajungea la fallback-ul local minimal (ex. doar 2 referințe la Ioan 3:16).

### Soluția
- Import complet din **Treasury of Scripture Knowledge** (openbible.info, licență CC-BY):
  ~**278.000 de referințe** pentru ~**29.000 de versete**, sortate după relevanță (voturi) și
  limitate la cele mai bune 12 per verset.
- URL-ul de backend a fost corectat peste tot la `https://popas-pentru-suflet-backend.onrender.com`.
- Referințele sunt acum incluse **local** în aplicație (offline, rapide), iar backend-ul rămâne
  ca sursă opțională suplimentară.

Acum **Ioan 3:16** are 12 referințe relevante (Romani 5:8, 1 Ioan 4:9-10, Romani 8:32, Ioan 6:40 etc.),
în loc de doar 2.

Fișiere noi:
- `nextjs/src/data/crossReferences.json` — datele compacte (cod carte + capitol + verset).
- `nextjs/src/lib/crossRefs.js` — `getChapterCrossRefs()` și `getVerseCrossRefs()`.

---

## Fișiere modificate / adăugate

**Frontend (nextjs/)**
- `src/app/(app)/biblia/[carte]/BibleReaderClient.jsx` — logică nouă red-letter + cross-refs locale; URL corectat.
- `src/app/(app)/biblia/[carte]/[capitol]/route.js` — URL backend corectat.
- `src/lib/redLetter.js` *(nou)*
- `src/lib/crossRefs.js` *(nou)*
- `src/data/redLetter.js` *(nou)*
- `src/data/crossReferences.json` *(nou)*

**Backend (backend/)** — pentru ca și aplicația Android / alți clienți să primească date corecte
- `data/crossReferences.json` *(nou)* — setul TSK complet pentru import în MongoDB.
- `data/redLetter.json` *(nou)* — setul cu cuvintele lui Isus.
- `scripts/importCrossReferencesFull.js` *(nou)* — importă setul complet în MongoDB.
- `routes/redLetter.js` *(nou)* — endpoint `GET /api/red-letter`.
- `server.js` — montează ruta `/api/red-letter`.

**Previzualizare**
- `preview-ioan3.html` — deschide acest fișier în browser ca să vezi rezultatul pe Ioan 3.

---

## Cum aplici în producție

### Frontend (Vercel)
Nu necesită pași speciali — datele sunt incluse în cod. La următorul deploy (push pe GitHub),
corecțiile devin active. Recomandat: setează variabila de mediu pe Vercel
`NEXT_PUBLIC_API_URL = https://popas-pentru-suflet-backend.onrender.com`
(ca să nu se mai bazeze pe fallback-ul din cod).

### Backend (Render) — opțional, dar recomandat pentru Android
Pentru a popula MongoDB cu setul complet de referințe:

```bash
cd backend
node scripts/importCrossReferencesFull.js
```

(necesită `MONGODB_URI` în `.env`). Vechiul script `importCrossReferences.js` poate fi ignorat.

---

## Surse de date (licențe)
- **Referințe încrucișate:** Treasury of Scripture Knowledge via openbible.info — CC-BY.
- **Cuvintele lui Isus (red-letter):** World English Bible (marcaje `\wj`) — domeniu public.

Numerotarea versetelor este standard între traduceri, deci seturile se potrivesc corect peste textul Cornilescu.
