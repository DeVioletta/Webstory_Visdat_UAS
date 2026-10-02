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

## Struktur folder

```
app/                 halaman dan gaya global
components/ui/       komponen bersama (header, caption, hook scroll, kerangka bab)
components/chapter0/ komponen Bab 0
components/chapter1/ komponen Bab 1 (Sankey dan grafik garis batu bara)
content/             semua teks webstory, dipisah dari kode
data/raw/            file Excel asli dari BPS
data/processed/      JSON hasil olahan yang di-import kode
public/data/         JSON yang diambil lewat fetch di browser
lib/                 fungsi format angka
scripts/             skrip Python pengolah data
```

## Deploy ke Vercel

1. Push folder ini ke repositori GitHub.
2. Di vercel.com: Add New, Project, pilih repositori, Deploy.
   Vercel mendeteksi Next.js otomatis, tidak perlu pengaturan tambahan.
3. Setiap push ke branch utama akan otomatis di-deploy ulang.

Catatan: Vercel tidak menjalankan skrip Python. Jalankan `npm run data`
di komputer sendiri dan commit file JSON hasilnya.
