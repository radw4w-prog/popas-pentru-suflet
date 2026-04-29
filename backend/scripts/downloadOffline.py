# downloadOffline.py - Fix BOM + procesare corecta
import requests
import json
import os

session = requests.Session()
session.verify = False

import urllib3
urllib3.disable_warnings()

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../data')
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'versete_complete.json')

print("📥 Descarcare Biblie Cornilescu...")
print()

URL = "https://raw.githubusercontent.com/thiagobodruk/bible/master/json/ro_cornilescu.json"

try:
    print(f"🌐 Descarcare din GitHub...")
    r = session.get(URL, timeout=60)
    print(f"   Status: {r.status_code}")
    print(f"   Size: {len(r.content)} bytes")
    
    # ✅ Fix BOM - folosim utf-8-sig in loc de utf-8
    continut = r.content.decode('utf-8-sig')
    data_raw = json.loads(continut)
    print(f"   ✅ JSON parsat cu succes!")
    print(f"   Tip: {type(data_raw)}")
    if isinstance(data_raw, list):
        print(f"   Carti: {len(data_raw)}")

except Exception as e:
    print(f"❌ Eroare: {e}")
    exit(1)

# ═══ PROCESARE DATE ═══
print()
print("⚙️  Procesare versete...")

versete = []

CARTI_INFO = [
    ("Geneza","Gen","VT"),("Exodul","Ex","VT"),("Leviticul","Lev","VT"),
    ("Numeri","Num","VT"),("Deuteronomul","Deut","VT"),("Iosua","Ios","VT"),
    ("Judecatori","Jud","VT"),("Rut","Rut","VT"),("1 Samuel","1Sam","VT"),
    ("2 Samuel","2Sam","VT"),("1 Imparati","1Imp","VT"),("2 Imparati","2Imp","VT"),
    ("1 Cronici","1Cron","VT"),("2 Cronici","2Cron","VT"),("Ezra","Ezra","VT"),
    ("Neemia","Neem","VT"),("Estera","Est","VT"),("Iov","Iov","VT"),
    ("Psalmi","Ps","VT"),("Proverbe","Prov","VT"),("Eclesiastul","Ecl","VT"),
    ("Cantarea Cantarilor","Cant","VT"),("Isaia","Is","VT"),("Ieremia","Ier","VT"),
    ("Plangerile","Plang","VT"),("Ezechiel","Iez","VT"),("Daniel","Dan","VT"),
    ("Osea","Os","VT"),("Ioel","Ioel","VT"),("Amos","Amos","VT"),
    ("Obadia","Obad","VT"),("Iona","Iona","VT"),("Mica","Mica","VT"),
    ("Naum","Naum","VT"),("Habacuc","Hab","VT"),("Tefania","Tef","VT"),
    ("Hagai","Hag","VT"),("Zaharia","Zah","VT"),("Maleahi","Mal","VT"),
    ("Matei","Mat","NT"),("Marcu","Mar","NT"),("Luca","Luc","NT"),
    ("Ioan","Ioan","NT"),("Faptele Apostolilor","FA","NT"),("Romani","Rom","NT"),
    ("1 Corinteni","1Cor","NT"),("2 Corinteni","2Cor","NT"),("Galateni","Gal","NT"),
    ("Efeseni","Ef","NT"),("Filipeni","Fil","NT"),("Coloseni","Col","NT"),
    ("1 Tesaloniceni","1Tes","NT"),("2 Tesaloniceni","2Tes","NT"),
    ("1 Timotei","1Tim","NT"),("2 Timotei","2Tim","NT"),("Tit","Tit","NT"),
    ("Filimon","Flm","NT"),("Evrei","Evr","NT"),("Iacov","Iac","NT"),
    ("1 Petru","1Pet","NT"),("2 Petru","2Pet","NT"),("1 Ioan","1Ioan","NT"),
    ("2 Ioan","2Ioan","NT"),("3 Ioan","3Ioan","NT"),("Iuda","Iuda","NT"),
    ("Apocalipsa","Apoc","NT")
]

# Detecteaza structura automata
print(f"   Detectare structura JSON...")

if isinstance(data_raw, list) and len(data_raw) > 0:
    primul = data_raw[0]
    print(f"   Primul element: {list(primul.keys()) if isinstance(primul, dict) else type(primul)}")
    
    for carte_idx, carte_data in enumerate(data_raw):
        if carte_idx >= len(CARTI_INFO):
            break
            
        nume, abrev, testament = CARTI_INFO[carte_idx]
        
        # Detecteaza cheia pentru capitole
        capitole = None
        for cheie in ['chapters', 'verses', 'chapter', 'books']:
            if cheie in carte_data:
                capitole = carte_data[cheie]
                break
        
        if capitole is None:
            # Poate e direct lista de capitole
            if isinstance(carte_data, list):
                capitole = carte_data
        
        if not capitole:
            print(f"   ⚠️  {nume}: structura necunoscuta - {list(carte_data.keys()) if isinstance(carte_data, dict) else type(carte_data)}")
            continue
        
        versete_carte = 0
        
        for cap_idx, capitol in enumerate(capitole):
            cap_nr = cap_idx + 1
            
            # Capitol poate fi lista sau dict
            if isinstance(capitol, list):
                for v_idx, verset in enumerate(capitol):
                    text = ""
                    if isinstance(verset, str):
                        text = verset.strip()
                    elif isinstance(verset, dict):
                        text = verset.get('verse', verset.get('text', verset.get('t', ''))).strip()
                    
                    if text:
                        v_nr = v_idx + 1
                        versete.append({
                            "carte": nume,
                            "abreviere": abrev,
                            "testament": testament,
                            "capitol": cap_nr,
                            "verset": v_nr,
                            "text": text,
                            "referinta": f"{abrev} {cap_nr}:{v_nr}",
                            "tema": [],
                            "favorit": False
                        })
                        versete_carte += 1
                        
            elif isinstance(capitol, dict):
                for v_key, v_val in capitol.items():
                    text = ""
                    if isinstance(v_val, str):
                        text = v_val.strip()
                    elif isinstance(v_val, dict):
                        text = v_val.get('verse', v_val.get('text', '')).strip()
                    
                    try:
                        v_nr = int(v_key)
                    except:
                        continue
                    
                    if text:
                        versete.append({
                            "carte": nume,
                            "abreviere": abrev,
                            "testament": testament,
                            "capitol": cap_nr,
                            "verset": v_nr,
                            "text": text,
                            "referinta": f"{abrev} {cap_nr}:{v_nr}",
                            "tema": [],
                            "favorit": False
                        })
                        versete_carte += 1
        
        print(f"   ✅ {nume}: {versete_carte} versete")

elif isinstance(data_raw, dict):
    # Format dict
    print(f"   Chei principale: {list(data_raw.keys())[:5]}")
    
    for carte_idx, (nume, abrev, testament) in enumerate(CARTI_INFO):
        # Incearca diferite formate
        carte_data = (
            data_raw.get(str(carte_idx + 1)) or
            data_raw.get(abrev) or
            data_raw.get(nume) or
            None
        )
        
        if not carte_data:
            continue
            
        versete_carte = 0
        capitole = carte_data if isinstance(carte_data, list) else carte_data.get('chapters', [])
        
        for cap_idx, capitol in enumerate(capitole):
            cap_nr = cap_idx + 1
            vv = capitol if isinstance(capitol, list) else capitol.get('verses', [])
            
            for v_idx, verset in enumerate(vv):
                text = verset if isinstance(verset, str) else verset.get('text', '')
                if text:
                    v_nr = v_idx + 1
                    versete.append({
                        "carte": nume,
                        "abreviere": abrev,
                        "testament": testament,
                        "capitol": cap_nr,
                        "verset": v_nr,
                        "text": text.strip(),
                        "referinta": f"{abrev} {cap_nr}:{v_nr}",
                        "tema": [],
                        "favorit": False
                    })
                    versete_carte += 1
        
        if versete_carte > 0:
            print(f"   ✅ {nume}: {versete_carte} versete")

# ═══ SALVARE ═══
print()
if versete:
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(versete, f, ensure_ascii=False, indent=2)
    
    vt = sum(1 for v in versete if v['testament'] == 'VT')
    nt = sum(1 for v in versete if v['testament'] == 'NT')
    carti_unice = len(set(v['carte'] for v in versete))
    
    print("=" * 50)
    print(f"✅ SUCCES!")
    print(f"📊 Total versete:  {len(versete)}")
    print(f"📖 Test. Vechi:    {vt}")
    print(f"📖 Test. Nou:      {nt}")
    print(f"📚 Carti:          {carti_unice}/66")
    print(f"💾 Salvat:         {OUTPUT_FILE}")
    print()
    print("🚀 Acum ruleaza:")
    print("   node importBible.js")
else:
    print("❌ Nu s-au putut extrage versete!")
    print()
    print("📋 Debug - primele date:")
    print(json.dumps(data_raw[0] if isinstance(data_raw, list) else data_raw, 
                     ensure_ascii=False, indent=2)[:500])