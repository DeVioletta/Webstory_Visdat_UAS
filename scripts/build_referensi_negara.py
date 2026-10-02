"""
Membuat tabel referensi negara: nama BPS -> kode ISO3, kawasan, titik koordinat.
Ini data referensi geografis (bukan data statistik), dipakai untuk menggambar flow map.

Sumber koordinat & subkawasan: paket npm `world-countries` (mledoze/countries).
Hasil: data/reference/negara_referensi.csv  (sudah disertakan, skrip ini hanya perlu
dijalankan ulang jika BPS menambah nama negara baru).

Jalankan:  npm install  lalu  python3 scripts/build_referensi_negara.py
"""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WC = ROOT / "node_modules" / "world-countries" / "countries.json"
OUT = ROOT / "data" / "reference" / "negara_referensi.csv"

# Nama persis seperti di tabel BPS -> ISO 3166-1 alpha-3
ISO = {
    "Afganistan": "AFG", "Afrika Selatan": "ZAF", "Afrika Tengah": "CAF", "Albania": "ALB",
    "Aljazair": "DZA", "Amerika Serikat": "USA", "Andorra": "AND", "Angola": "AGO",
    "Anguilla": "AIA", "Antarktika": "ATA", "Antigua dan Barbuda": "ATG", "Antilla Belanda": "ANT",
    "Arab Saudi": "SAU", "Argentina": "ARG", "Armenia": "ARM", "Aruba": "ABW", "Australia": "AUS",
    "Austria": "AUT", "Azerbaijan": "AZE", "Bahama": "BHS", "Bahrain": "BHR", "Bangladesh": "BGD",
    "Barbados": "BRB", "Belanda": "NLD", "Belarus": "BLR", "Belgia": "BEL", "Belize": "BLZ",
    "Benin": "BEN", "Bermuda": "BMU", "Bhutan": "BTN", "Bolivia": "BOL",
    "Bonaire, Sint Eustatius dan Saba": "BES", "Bosnia-Herzegovina": "BIH", "Botswana": "BWA",
    "Brasil": "BRA", "Brunei Darussalam": "BRN", "Bulgaria": "BGR", "Burkina Faso": "BFA",
    "Burundi": "BDI", "Chad": "TCD", "Cile": "CHL", "Curacao": "CUW", "Denmark": "DNK",
    "Dominika": "DMA", "Ekuador": "ECU", "El Salvador": "SLV", "Eritrea": "ERI", "Estonia": "EST",
    "Etiopia": "ETH", "Fiji": "FJI", "Filipina": "PHL", "Finlandia": "FIN", "Gabon": "GAB",
    "Gambia": "GMB", "Georgia": "GEO", "Georgia Selatan dan Kepulauan Sandwich Selatan": "SGS",
    "Ghana": "GHA", "Gibraltar": "GIB", "Greenlandia": "GRL", "Grenada": "GRD", "Guadeloupe": "GLP",
    "Guam": "GUM", "Guatemala": "GTM", "Guernsey": "GGY", "Guinea": "GIN", "Guinea Bissau": "GNB",
    "Guinea Ekuatorial": "GNQ", "Guyana": "GUY", "Guyana Prancis": "GUF", "Haiti": "HTI",
    "Honduras": "HND", "Hong Kong": "HKG", "Hungaria": "HUN", "India": "IND", "Indonesia": "IDN",
    "Inggris": "GBR", "Irak": "IRQ", "Iran": "IRN", "Irlandia": "IRL", "Islandia": "ISL",
    "Israel": "ISR", "Italia": "ITA", "Jamaika": "JAM", "Jepang": "JPN", "Jerman": "DEU",
    "Jersey": "JEY", "Jibuti": "DJI", "Kaledonia Baru": "NCL", "Kamboja": "KHM", "Kamerun": "CMR",
    "Kanada": "CAN", "Kazakstan": "KAZ", "Kenya": "KEN", "Kepulauan Aland": "ALA",
    "Kepulauan Cayman": "CYM", "Kepulauan Christmas": "CXR", "Kepulauan Cocos (Keeling)": "CCK",
    "Kepulauan Cook": "COK", "Kepulauan Faeroe": "FRO", "Kepulauan Falkland": "FLK",
    "Kepulauan Mariana Utara": "MNP", "Kepulauan Marshall": "MHL", "Kepulauan Norfolk": "NFK",
    "Kepulauan Solomon": "SLB", "Kepulauan Terluar Kecil AS": "UMI", "Kepulauan Virgin (AS)": "VIR",
    "Kepulauan Virgin (Britania)": "VGB", "Kepulauan Virgin (British)": "VGB", "Kirgistan": "KGZ",
    "Kiribati": "KIR", "Kolombia": "COL", "Komoro": "COM", "Kongo": "COG", "Korea Selatan": "KOR",
    "Korea Utara": "PRK", "Kosovo": "UNK", "Kosta Rika": "CRI", "Kroasia": "HRV", "Kuba": "CUB",
    "Kuwait": "KWT", "Laos": "LAO", "Latvia": "LVA", "Lebanon": "LBN", "Lesotho": "LSO",
    "Liberia": "LBR", "Libia": "LBY", "Libya": "LBY", "Liechtenstein": "LIE", "Lituania": "LTU",
    "Luksemburg": "LUX", "Madagaskar": "MDG", "Makau": "MAC", "Makedonia": "MKD", "Maladewa": "MDV",
    "Malawi": "MWI", "Malaysia": "MYS", "Mali": "MLI", "Malta": "MLT", "Maroko": "MAR",
    "Martinik": "MTQ", "Mauritania": "MRT", "Mauritius": "MUS", "Mayotte": "MYT", "Meksiko": "MEX",
    "Mesir": "EGY", "Mikronesia": "FSM", "Moldova": "MDA", "Monako": "MCO", "Mongolia": "MNG",
    "Montenegro": "MNE", "Montserrat": "MSR", "Mozambik": "MOZ", "Myanmar": "MMR", "Namibia": "NAM",
    "Nauru": "NRU", "Nepal": "NPL", "Niger": "NER", "Nigeria": "NGA", "Nikaragua": "NIC",
    "Niue": "NIU", "Norwegia": "NOR", "Oman": "OMN", "Pakistan": "PAK", "Palau": "PLW",
    "Palestina": "PSE", "Panama": "PAN", "Pantai Gading": "CIV", "Papua Nugini": "PNG",
    "Paraguay": "PRY", "Peru": "PER", "Pitcairn": "PCN", "Polandia": "POL",
    "Polinesia Prancis": "PYF", "Portugal": "PRT", "Prancis": "FRA", "Puerto Riko": "PRI",
    "Pulau Bouvet": "BVT", "Pulau Heard dan Kepulauan McDonald": "HMD", "Pulau Man": "IMN",
    "Qatar": "QAT", "Republik Cheska": "CZE", "Republik Demokratik Kongo": "COD",
    "Republik Dominika": "DOM", "Reunion": "REU", "Rumania": "ROU", "Rusia": "RUS", "Rwanda": "RWA",
    "Sahara Barat": "ESH", "Saint Barthelemy": "BLM", "Saint Kitts dan Nevis": "KNA",
    "Saint Martin (Bagian Prancis)": "MAF", "Saint Vincent dan Grenadin": "VCT", "Samoa": "WSM",
    "Samoa Amerika": "ASM", "San Marino": "SMR", "Santa Helena": "SHN", "Santa Lusia": "LCA",
    "Sao Tome dan Principe": "STP", "Selandia Baru": "NZL", "Senegal": "SEN", "Serbia": "SRB",
    "Seychelles": "SYC", "Sierra Leone": "SLE", "Singapura": "SGP",
    "Sint Maarten (Bagian Belanda)": "SXM", "Siprus": "CYP", "Slovakia": "SVK", "Slovenia": "SVN",
    "Somalia": "SOM", "Spanyol": "ESP", "Sri Lanka": "LKA", "Sudan": "SDN", "Sudan Selatan": "SSD",
    "Suriah": "SYR", "Suriname": "SUR", "Svalbard dan Jan Mayen": "SJM", "Swaziland": "SWZ",
    "Swedia": "SWE", "Swiss": "CHE", "Taiwan": "TWN", "Tajikistan": "TJK", "Tanjung Verde": "CPV",
    "Tanzania": "TZA", "Thailand": "THA", "Timor Leste": "TLS", "Tiongkok": "CHN", "Togo": "TGO",
    "Tokelau": "TKL", "Tonga": "TON", "Trinidad dan Tobago": "TTO", "Tunisia": "TUN",
    "Turki": "TUR", "Turkmenistan": "TKM", "Turks dan Kepulauan Caicos": "TCA", "Tuvalu": "TUV",
    "Uganda": "UGA", "Ukraina": "UKR", "Uni Emirat Arab": "ARE", "Uruguay": "URY",
    "Uzbekistan": "UZB", "Vanuatu": "VUT", "Vatikan": "VAT", "Venezuela": "VEN", "Vietnam": "VNM",
    "Wallis dan Futuna": "WLF", "Wilayah Samudra Hindia Britania": "IOT",
    "Wilayah Selatan Prancis": "ATF", "Yaman": "YEM", "Yordania": "JOR", "Yunani": "GRC",
    "Zambia": "ZMB", "Zimbabwe": "ZWE",
}

# Nama tampilan (satu nama per kode, untuk kode yang muncul dengan dua ejaan di BPS)
NAMA_TAMPIL = {"LBY": "Libia", "VGB": "Kepulauan Virgin (Britania)"}

# Subkawasan PBB (world-countries) -> kawasan dalam bahasa Indonesia
KAWASAN = {
    "South-Eastern Asia": "Asia Tenggara",
    "Eastern Asia": "Asia Timur",
    "Southern Asia": "Asia Selatan & Tengah",
    "Central Asia": "Asia Selatan & Tengah",
    "Western Asia": "Timur Tengah",
    "Northern Africa": "Afrika",
    "Middle Africa": "Afrika",
    "Eastern Africa": "Afrika",
    "Western Africa": "Afrika",
    "Southern Africa": "Afrika",
    "Northern Europe": "Eropa",
    "Western Europe": "Eropa",
    "Southern Europe": "Eropa",
    "Eastern Europe": "Eropa",
    "Southeast Europe": "Eropa",
    "Central Europe": "Eropa",
    "North America": "Amerika Utara",
    "Northern America": "Amerika Utara",
    "Caribbean": "Amerika Latin & Karibia",
    "Central America": "Amerika Latin & Karibia",
    "South America": "Amerika Latin & Karibia",
    "Australia and New Zealand": "Oseania",
    "Melanesia": "Oseania",
    "Micronesia": "Oseania",
    "Polynesia": "Oseania",
}

# Wilayah yang tidak ada di world-countries
MANUAL = {
    "ANT": {"lat": 12.2, "lon": -69.0, "kawasan": "Amerika Latin & Karibia"},  # Antilla Belanda (sudah dibubarkan)
}

wc = {c["cca3"]: c for c in json.loads(WC.read_text(encoding="utf-8"))}
rows = []
for nama, iso in sorted(ISO.items()):
    if iso in MANUAL:
        info = MANUAL[iso]
        lat, lon, kaw = info["lat"], info["lon"], info["kawasan"]
    else:
        c = wc[iso]
        lat, lon = c["latlng"]
        sub = c.get("subregion") or ""
        if c["region"] == "Antarctic" or not sub:
            kaw = "Lainnya"
        else:
            kaw = KAWASAN[sub]
    rows.append({
        "nama_bps": nama,
        "iso3": iso,
        "ccn3": "" if iso in MANUAL else wc[iso].get("ccn3", ""),
        "nama_tampil": NAMA_TAMPIL.get(iso, nama),
        "kawasan": kaw,
        "lat": lat,
        "lon": lon,
    })

# Titik untuk negara besar dipindah ke pusat ekonomi/pelabuhan utama agar panah tidak
# berakhir di tengah gurun atau hutan. Ini pilihan kartografis, bukan data.
GESER = {
    "USA": (37.0, -100.0), "CAN": (49.0, -95.0), "RUS": (56.0, 40.0),
    "CHN": (32.0, 114.0), "AUS": (-30.0, 145.0), "BRA": (-15.0, -48.0), "IND": (21.0, 78.0),
}
for r in rows:
    if r["iso3"] in GESER:
        r["lat"], r["lon"] = GESER[r["iso3"]]

OUT.parent.mkdir(parents=True, exist_ok=True)
with OUT.open("w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
    w.writeheader()
    w.writerows(rows)
print(f"{len(rows)} nama ditulis ke {OUT.relative_to(ROOT)}")
