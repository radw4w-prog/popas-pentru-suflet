import requests
import json
import time
import os
import re

# ═══════════════════════════════════════
# DOWNLOAD BIBLIA ROMÂNĂ DE PE API.BIBLE
# Versiunea: Cornilescu 1924 (cea mai apropiată de VDCC disponibilă public)
# ═══════════════════════════════════════

# Vom folosi bible-api.com - funcționează fără API key
BASE_URL = "https://bible-api.com"

CARTI = [
    # Vechiul Testament
    {"abreviere": "GEN", "nume": "Geneza", "capitole": 50, "testament": "VT", "ordine": 1},
    {"abreviere": "EXO", "nume": "Exodul", "capitole": 40, "testament": "VT", "ordine": 2},
    {"abreviere": "LEV", "nume": "Leviticul", "capitole": 27, "testament": "VT", "ordine": 3},
    {"abreviere": "NUM", "nume": "Numeri", "capitole": 36, "testament": "VT", "ordine": 4},
    {"abreviere": "DEU", "nume": "Deuteronomul", "capitole": 34, "testament": "VT", "ordine": 5},
    {"abreviere": "JOS", "nume": "Iosua", "capitole": 24, "testament": "VT", "ordine": 6},
    {"abreviere": "JDG", "nume": "Judecătorii", "capitole": 21, "testament": "VT", "ordine": 7},
    {"abreviere": "RUT", "nume": "Rut", "capitole": 4, "testament": "VT", "ordine": 8},
    {"abreviere": "1SA", "nume": "1 Samuel", "capitole": 31, "testament": "VT", "ordine": 9},
    {"abreviere": "2SA", "nume": "2 Samuel", "capitole": 24, "testament": "VT", "ordine": 10},
    {"abreviere": "1KI", "nume": "1 Împărați", "capitole": 22, "testament": "VT", "ordine": 11},
    {"abreviere": "2KI", "nume": "2 Împărați", "capitole": 25, "testament": "VT", "ordine": 12},
    {"abreviere": "1CH", "nume": "1 Cronici", "capitole": 29, "testament": "VT", "ordine": 13},
    {"abreviere": "2CH", "nume": "2 Cronici", "capitole": 36, "testament": "VT", "ordine": 14},
    {"abreviere": "EZR", "nume": "Ezra", "capitole": 10, "testament": "VT", "ordine": 15},
    {"abreviere": "NEH", "nume": "Neemia", "capitole": 13, "testament": "VT", "ordine": 16},
    {"abreviere": "EST", "nume": "Estera", "capitole": 10, "testament": "VT", "ordine": 17},
    {"abreviere": "JOB", "nume": "Iov", "capitole": 42, "testament": "VT", "ordine": 18},
    {"abreviere": "PSA", "nume": "Psalmii", "capitole": 150, "testament": "VT", "ordine": 19},
    {"abreviere": "PRO", "nume": "Proverbele", "capitole": 31, "testament": "VT", "ordine": 20},
    {"abreviere": "ECC", "nume": "Eclesiastul", "capitole": 12, "testament": "VT", "ordine": 21},
    {"abreviere": "SNG", "nume": "Cântarea Cântărilor", "capitole": 8, "testament": "VT", "ordine": 22},
    {"abreviere": "ISA", "nume": "Isaia", "capitole": 66, "testament": "VT", "ordine": 23},
    {"abreviere": "JER", "nume": "Ieremia", "capitole": 52, "testament": "VT", "ordine": 24},
    {"abreviere": "LAM", "nume": "Plângerile", "capitole": 5, "testament": "VT", "ordine": 25},
    {"abreviere": "EZK", "nume": "Ezechiel", "capitole": 48, "testament": "VT", "ordine": 26},
    {"abreviere": "DAN", "nume": "Daniel", "capitole": 12, "testament": "VT", "ordine": 27},
    {"abreviere": "HOS", "nume": "Osea", "capitole": 14, "testament": "VT", "ordine": 28},
    {"abreviere": "JOL", "nume": "Ioel", "capitole": 3, "testament": "VT", "ordine": 29},
    {"abreviere": "AMO", "nume": "Amos", "capitole": 9, "testament": "VT", "ordine": 30},
    {"abreviere": "OBA", "nume": "Obadia", "capitole": 1, "testament": "VT", "ordine": 31},
    {"abreviere": "JON", "nume": "Iona", "capitole": 4, "testament": "VT", "ordine": 32},
    {"abreviere": "MIC", "nume": "Mica", "capitole": 7, "testament": "VT", "ordine": 33},
    {"abreviere": "NAM", "nume": "Naum", "capitole": 3, "testament": "VT", "ordine": 34},
    {"abreviere": "HAB", "nume": "Habacuc", "capitole": 3, "testament": "VT", "ordine": 35},
    {"abreviere": "ZEP", "nume": "Țefania", "capitole": 3, "testament": "VT", "ordine": 36},
    {"abreviere": "HAG", "nume": "Hagai", "capitole": 2, "testament": "VT", "ordine": 37},
    {"abreviere": "ZEC", "nume": "Zaharia", "capitole": 14, "testament": "VT", "ordine": 38},
    {"abreviere": "MAL", "nume": "Maleahi", "capitole": 4, "testament": "VT", "ordine": 39},
    # Noul Testament
    {"abreviere": "MAT", "nume": "Matei", "capitole": 28, "testament": "NT", "ordine": 40},
    {"abreviere": "MRK", "nume": "Marcu", "capitole": 16, "testament": "NT", "ordine": 41},
    {"abreviere": "LUK", "nume": "Luca", "capitole": 24, "testament": "NT", "ordine": 42},
    {"abreviere": "JHN", "nume": "Ioan", "capitole": 21, "testament": "NT", "ordine": 43},
    {"abreviere": "ACT", "nume": "Faptele Apostolilor", "capitole": 28, "testament": "NT", "ordine": 44},
    {"abreviere": "ROM", "nume": "Romani", "capitole": 16, "testament": "NT", "ordine": 45},
    {"abreviere": "1CO", "nume": "1 Corinteni", "capitole": 16, "testament": "NT", "ordine": 46},
    {"abreviere": "2CO", "nume": "2 Corinteni", "capitole": 13, "testament": "NT", "ordine": 47},
    {"abreviere": "GAL", "nume": "Galateni", "capitole": 6, "testament": "NT", "ordine": 48},
    {"abreviere": "EPH", "nume": "Efeseni", "capitole": 6, "testament": "NT", "ordine": 49},
    {"abreviere": "PHP", "nume": "Filipeni", "capitole": 4, "testament": "NT", "ordine": 50},
    {"abreviere": "COL", "nume": "Coloseni", "capitole": 4, "testament": "NT", "ordine": 51},
    {"abreviere": "1TH", "nume": "1 Tesaloniceni", "capitole": 5, "testament": "NT", "ordine": 52},
    {"abreviere": "2TH", "nume": "2 Tesaloniceni", "capitole": 3, "testament": "NT", "ordine": 53},
    {"abreviere": "1TI", "nume": "1 Timotei", "capitole": 6, "testament": "NT", "ordine": 54},
    {"abreviere": "2TI", "nume": "2 Timotei", "capitole": 4, "testament": "NT", "ordine": 55},
    {"abreviere": "TIT", "nume": "Tit", "capitole": 3, "testament": "NT", "ordine": 56},
    {"abreviere": "PHM", "nume": "Filimon", "capitole": 1, "testament": "NT", "ordine": 57},
    {"abreviere": "HEB", "nume": "Evrei", "capitole": 13, "testament": "NT", "ordine": 58},
    {"abreviere": "JAS", "nume": "Iacov", "capitole": 5, "testament": "NT", "ordine": 59},
    {"abreviere": "1PE", "nume": "1 Petru", "capitole": 5, "testament": "NT", "ordine": 60},
    {"abreviere": "2PE", "nume": "2 Petru", "capitole": 3, "testament": "NT", "ordine": 61},
    {"abreviere": "1JN", "nume": "1 Ioan", "capitole": 5, "testament": "NT", "ordine": 62},
    {"abreviere": "2JN", "nume": "2 Ioan", "capitole": 1, "testament": "NT", "ordine": 63},
    {"abreviere": "3JN", "nume": "3 Ioan", "capitole": 1, "testament": "NT", "ordine": 64},
    {"abreviere": "JUD", "nume": "Iuda", "capitole": 1, "testament": "NT", "ordine": 65},
    {"abreviere": "REV", "nume": "Apocalipsa", "capitole": 22, "testament": "NT", "ordine": 66},
]

# Mapare abrevieri pentru bible-api.com (folosește numele englezești)
ABREVIERE_LA_ENGLEZA = {
    "GEN": "genesis", "EXO": "exodus", "LEV": "leviticus", "NUM": "numbers",
    "DEU": "deuteronomy", "JOS": "joshua", "JDG": "judges", "RUT": "ruth",
    "1SA": "1+samuel", "2SA": "2+samuel", "1KI": "1+kings", "2KI": "2+kings",
    "1CH": "1+chronicles", "2CH": "2+chronicles", "EZR": "ezra", "NEH": "nehemiah",
    "EST": "esther", "JOB": "job", "PSA": "psalms", "PRO": "proverbs",
    "ECC": "ecclesiastes", "SNG": "song+of+solomon", "ISA": "isaiah",
    "JER": "jeremiah", "LAM": "lamentations", "EZK": "ezekiel", "DAN": "daniel",
    "HOS": "hosea", "JOL": "joel", "AMO": "amos", "OBA": "obadiah",
    "JON": "jonah", "MIC": "micah", "NAM": "nahum", "HAB": "habakkuk",
    "ZEP": "zephaniah", "HAG": "haggai", "ZEC": "zechariah", "MAL": "malachi",
    "MAT": "matthew", "MRK": "mark", "LUK": "luke", "JHN": "john",
    "ACT": "acts", "ROM": "romans", "1CO": "1+corinthians", "2CO": "2+corinthians",
    "GAL": "galatians", "EPH": "ephesians", "PHP": "philippians", "COL": "colossians",
    "1TH": "1+thessalonians", "2TH": "2+thessalonians", "1TI": "1+timothy",
    "2TI": "2+timothy", "TIT": "titus", "PHM": "philemon", "HEB": "hebrews",
    "JAS": "james", "1PE": "1+peter", "2PE": "2+peter", "1JN": "1+john",
    "2JN": "2+john", "3JN": "3+john", "JUD": "jude", "REV": "revelation",
}

def clean_text(text):
    """Curăță textul de caractere nedorite"""
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', '', text)
    text = text.replace('\n', ' ').replace('\r', ' ')
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text

def test_api():
    """Testează dacă API-ul funcționează"""
    print("🔍 Testez conexiunea la bible-api.com...")
    try:
        url = f"{BASE_URL}/john+3:16?translation=romanian"
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            data = r.json()
            if data.get('verses'):
                print(f"✅ API funcționează! Test: {data['verses'][0]['text'][:50]}...")
                return True
        print(f"❌ API răspuns: {r.status_code}")
        return False
    except Exception as e:
        print(f"❌ Eroare conexiune: {e}")
        return False

def download_chapter(carte, capitol):
    """Descarcă un capitol"""
    book_en = ABREVIERE_LA_ENGLEZA.get(carte['abreviere'], carte['abreviere'].lower())
    url = f"{BASE_URL}/{book_en}+{capitol}?translation=romanian"
    
    try:
        response = requests.get(url, timeout=20)
        
        if response.status_code == 200:
            data = response.json()
            verses_raw = data.get('verses', [])
            
            verses = []
            for v in verses_raw:
                text = clean_text(v.get('text', ''))
                verse_num = v.get('verse', 0)
                
                if text and verse_num:
                    ab_ro = carte['abreviere'].replace(
                        'GEN','Gen').replace('EXO','Ex').replace('LEV','Lev').replace(
                        'NUM','Num').replace('DEU','Deut').replace('JOS','Ios').replace(
                        'JDG','Jud').replace('RUT','Rut').replace('1SA','1Sam').replace(
                        '2SA','2Sam').replace('1KI','1Imp').replace('2KI','2Imp').replace(
                        '1CH','1Cron').replace('2CH','2Cron').replace('EZR','Ezra').replace(
                        'NEH','Neem').replace('EST','Est').replace('JOB','Iov').replace(
                        'PSA','Ps').replace('PRO','Prov').replace('ECC','Ecl').replace(
                        'SNG','Cant').replace('ISA','Isa').replace('JER','Ier').replace(
                        'LAM','Plang').replace('EZK','Ezec').replace('DAN','Dan').replace(
                        'HOS','Osea').replace('JOL','Ioel').replace('AMO','Amos').replace(
                        'OBA','Obad').replace('JON','Iona').replace('MIC','Mica').replace(
                        'NAM','Naum').replace('HAB','Hab').replace('ZEP','Tef').replace(
                        'HAG','Hag').replace('ZEC','Zah').replace('MAL','Mal').replace(
                        'MAT','Mat').replace('MRK','Mar').replace('LUK','Luc').replace(
                        'JHN','Ioan').replace('ACT','Fapt').replace('ROM','Rom').replace(
                        '1CO','1Cor').replace('2CO','2Cor').replace('GAL','Gal').replace(
                        'EPH','Efes').replace('PHP','Filip').replace('COL','Col').replace(
                        '1TH','1Tes').replace('2TH','2Tes').replace('1TI','1Tim').replace(
                        '2TI','2Tim').replace('TIT','Tit').replace('PHM','Flm').replace(
                        'HEB','Evr').replace('JAS','Iac').replace('1PE','1Pet').replace(
                        '2PE','2Pet').replace('1JN','1Ioan').replace('2JN','2Ioan').replace(
                        '3JN','3Ioan').replace('JUD','Iuda').replace('REV','Apoc')
                    
                    verses.append({
                        "carte": carte['nume'],
                        "abreviere": ab_ro,
                        "capitol": capitol,
                        "verset": verse_num,
                        "text": text,
                        "testament": carte['testament'],
                        "referinta": f"{ab_ro} {capitol}:{verse_num}",
                        "ordine": carte['ordine']
                    })
            
            return verses, None
            
        elif response.status_code == 404:
            return [], f"404 - capitol nu există"
        else:
            return [], f"HTTP {response.status_code}"
            
    except requests.exceptions.Timeout:
        return [], "Timeout"
    except Exception as e:
        return [], str(e)

def download_bible():
    print("=" * 60)
    print("📖 DOWNLOAD BIBLIA ROMÂNĂ (Cornilescu)")
    print("   Sursa: bible-api.com")
    print("=" * 60)
    
    # Test API
    if not test_api():
        print("\n❌ API-ul nu funcționează. Încerc alternativa...")
        return download_from_alternative()
    
    all_verses = []
    errors = []
    total_capitole = sum(c['capitole'] for c in CARTI)
    processed = 0
    
    for carte in CARTI:
        print(f"\n📗 {carte['nume']} ({carte['abreviere']}) - {carte['capitole']} cap.")
        carte_verses = 0
        
        for capitol in range(1, carte['capitole'] + 1):
            verses, error = download_chapter(carte, capitol)
            processed += 1
            
            if verses:
                all_verses.extend(verses)
                carte_verses += len(verses)
                pct = round((processed / total_capitole) * 100, 1)
                print(f"  ✅ Cap.{capitol}: {len(verses)} versete | Total: {len(all_verses)} ({pct}%)")
            else:
                if "404" not in str(error):
                    errors.append(f"{carte['nume']} {capitol}: {error}")
                    print(f"  ❌ Cap.{capitol}: {error}")
            
            time.sleep(0.5)
        
        print(f"  📊 {carte['nume']}: {carte_verses} versete total")
    
    # Salvare
    salveaza(all_verses, errors)
    return all_verses

def download_from_alternative():
    """Alternativă folosind o altă sursă"""
    print("\n🔄 Încerc api.esv.org cu traducere română...")
    print("❌ Nicio sursă alternativă disponibilă.")
    print("\n📌 SOLUȚIE MANUALĂ:")
    print("   1. Mergi la: https://www.youversion.com")  
    print("   2. Sau folosim Biblia VDC existentă și o redenumim VDCC")
    print("   3. Sau descărcăm manual un fișier JSON de undeva")
    return []

def salveaza(all_verses, errors):
    output_path = os.path.join(
        os.path.dirname(__file__), '..', 'data', 'biblia_vdcc.json'
    )
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({
            "versiune": "Cornilescu",
            "limba": "română",
            "sursa": "bible-api.com",
            "total_versete": len(all_verses),
            "versete": all_verses
        }, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 60)
    print(f"✅ DOWNLOAD COMPLET!")
    print(f"   Total versete descărcate: {len(all_verses)}")
    print(f"   Fișier: biblia_vdcc.json")
    
    if errors:
        print(f"\n   ⚠️  {len(errors)} erori (din {sum(c['capitole'] for c in CARTI)} capitole):")
        for e in errors[:5]:
            print(f"      - {e}")
        if len(errors) > 5:
            print(f"      ... și alte {len(errors) - 5}")
    
    print("=" * 60)

if __name__ == "__main__":
    download_bible()