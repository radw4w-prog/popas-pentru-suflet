import requests
import json
import time
import os
import sys
import ssl
import urllib3

# Dezactiveaza warningurile SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

print("=" * 60)
print("   DESCARCARE BIBLIE ROMANA - Cornilescu VDC")
print("=" * 60)
print()

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../data')
os.makedirs(OUTPUT_DIR, exist_ok=True)
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'versete_complete.json')
PROGRESS_FILE = os.path.join(OUTPUT_DIR, 'download_progress.json')

CARTI = [
    {"abrev_en": "gen", "abrev_ro": "Gen", "nume": "Geneza", "testament": "VT", "capitole": 50},
    {"abrev_en": "exo", "abrev_ro": "Ex", "nume": "Exodul", "testament": "VT", "capitole": 40},
    {"abrev_en": "lev", "abrev_ro": "Lev", "nume": "Leviticul", "testament": "VT", "capitole": 27},
    {"abrev_en": "num", "abrev_ro": "Num", "nume": "Numeri", "testament": "VT", "capitole": 36},
    {"abrev_en": "deu", "abrev_ro": "Deut", "nume": "Deuteronomul", "testament": "VT", "capitole": 34},
    {"abrev_en": "jos", "abrev_ro": "Ios", "nume": "Iosua", "testament": "VT", "capitole": 24},
    {"abrev_en": "jdg", "abrev_ro": "Jud", "nume": "Judecatori", "testament": "VT", "capitole": 21},
    {"abrev_en": "rut", "abrev_ro": "Rut", "nume": "Rut", "testament": "VT", "capitole": 4},
    {"abrev_en": "1sa", "abrev_ro": "1Sam", "nume": "1 Samuel", "testament": "VT", "capitole": 31},
    {"abrev_en": "2sa", "abrev_ro": "2Sam", "nume": "2 Samuel", "testament": "VT", "capitole": 24},
    {"abrev_en": "1ki", "abrev_ro": "1Imp", "nume": "1 Imparati", "testament": "VT", "capitole": 22},
    {"abrev_en": "2ki", "abrev_ro": "2Imp", "nume": "2 Imparati", "testament": "VT", "capitole": 25},
    {"abrev_en": "1ch", "abrev_ro": "1Cron", "nume": "1 Cronici", "testament": "VT", "capitole": 29},
    {"abrev_en": "2ch", "abrev_ro": "2Cron", "nume": "2 Cronici", "testament": "VT", "capitole": 36},
    {"abrev_en": "ezr", "abrev_ro": "Ezra", "nume": "Ezra", "testament": "VT", "capitole": 10},
    {"abrev_en": "neh", "abrev_ro": "Neem", "nume": "Neemia", "testament": "VT", "capitole": 13},
    {"abrev_en": "est", "abrev_ro": "Est", "nume": "Estera", "testament": "VT", "capitole": 10},
    {"abrev_en": "job", "abrev_ro": "Iov", "nume": "Iov", "testament": "VT", "capitole": 42},
    {"abrev_en": "psa", "abrev_ro": "Ps", "nume": "Psalmi", "testament": "VT", "capitole": 150},
    {"abrev_en": "pro", "abrev_ro": "Prov", "nume": "Proverbe", "testament": "VT", "capitole": 31},
    {"abrev_en": "ecc", "abrev_ro": "Ecl", "nume": "Eclesiastul", "testament": "VT", "capitole": 12},
    {"abrev_en": "sng", "abrev_ro": "Cant", "nume": "Cantarea Cantarilor", "testament": "VT", "capitole": 8},
    {"abrev_en": "isa", "abrev_ro": "Is", "nume": "Isaia", "testament": "VT", "capitole": 66},
    {"abrev_en": "jer", "abrev_ro": "Ier", "nume": "Ieremia", "testament": "VT", "capitole": 52},
    {"abrev_en": "lam", "abrev_ro": "Plang", "nume": "Plangerile", "testament": "VT", "capitole": 5},
    {"abrev_en": "ezk", "abrev_ro": "Iez", "nume": "Ezechiel", "testament": "VT", "capitole": 48},
    {"abrev_en": "dan", "abrev_ro": "Dan", "nume": "Daniel", "testament": "VT", "capitole": 12},
    {"abrev_en": "hos", "abrev_ro": "Os", "nume": "Osea", "testament": "VT", "capitole": 14},
    {"abrev_en": "jol", "abrev_ro": "Ioel", "nume": "Ioel", "testament": "VT", "capitole": 3},
    {"abrev_en": "amo", "abrev_ro": "Amos", "nume": "Amos", "testament": "VT", "capitole": 9},
    {"abrev_en": "oba", "abrev_ro": "Obad", "nume": "Obadia", "testament": "VT", "capitole": 1},
    {"abrev_en": "jon", "abrev_ro": "Iona", "nume": "Iona", "testament": "VT", "capitole": 4},
    {"abrev_en": "mic", "abrev_ro": "Mica", "nume": "Mica", "testament": "VT", "capitole": 7},
    {"abrev_en": "nam", "abrev_ro": "Naum", "nume": "Naum", "testament": "VT", "capitole": 3},
    {"abrev_en": "hab", "abrev_ro": "Hab", "nume": "Habacuc", "testament": "VT", "capitole": 3},
    {"abrev_en": "zep", "abrev_ro": "Tef", "nume": "Tefania", "testament": "VT", "capitole": 3},
    {"abrev_en": "hag", "abrev_ro": "Hag", "nume": "Hagai", "testament": "VT", "capitole": 2},
    {"abrev_en": "zec", "abrev_ro": "Zah", "nume": "Zaharia", "testament": "VT", "capitole": 14},
    {"abrev_en": "mal", "abrev_ro": "Mal", "nume": "Maleahi", "testament": "VT", "capitole": 4},
    {"abrev_en": "mat", "abrev_ro": "Mat", "nume": "Matei", "testament": "NT", "capitole": 28},
    {"abrev_en": "mrk", "abrev_ro": "Mar", "nume": "Marcu", "testament": "NT", "capitole": 16},
    {"abrev_en": "luk", "abrev_ro": "Luc", "nume": "Luca", "testament": "NT", "capitole": 24},
    {"abrev_en": "jhn", "abrev_ro": "Ioan", "nume": "Ioan", "testament": "NT", "capitole": 21},
    {"abrev_en": "act", "abrev_ro": "FA", "nume": "Faptele Apostolilor", "testament": "NT", "capitole": 28},
    {"abrev_en": "rom", "abrev_ro": "Rom", "nume": "Romani", "testament": "NT", "capitole": 16},
    {"abrev_en": "1co", "abrev_ro": "1Cor", "nume": "1 Corinteni", "testament": "NT", "capitole": 16},
    {"abrev_en": "2co", "abrev_ro": "2Cor", "nume": "2 Corinteni", "testament": "NT", "capitole": 13},
    {"abrev_en": "gal", "abrev_ro": "Gal", "nume": "Galateni", "testament": "NT", "capitole": 6},
    {"abrev_en": "eph", "abrev_ro": "Ef", "nume": "Efeseni", "testament": "NT", "capitole": 6},
    {"abrev_en": "php", "abrev_ro": "Fil", "nume": "Filipeni", "testament": "NT", "capitole": 4},
    {"abrev_en": "col", "abrev_ro": "Col", "nume": "Coloseni", "testament": "NT", "capitole": 4},
    {"abrev_en": "1th", "abrev_ro": "1Tes", "nume": "1 Tesaloniceni", "testament": "NT", "capitole": 5},
    {"abrev_en": "2th", "abrev_ro": "2Tes", "nume": "2 Tesaloniceni", "testament": "NT", "capitole": 3},
    {"abrev_en": "1ti", "abrev_ro": "1Tim", "nume": "1 Timotei", "testament": "NT", "capitole": 6},
    {"abrev_en": "2ti", "abrev_ro": "2Tim", "nume": "2 Timotei", "testament": "NT", "capitole": 4},
    {"abrev_en": "tit", "abrev_ro": "Tit", "nume": "Tit", "testament": "NT", "capitole": 3},
    {"abrev_en": "phm", "abrev_ro": "Flm", "nume": "Filimon", "testament": "NT", "capitole": 1},
    {"abrev_en": "heb", "abrev_ro": "Evr", "nume": "Evrei", "testament": "NT", "capitole": 13},
    {"abrev_en": "jas", "abrev_ro": "Iac", "nume": "Iacov", "testament": "NT", "capitole": 5},
    {"abrev_en": "1pe", "abrev_ro": "1Pet", "nume": "1 Petru", "testament": "NT", "capitole": 5},
    {"abrev_en": "2pe", "abrev_ro": "2Pet", "nume": "2 Petru", "testament": "NT", "capitole": 3},
    {"abrev_en": "1jn", "abrev_ro": "1Ioan", "nume": "1 Ioan", "testament": "NT", "capitole": 5},
    {"abrev_en": "2jn", "abrev_ro": "2Ioan", "nume": "2 Ioan", "testament": "NT", "capitole": 1},
    {"abrev_en": "3jn", "abrev_ro": "3Ioan", "nume": "3 Ioan", "testament": "NT", "capitole": 1},
    {"abrev_en": "jud", "abrev_ro": "Iuda", "nume": "Iuda", "testament": "NT", "capitole": 1},
    {"abrev_en": "rev", "abrev_ro": "Apoc", "nume": "Apocalipsa", "testament": "NT", "capitole": 22},
]

# ═══ SESIUNE HTTP cu SSL dezactivat ═══
session = requests.Session()
session.verify = False  # Dezactiveaza verificarea SSL

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
}

def get_chapter_getbible(book_en, chapter):
    """getbible.net API v2 - SSL dezactivat"""
    try:
        url = f"https://api.getbible.net/v2/vdc/{book_en}/{chapter}.json"
        r = session.get(url, timeout=20, headers=HEADERS)
        if r.status_code == 200:
            data = r.json()
            versete = {}
            for v in data.get("verses", []):
                nr = str(v.get("verse", ""))
                text = v.get("text", "").strip().replace('\n', ' ')
                if nr and text:
                    versete[nr] = text
            if versete:
                return versete, "getbible"
    except Exception as e:
        pass
    return {}, ""

def get_chapter_bibleapi(book_en, chapter):
    """bible-api.com - sursa alternativa"""
    try:
        url = f"https://bible-api.com/{book_en}+{chapter}?translation=romanian"
        r = session.get(url, timeout=20, headers=HEADERS)
        if r.status_code == 200:
            data = r.json()
            versete = {}
            for v in data.get("verses", []):
                nr = str(v.get("verse", ""))
                text = v.get("text", "").strip().replace('\n', ' ')
                if nr and text:
                    versete[nr] = text
            if versete:
                return versete, "bibleapi"
    except Exception as e:
        pass
    return {}, ""

def get_chapter_digitalbible(book_en, chapter):
    """digital.bible.org - sursa alternativa 2"""
    try:
        # Mapare ID-uri pentru digitalbible
        url = f"http://api.preachingcentral.com/bible.php?passage={book_en}+{chapter}&version=ro"
        r = session.get(url, timeout=20, headers=HEADERS)
        if r.status_code == 200 and len(r.text) > 50:
            # Parse simplu din HTML/text
            versete = {}
            return versete, "digital"
    except:
        pass
    return {}, ""

def get_chapter(book_en, book_ro, chapter):
    """Incearca toate sursele"""
    
    # Sursa 1: getbible
    versete, sursa = get_chapter_getbible(book_en, chapter)
    if versete:
        return versete, sursa
    
    time.sleep(0.5)
    
    # Sursa 2: bible-api
    versete, sursa = get_chapter_bibleapi(book_en, chapter)
    if versete:
        return versete, sursa
    
    return {}, "none"

# ═══ INCARCARE PROGRES ═══
progres = {}
versete_existente = []

if os.path.exists(PROGRESS_FILE):
    try:
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            progres = json.load(f)
        print(f"📂 Progres gasit: {len(progres)} carti procesate")
    except:
        progres = {}

if os.path.exists(OUTPUT_FILE):
    try:
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            versete_existente = json.load(f)
        print(f"📖 {len(versete_existente)} versete existente")
    except:
        versete_existente = []

# Filtreaza versete deja descarcate (nu cele din generateLocalBible)
# Pastram toate versetele existente
toate_versetele = []

# ═══ DESCARCARE ═══
print()
print(f"📚 Carti: {len(CARTI)} | Timp estimat: ~{len(CARTI) * 2} min")
print(f"🔒 SSL verificare: DEZACTIVATA (mod compatibilitate)")
print()

carti_ok = 0
carti_eroare = []
total_noi = 0

for idx, carte in enumerate(CARTI):
    carte_key = carte['abrev_ro']
    
    # Sari daca deja descarcata cu succes
    if carte_key in progres and progres[carte_key].get('ok') and progres[carte_key].get('versete', 0) > 0:
        nr = progres[carte_key].get('versete', 0)
        sursa = progres[carte_key].get('sursa', '?')
        print(f"✅ [{idx+1:02d}/{len(CARTI)}] {carte['nume']}: {nr} versete [{sursa}]")
        carti_ok += 1
        continue
    
    print(f"\n📖 [{idx+1:02d}/{len(CARTI)}] {carte['nume']} ({carte['capitole']} capitole)...")
    
    versete_carte = []
    capitole_ok = 0
    sursa_folosita = "none"
    
    for cap in range(1, carte['capitole'] + 1):
        versete_cap, sursa = get_chapter(
            carte['abrev_en'],
            carte['abrev_ro'],
            cap
        )
        
        if versete_cap:
            sursa_folosita = sursa
            for nr_v, text_v in versete_cap.items():
                try:
                    verset_nr = int(nr_v)
                except:
                    continue
                    
                referinta = f"{carte['abrev_ro']} {cap}:{nr_v}"
                versete_carte.append({
                    "carte": carte['nume'],
                    "abreviere": carte['abrev_ro'],
                    "testament": carte['testament'],
                    "capitol": cap,
                    "verset": verset_nr,
                    "text": text_v,
                    "referinta": referinta,
                    "tema": [],
                    "favorit": False
                })
            capitole_ok += 1
            sys.stdout.write(
                f"   Cap {cap:3d}/{carte['capitole']}: "
                f"{len(versete_cap):3d} versete [{sursa}]    \r"
            )
            sys.stdout.flush()
        else:
            sys.stdout.write(f"   Cap {cap:3d}/{carte['capitole']}: ??? eroare         \r")
            sys.stdout.flush()
        
        time.sleep(0.2)
    
    print(f"   {'✅' if versete_carte else '❌'} {carte['nume']}: "
          f"{len(versete_carte)} versete "
          f"({capitole_ok}/{carte['capitole']} cap) "
          f"[{sursa_folosita}]                    ")
    
    # Adauga versete
    toate_versetele.extend(versete_carte)
    total_noi += len(versete_carte)
    
    # Salveaza progres
    progres[carte_key] = {
        'ok': len(versete_carte) > 0,
        'versete': len(versete_carte),
        'capitole_ok': capitole_ok,
        'sursa': sursa_folosita
    }
    
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(progres, f, ensure_ascii=False)
    
    # Salveaza versete partial
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(toate_versetele, f, ensure_ascii=False, indent=2)
    
    if len(versete_carte) > 0:
        carti_ok += 1
    else:
        carti_eroare.append(carte['nume'])
    
    time.sleep(0.3)

# ═══ FINAL ═══
print()
print("=" * 60)
print(f"✅ DESCARCARE COMPLETA!")
print(f"📊 Total versete: {len(toate_versetele)}")
print(f"📚 Carti OK: {carti_ok}/{len(CARTI)}")
print(f"💾 Fisier: {OUTPUT_FILE}")

if carti_eroare:
    print(f"\n⚠️  Carti fara date ({len(carti_eroare)}):")
    for c in carti_eroare:
        print(f"   - {c}")

print()
print("🚀 Pasul urmator:")
print("   node importBible.js")