# Kaya di Atas Kertas, Merata di Mana?

*Webstory* interaktif tentang aliran energi, struktur perdagangan, dan ketimpangan ekonomi antarwilayah Indonesia, dibangun sepenuhnya dari data Badan Pusat Statistik (BPS).

**Tautan proyek:** https://amrestya-uas-visdat.vercel.app
**Repositori:** https://github.com/DeVioletta/Webstory_Visdat_UAS

---

## Sekilas tentang proyek

Pada 2025, ekspor barang Indonesia mencapai 282,5 miliar USD dengan surplus 41,1 miliar USD. Angka sebesar itu mudah dibaca sebagai tanda ekonomi yang kuat, tetapi tidak menunjukkan **apa** yang diperdagangkan, **ke mana** barang mengalir, dan **di mana** nilai ekonominya sebenarnya dihasilkan.

*Webstory* ini memperbesar angka nasional itu dalam tiga jarak, dari yang terjauh sampai yang terdekat:

1. **Aliran**: bagaimana energi dan barang masuk dan keluar dari Indonesia, dan dengan mitra mana?
2. **Struktur**: kelompok komoditas apa yang membentuk perdagangan, dan apa yang berubah dari 2024 ke 2025?
3. **Wilayah**: seberapa merata nilai ekonomi tersebar di antara 514 kabupaten/kota, dan apakah daerah yang serupa cenderung berdekatan?

Cerita disajikan dengan pola *scrollytelling*: grafik menempel di layar dan berubah mengikuti langkah cerita saat pembaca menggulir, sementara pembaca tetap bebas berinteraksi dengan setiap grafik. Sasaran pembacanya masyarakat umum dan mahasiswa yang tidak terbiasa membaca tabel statistik. Tampilan dirancang untuk laptop maupun ponsel.

Proyek ini dibuat untuk memenuhi tugas mata kuliah visualisasi data, dengan syarat tiga jenis data (aliran, hierarki, dan geospasial) yang masing-masing divisualisasikan dengan minimal dua teknik berbeda.

## Isi *webstory*

| Bab | Judul | Visualisasi | Interaksi utama |
|---|---|---|---|
| 0 | Ekspor naik, juaranya berganti | Kartu angka utama, peringkat 10 komoditas ekspor | Pilihan tahun, sorotan komoditas |
| 1 | Energi yang keluar, energi yang masuk | **Diagram Sankey** neraca energi 2024, grafik garis batu bara 2020–2024 | Sorot jenis energi, klik simpul, tampilkan atau sembunyikan garis |
| 2 | Satu mitra, dua arah yang timpang | **Peta aliran** perdagangan, batang neraca per mitra | Filter tahun, arah, kawasan, dan jumlah mitra; *zoom* dan geser |
| 3 | Yang dijual mentah, yang dibeli jadi | **Treemap** SITC tiga tingkat, daftar surplus dan defisit | *Drill-down*, *breadcrumb*, pilihan tahun |
| 4 | Yang tumbuh, yang menyusut | **Sunburst** perubahan 2024 ke 2025 | Pilihan ekspor, impor, atau total; *zoom* beranimasi |
| 5 | Kaya di atas kertas | **Peta choropleth** PDRB per kapita, histogram, peta dan diagram Moran (LISA) | Lapisan peta, metode klasifikasi, pencarian daerah, *zoom* |
| 6 | Rata-rata yang menyembunyikan | Peta provinsi dan kabupaten/kota, **peta simbol proporsional** PDRB total, kurva Lorenz, porsi per pulau | Lapisan dasar, lingkaran PDRB total, pembacaan kurva |
| 7 | Penutup | Ringkasan tiga temuan, profil per kabupaten/kota, catatan metodologi | Pencarian daerah |

Pemetaan ke syarat tugas:

- **Data aliran:** diagram Sankey (Bab 1) dan peta aliran (Bab 2).
- **Data hierarki:** treemap (Bab 3) dan sunburst (Bab 4), dengan hierarki Section, Division, dan Group SITC.
- **Data geospasial tingkat kabupaten/kota:** peta choropleth (Bab 5) dan peta simbol proporsional (Bab 6), ditambah analisis autokorelasi spasial LISA.

## Temuan utama

- **Batu bara keluar, minyak masuk.** Sekitar 63% produksi batu bara 2024 langsung diekspor, sementara nilai impor minyak mentah dan produk olahannya pada 2024 melebihi nilai ekspor batu bara.
- **Satu mitra, dua arah.** Tiongkok adalah tujuan ekspor terbesar sekaligus sumber impor terbesar; defisit dengannya melebar menjadi 20,4 miliar USD pada 2025.
- **Dijual mentah, dibeli jadi.** Mesin dan alat angkut menyumbang 34,6% impor, tetapi hanya 14,5% ekspor.
- **Rata-rata yang menyembunyikan.** PDRB per kapita antarkabupaten/kota berbeda sekitar 143 kali, dan hanya 40 dari 514 kabupaten/kota yang menghasilkan separuh PDRB. Indeks Williamson 1,125 dan Gini antarwilayah 0,435.
- **Daerah serupa cenderung berdekatan.** Moran's I sebesar 0,481 (p = 0,001); klaster tinggi-tinggi terkonsentrasi antara lain di Riau, Kalimantan Timur, dan DKI Jakarta.

## Data

Semua angka yang divisualisasikan berasal dari BPS. Data di luar BPS hanya dipakai untuk menggambar peta.

| Data | Sumber | Dipakai di |
|---|---|---|
| Ekspor dan impor menurut kode SITC, 2024–2025 | BPS, [*Statistik Perdagangan Luar Negeri Indonesia Menurut Kode SITC, 2024 dan 2025*](https://www.bps.go.id/id/publication/2026/08/31/e15722f0d16e51d9c64536a2/statistik-perdagangan-luar-negeri-indonesia-menurut-kode-sitc-2004-dan-2025.html) | Bab 0, 3, 4 |
| Ekspor dan impor menurut negara, 2024–2025 | [*Statistik Perdagangan Luar Negeri Indonesia Menurut Kode SITC, 2024 dan 2025*](https://www.bps.go.id/id/publication/2026/08/31/e15722f0d16e51d9c64536a2/statistik-perdagangan-luar-negeri-indonesia-menurut-kode-sitc-2004-dan-2025.html) | Bab 2 |
| Neraca energi 2024 dan 2020–2024 | BPS, [*Neraca Energi Indonesia 2020–2024*](https://www.bps.go.id/id/publication/2025/12/31/08fbe1e409d6fe8a83688144/energy-balances-of-indonesia-2020-2024.html) | Bab 1 |
| PDRB dan PDRB per kapita kabupaten/kota, 2025 | BPS, [*PDRB Kabupaten/Kota di Indonesia 2021–2025*](https://www.bps.go.id/id/publication/2026/06/10/234d5061d35a199c70e77766/produk-domestik-regional-bruto-kabupaten-kota-di-indonesia-2021-2025.html) | Bab 5, 6, 7 |
| PDRB per kapita provinsi, 2025 | BPS, [*PDRB Provinsi-Provinsi di Indonesia Menurut Lapangan Usaha 2021–2025*](https://www.bps.go.id/id/publication/2026/04/13/71d97fa95c70c5049deecbab/produk-domestik-regional-bruto-provinsi-provinsi-di-indonesia-menurut-lapangan-usaha-2021-2025.html) | Bab 6 |
| Batas 514 kabupaten/kota | [Lapak GIS](https://www.lapakgis.com/2022/01/shp-batas-kabupaten-kota-indonesia.html) (2022) | Bab 5, 6, 7 |
| Batas negara | Natural Earth 4.1.0 melalui [world-atlas](https://github.com/topojson/world-atlas) | Bab 2 |
| Kode ISO dan koordinat negara | [mledoze/countries](https://github.com/mledoze/countries) melalui paket world-countries | Bab 2 |

### Catatan data

- **Angka 2024 neraca energi berstatus sementara.** 
- **Emas moneter dikeluarkan dari hierarki komoditas** karena merupakan cadangan devisa, bukan barang dagangan. Total di Bab 3 dan 4 karena itu sedikit lebih kecil dari Bab 0; selisihnya dijelaskan di awal kedua bab. Emas non-moneter (SITC 971) tetap termasuk.
- **Kode wilayah Kemendagri dan BPS berbeda pada 171 dari 514 kabupaten/kota**, walaupun formatnya sama. Batas wilayah dan tabel PDRB karena itu digabung lewat nama daerah di dalam provinsi yang sama, bukan lewat kode. Padanan lengkapnya ada di `data/reference/crosswalk_kab_kota.csv`.
- **Jumlah penduduk diturunkan** dari PDRB total dibagi PDRB per kapita (total 284,4 juta jiwa), bukan diambil dari tabel kependudukan.
- **PDRB mengukur nilai produksi di suatu wilayah**, bukan pendapatan atau kesejahteraan penduduknya.

## Metode singkat

| Ukuran | Rumus atau keterangan | Bab |
|---|---|---|
| Indeks spesialisasi perdagangan | (ekspor − impor) / (ekspor + impor), dihitung dari nilai yang dijumlahkan di setiap tingkat hierarki | 3 |
| Persentase perubahan | (nilai 2025 − nilai 2024) / nilai 2024 × 100% | 4 |
| Klasifikasi peta | Kuantil lima kelas; Fisher-Jenks sebagai pembanding | 5 |
| Moran's I dan LISA | Logaritma PDRB per kapita, bobot *queen contiguity* baku baris, satu tetangga terdekat untuk 33 daerah kepulauan, 999 permutasi, α = 0,05 | 5 |
| Indeks Williamson | √[Σ (yᵢ − ȳ)² · Pᵢ/P] / ȳ, dengan ȳ rata-rata PDRB per kapita tertimbang penduduk | 6 |
| Gini antarwilayah | Dari kurva Lorenz PDRB terhadap penduduk dengan metode trapesium | 6 |
| Simbol proporsional | Luas lingkaran sebanding dengan PDRB total (jari-jari memakai akar kuadrat) | 6 |

Seluruh pengolahan mengikuti kerangka CRISP-DM. Penjelasan lengkap tiap langkah dan rumus ada di makalah serta di bagian "Catatan data dan metodologi" pada bab Penutup.

## Teknologi

- **Situs:** [Next.js](https://nextjs.org/) 16 (App Router), React 19, TypeScript.
- **Grafik:** digambar sendiri dalam SVG dengan bantuan d3-sankey, d3-hierarchy, d3-geo, d3-shape, dan topojson-client. Tidak memakai pustaka grafik siap pakai.
- **Pengolahan data:** Python dengan pandas, openpyxl, geopandas, libpysal, esda, dan mapclassify; mapshaper untuk menyederhanakan batas wilayah.
- **Hosting:** Verce, dengan seluruh halaman dibangkitkan sebagai halaman statis.

## Menjalankan secara lokal

Prasyarat: **Node.js 20.9 atau lebih baru** dan npm.

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`. Data hasil olahan sudah tersedia di repositori, jadi langkah ini cukup untuk menjalankan *webstory*.

Untuk versi produksi:

```bash
npm run build
npm run start
```

## Mengolah ulang data

Langkah ini hanya diperlukan bila berkas di `data/raw/` diganti atau skrip diubah. Prasyarat tambahan: **Python 3** (diuji dengan Python 3.12).

```bash
pip install -r scripts/requirements.txt
npm run data
```

`npm run data` menjalankan enam skrip secara berurutan. Urutannya penting karena ada ketergantungan antarskrip:

| Urutan | Skrip | Keluaran | Bergantung pada |
|---|---|---|---|
| 1 | `prepare_sitc.py` | `chapter0.json`, `sitc_clean.json` | |
| 2 | `prepare_energi.py` | `chapter1.json` | |
| 3 | `prepare_negara.py` | `chapter2.json` | `chapter0.json`  |
| 4 | `prepare_treemap.py` | `chapter3.json` | `sitc_clean.json` |
| 5 | `prepare_pdrb.py` | `chapter5.json`, `kabkota.topo.json`, `crosswalk_kab_kota.csv` | |
| 6 | `prepare_massa.py` | `chapter6.json`, `provinsi.topo.json` | output langkah 5 |

`scripts/build_referensi_negara.py` hanya perlu dijalankan bila ada nama negara baru yang belum terdaftar di `data/reference/negara_referensi.csv`.


## Struktur proyek

```text
app/
  globals.css            Token warna, huruf, dan gaya dasar
  layout.tsx             Kerangka HTML
  page.tsx               Menyusun seluruh bab
components/
  ui/                    Komponen bersama: header dan navigasi, keterangan grafik,
                         catatan emas moneter, hook langkah scrollytelling
  chapter0/ ... chapter7/  Komponen tiap bab (grafik, peta, dan susunan bab)
content/
  chapter0.ts ... chapter7.ts   Semua teks cerita; angka dihitung dari JSON hasil olahan
lib/
  format.ts              Format angka berbahasa Indonesia
  color.ts               Palet dan skala warna
  petaIndonesia.ts       Proyeksi dan logika zoom peta
scripts/                 Skrip Python pengolahan data dan requirements.txt
data/
  raw/                   Berkas sumber asli (Excel BPS, batas wilayah)
  processed/             JSON hasil olahan per bab (diimpor saat build)
  reference/             Padanan kode wilayah dan referensi negara
public/data/             Berkas yang diunduh peramban saat halaman dibuka
                         (batas wilayah TopoJSON, data SITC bersih)
```

Seluruh teks cerita ada di folder `content/`. Angka di dalam teks dihitung langsung dari berkas JSON yang sama dengan grafik, jadi teks dan grafik tidak dapat saling bertentangan bila data diperbarui. Untuk mengubah gaya bahasa, cukup sunting folder ini.


## Aksesibilitas dan rancangan

- **Konvensi warna tetap:** pada visualisasi perdagangan, biru berarti ekspor (atau surplus) dan oranye berarti impor (atau defisit).
- **Palet ramah buta warna:** Okabe-Ito untuk kategori, serta skema ColorBrewer untuk skala berurutan dan divergen. Palet diperiksa dengan simulasi protanopia, deuteranopia, dan tritanopia.
- **Tidak hanya warna:** makna juga dikodekan dengan pola garis, bentuk penanda, tanda positif dan negatif, mata panah, dan label teks.
- **Setiap grafik** memiliki judul, satuan, legenda, dan keterangan sumber data.
- **Responsif:** diuji pada ukuran layar laptop  dan ponsel.

## Keterbatasan

- Evaluasi rancangan bersifat heuristik dan berbasis simulasi; belum ada uji pengguna formal.
- Neraca energi yang merinci proses transformasi baru tersedia untuk 2024.
- Data perdagangan menurut negara tidak memuat rincian komoditas.
- Indeks Williamson dan Gini mengukur ketimpangan antarwilayah, bukan antarpenduduk, dan tidak sebanding dengan rasio Gini pengeluaran BPS.
- Hasil Moran's I dan LISA bergantung pada pilihan matriks bobot yang belum diuji sensitivitasnya.
- Pola yang ditampilkan tidak ditafsirkan secara kausal.

## Penulis

**Amrestya Gaia Bujjhati Isbandi** (222312969)
[Program studi, universitas]
Mata kuliah: [Nama mata kuliah], 2026

## Penggunaan alat bantu AI

Proyek ini memanfaatkan asisten berbasis AI sebagai alat bantu dalam pengembangan kode, pemeriksaan prosedur validasi data, penyusunan dan penyuntingan draf, serta pemahaman terhadap jurnal dan referensi yang relevan. Penggunaan AI dilakukan sebagai bagian dari proses kerja untuk mendukung efisiensi dan membantu penyelesaian berbagai tahapan penelitian. Penulis tetap bertanggung jawab dalam menentukan topik, alur cerita, pertanyaan penelitian, rancangan analisis dan visualisasi, serta melakukan pengunduhan dan pemeriksaan data dari BPS, termasuk mencocokkan data dengan publikasi asli dan memperbaiki kesalahan penyalinan yang ditemukan. Seluruh keluaran yang dihasilkan dengan bantuan AI kemudian ditinjau, disunting, diuji, dan diverifikasi oleh penulis, termasuk pemeriksaan terhadap keberadaan, relevansi, dan isi setiap referensi yang digunakan.

