"""
Bab 5: PDRB per kapita kabupaten/kota 2025, klasifikasi, dan autokorelasi spasial.

Masukan:
  data/raw/indonesia_kab_kota.zip          (GeoJSON batas kab/kota, kode Kemendagri)
  data/raw/pdrb_adhb_perkapita_2025.xlsx   (BPS, ribu rupiah, kode BPS)
Keluaran:
  data/reference/crosswalk_kab_kota.csv    (kode BPS <-> kode Kemendagri, untuk diperiksa)
  data/processed/chapter5.json             (nilai, kelas, Moran's I, LISA per daerah)
  public/data/kabkota.topo.json            (batas yang disederhanakan untuk web)

PENTING: GeoJSON memakai kode wilayah Kemendagri, sedangkan tabel PDRB memakai kode BPS.
Keduanya sama-sama berbentuk "11.01" tetapi menunjuk daerah yang BERBEDA (11.01 adalah
Aceh Selatan di Kemendagri, Simeulue di BPS). Karena itu join dilakukan lewat NAMA daerah
di dalam provinsi yang sama, lalu diperiksa harus cocok 1:1 untuk semua 514 daerah.

Moran's I dan LISA dihitung dari batas resolusi ASLI (sebelum disederhanakan).
Jalankan dari root proyek:  python3 scripts/prepare_pdrb.py
"""
import json
import re
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

import geopandas as gpd
import mapclassify
import numpy as np
import pandas as pd
from esda.moran import Moran, Moran_Local
from libpysal.weights import KNN, Queen, attach_islands

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
SEED = 2025
PERMUTASI = 999
ALPHA = 0.05
KELAS = 5

# ---------- 1. Baca data ----------
with zipfile.ZipFile(RAW / "indonesia_kab_kota.zip") as z:
    nama_geo = [n for n in z.namelist() if n.endswith(".geojson")][0]
    tmpdir = Path(tempfile.mkdtemp())
    z.extract(nama_geo, tmpdir)
geo = gpd.read_file(tmpdir / nama_geo)

pdrb = pd.read_excel(RAW / "pdrb_adhb_perkapita_2025.xlsx")
# kodekab terbaca sebagai angka (11.1 untuk 11.10). Selalu format ulang ke dua desimal.
pdrb["kode_bps"] = pdrb["kodekab"].map(lambda v: f"{float(v):.2f}")
pdrb["kodeprov"] = pdrb["kodeprov"].astype(int).astype(str)

# ---------- 2. Crosswalk lewat nama ----------
ALIAS = {
    "bireun": "bireuen",  # ejaan
    "tobasamosir": "toba",  # berganti nama menjadi Kab. Toba (2020)
    "siautagulandangbiaro": "kepulauansiautagulandangbiaro",  # nama resmi memakai "Kepulauan"
}


def kunci_nama(nama: str) -> str:
    s = str(nama).strip().lower()
    kota = bool(re.match(r"^kota\s", s))
    s = re.sub(r"^(kab\.?\s+|kabupaten\s+|kota\s+)", "", s)
    s = re.sub(r"^adm\.?\s*", "", s)  # "Kota Adm. Jakarta Barat", "Adm. Kep. Seribu"
    s = re.sub(r"\bkep\.\s*", "kepulauan ", s)
    s = re.sub(r"[^a-z]", "", s)
    s = ALIAS.get(s, s)
    return ("kota_" if kota else "") + s


pdrb["kunci"] = pdrb["kodeprov"] + "|" + pdrb["kab_kota"].map(kunci_nama)
geo["kunci"] = geo["KDPPUM"].astype(str) + "|" + geo["WADMKK"].map(kunci_nama)

gab = geo.merge(pdrb, on="kunci", how="outer", indicator=True)
tidak_cocok = gab[gab["_merge"] != "both"]
if len(tidak_cocok) or gab["kunci"].duplicated().any():
    print("JOIN GAGAL. Daerah yang tidak menemukan pasangan:")
    print(tidak_cocok[["kunci", "KDPKAB", "WADMKK", "kode_bps", "kab_kota"]].to_string())
    sys.exit(1)
gdf = gpd.GeoDataFrame(gab.drop(columns="_merge"), geometry="geometry", crs=geo.crs)

beda_kode = int((gdf["KDPKAB"] != gdf["kode_bps"]).sum())
print(f"Join lewat nama: {len(gdf)} daerah cocok 1:1. Kode BPS dan Kemendagri berbeda di {beda_kode} daerah.")

(ROOT / "data" / "reference").mkdir(parents=True, exist_ok=True)
gdf[["kode_bps", "KDPKAB", "kab_kota", "WADMKK", "WADMPR"]].rename(
    columns={"KDPKAB": "kode_kemendagri", "kab_kota": "nama_bps", "WADMKK": "nama_geojson", "WADMPR": "provinsi"}
).sort_values("kode_bps").to_csv(ROOT / "data" / "reference" / "crosswalk_kab_kota.csv", index=False)

# ---------- 3. Klasifikasi ----------
nilai = gdf["pdrb_adhb_perkapita_2025"].to_numpy()  # ribu rupiah
kuantil = mapclassify.Quantiles(nilai, k=KELAS)
jenks = mapclassify.FisherJenks(nilai, k=KELAS)

# ---------- 4. Autokorelasi spasial (resolusi asli) ----------
# Proyeksi ke meter supaya KNN untuk pulau memakai jarak yang benar
gdf_m = gdf.to_crs(3857)
w_queen = Queen.from_dataframe(gdf_m, use_index=False, silence_warnings=True)
pulau = list(w_queen.islands)
w_knn = KNN.from_dataframe(gdf_m.set_geometry(gdf_m.representative_point()), k=1)
w = attach_islands(w_queen, w_knn) if pulau else w_queen
w.transform = "r"

y = np.log(nilai)  # log: distribusi PDRB per kapita sangat miring
np.random.seed(SEED)
mi = Moran(y, w, permutations=PERMUTASI)
np.random.seed(SEED)
lisa = Moran_Local(y, w, permutations=PERMUTASI, seed=SEED)

KUADRAN = {1: "HH", 2: "LH", 3: "LL", 4: "HL"}
z = (y - y.mean()) / y.std()
lag = np.array([sum(w.weights[i][j] * z[nb] for j, nb in enumerate(w.neighbors[i])) for i in range(len(z))])
klaster = [KUADRAN[int(q)] if p < ALPHA else "NS" for q, p in zip(lisa.q, lisa.p_sim)]
print(f"Pulau tanpa tetangga darat (diberi 1 tetangga terdekat): {len(pulau)}")
print(f"Moran's I = {mi.I:.3f}, p (permutasi) = {mi.p_sim:.3f}, z = {mi.z_sim:.2f}")
print("Klaster LISA:", pd.Series(klaster).value_counts().to_dict())

# ---------- 5. Batas untuk web (disederhanakan) ----------
web = gdf[["kode_bps", "KDPPUM", "geometry"]].rename(columns={"kode_bps": "id", "KDPPUM": "prov"})
tmp_geo = tmpdir / "web.geojson"
web.to_file(tmp_geo, driver="GeoJSON")
out_topo = ROOT / "public" / "data" / "kabkota.topo.json"
mapshaper = ROOT / "node_modules" / ".bin" / "mapshaper"
subprocess.run(
    [
        str(mapshaper), "-i", str(tmp_geo), "name=kabkota",
        # keep-shapes: kota kecil (mis. Kota Kediri, Kota Magelang) tidak boleh hilang saat disederhanakan.
        # Jangan tambahkan -filter-slivers: opsi itu menghapus poligon kota kecil seluruhnya.
        "-simplify", "weighted", "2%", "keep-shapes",
        "-o", "format=topojson", "quantization=1e5", str(out_topo),
    ],
    check=True,
)
print(f"Batas web: {out_topo.relative_to(ROOT)} ({out_topo.stat().st_size / 1e6:.2f} MB)")

# Pastikan tidak ada daerah yang hilang geometrinya setelah penyederhanaan
topo = json.loads(out_topo.read_text(encoding="utf-8"))
kosong = [g["properties"]["id"] for g in topo["objects"]["kabkota"]["geometries"] if not g.get("type")]
if kosong:
    print("GAGAL: daerah kehilangan geometri setelah disederhanakan:", kosong)
    sys.exit(1)

# ---------- 6. Simpan ----------
daerah = []
for i, r in gdf.reset_index(drop=True).iterrows():
    daerah.append({
        "id": r["kode_bps"],
        "nama": r["kab_kota"],
        "provinsi": r["WADMPR"],
        "prov": str(r["KDPPUM"]),
        "nilai": round(float(r["pdrb_adhb_perkapita_2025"]), 1),  # ribu rupiah
        "z": round(float(z[i]), 4),
        "lag": round(float(lag[i]), 4),
        "lisa": klaster[i],
        "p": round(float(lisa.p_sim[i]), 4),
        "pulau": bool(i in pulau),
    })

ringkas = {
    "jumlah": len(daerah),
    "median": round(float(np.median(nilai)), 1),
    "rata": round(float(np.mean(nilai)), 1),
    "min": round(float(nilai.min()), 1),
    "maks": round(float(nilai.max()), 1),
}

out = {
    "satuan": "ribu rupiah",
    "tahun": 2025,
    "daerah": sorted(daerah, key=lambda d: d["id"]),
    "kelas": {
        "kuantil": [round(float(b), 1) for b in kuantil.bins],
        "jenks": [round(float(b), 1) for b in jenks.bins],
    },
    "moran": {
        "I": round(float(mi.I), 4),
        "EI": round(float(mi.EI), 4),
        "z": round(float(mi.z_sim), 3),
        "p": round(float(mi.p_sim), 4),
        "permutasi": PERMUTASI,
        "alpha": ALPHA,
        "variabel": "ln(PDRB per kapita ADHB)",
        "bobot": "Queen contiguity, standarisasi baris; daerah tanpa tetangga darat diberi 1 tetangga terdekat",
        "jumlahPulau": len(pulau),
    },
    "ringkas": ringkas,
}
(ROOT / "data" / "processed" / "chapter5.json").write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
print("Selesai: data/processed/chapter5.json")
