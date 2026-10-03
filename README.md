# Kaya di Atas Kertas, Merata di Mana?

Webstory scrollytelling. Next.js (App Router) + TypeScript.
Bab 0 tanpa library grafik, Bab 1 memakai d3-sankey hanya untuk menghitung tata letak Sankey.

## Menjalankan di komputer sendiri

Prasyarat: Node.js 20 atau lebih baru, Python 3.10 atau lebih baru.

```bash
npm install                      # pasang dependensi
npm run dev                      # buka http://localhost:3000
```

## Memperbarui data

```bash
pip install -r scripts/requirements.txt
npm run data                     # menjalankan kedua skrip di bawah
```

- `scripts/prepare_sitc.py` membaca data SITC, menulis `data/processed/chapter0.json`
  dan `public/data/sitc_clean.json`.
- `scripts/prepare_energi.py` membaca neraca energi, mengecek keseimbangan neraca,
  lalu menulis `data/processed/chapter1.json`. Perbedaan yang sudah diketahui dari
  publikasi BPS dicatat di bagian atas skrip. Kalau muncul ketidakcocokan baru,
  skrip berhenti dan menampilkan selnya.
- `scripts/prepare_negara.py` membaca ekspor-impor per negara, mencocokkan nama
  negara dengan `data/reference/negara_referensi.csv`, mengecek total terhadap data
  SITC, lalu menulis `data/processed/chapter2.json`.
- `scripts/prepare_treemap.py` menyusun hirarki SITC (Section, Division, Group)
  dengan label Indonesia, menulis `data/processed/chapter3.json`. File ini dipakai
  bersama oleh Bab 3 (treemap) dan Bab 4 (sunburst).
- `scripts/prepare_pdrb.py` mencocokkan GeoJSON kab/kota (kode Kemendagri) dengan
  tabel PDRB (kode BPS) lewat nama daerah, menghitung kelas kuantil dan natural breaks,
  Moran's I dan LISA (dari batas resolusi asli), lalu menyederhanakan batas untuk web
  dengan mapshaper. Menulis `data/processed/chapter5.json`,
  `public/data/kabkota.topo.json`, dan `data/reference/crosswalk_kab_kota.csv`.
- `scripts/prepare_massa.py` (jalankan setelah prepare_pdrb.py) menggabungkan PDRB total
  dan per kapita kab/kota, PDRB per kapita provinsi, titik simbol, penduduk turunan,
  Indeks Williamson, Gini, kurva Lorenz, porsi per pulau, serta menggabungkan batas
  kab/kota menjadi batas provinsi. Menulis `data/processed/chapter6.json` dan
  `public/data/provinsi.topo.json`.
- `scripts/build_referensi_negara.py` (jarang perlu) membuat ulang tabel referensi
  negara. Jalankan hanya jika BPS memakai nama negara baru; tambahkan dulu namanya
  ke kamus `ISO` di dalam skrip.

## Struktur folder

```
app/                 halaman dan gaya global
components/ui/       komponen bersama (header, caption, hook scroll, kerangka bab)
components/chapter0/ komponen Bab 0
components/chapter1/ komponen Bab 1 (Sankey dan grafik garis batu bara)
components/chapter2/ komponen Bab 2 (flow map dan grafik neraca per mitra)
components/chapter3/ komponen Bab 3 (treemap dan daftar surplus/defisit)
components/chapter4/ komponen Bab 4 (sunburst perubahan 2024 ke 2025)
components/chapter5/ komponen Bab 5 (peta PDRB per kapita, histogram, diagram Moran)
components/chapter6/ komponen Bab 6 (peta provinsi/kab/kota + simbol, Lorenz, porsi pulau)
components/chapter7/ komponen Penutup (tiga temuan, cek daerahmu, catatan metodologi)
content/             semua teks webstory, dipisah dari kode
data/raw/            file Excel asli dari BPS
data/processed/      JSON hasil olahan yang di-import kode
data/reference/      tabel referensi negara (kode ISO, kawasan, koordinat)
public/data/         JSON yang diambil lewat fetch di browser
lib/                 fungsi format angka, skala warna, proyeksi dan zoom peta
scripts/             skrip Python pengolah data
```

## Deploy ke Vercel

1. Push folder ini ke repositori GitHub.
2. Di vercel.com: Add New, Project, pilih repositori, Deploy.
   Vercel mendeteksi Next.js otomatis, tidak perlu pengaturan tambahan.
3. Setiap push ke branch utama akan otomatis di-deploy ulang.

Catatan: Vercel tidak menjalankan skrip Python. Jalankan `npm run data`
di komputer sendiri dan commit file JSON hasilnya.
