import data from "@/data/processed/chapter1.json";
import sitc from "@/public/data/sitc_clean.json";
import { angka1, jutaTJ, miliar, persenBulat, pertumbuhan } from "@/lib/format";

export type Keluarga = "batubara" | "minyak" | "gas" | "listrik" | "biomassa" | "lainnya";

export type Fokus =
  | { jenis: "semua" }
  | { jenis: "keluarga"; id: Keluarga }
  | { jenis: "node"; id: string };

export interface Step1 {
  id: string;
  teks: string;
  fokus: Fokus;
}

export const KELUARGA_ENERGI: { id: Keluarga; label: string; warna: string }[] = [
  { id: "batubara", label: "Batu bara", warna: "var(--e-batubara)" },
  { id: "minyak", label: "Minyak", warna: "var(--e-minyak)" },
  { id: "gas", label: "Gas alam", warna: "var(--e-gas)" },
  { id: "biomassa", label: "Biomassa", warna: "var(--e-biomassa)" },
  { id: "listrik", label: "Listrik", warna: "var(--e-listrik)" },
];

export const WARNA_KELUARGA: Record<Keluarga, string> = {
  batubara: "var(--e-batubara)",
  minyak: "var(--e-minyak)",
  gas: "var(--e-gas)",
  listrik: "var(--e-listrik)",
  biomassa: "var(--e-biomassa)",
  lainnya: "var(--e-lainnya)",
};

const k = data.ringkas;
const bb = data.batubara;
const bb20 = bb[0];
const bb24 = bb[bb.length - 1];

// penghubung data perdagangan (SITC 2024, juta USD)
const nilai = (kode: string, kolom: "ekspor_2024" | "impor_2024") =>
  sitc.find((r) => r.kode_3 === kode)?.[kolom] ?? 0;
const imporMinyakUSD = nilai("333", "impor_2024") + nilai("334", "impor_2024");
const eksporBatubaraUSD = nilai("321", "ekspor_2024");

export const chapter1Copy = {
  nomor: "Bab 1",
  judul: "Energi yang keluar, energi yang masuk",
  pengantar: `Batu bara masih menjadi komoditas ekspor terbesar kedua. Untuk melihat perannya, kita perlu mengikuti energinya dari tambang dan sumur sampai ke pemakai, dalam satuan energi, bukan dolar.`,
  catatanTahun:
    "Bab ini memakai Neraca Energi 2024, edisi terbaru yang tersedia.",

  sankeyJudul: "Aliran energi Indonesia dari pasokan ke pemakaian, 2024",

  steps: [
    {
      id: "e1",
      teks: `Pada 2024 Indonesia memproduksi ${jutaTJ(k.produksiTotal)} juta terajoule energi primer. Energi yang diekspor setara ${persenBulat(
        k.eksporTotal,
        k.produksiTotal
      )} persen dari produksi itu, sementara yang sampai ke pemakai akhir di dalam negeri ${jutaTJ(
        k.konsumsiAkhirTotal
      )} juta TJ.`,
      fokus: { jenis: "semua" },
    },
    {
      id: "e2",
      teks: `Sebagian besar produksi itu adalah batu bara: ${persenBulat(
        k.batubaraProduksi,
        k.produksiTotal
      )} persen. Dari ${jutaTJ(k.batubaraProduksi)} juta TJ batu bara yang ditambang, ${jutaTJ(
        k.batubaraEkspor
      )} juta TJ atau ${persenBulat(k.batubaraEkspor, k.batubaraProduksi)} persen langsung diekspor.`,
      fokus: { jenis: "keluarga", id: "batubara" },
    },
    {
      id: "e3",
      teks: `Di dalam negeri, batu bara paling banyak dibakar di pembangkit listrik, ${persenBulat(
        k.pembangkitBatubara,
        k.pembangkitMasuk
      )} persen dari seluruh bahan bakar pembangkit. Dari ${jutaTJ(k.pembangkitMasuk)} juta TJ yang masuk, hanya ${jutaTJ(
        k.listrikKeluar
      )} juta TJ keluar sebagai listrik. Sekitar ${persenBulat(
        k.pembangkitMasuk - k.listrikKeluar,
        k.pembangkitMasuk
      )} persen sisanya terlepas sebagai panas saat konversi.`,
      fokus: { jenis: "node", id: "pembangkit_tenaga_listrik" },
    },
    {
      id: "e4",
      teks: `Arah sebaliknya terjadi pada minyak. ${persenBulat(
        k.imporMinyak,
        k.imporTotal
      )} persen energi yang diimpor adalah minyak mentah dan produk olahannya. Dalam nilai uang, impor minyak mentah dan BBM 2024 mencapai ${miliar(
        imporMinyakUSD
      )} miliar US$, ${imporMinyakUSD > eksporBatubaraUSD ? "lebih besar dari" : "mendekati"} nilai ekspor batu bara tahun yang sama, ${miliar(
        eksporBatubaraUSD
      )} miliar US$.`,
      fokus: { jenis: "node", id: "impor" },
    },
  ] satisfies Step1[],

  garisJudul: "Batu bara makin banyak dipakai sendiri",
  garisTeks: `Antara 2020 dan 2024 produksi batu bara naik ${angka1(
    pertumbuhan(bb20.produksi, bb24.produksi)
  )} persen. Ekspor ikut naik, tapi lebih lambat, ${angka1(
    pertumbuhan(bb20.ekspor, bb24.ekspor)
  )} persen. Yang tumbuh paling cepat adalah pemakaian di dalam negeri, naik ${angka1(
    pertumbuhan(bb20.pemakaianDalamNegeri, bb24.pemakaianDalamNegeri)
  )} persen. Akibatnya porsi produksi yang diekspor turun dari ${angka1(
    (bb20.ekspor / bb20.produksi) * 100
  )} persen menjadi ${angka1((bb24.ekspor / bb24.produksi) * 100)} persen.`,
  garisCaption: "Produksi, ekspor, dan pemakaian dalam negeri batu bara Indonesia, 2020-2024",

  penutupLabel: "Berikutnya, Bab 2",
  penutup:
    "Batu bara dan gas mengalir keluar, minyak mengalir masuk. Bab berikutnya melihat aliran barang secara keseluruhan: ke negara mana Indonesia menjual, dan dari mana ia membeli.",
};

export const chapter1Data = data;
