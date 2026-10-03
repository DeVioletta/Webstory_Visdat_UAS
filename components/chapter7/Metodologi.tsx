import { chapter7Data } from "@/content/chapter7";
import styles from "./chapter7.module.css";

const { ch5, ch6 } = chapter7Data;

/**
 * Catatan data dan metodologi. Isinya teks statis yang merangkum keputusan di setiap bab.
 * Jika ada sumber atau keputusan yang berubah, perbarui di sini juga.
 */
export default function Metodologi() {
  return (
    <div className={styles.method}>
      <details open>
        <summary>Sumber data utama (BPS)</summary>
        <ul>
          <li>Ekspor dan impor menurut kelompok komoditas SITC Rev.4 hingga 3 digit, 2024 dan 2025 (Bab 0, 3, 4).</li>
          <li>Ekspor dan impor menurut negara mitra, 2024 dan 2025 (Bab 2).</li>
          <li>
            Neraca Energi Indonesia: Tabel 2 (neraca 2024) untuk diagram Sankey, dan Tabel 3 sampai 13 (neraca per jenis
            energi 2020 sampai 2024) untuk deret batu bara (Bab 1).
          </li>
          <li>
            PDRB atas dasar harga berlaku 2025: PDRB per kapita kabupaten/kota, PDRB kabupaten/kota, dan PDRB per kapita
            provinsi (Bab 5 dan 6).
          </li>
        </ul>
      </details>

      <details>
        <summary>Data referensi di luar BPS</summary>
        <ul>
          <li>Batas negara: Natural Earth, skala 1:110 juta (melalui paket world-atlas).</li>
          <li>Titik koordinat, kode ISO, dan kawasan negara: dataset mledoze/countries (melalui paket world-countries).</li>
          <li>Batas kabupaten/kota: GeoJSON 514 kabupaten/kota dengan kode wilayah Kemendagri. Batas provinsi adalah gabungan dari batas kabupaten/kota ini.</li>
        </ul>
        <p>Data referensi hanya dipakai untuk menggambar peta. Semua angka yang divisualisasikan berasal dari BPS.</p>
      </details>

      <details>
        <summary>Metode dan rumus</summary>
        <dl>
          <dt>Indeks spesialisasi perdagangan (Bab 3)</dt>
          <dd>(ekspor &minus; impor) / (ekspor + impor). Di setiap tingkat hirarki dihitung dari nilai yang dijumlahkan.</dd>
          <dt>Perubahan (Bab 4)</dt>
          <dd>(nilai 2025 &minus; nilai 2024) / nilai 2024 &times; 100%. Skala warna dibatasi &plusmn;50%.</dd>
          <dt>Klasifikasi peta (Bab 5)</dt>
          <dd>Kuantil, 5 kelas dengan jumlah daerah yang sama. Natural breaks (Fisher-Jenks) disediakan sebagai pembanding.</dd>
          <dt>Moran&apos;s I dan LISA (Bab 5)</dt>
          <dd>
            Variabel {ch5.moran.variabel}. Bobot queen contiguity dengan standarisasi baris; {ch5.moran.jumlahPulau} daerah
            kepulauan tanpa tetangga darat diberi satu tetangga terdekat. {ch5.moran.permutasi} permutasi, &alpha; = 0,05,
            dihitung dari batas resolusi asli. Hasil: I = {ch5.moran.I.toFixed(3).replace(".", ",")}, p ={" "}
            {ch5.moran.p.toFixed(3).replace(".", ",")}.
          </dd>
          <dt>Penduduk (Bab 6)</dt>
          <dd>Diturunkan dari PDRB dibagi PDRB per kapita, sehingga konsisten dengan angka yang dipetakan.</dd>
          <dt>Indeks Williamson dan Gini antarwilayah (Bab 6)</dt>
          <dd>
            Williamson = &radic;[&Sigma;(y<sub>i</sub> &minus; &#563;)&sup2; &times; P<sub>i</sub>/P] / &#563;. Gini dari kurva
            Lorenz PDRB terhadap penduduk dengan metode trapesium. Hasil: {ch6.nasional.williamson.toFixed(3).replace(".", ",")}{" "}
            dan {ch6.nasional.gini.toFixed(3).replace(".", ",")}.
          </dd>
          <dt>Simbol proporsional (Bab 6)</dt>
          <dd>Luas lingkaran sebanding dengan PDRB total (jari-jari memakai akar kuadrat).</dd>
        </dl>
      </details>

      <details>
        <summary>Catatan dan keterbatasan data</summary>
        <ul>
          <li>
            Neraca energi 2024 adalah angka sementara. Untuk 2024, tabel per jenis energi berbeda dengan Tabel 2 pada transfer
            BBM berkadar ringan dan perubahan stok briket-kokas; diagram Sankey memakai Tabel 2.
          </li>
          <li>
            Pada Tabel 2, biomassa olahan yang tercatat masuk ke kilang minyak ditafsirkan sebagai biodiesel yang dicampurkan
            ke BBM berkadar berat. Keluaran kilang gas tercatat lebih besar dari masukannya dan ditampilkan sebagai selisih neraca.
          </li>
          <li>Emas moneter dikeluarkan dari analisis komoditas karena merupakan aset cadangan devisa, bukan barang dagangan.</li>
          <li>
            Kode wilayah di GeoJSON (Kemendagri) dan tabel PDRB (BPS) berbeda sistem pada 171 daerah, sehingga keduanya
            dicocokkan lewat nama daerah di dalam provinsi yang sama. Padanan lengkapnya ada di berkas
            data/reference/crosswalk_kab_kota.csv.
          </li>
          <li>Mitra dagang &ldquo;Indonesia&rdquo; (barang yang diekspor atau diimpor kembali) dikeluarkan dari peta aliran.</li>
          <li>
            PDRB mengukur nilai produksi di suatu wilayah, bukan pendapatan penduduknya. Indeks ketimpangan di Bab 6 mengukur
            ketimpangan antarwilayah, bukan antarpenduduk, dan tidak sebanding dengan rasio Gini pengeluaran BPS.
          </li>
        </ul>
      </details>

      <details>
        <summary>Perangkat dan palet warna</summary>
        <ul>
          <li>Situs: Next.js dan React; grafik dengan d3-sankey, d3-hierarchy, d3-geo, d3-shape, dan topojson.</li>
          <li>Pengolahan data: Python (pandas, geopandas, libpysal, esda, mapclassify) dan mapshaper.</li>
          <li>
            Palet: Okabe-Ito untuk kategori, ColorBrewer (YlGnBu, BrBG) untuk skala berurutan dan divergen. Semua dipilih agar
            dapat dibaca pembaca buta warna.
          </li>
        </ul>
      </details>
    </div>
  );
}
