"""
Membersihkan data SITC ekspor & impor BPS, lalu membuat:
  - data/processed/chapter0.json   -> dipakai Bab 0 (di-import langsung oleh Next.js)
  - public/data/sitc_clean.json    -> data bersih tingkat kode 3-digit untuk bab berikutnya

Jalankan dari root proyek:  python3 scripts/prepare_sitc.py
Satuan semua nilai: juta USD (sesuai file sumber).
"""
import json
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
OUT_PROCESSED = ROOT / "data" / "processed"
OUT_PUBLIC = ROOT / "public" / "data"

# Label pendek berbahasa Indonesia untuk komoditas yang muncul di 10 besar ekspor 2024/2025.
# Kode lain tetap memakai nama resmi SITC (bahasa Inggris).
LABEL_ID = {
    "321": "Batu bara",
    "422": "Minyak nabati (sawit)",
    "671": "Besi kasar & feroaloi",
    "343": "Gas alam & LNG",
    "283": "Bijih & konsentrat tembaga",
    "322": "Briket, lignit & gambut",
    "851": "Alas kaki",
    "284": "Bijih & produk antara nikel",
    "512": "Alkohol, fenol & turunannya",
    "781": "Mobil penumpang",
    "897": "Perhiasan",
}


def load(name: str) -> pd.DataFrame:
    df = pd.read_excel(RAW / name, dtype={"kode_1": str, "kode_2": str, "kode_3": str})
    df = df[df["kode_1"] != "Total"].copy()  # 1) buang baris Total
    df["kode_3"] = df["kode_3"].str.strip()
    return df


ekspor = load("sitc_ekspor.xlsx")
impor = load("sitc_impor.xlsx")

# 2) gabung dengan outer join, nilai kosong = 0
cols = ["kode_3", "nama_1", "nama_2", "nama_3", "fob_2024", "fob_2025"]
m = ekspor[cols].merge(impor[cols], on="kode_3", how="outer", suffixes=("_e", "_i"))

# 3) satu sumber label: utamakan file ekspor, isi dari impor untuk kode yang hanya ada di impor
for lvl in ["nama_1", "nama_2", "nama_3"]:
    m[lvl] = m[f"{lvl}_e"].combine_first(m[f"{lvl}_i"])
m = m.rename(
    columns={
        "fob_2024_e": "ekspor_2024",
        "fob_2025_e": "ekspor_2025",
        "fob_2024_i": "impor_2024",
        "fob_2025_i": "impor_2025",
    }
)
num = ["ekspor_2024", "ekspor_2025", "impor_2024", "impor_2025"]
m[num] = m[num].fillna(0.0)
m["kode_1"] = m["kode_3"].str[0]
m["kode_2"] = m["kode_3"].str[:2]

# Total nasional (termasuk emas moneter, sama dengan baris Total di file sumber)
totals = {}
for y in ("2024", "2025"):
    e, i = m[f"ekspor_{y}"].sum(), m[f"impor_{y}"].sum()
    totals[y] = {"ekspor": round(e, 3), "impor": round(i, 3), "neraca": round(e - i, 3)}

# 4) emas moneter (I00) dikeluarkan dari hirarki & ranking komoditas
gold_monetary = m[m["kode_3"] == "I00"]
m = m[m["kode_3"] != "I00"].copy()

# ---------- Bab 0: ranking ekspor ----------
top = set(m.nlargest(10, "ekspor_2024")["kode_3"]) | set(m.nlargest(10, "ekspor_2025")["kode_3"])
r = m[m["kode_3"].isin(top)].copy()
for y in ("2024", "2025"):
    r[f"rank_{y}"] = r[f"ekspor_{y}"].rank(ascending=False, method="first").astype(int)
    r[f"share_{y}"] = r[f"ekspor_{y}"] / totals[y]["ekspor"] * 100

missing = sorted(set(r["kode_3"]) - set(LABEL_ID))
if missing:
    print("PERINGATAN: belum ada label Indonesia untuk kode", missing)

ranking = [
    {
        "kode": row.kode_3,
        "label": LABEL_ID.get(row.kode_3, row.nama_3),
        "namaResmi": row.nama_3,
        "ekspor2024": round(row.ekspor_2024, 3),
        "ekspor2025": round(row.ekspor_2025, 3),
        "share2024": round(row.share_2024, 2),
        "share2025": round(row.share_2025, 2),
        "rank2024": int(row.rank_2024),
        "rank2025": int(row.rank_2025),
    }
    for row in r.sort_values("rank_2025").itertuples()
]

top10_share = {
    y: round(m.nlargest(10, f"ekspor_{y}")[f"ekspor_{y}"].sum() / totals[y]["ekspor"] * 100, 2)
    for y in ("2024", "2025")
}

chapter0 = {
    "satuan": "juta USD",
    "totals": totals,
    "ranking": ranking,
    "top10Share": top10_share,
    "jumlahKodeEkspor2025": int((m["ekspor_2025"] > 0).sum()),
    "emasMoneter": {
        "ekspor2025": round(float(gold_monetary["ekspor_2025"].sum()), 3),
        "catatan": "Termasuk di total nasional, dikeluarkan dari ranking komoditas.",
    },
}

# ---------- Data bersih untuk bab berikutnya ----------
clean = m[["kode_1", "kode_2", "kode_3", "nama_1", "nama_2", "nama_3"] + num].sort_values("kode_3")
clean_records = clean.round(4).to_dict(orient="records")

OUT_PROCESSED.mkdir(parents=True, exist_ok=True)
OUT_PUBLIC.mkdir(parents=True, exist_ok=True)
(OUT_PROCESSED / "chapter0.json").write_text(
    json.dumps(chapter0, ensure_ascii=False, indent=2), encoding="utf-8"
)
(OUT_PUBLIC / "sitc_clean.json").write_text(
    json.dumps(clean_records, ensure_ascii=False), encoding="utf-8"
)

# ---------- Ringkasan untuk dicek manual ----------
print("Total 2024:", totals["2024"])
print("Total 2025:", totals["2025"])
print("Pangsa 10 besar ekspor (%):", top10_share)
print("Jumlah kode komoditas (tanpa emas moneter):", len(clean))
print("Selesai: data/processed/chapter0.json dan public/data/sitc_clean.json")
