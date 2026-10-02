"""
Menyusun hirarki SITC (Section > Division > Group 3 digit) untuk Bab 3 (treemap)
dan Bab 4 (sunburst).

Masukan : public/data/sitc_clean.json   (hasil scripts/prepare_sitc.py)
Keluaran: data/processed/chapter3.json

Nilai tiap tingkat dijumlahkan dari kode 3 digit di bawahnya, untuk ekspor dan impor
TERPISAH. Indeks Spesialisasi Perdagangan (ISP) dihitung di browser dari jumlah itu,
bukan dari rata-rata ISP anak-anaknya.

Label Section dan Division: terjemahan bebas dari nomenklatur SITC Rev.4 (bukan
nomenklatur resmi BPS). Label 3 digit memakai nama resmi bahasa Inggris, kecuali
beberapa komoditas kunci yang dibahas di narasi.

Jalankan dari root proyek:  python3 scripts/prepare_treemap.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "data" / "sitc_clean.json"
OUT = ROOT / "data" / "processed" / "chapter3.json"

SECTION_ID = {
    "0": "Bahan makanan & hewan hidup",
    "1": "Minuman & tembakau",
    "2": "Bahan mentah nonpangan",
    "3": "Bahan bakar mineral",
    "4": "Minyak & lemak hewani/nabati",
    "5": "Bahan kimia",
    "6": "Barang manufaktur menurut bahan",
    "7": "Mesin & alat angkut",
    "8": "Barang manufaktur lainnya",
    "9": "Komoditas tidak terklasifikasi",
}

DIVISION_ID = {
    "00": "Hewan hidup (selain ikan)", "01": "Daging & olahannya", "02": "Susu, olahan susu & telur",
    "03": "Ikan, udang & hasil laut", "04": "Serealia & olahannya", "05": "Sayur & buah",
    "06": "Gula, olahan gula & madu", "07": "Kopi, teh, kakao & rempah", "08": "Pakan ternak",
    "09": "Aneka olahan makanan", "11": "Minuman", "12": "Tembakau & olahannya",
    "21": "Kulit mentah", "22": "Biji & buah berminyak", "23": "Karet mentah", "24": "Gabus & kayu",
    "25": "Pulp & kertas bekas", "26": "Serat tekstil", "27": "Pupuk alam & mineral mentah",
    "28": "Bijih logam & skrap", "29": "Bahan mentah hewani & nabati lain",
    "32": "Batu bara, kokas & briket", "33": "Minyak bumi & produknya", "34": "Gas alam & gas buatan",
    "35": "Arus listrik", "41": "Minyak & lemak hewani", "42": "Minyak & lemak nabati",
    "43": "Minyak & lemak olahan; lilin", "51": "Kimia organik", "52": "Kimia anorganik",
    "53": "Bahan pewarna & penyamak", "54": "Obat & farmasi", "55": "Minyak atsiri, parfum & pembersih",
    "56": "Pupuk buatan", "57": "Plastik bentuk primer", "58": "Plastik bentuk nonprimer",
    "59": "Bahan & produk kimia lain", "61": "Kulit olahan & barang kulit", "62": "Barang dari karet",
    "63": "Barang dari kayu & gabus", "64": "Kertas & barang kertas", "65": "Benang, kain & barang tekstil",
    "66": "Barang mineral nonlogam", "67": "Besi & baja", "68": "Logam bukan besi", "69": "Barang dari logam",
    "71": "Mesin pembangkit tenaga", "72": "Mesin industri khusus", "73": "Mesin pengerjaan logam",
    "74": "Mesin industri umum & suku cadang", "75": "Mesin kantor & komputer",
    "76": "Alat telekomunikasi & audio", "77": "Mesin & perlengkapan listrik", "78": "Kendaraan jalan raya",
    "79": "Alat angkut lainnya", "81": "Bangunan prafabrikasi & perlengkapan sanitasi", "82": "Furnitur",
    "83": "Barang perjalanan & tas", "84": "Pakaian & aksesori", "85": "Alas kaki",
    "87": "Instrumen ilmiah & pengukur", "88": "Alat fotografi, optik & jam", "89": "Barang manufaktur lain",
    "91": "Paket pos", "96": "Koin (bukan alat bayar sah)", "97": "Emas nonmoneter",
}

# Label Indonesia hanya untuk kode 3 digit yang dibahas di narasi. Sisanya nama resmi.
GROUP_ID = {
    "321": "Batu bara", "322": "Briket, lignit & gambut", "333": "Minyak mentah",
    "334": "Produk minyak olahan", "342": "LPG", "343": "Gas alam & LNG",
    "422": "Minyak nabati (sawit)", "671": "Besi kasar & feroaloi", "284": "Bijih & produk antara nikel",
    "283": "Bijih & konsentrat tembaga", "512": "Alkohol, fenol & turunannya", "851": "Alas kaki",
    "897": "Perhiasan", "781": "Mobil penumpang", "784": "Suku cadang kendaraan",
    "041": "Gandum", "042": "Beras", "061": "Gula & madu", "081": "Pakan ternak",
    "752": "Komputer & pengolah data", "764": "Peralatan telekomunikasi",
    "776": "Semikonduktor & komponen elektronik", "778": "Mesin listrik lainnya",
    "728": "Mesin industri khusus lain", "971": "Emas nonmoneter",
}


def nilai(rows):
    return {
        "2024": {"e": round(sum(r["ekspor_2024"] for r in rows), 3), "i": round(sum(r["impor_2024"] for r in rows), 3)},
        "2025": {"e": round(sum(r["ekspor_2025"] for r in rows), 3), "i": round(sum(r["impor_2025"] for r in rows), 3)},
    }


rows = json.loads(SRC.read_text(encoding="utf-8"))
missing = sorted({r["kode_2"] for r in rows} - set(DIVISION_ID)) + sorted({r["kode_1"] for r in rows} - set(SECTION_ID))
if missing:
    raise SystemExit(f"Kode tanpa label Indonesia: {missing}")

sections = []
for k1 in sorted({r["kode_1"] for r in rows}):
    r1 = [r for r in rows if r["kode_1"] == k1]
    divs = []
    for k2 in sorted({r["kode_2"] for r in r1}):
        r2 = [r for r in r1 if r["kode_2"] == k2]
        leaves = [
            {
                "id": r["kode_3"],
                "label": GROUP_ID.get(r["kode_3"], r["nama_3"]),
                "labelEn": r["nama_3"],
                "nilai": nilai([r]),
            }
            for r in sorted(r2, key=lambda x: x["kode_3"])
        ]
        divs.append({"id": k2, "label": DIVISION_ID[k2], "labelEn": r2[0]["nama_2"], "nilai": nilai(r2), "children": leaves})
    sections.append({"id": k1, "label": SECTION_ID[k1], "labelEn": r1[0]["nama_1"], "nilai": nilai(r1), "children": divs})

tree = {"id": "root", "label": "Semua komoditas", "labelEn": "All commodities", "nilai": nilai(rows), "children": sections}
OUT.write_text(json.dumps({"satuan": "juta USD", "tree": tree}, ensure_ascii=False), encoding="utf-8")
n_div = sum(len(s["children"]) for s in sections)
print(f"{len(sections)} section, {n_div} division, {len(rows)} kode 3 digit")
print("Selesai: data/processed/chapter3.json")
