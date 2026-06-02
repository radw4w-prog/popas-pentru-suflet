export const bibleBooks = [
  { slug: 'geneza', name: 'Geneza', abbr: 'Gen', order: 1, testament: 'VT', chapters: 50, theme: 'origini, creație și începuturile poporului lui Dumnezeu' },
  { slug: 'exodul', name: 'Exodul', abbr: 'Ex', order: 2, testament: 'VT', chapters: 40, theme: 'eliberarea din Egipt, legământul și prezența lui Dumnezeu' },
  { slug: 'leviticul', name: 'Leviticul', abbr: 'Lev', order: 3, testament: 'VT', chapters: 27, theme: 'sfințenie, închinare și rânduieli pentru popor' },
  { slug: 'numeri', name: 'Numeri', abbr: 'Num', order: 4, testament: 'VT', chapters: 36, theme: 'călătoria prin pustiu, încercări și credincioșie' },
  { slug: 'deuteronomul', name: 'Deuteronomul', abbr: 'Deut', order: 5, testament: 'VT', chapters: 34, theme: 'recapitularea Legii și chemarea la ascultare' },
  { slug: 'iosua', name: 'Iosua', abbr: 'Ios', order: 6, testament: 'VT', chapters: 24, theme: 'intrarea în țara promisă și cucerirea Canaanului' },
  { slug: 'judecatori', name: 'Judecători', abbr: 'Jud', order: 7, testament: 'VT', chapters: 21, theme: 'ciclul căderii, izbăvirii și judecătorilor lui Israel' },
  { slug: 'rut', name: 'Rut', abbr: 'Rut', order: 8, testament: 'VT', chapters: 4, theme: 'credincioșie, răscumpărare și providență divină' },
  { slug: '1-samuel', name: '1 Samuel', abbr: '1Sam', order: 9, testament: 'VT', chapters: 31, theme: 'Samuel, Saul și începutul monarhiei în Israel' },
  { slug: '2-samuel', name: '2 Samuel', abbr: '2Sam', order: 10, testament: 'VT', chapters: 24, theme: 'domnia lui David, biruințe și căderi personale' },
  { slug: '1-imparati', name: '1 Împărați', abbr: '1Imp', order: 11, testament: 'VT', chapters: 22, theme: 'Solomon, templul și împărțirea împărăției' },
  { slug: '2-imparati', name: '2 Împărați', abbr: '2Imp', order: 12, testament: 'VT', chapters: 25, theme: 'regii lui Israel și Iuda până la exil' },
  { slug: '1-cronici', name: '1 Cronici', abbr: '1Cron', order: 13, testament: 'VT', chapters: 29, theme: 'genealogii și consolidarea domniei lui David' },
  { slug: '2-cronici', name: '2 Cronici', abbr: '2Cron', order: 14, testament: 'VT', chapters: 36, theme: 'templul, regii lui Iuda și drumul spre exil' },
  { slug: 'ezra', name: 'Ezra', abbr: 'Ezra', order: 15, testament: 'VT', chapters: 10, theme: 'întoarcerea din exil și refacerea închinării' },
  { slug: 'neemia', name: 'Neemia', abbr: 'Neem', order: 16, testament: 'VT', chapters: 13, theme: 'reconstrucția zidurilor și reforma spirituală' },
  { slug: 'estera', name: 'Estera', abbr: 'Est', order: 17, testament: 'VT', chapters: 10, theme: 'protecția providențială a poporului lui Dumnezeu' },
  { slug: 'iov', name: 'Iov', abbr: 'Iov', order: 18, testament: 'VT', chapters: 42, theme: 'suferință, integritate și suveranitatea lui Dumnezeu' },
  { slug: 'psalmii', name: 'Psalmii', abbr: 'Ps', order: 19, testament: 'VT', chapters: 150, theme: 'rugăciune, laudă, pocăință și speranță' },
  { slug: 'proverbe', name: 'Proverbe', abbr: 'Prov', order: 20, testament: 'VT', chapters: 31, theme: 'înțelepciune practică pentru viața de zi cu zi' },
  { slug: 'eclesiastul', name: 'Eclesiastul', abbr: 'Ecl', order: 21, testament: 'VT', chapters: 12, theme: 'sensul vieții și valoarea fricii de Domnul' },
  { slug: 'cantarea-cantarilor', name: 'Cântarea Cântărilor', abbr: 'Cant', order: 22, testament: 'VT', chapters: 8, theme: 'dragoste, frumusețe și devotament' },
  { slug: 'isaia', name: 'Isaia', abbr: 'Isa', order: 23, testament: 'VT', chapters: 66, theme: 'judecată, mângâiere și promisiunea lui Mesia' },
  { slug: 'ieremia', name: 'Ieremia', abbr: 'Ier', order: 24, testament: 'VT', chapters: 52, theme: 'chemare la pocăință și noul legământ' },
  { slug: 'plangerile-lui-ieremia', name: 'Plângerile lui Ieremia', abbr: 'Plang', order: 25, testament: 'VT', chapters: 5, theme: 'jale, ruine și speranță în mila lui Dumnezeu' },
  { slug: 'ezechiel', name: 'Ezechiel', abbr: 'Ezec', order: 26, testament: 'VT', chapters: 48, theme: 'slava lui Dumnezeu, judecată și restaurare' },
  { slug: 'daniel', name: 'Daniel', abbr: 'Dan', order: 27, testament: 'VT', chapters: 12, theme: 'credincioșie în exil și viziuni profetice' },
  { slug: 'osea', name: 'Osea', abbr: 'Osea', order: 28, testament: 'VT', chapters: 14, theme: 'dragostea neclintită a lui Dumnezeu față de popor' },
  { slug: 'ioel', name: 'Ioel', abbr: 'Ioel', order: 29, testament: 'VT', chapters: 3, theme: 'ziua Domnului și revărsarea Duhului' },
  { slug: 'amos', name: 'Amos', abbr: 'Amos', order: 30, testament: 'VT', chapters: 9, theme: 'dreptate, sfințenie și chemare la întoarcere' },
  { slug: 'obadia', name: 'Obadia', abbr: 'Obad', order: 31, testament: 'VT', chapters: 1, theme: 'judecata asupra mândriei și biruința Domnului' },
  { slug: 'iona', name: 'Iona', abbr: 'Iona', order: 32, testament: 'VT', chapters: 4, theme: 'milă, ascultare și chemare pentru toate națiunile' },
  { slug: 'mica', name: 'Mica', abbr: 'Mica', order: 33, testament: 'VT', chapters: 7, theme: 'dreptate, smerenie și speranța venirii lui Mesia' },
  { slug: 'naum', name: 'Naum', abbr: 'Naum', order: 34, testament: 'VT', chapters: 3, theme: 'judecata asupra Ninivei și dreptatea lui Dumnezeu' },
  { slug: 'habacuc', name: 'Habacuc', abbr: 'Hab', order: 35, testament: 'VT', chapters: 3, theme: 'credință în mijlocul întrebărilor și al crizei' },
  { slug: 'tefania', name: 'Ţefania', abbr: 'Tef', order: 36, testament: 'VT', chapters: 3, theme: 'ziua Domnului, curățire și restaurare' },
  { slug: 'hagai', name: 'Hagai', abbr: 'Hag', order: 37, testament: 'VT', chapters: 2, theme: 'priorități spirituale și reconstruirea templului' },
  { slug: 'zaharia', name: 'Zaharia', abbr: 'Zah', order: 38, testament: 'VT', chapters: 14, theme: 'viziuni profetice și speranța împărăției lui Dumnezeu' },
  { slug: 'maleahi', name: 'Maleahi', abbr: 'Mal', order: 39, testament: 'VT', chapters: 4, theme: 'credincioșie, închinare autentică și pregătirea drumului' },
  { slug: 'matei', name: 'Matei', abbr: 'Mat', order: 40, testament: 'NT', chapters: 28, theme: 'Isus Mesia, Împărăția cerurilor și învățătura Sa' },
  { slug: 'marcu', name: 'Marcu', abbr: 'Mar', order: 41, testament: 'NT', chapters: 16, theme: 'Isus în acțiune, putere, slujire și sacrificiu' },
  { slug: 'luca', name: 'Luca', abbr: 'Luc', order: 42, testament: 'NT', chapters: 24, theme: 'viața lui Isus, compasiune și mântuire pentru toți' },
  { slug: 'ioan', name: 'Ioan', abbr: 'Ioan', order: 43, testament: 'NT', chapters: 21, theme: 'divinitatea lui Hristos și viața veșnică prin credință' },
  { slug: 'faptele-apostolilor', name: 'Faptele Apostolilor', abbr: 'Fapt', order: 44, testament: 'NT', chapters: 28, theme: 'nașterea Bisericii și lucrarea Duhului Sfânt' },
  { slug: 'romani', name: 'Romani', abbr: 'Rom', order: 45, testament: 'NT', chapters: 16, theme: 'Evanghelia harului, credință și neprihănire' },
  { slug: '1-corinteni', name: '1 Corinteni', abbr: '1Cor', order: 46, testament: 'NT', chapters: 16, theme: 'viața bisericii, sfințenie și dragoste creștină' },
  { slug: '2-corinteni', name: '2 Corinteni', abbr: '2Cor', order: 47, testament: 'NT', chapters: 13, theme: 'slujire, suferință și puterea lui Dumnezeu în slăbiciune' },
  { slug: 'galateni', name: 'Galateni', abbr: 'Gal', order: 48, testament: 'NT', chapters: 6, theme: 'libertate în Hristos și justificare prin credință' },
  { slug: 'efeseni', name: 'Efeseni', abbr: 'Efes', order: 49, testament: 'NT', chapters: 6, theme: 'identitatea în Hristos și unitatea Bisericii' },
  { slug: 'filipeni', name: 'Filipeni', abbr: 'Filip', order: 50, testament: 'NT', chapters: 4, theme: 'bucurie, smerenie și perseverență în Hristos' },
  { slug: 'coloseni', name: 'Coloseni', abbr: 'Col', order: 51, testament: 'NT', chapters: 4, theme: 'supremația lui Hristos și viața nouă' },
  { slug: '1-tesaloniceni', name: '1 Tesaloniceni', abbr: '1Tes', order: 52, testament: 'NT', chapters: 5, theme: 'credincioșie, nădejde și revenirea Domnului' },
  { slug: '2-tesaloniceni', name: '2 Tesaloniceni', abbr: '2Tes', order: 53, testament: 'NT', chapters: 3, theme: 'perseverență, adevăr și statornicie' },
  { slug: '1-timotei', name: '1 Timotei', abbr: '1Tim', order: 54, testament: 'NT', chapters: 6, theme: 'ordine în biserică și păstorire sănătoasă' },
  { slug: '2-timotei', name: '2 Timotei', abbr: '2Tim', order: 55, testament: 'NT', chapters: 4, theme: 'credincioșie până la capăt și puterea Cuvântului' },
  { slug: 'tit', name: 'Tit', abbr: 'Tit', order: 56, testament: 'NT', chapters: 3, theme: 'învățătură sănătoasă și viață evlavioasă' },
  { slug: 'filimon', name: 'Filimon', abbr: 'Flm', order: 57, testament: 'NT', chapters: 1, theme: 'iertare, reconciliere și dragoste frățească' },
  { slug: 'evrei', name: 'Evrei', abbr: 'Evr', order: 58, testament: 'NT', chapters: 13, theme: 'superioritatea lui Hristos și chemarea la statornicie' },
  { slug: 'iacov', name: 'Iacov', abbr: 'Iac', order: 59, testament: 'NT', chapters: 5, theme: 'credință practică, înțelepciune și maturitate spirituală' },
  { slug: '1-petru', name: '1 Petru', abbr: '1Pet', order: 60, testament: 'NT', chapters: 5, theme: 'speranță vie și sfințenie în mijlocul suferinței' },
  { slug: '2-petru', name: '2 Petru', abbr: '2Pet', order: 61, testament: 'NT', chapters: 3, theme: 'creștere spirituală și păstrarea adevărului' },
  { slug: '1-ioan', name: '1 Ioan', abbr: '1Ioan', order: 62, testament: 'NT', chapters: 5, theme: 'dragoste, lumină și siguranța vieții veșnice' },
  { slug: '2-ioan', name: '2 Ioan', abbr: '2Ioan', order: 63, testament: 'NT', chapters: 1, theme: 'adevăr, dragoste și discernământ' },
  { slug: '3-ioan', name: '3 Ioan', abbr: '3Ioan', order: 64, testament: 'NT', chapters: 1, theme: 'ospitalitate, adevăr și caracter creștin' },
  { slug: 'iuda', name: 'Iuda', abbr: 'Iuda', order: 65, testament: 'NT', chapters: 1, theme: 'lupta pentru credință și avertisment împotriva rătăcirii' },
  { slug: 'apocalipsa', name: 'Apocalipsa', abbr: 'Apoc', order: 66, testament: 'NT', chapters: 22, theme: 'biruința finală a lui Hristos și noua creație' },
];

export function getBibleBookBySlug(slug) {
  return bibleBooks.find((book) => book.slug === slug) || null;
}

export function getBibleBookByName(name) {
  return bibleBooks.find((book) => book.name === name) || null;
}

export function getAdjacentBibleBooks(slug) {
  const index = bibleBooks.findIndex((book) => book.slug === slug);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: bibleBooks[index - 1] || null,
    next: bibleBooks[index + 1] || null,
  };
}

export function getBibleBooksByTestament(testament) {
  return bibleBooks.filter((book) => book.testament === testament);
}

export function getBibleBookDescription(book) {
  if (!book) return '';
  const testamentLabel = book.testament === 'VT' ? 'Vechiul Testament' : 'Noul Testament';
  return `Citește cartea ${book.name} online în Biblia Cornilescu. ${book.chapters} capitole din ${testamentLabel}, despre ${book.theme}.`;
}
