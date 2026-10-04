"""
Mengolah ekspor & impor Indonesia menurut negara (BPS), 2024-2025, untuk Bab 2.

Masukan:
  data/raw/ekspor_semua_negara_2024_2025.xlsx
  data/raw/impor_semua_negara_2024_2025.xlsx
  data/reference/negara_referensi.csv   (nama BPS -> ISO3, kawasan, koordinat)
  data/processed/chapter0.json          (total dari data SITC, untuk cek silang)
Keluaran:
  data/processed/chapter2.json

Satuan keluaran: juta USD (disamakan dengan data SITC).
Jalankan dari root proyek:  python3 scripts/prepare_negara.py
"""
import csv
import json
import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
REF = ROOT / "data" / "reference" / "negara_referensi.csv"
OUT = ROOT / "data" / "processed" / "chapter2.json"
TAHUN = ("2024", "2025")

masalah: list[str] = []


def baca(nama: str) -> tuple[pd.DataFrame, dict]:
    df = pd.read_excel(RAW / nama).replace("-", 0)
    for y in TAHUN:
        df[f"fob_{y}"] = pd.to_numeric(df[f"fob_{y}"])
    total = df[df["negara"] == "Total"].iloc[0]
    df = df[df["negara"] != "Total"].copy()
    tot = {y: float(total[f"fob_{y}"]) for y in TAHUN}
    for y in TAHUN:
        selisih = abs(df[f"fob_{y}"].sum() - tot[y])
        if selisih > 1_000_000:  # toleransi 1 juta USD (pembulatan / data rahasia)
            masalah.append(f"{nama} {y}: jumlah negara beda {selisih:,.0f} USD dari baris Total")
    return df, tot


ekspor, tot_e = baca("ekspor_semua_negara_2024_2025.xlsx")
impor, tot_i = baca("impor_semua_negara_2024_2025.xlsx")

ref = {r["nama_bps"]: r for r in csv.DictReader(REF.open(encoding="utf-8"))}
tak_dikenal = sorted((set(ekspor["negara"]) | set(impor["negara"])) - set(ref))
if tak_dikenal:
    masalah.append(f"Nama negara belum ada di negara_referensi.csv: {tak_dikenal}")

if masalah:
    print("PENGECEKAN GAGAL:")
    for m in masalah:
        print("  -", m)
    sys.exit(1)

# Gabung per ISO3: menyatukan nama ganda di BPS (mis. "Libia" dan "Libya")
for df in (ekspor, impor):
    df["iso3"] = df["negara"].map(lambda n: ref[n]["iso3"])
e = ekspor.groupby("iso3")[[f"fob_{y}" for y in TAHUN]].sum()
i = impor.groupby("iso3")[[f"fob_{y}" for y in TAHUN]].sum()
m = e.join(i, how="outer", lsuffix="_e", rsuffix="_i").fillna(0.0)

ref_iso = {}
for r in ref.values():
    ref_iso.setdefault(r["iso3"], r)

# Indonesia sendiri muncul sebagai mitra (barang yang diekspor/diimpor kembali).
# Tidak bisa digambar sebagai aliran, jadi dipisahkan dan dicatat.
indonesia = {}
if "IDN" in m.index:
    row = m.loc["IDN"]
    indonesia = {f"{a}{y}": round(row[f"fob_{y}_{s}"] / 1e6, 3) for y in TAHUN for a, s in (("ekspor", "e"), ("impor", "i"))}
    m = m.drop(index="IDN")

mitra = []
for iso, row in m.iterrows():
    r = ref_iso[iso]
    item = {
        "iso3": iso,
        "nama": r["nama_tampil"],
        "kawasan": r["kawasan"],
        "ccn3": r["ccn3"],  # kode numerik ISO, untuk mencocokkan poligon peta dasar
        "lat": float(r["lat"]),
        "lon": float(r["lon"]),
    }
    for y in TAHUN:
        item[f"ekspor{y}"] = round(row[f"fob_{y}_e"] / 1e6, 3)  # juta USD
        item[f"impor{y}"] = round(row[f"fob_{y}_i"] / 1e6, 3)
    mitra.append(item)
mitra.sort(key=lambda d: -(d["ekspor2025"] + d["impor2025"]))

totals = {
    y: {
        "ekspor": round(tot_e[y] / 1e6, 3),
        "impor": round(tot_i[y] / 1e6, 3),
        # Dihitung dari nilai USD asli, sebelum dibulatkan ke juta USD. Pembulatan 3 desimal
        # membuat mitra bernilai di bawah 500 USD terbaca nol dan tidak terhitung.
        "jumlahMitraEkspor": int((m[f"fob_{y}_e"] > 0).sum()),
        "jumlahMitraImpor": int((m[f"fob_{y}_i"] > 0).sum()),
        "jumlahMitraDagang": int(((m[f"fob_{y}_e"] > 0) | (m[f"fob_{y}_i"] > 0)).sum()),
    }
    for y in TAHUN
}

# Cek silang dengan total data SITC (Bab 0). Harus sama, karena sumbernya sama.
ch0 = json.loads((ROOT / "data" / "processed" / "chapter0.json").read_text(encoding="utf-8"))
for y in TAHUN:
    for k in ("ekspor", "impor"):
        d = abs(totals[y][k] - ch0["totals"][y][k])
        if d > 1:  # 1 juta USD
            masalah.append(f"Total {k} {y} beda {d:.1f} juta USD dengan data SITC")
if masalah:
    print("PENGECEKAN GAGAL:")
    for m_ in masalah:
        print("  -", m_)
    sys.exit(1)

OUT.write_text(
    json.dumps(
        {
            "satuan": "juta USD",
            "totals": totals,
            "mitra": mitra,
            "indonesiaSendiri": indonesia,
            "catatan": "Nilai ekspor FOB. Mitra 'Indonesia' (barang diekspor/diimpor kembali) dikeluarkan dari peta.",
        },
        ensure_ascii=False,
        indent=2,
    ),
    encoding="utf-8",
)
print(f"{len(mitra)} mitra dagang. Total cocok dengan data SITC.")
print("Selesai: data/processed/chapter2.json")