"""
Bab penutup: daerah-daerah yang bersama-sama menghasilkan separuh PDRB Indonesia.

Masukan : data/processed/chapter6.json, data/reference/crosswalk_kab_kota.csv,
          data/raw/indonesia_kab_kota.zip (untuk luas wilayah)
Keluaran: data/processed/chapter7.json

Luas dihitung dari poligon GeoJSON asli pada proyeksi luas-sama (EPSG:6933),
sehingga ini luas daratan menurut batas administrasi di GeoJSON, bukan angka resmi BPS.
Jalankan SETELAH prepare_massa.py:  python3 scripts/prepare_penutup.py
"""
import json
import tempfile
import zipfile
from pathlib import Path

import geopandas as gpd
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
ch6 = json.loads((ROOT / "data" / "processed" / "chapter6.json").read_text(encoding="utf-8"))
d = pd.DataFrame(ch6["daerah"]).sort_values("total", ascending=False).reset_index(drop=True)

T = d["total"].sum()
kum = d["total"].cumsum() / T
n = int((kum < 0.5).sum() + 1)
separuh = d.iloc[:n]

with zipfile.ZipFile(ROOT / "data" / "raw" / "indonesia_kab_kota.zip") as z:
    nama = [x for x in z.namelist() if x.endswith(".geojson")][0]
    tmp = Path(tempfile.mkdtemp())
    z.extract(nama, tmp)
geo = gpd.read_file(tmp / nama).to_crs(6933)
geo["luas"] = geo.geometry.area
cw = pd.read_csv(ROOT / "data" / "reference" / "crosswalk_kab_kota.csv", dtype=str)
geo = geo.merge(cw[["kode_bps", "kode_kemendagri"]], left_on="KDPKAB", right_on="kode_kemendagri")
luas = dict(zip(geo["kode_bps"], geo["luas"]))

out = {
    "jumlah": n,
    "ids": separuh["id"].tolist(),
    "porsiPdrb": round(float(separuh["total"].sum() / T * 100), 1),
    "porsiPenduduk": round(float(separuh["penduduk"].sum() / d["penduduk"].sum() * 100), 1),
    "porsiLuas": round(float(sum(luas[i] for i in separuh["id"]) / sum(luas.values()) * 100), 1),
    "jumlahJawa": int(separuh["prov"].isin(["31", "32", "33", "34", "35", "36"]).sum()),
}
(ROOT / "data" / "processed" / "chapter7.json").write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
print(f"{n} kab/kota: {out['porsiPdrb']}% PDRB, {out['porsiPenduduk']}% penduduk, {out['porsiLuas']}% luas; {out['jumlahJawa']} di Jawa")
