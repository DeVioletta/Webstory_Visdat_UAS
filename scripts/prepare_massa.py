"""
Bab 6: massa ekonomi (PDRB total) dan ketimpangan antarwilayah.

Masukan:
  data/raw/pdrb_adhb_kab_2025.xlsx                  PDRB ADHB kab/kota, miliar rupiah, kode BPS
  data/raw/pdrb_adhb_perkapita_2025.xlsx            PDRB per kapita ADHB kab/kota, ribu rupiah
  data/raw/pdrb_perkapita_adhb_provinsi_2025.xlsx   PDRB per kapita ADHB provinsi, ribu rupiah
  data/raw/indonesia_kab_kota.zip                   GeoJSON (untuk titik simbol)
  data/reference/crosswalk_kab_kota.csv             padanan kode BPS <-> Kemendagri (dari prepare_pdrb.py)
  public/data/kabkota.topo.json                     batas web (dari prepare_pdrb.py)
Keluaran:
  data/processed/chapter6.json
  public/data/provinsi.topo.json                    batas provinsi hasil penggabungan kab/kota

Penduduk TIDAK diambil dari tabel terpisah, melainkan diturunkan:
  penduduk = PDRB total / PDRB per kapita
Keduanya data BPS, jadi hasilnya konsisten dengan angka PDRB yang dipetakan.

Jalankan SETELAH prepare_pdrb.py:  python3 scripts/prepare_massa.py
"""
import json
import re
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

import geopandas as gpd
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"


def kode(v) -> str:
    return f"{float(v):.2f}"  # 11.1 -> "11.10"


def kunci(s: str) -> str:
    s = re.sub(r"^(kab\.?\s+|kabupaten\s+|kota\s+)", "", str(s).strip().lower())
    return re.sub(r"[^a-z]", "", s)


# ---------- 1. PDRB total + per kapita (sama-sama kode BPS) ----------
total = pd.read_excel(RAW / "pdrb_adhb_kab_2025.xlsx")
total["kode_bps"] = total["kodekab"].map(kode)
pk = pd.read_excel(RAW / "pdrb_adhb_perkapita_2025.xlsx")
pk["kode_bps"] = pk["kodekab"].map(kode)
m = total.merge(pk[["kode_bps", "kab_kota", "pdrb_adhb_perkapita_2025"]], on="kode_bps", how="outer", indicator=True)
if (m["_merge"] != "both").any():
    print("JOIN GAGAL antara PDRB total dan PDRB per kapita:")
    print(m[m["_merge"] != "both"].to_string())
    sys.exit(1)

# Nama yang berbeda hanya karena ejaan atau pergantian nama resmi (diperiksa manual)
NAMA_SAMA = {
    ("bireuen", "bireun"),
    ("padangsidimpuan", "padangsidempuan"),
    ("kepulauananambas", "kepanambas"),
    ("baru", "kotabaru"),  # "Kota Baru" (Kab. Kotabaru) terbaca seolah awalan "Kota"
    ("mamujuutara", "pasangkayu"),
    ("malukutenggarabarat", "kepulauantanimbar"),
}
beda = m[m["Kabupaten/Kota"].map(kunci) != m["kab_kota"].map(kunci)]
tak_dikenal = [
    (r["kode_bps"], r["Kabupaten/Kota"], r["kab_kota"])
    for _, r in beda.iterrows()
    if (kunci(r["Kabupaten/Kota"]), kunci(r["kab_kota"])) not in NAMA_SAMA
]
if tak_dikenal:
    print("PERINGATAN: nama berbeda untuk kode yang sama, periksa manual:", tak_dikenal)
    sys.exit(1)

cw = pd.read_csv(ROOT / "data" / "reference" / "crosswalk_kab_kota.csv", dtype=str)
m = m.merge(cw[["kode_bps", "kode_kemendagri", "provinsi"]], on="kode_bps", how="left")
m["penduduk"] = m["pdrb_adhb_2025"] * 1e6 / m["pdrb_adhb_perkapita_2025"]  # miliar*1e9 / (ribu*1e3)

# ---------- 2. Titik simbol: representative point (selalu di dalam poligon) ----------
with zipfile.ZipFile(RAW / "indonesia_kab_kota.zip") as z:
    nama_geo = [n for n in z.namelist() if n.endswith(".geojson")][0]
    tmp = Path(tempfile.mkdtemp())
    z.extract(nama_geo, tmp)
geo = gpd.read_file(tmp / nama_geo)
geo["kode_kemendagri"] = geo["KDPKAB"].astype(str)
# Titik dihitung di proyeksi meter lalu dikembalikan ke derajat
pt = geo.to_crs(3857).representative_point().to_crs(4326)
geo["lon"], geo["lat"] = pt.x, pt.y
m = m.merge(geo[["kode_kemendagri", "KDPPUM", "lon", "lat"]], on="kode_kemendagri", how="left")
if m["lon"].isna().any():
    print("Titik tidak ditemukan untuk:", m[m["lon"].isna()]["kab_kota"].tolist())
    sys.exit(1)

# ---------- 3. Provinsi ----------
prov = pd.read_excel(RAW / "pdrb_perkapita_adhb_provinsi_2025.xlsx")
ALIAS_PROV = {"DI Yogyakarta": "Daerah Istimewa Yogyakarta"}
prov["provinsi"] = prov["Provinsi"].map(lambda p: ALIAS_PROV.get(p, p))
kode_prov = m.groupby("provinsi")["KDPPUM"].first()
hilang = sorted(set(prov["provinsi"]) ^ set(kode_prov.index))
if hilang:
    print("Nama provinsi tidak cocok:", hilang)
    sys.exit(1)

provinsi = []
for _, r in prov.iterrows():
    isi = m[m["provinsi"] == r["provinsi"]]
    hi = isi.loc[isi["pdrb_adhb_perkapita_2025"].idxmax()]
    lo = isi.loc[isi["pdrb_adhb_perkapita_2025"].idxmin()]
    provinsi.append({
        "id": str(kode_prov[r["provinsi"]]),
        "nama": r["provinsi"],
        "nilai": float(r["pdrb_perkapita_adhb_2025"]),  # ribu rupiah
        "jumlahKab": int(len(isi)),
        "tertinggi": {"nama": hi["kab_kota"], "nilai": round(float(hi["pdrb_adhb_perkapita_2025"]), 1)},
        "terendah": {"nama": lo["kab_kota"], "nilai": round(float(lo["pdrb_adhb_perkapita_2025"]), 1)},
        "pdrbTotal": round(float(isi["pdrb_adhb_2025"].sum()), 2),
    })

# ---------- 4. Ketimpangan antarwilayah (berbobot penduduk) ----------
T = m["pdrb_adhb_2025"].sum()
P = m["penduduk"].sum()
ybar = T * 1e6 / P  # ribu rupiah per penduduk
f = m["penduduk"] / P
y = m["pdrb_adhb_perkapita_2025"]
williamson = float(np.sqrt(((y - ybar) ** 2 * f).sum()) / ybar)

urut = m.sort_values("pdrb_adhb_perkapita_2025")
cp = np.concatenate([[0], np.cumsum(urut["penduduk"].to_numpy()) / P])
cy = np.concatenate([[0], np.cumsum(urut["pdrb_adhb_2025"].to_numpy()) / T])
gini = float(1 - np.sum((cp[1:] - cp[:-1]) * (cy[1:] + cy[:-1])))
porsi_bawah50 = float(np.interp(0.5, cp, cy))
porsi_atas10 = float(1 - np.interp(0.9, cp, cy))

besar = m.sort_values("pdrb_adhb_2025", ascending=False)
kum = np.cumsum(besar["pdrb_adhb_2025"].to_numpy()) / T
n_separuh = int(np.searchsorted(kum, 0.5) + 1)

PULAU = {
    "Sumatera": ["11", "12", "13", "14", "15", "16", "17", "18", "19", "21"],
    "Jawa": ["31", "32", "33", "34", "35", "36"],
    "Bali & Nusa Tenggara": ["51", "52", "53"],
    "Kalimantan": ["61", "62", "63", "64", "65"],
    "Sulawesi": ["71", "72", "73", "74", "75", "76"],
    "Maluku": ["81", "82"],
    "Papua": ["91", "92", "93", "94", "95", "96"],
}
pulau = [
    {
        "nama": k,
        "porsiPdrb": round(float(m[m["KDPPUM"].isin(v)]["pdrb_adhb_2025"].sum() / T * 100), 2),
        "porsiPenduduk": round(float(m[m["KDPPUM"].isin(v)]["penduduk"].sum() / P * 100), 2),
    }
    for k, v in PULAU.items()
]

# ---------- 5. Batas provinsi: gabungan kab/kota per kode provinsi ----------
mapshaper = ROOT / "node_modules" / ".bin" / "mapshaper"
subprocess.run(
    [
        str(mapshaper), "-i", str(ROOT / "public" / "data" / "kabkota.topo.json"),
        "-dissolve", "prov", "-rename-layers", "provinsi",
        "-o", "format=topojson", str(ROOT / "public" / "data" / "provinsi.topo.json"),
    ],
    check=True,
)

# ---------- 6. Simpan ----------
daerah = [
    {
        "id": r["kode_bps"],
        "nama": r["kab_kota"],
        "provinsi": r["provinsi"],
        "prov": str(r["KDPPUM"]),
        "total": round(float(r["pdrb_adhb_2025"]), 2),  # miliar rupiah
        "perKapita": round(float(r["pdrb_adhb_perkapita_2025"]), 1),  # ribu rupiah
        "penduduk": int(round(r["penduduk"])),
        "lon": round(float(r["lon"]), 4),
        "lat": round(float(r["lat"]), 4),
    }
    for _, r in m.iterrows()
]
# Kurva Lorenz diringkas menjadi 101 titik supaya file kecil
grid = np.linspace(0, 1, 101)
lorenz = [[round(float(g), 3), round(float(np.interp(g, cp, cy)), 4)] for g in grid]

out = {
    "satuan": {"total": "miliar rupiah", "perKapita": "ribu rupiah"},
    "tahun": 2025,
    "daerah": sorted(daerah, key=lambda d: -d["total"]),
    "provinsi": provinsi,
    "nasional": {
        "pdrbTotal": round(float(T), 1),
        "pendudukTurunan": int(round(P)),
        "perKapitaTertimbang": round(float(ybar), 1),
        "williamson": round(williamson, 3),
        "gini": round(gini, 3),
        "porsiBawah50": round(porsi_bawah50 * 100, 1),
        "porsiAtas10": round(porsi_atas10 * 100, 1),
        "nSeparuh": n_separuh,
    },
    "pulau": pulau,
    "lorenz": lorenz,
}
(ROOT / "data" / "processed" / "chapter6.json").write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
print(f"Penduduk turunan: {P / 1e6:.1f} juta. PDRB total: {T / 1000:,.1f} triliun rupiah.")
print(f"Indeks Williamson {williamson:.3f}, Gini {gini:.3f}. {n_separuh} kab/kota menghasilkan separuh PDRB.")
print("Selesai: data/processed/chapter6.json, public/data/provinsi.topo.json")
