/**
 * Semua teks Bab 2. Angka dihitung dari data/processed/chapter2.json
 * (python3 scripts/prepare_negara.py).
 *
 * Teks ini masih draf berbasis data. Silakan ganti gaya bahasanya.
 */
import data from "@/data/processed/chapter2.json";
import { angka1, miliar, persenBulat, pertumbuhan } from "@/lib/format";

export type Tahun2 = "2024" | "2025";
export type Arah = "ekspor" | "impor" | "keduanya";

export interface FlowState {
  tahun: Tahun2;
  arah: Arah;
  kawasan: string; // "Semua" atau nama kawasan
  jumlah: number; // berapa mitra teratas yang digambar
  sorot: string[]; // kode ISO3
}

export interface Step2 {
  id: string;
  teks: string;
  state: FlowState;
}

export type Mitra = (typeof data.mitra)[number];

export const KAWASAN: string[] = [
  "Semua",
  ...Array.from(new Set(data.mitra.map((m) => m.kawasan)))
    .filter((k) => k !== "Lainnya")
    .sort((a, b) => a.localeCompare(b, "id")),
];

/** Keterangan satuan impor. Ganti jika tabel BPS impor ternyata bernilai CIF. */
export const CATATAN_NILAI = "Nilai ekspor FOB. Nilai impor mengikuti tabel BPS yang dipakai.";

const cari = (iso: string) => {
  const m = data.mitra.find((d) => d.iso3 === iso);
  if (!m) throw new Error(`Mitra ${iso} tidak ada di data`);
  return m;
};
const t25 = data.totals["2025"];
const chn = cari("CHN");
const neraca = (m: Mitra, y: Tahun2) => (y === "2024" ? m.ekspor2024 - m.impor2024 : m.ekspor2025 - m.impor2025);

// Tiga mitra dengan surplus terbesar 2025
const surplusTeratas = [...data.mitra].sort((a, b) => neraca(b, "2025") - neraca(a, "2025")).slice(0, 3);
const jumlahSurplus3 = surplusTeratas.reduce((a, m) => a + neraca(m, "2025"), 0);
const kedua = [...data.mitra].sort((a, b) => b.ekspor2025 - a.ekspor2025)[1];

const dasar: FlowState = { tahun: "2025", arah: "ekspor", kawasan: "Semua", jumlah: 20, sorot: [] };

export const chapter2Copy = {
  nomor: "Bab 2",
  judul: "Satu mitra, dua arah yang timpang",
  pengantar: `Indonesia berdagang dengan ${t25.jumlahMitraEkspor} negara dan wilayah. Tapi aliran barangnya jauh dari merata: segelintir mitra menyerap sebagian besar ekspor, dan satu mitra mendominasi impor.`,

  petaJudul: "Aliran perdagangan Indonesia dengan mitra dagang utama",
  neracaJudul: "Neraca perdagangan dengan 15 mitra terbesar",

  steps: [
    {
      id: "a1",
      teks: `Pada 2025 Tiongkok adalah tujuan ekspor terbesar: ${miliar(chn.ekspor2025)} miliar USD, atau ${persenBulat(
        chn.ekspor2025,
        t25.ekspor
      )} persen dari seluruh ekspor. ${kedua.nama} di urutan kedua dengan ${miliar(kedua.ekspor2025)} miliar USD.`,
      state: { ...dasar, sorot: ["CHN", kedua.iso3] },
    },
    {
      id: "a2",
      teks: `Di sisi impor, ketergantungannya jauh lebih besar. Impor dari Tiongkok mencapai ${miliar(
        chn.impor2025
      )} miliar USD, ${persenBulat(chn.impor2025, t25.impor)} persen dari seluruh impor, naik ${angka1(
        pertumbuhan(chn.impor2024, chn.impor2025)
      )} persen dalam setahun.`,
      state: { ...dasar, arah: "impor", sorot: ["CHN"] },
    },
    {
      id: "a3",
      teks: `Akibatnya defisit perdagangan dengan Tiongkok melebar dari ${miliar(
        -neraca(chn, "2024")
      )} miliar USD pada 2024 menjadi ${miliar(-neraca(chn, "2025"))} miliar USD pada 2025.`,
      state: { ...dasar, arah: "keduanya", sorot: ["CHN"] },
    },
    {
      id: "a4",
      teks: `Surplus Indonesia datang dari tempat lain. ${surplusTeratas
        .map((m) => `${m.nama} (${miliar(neraca(m, "2025"))})`)
        .join(", ")
        .replace(/, ([^,]*)$/, ", dan $1")} menyumbang surplus ${miliar(
        jumlahSurplus3
      )} miliar USD, lebih besar dari defisit dengan Tiongkok.`,
      state: { ...dasar, arah: "keduanya", sorot: surplusTeratas.map((m) => m.iso3) },
    },
  ] satisfies Step2[],

  neracaSubjudul: "Surplus dan defisit per mitra",
  neracaTeks:
    "Angka total menyembunyikan dua cerita yang berlawanan. Grafik di bawah mengurutkan 15 mitra terbesar menurut neracanya: di kanan mitra tempat Indonesia surplus, di kiri tempat Indonesia defisit.",

  penutupLabel: "Berikutnya, Bab 3",
  penutup:
    "Peta ini menunjukkan ke mana barang pergi, tapi belum menunjukkan barang apa. Bab berikutnya membedah isi perdagangan itu menurut kelompok komoditas.",
};

export const chapter2Data = data;
export { neraca };
