"""
Mengolah Neraca Energi Indonesia (BPS) menjadi data Bab 1:
  - Sankey 2024 dari Tabel 2 (data/raw/neraca_energi.xlsx)
  - Deret batu bara 2020-2024 dari Tabel 3 (data/raw/neraca_energi_komoditas_2020_2024.xlsx)

Keluaran: data/processed/chapter1.json
Jalankan dari root proyek:  python3 scripts/prepare_energi.py
Satuan: terajoule (TJ). Angka 2024 adalah angka sementara.
"""
import json
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
OUT = ROOT / "data" / "processed" / "chapter1.json"
TOL = 2  # toleransi pembulatan (TJ)

# ---------------------------------------------------------------------------
# Perbedaan yang SUDAH diketahui dan sesuai publikasi BPS.
# Pengecekan tidak akan gagal karena ini. Ketidakcocokan baru akan menghentikan skrip.
# ---------------------------------------------------------------------------
KNOWN_TABEL2 = {
    # Pencampuran biodiesel: biomassa olahan masuk kilang, keluar sebagai BBM berkadar berat.
    # Subtotal transformasi BBM berat sudah memuatnya, rincian kilang belum.
    ("energi_total", "neraca"),
    ("energi_total", "subtotal_transformasi"),
    ("bbm_berkadar_berat", "subtotal_transformasi"),
}
KNOWN_KOMODITAS = {
    ("briket_kokas", 2024, "persediaan"),  # stok 2024 angka sementara (beda dengan Tabel 2)
    ("bbm_berkadar_ringan", 2024, "neraca"),  # transfer 2024 angka sementara (beda dengan Tabel 2)
    ("bbm_berkadar_berat", 2020, "neraca"),  # sesuai publikasi
    ("batubara", 2020, "persediaan"),  # selisih kecil (155 TJ)
    ("batubara", 2020, "neraca"),
    ("lpg_gas_kilang", 2020, "persediaan"),
    ("lpg_gas_kilang", 2020, "neraca"),
    ("energi_indonesia", 2024, "neraca"),  # efek pencampuran biodiesel
}

masalah_baru: list[str] = []


def cek(kondisi_ok: bool, kunci: tuple, pesan: str, known: set):
    if not kondisi_ok and kunci not in known:
        masalah_baru.append(pesan)


# ============================ TABEL 2 (2024) ============================
t2 = (
    pd.read_excel(RAW / "neraca_energi.xlsx")
    .drop(columns="no")
    .set_index("produksi_dan_pemanfaatan")
    .replace("-", 0)
    .astype(float)
)
JENIS = [c for c in t2.columns if c != "energi_total"]
r = t2.loc

for j in JENIS + ["energi_total"]:
    c = t2[j]
    tpes = c["produksi_energi_primer"] + c["impor"] - c["ekspor"] - c["marine_aviation_bunkers"] + c["perubahan_stok"]
    cek(abs(tpes - c["total_persediaan_energi_primer"]) <= TOL, (j, "persediaan"), f"Tabel 2 {j}: persediaan", KNOWN_TABEL2)
    sub = c[["pabrik_briket", "pabrik_kokas", "kilang_gas", "tanur_tinggi", "kilang_minyak",
             "pembangkit_tenaga_listrik", "transfer_netto_bersih"]].sum()
    cek(abs(sub - c["transformasi_energi"]) <= TOL, (j, "subtotal_transformasi"),
        f"Tabel 2 {j}: subtotal transformasi", KNOWN_TABEL2)
    akhir = (c["total_persediaan_energi_primer"] + c["transformasi_energi"] - c["konsumsi_sektor_energi"]
             - c["tercecer_penyaluran_pengangkutan"] - c["konsumsi_bukan_untuk_energi"] - c["perbedaan_statistik"])
    cek(abs(akhir - c["konsumsi_akhir"]) <= TOL, (j, "neraca"), f"Tabel 2 {j}: neraca", KNOWN_TABEL2)

# ---------- Node Sankey ----------
LABEL_JENIS = {
    "batubara": "Batu bara",
    "briket_kokas": "Briket & kokas",
    "minyak_mentah_kondensat": "Minyak mentah",
    "bbm_berkadar_ringan": "BBM ringan",
    "bbm_berkadar_berat": "BBM berat",
    "hasil_olahan_minyak_lainnya": "Olahan minyak lain",
    "lpg_gas_kilang": "LPG & gas kilang",
    "gas_alam": "Gas alam",
    "listrik": "Listrik",
    "energi_biomassa": "Biomassa",
    "energi_biomassa_olahan_lainnya": "Biomassa olahan",
    "sumber_energi_lainnya": "Sumber lainnya",
}
KELUARGA = {
    "batubara": "batubara",
    "briket_kokas": "batubara",
    "minyak_mentah_kondensat": "minyak",
    "bbm_berkadar_ringan": "minyak",
    "bbm_berkadar_berat": "minyak",
    "hasil_olahan_minyak_lainnya": "minyak",
    "lpg_gas_kilang": "minyak",
    "gas_alam": "gas",
    "listrik": "listrik",
    "energi_biomassa": "biomassa",
    "energi_biomassa_olahan_lainnya": "biomassa",
    "sumber_energi_lainnya": "lainnya",
}
PROSES = {
    "pabrik_briket": "Pabrik briket",
    "pabrik_kokas": "Pabrik kokas",
    "kilang_gas": "Kilang gas",
    "kilang_minyak": "Kilang minyak",
    "pembangkit_tenaga_listrik": "Pembangkit listrik",
}
SEKTOR = {
    "industri_konstruksi_pertambangan_non_migas": "Industri",
    "transportasi": "Transportasi",
    "rumah_tangga": "Rumah tangga",
    "pertanian": "Pertanian",
    "konsumen_lainnya": "Komersial & lainnya",
}
TUJUAN_LAIN = {
    "ekspor": "Ekspor",
    "marine_aviation_bunkers": "Bunker kapal & pesawat",
    "konsumsi_bukan_untuk_energi": "Bahan baku (bukan energi)",
    "konsumsi_sektor_energi": "Dipakai sektor energi",
    "tercecer_penyaluran_pengangkutan": "Susut penyaluran",
}

nodes: dict[str, dict] = {}


def node(nid: str, label: str, peran: str, keluarga: str | None = None):
    nodes.setdefault(nid, {"id": nid, "label": label, "peran": peran, "keluarga": keluarga})


links: list[dict] = []


def link(src: str, tgt: str, val: float, keluarga: str):
    if val > 0.5:
        links.append({"source": src, "target": tgt, "value": round(val), "keluarga": keluarga})


node("produksi", "Produksi dalam negeri", "asal")
node("impor", "Impor", "asal")
node("stok_ambil", "Pengambilan stok", "asal")

for j in JENIS:
    c, kel = t2[j], KELUARGA[j]
    node(j, LABEL_JENIS[j], "jenis", kel)
    link("produksi", j, c["produksi_energi_primer"], kel)
    link("impor", j, c["impor"], kel)
    if c["perubahan_stok"] > 0:  # positif = stok diambil (menambah pasokan)
        link("stok_ambil", j, c["perubahan_stok"], kel)
    elif c["perubahan_stok"] < 0:  # negatif = stok bertambah
        node("stok_tambah", "Penambahan stok", "tujuan")
        link(j, "stok_tambah", -c["perubahan_stok"], kel)
    for k, lbl in TUJUAN_LAIN.items():
        node(k, lbl, "tujuan")
        link(j, k, c[k], kel)
    for k, lbl in SEKTOR.items():
        node(k, lbl, "tujuan")
        link(j, k, c[k], kel)

# Transformasi: nilai negatif = masukan proses, positif = keluaran proses
for p, lbl in PROSES.items():
    node(p, lbl, "proses")
    masuk = keluar = 0.0
    for j in JENIS:
        v = t2.loc[p, j]
        if p == "kilang_minyak" and j == "energi_biomassa_olahan_lainnya":
            continue  # ditangani sebagai node pencampuran biodiesel di bawah
        if v < 0:
            link(j, p, -v, KELUARGA[j])
            masuk += -v
        elif v > 0:
            link(p, j, v, KELUARGA[j])
            keluar += v
    sisa = masuk - keluar
    if sisa > 0:
        node("kehilangan", "Kehilangan konversi", "tujuan")
        link(p, "kehilangan", sisa, "lainnya")
    elif sisa < 0:
        # Keluaran lebih besar dari masukan tercatat (kilang gas). Ditampilkan apa adanya sebagai selisih.
        node("selisih", "Selisih neraca", "asal")
        link("selisih", p, -sisa, "lainnya")

# Pencampuran biodiesel ke BBM berkadar berat (tafsiran dikonfirmasi)
campur = -t2.loc["kilang_minyak", "energi_biomassa_olahan_lainnya"]
node("pencampuran", "Pencampuran biodiesel", "proses")
link("energi_biomassa_olahan_lainnya", "pencampuran", campur, "biomassa")
link("pencampuran", "bbm_berkadar_berat", campur, "biomassa")

# Cek keseimbangan tiap node jenis energi
for j in JENIS:
    masuk = sum(l["value"] for l in links if l["target"] == j)
    keluar = sum(l["value"] for l in links if l["source"] == j)
    if abs(masuk - keluar) > 5:
        masalah_baru.append(f"Sankey node {j} tidak seimbang: masuk {masuk}, keluar {keluar}")

used = {l["source"] for l in links} | {l["target"] for l in links}
node_list = [n for n in nodes.values() if n["id"] in used]

# Angka ringkas untuk narasi
pembangkit_masuk = sum(l["value"] for l in links if l["target"] == "pembangkit_tenaga_listrik")
ringkas = {
    "produksiTotal": round(r["produksi_energi_primer", "energi_total"]),
    "imporTotal": round(r["impor", "energi_total"]),
    "eksporTotal": round(r["ekspor", "energi_total"]),
    "konsumsiAkhirTotal": round(r["konsumsi_akhir", "energi_total"]),
    "batubaraProduksi": round(r["produksi_energi_primer", "batubara"]),
    "batubaraEkspor": round(r["ekspor", "batubara"]),
    "pembangkitMasuk": round(pembangkit_masuk),
    "pembangkitBatubara": round(-r["pembangkit_tenaga_listrik", "batubara"]),
    "listrikKeluar": round(r["pembangkit_tenaga_listrik", "listrik"]),
    "imporMinyak": round(sum(r["impor", j] for j in JENIS if KELUARGA[j] == "minyak")),
    "campurBiodiesel": round(campur),
}

# ===================== TABEL 3-13 (2020-2024) =====================
kom = pd.read_excel(RAW / "neraca_energi_komoditas_2020_2024.xlsx").set_index("Transaksi").replace("-", 0).astype(float)
kom.index = ["P", "M", "X", "B", "S", "TPES", "K", "TR", "SE", "L", "NE", "KA", "PS"]
jenis_kom = list(dict.fromkeys(c.rsplit("_", 1)[0] for c in kom.columns))
for j in jenis_kom:
    for y in range(2020, 2025):
        c = kom[f"{j}_{y}"]
        cek(abs(c["P"] + c["M"] - c["X"] - c["B"] + c["S"] - c["TPES"]) <= TOL, (j, y, "persediaan"),
            f"Tabel komoditas {j} {y}: persediaan", KNOWN_KOMODITAS)
        cek(abs(c["TPES"] + c["K"] + c["TR"] - c["SE"] - c["L"] - c["NE"] - c["PS"] - c["KA"]) <= TOL,
            (j, y, "neraca"), f"Tabel komoditas {j} {y}: neraca", KNOWN_KOMODITAS)

batubara = []
for y in range(2020, 2025):
    c = kom[f"batubara_{y}"]
    batubara.append({
        "tahun": y,
        "produksi": round(c["P"]),
        "ekspor": round(c["X"]),
        "impor": round(c["M"]),
        "konversi": round(-c["K"]),  # dipakai pembangkit listrik & pabrik kokas/briket
        "konsumsiAkhir": round(c["KA"]),  # langsung dipakai industri
        "pemakaianDalamNegeri": round(-c["K"] + c["KA"]),
    })

# Konsistensi antarsumber: batu bara 2024 di Tabel 3 harus sama dengan Tabel 2
b24 = kom["batubara_2024"]
for k3, k2 in [("P", "produksi_energi_primer"), ("X", "ekspor"), ("KA", "konsumsi_akhir"), ("K", "transformasi_energi")]:
    if abs(b24[k3] - r[k2, "batubara"]) > TOL:
        masalah_baru.append(f"Batu bara 2024 beda antara Tabel 2 dan Tabel 3 ({k3})")

if masalah_baru:
    print("PENGECEKAN GAGAL. Ketidakcocokan baru ditemukan:")
    for m in masalah_baru:
        print("  -", m)
    sys.exit(1)

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps({
    "satuan": "terajoule (TJ)",
    "tahunSankey": 2024,
    "sankey": {"nodes": node_list, "links": links},
    "ringkas": ringkas,
    "batubara": batubara,
}, ensure_ascii=False, indent=2), encoding="utf-8")

print(f"Sankey: {len(node_list)} node, {len(links)} aliran")
print("Ringkas:", ringkas)
print("Selesai: data/processed/chapter1.json")
