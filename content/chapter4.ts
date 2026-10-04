import { cariJalur, TREE, type SitcNode } from "@/content/chapter3";
import { angka1, miliar, pertumbuhan } from "@/lib/format";

export type Arus = "ekspor" | "impor" | "total";

export interface SunburstState {
  arus: Arus;
  fokus: string; // "root", kode section, atau kode division
}

export interface Step4 {
  id: string;
  teks: string;
  state: SunburstState;
}

export const LABEL_ARUS: Record<Arus, string> = {
  ekspor: "ekspor",
  impor: "impor",
  total: "ekspor + impor",
};

/** Nilai satu node untuk arus dan tahun tertentu (juta USD) */
export function nilaiArus(n: SitcNode, arus: Arus, tahun: "2024" | "2025"): number {
  const v = n.nilai[tahun];
  return arus === "ekspor" ? v.e : arus === "impor" ? v.i : v.e + v.i;
}

/** Pertumbuhan 2024 ke 2025 dalam persen; null jika 2024 bernilai nol */
export function tumbuh(n: SitcNode, arus: Arus): number | null {
  const a = nilaiArus(n, arus, "2024");
  const b = nilaiArus(n, arus, "2025");
  return a > 0 ? pertumbuhan(a, b) : null;
}

const node = (id: string) => {
  const j = cariJalur(id);
  if (!j) throw new Error(`Node ${id} tidak ditemukan`);
  return j[j.length - 1];
};
const g = (id: string, a: Arus) => tumbuh(node(id), a) ?? 0;
const selisih = (id: string, a: Arus) => nilaiArus(node(id), a, "2025") - nilaiArus(node(id), a, "2024");

export const chapter4Copy = {
  nomor: "Bab 4",
  judul: "Yang tumbuh, yang menyusut",
  pengantar: `Di luar emas moneter, ekspor naik ${angka1(g("root", "ekspor"))} persen dan impor naik ${angka1(
    g("root", "impor")
  )} persen dari 2024 ke 2025. Angka itu rata-rata dari ratusan kelompok komoditas yang bergerak ke arah berbeda. Diagram di bawah memecahnya kembali.`,

  sunburstJudul: "Perubahan perdagangan Indonesia menurut kelompok komoditas SITC, 2024 ke 2025",
  bacaIrisan: (arus: Arus) =>
    `Lebar irisan sebanding dengan nilai ${LABEL_ARUS[arus]} tahun 2025, dalam miliar USD. Cincin dalam adalah Section, cincin tengah Division, cincin luar kelompok 3 digit. Total tidak mencakup emas moneter, sehingga sedikit berbeda dari Bab 0 (lihat catatan di atas).`,
  bacaWarna:
    "Warna menunjukkan perubahan nilai dari 2024 ke 2025: (nilai 2025 \u2212 nilai 2024) / nilai 2024 \u00d7 100%. Cokelat berarti turun, hijau kebiruan berarti naik.",

  steps: [
    {
      id: "s1",
      teks: `Kenaikan ekspor tidak datang dari energi. Bahan bakar mineral justru turun ${angka1(
        -g("3", "ekspor")
      )} persen. Yang naik adalah minyak nabati (${angka1(g("4", "ekspor"))} persen), bahan kimia (${angka1(
        g("5", "ekspor")
      )} persen), serta mesin dan alat angkut (${angka1(g("7", "ekspor"))} persen).`,
      state: { arus: "ekspor", fokus: "root" },
    },
    {
      id: "s2",
      teks: `Di dalam bahan bakar mineral, hampir semuanya turun. Ekspor batu bara berkurang ${miliar(
        -selisih("321", "ekspor")
      )} miliar USD (${angka1(g("321", "ekspor"))} persen), gas alam dan LNG ${angka1(
        g("343", "ekspor")
      )} persen, briket ${angka1(g("322", "ekspor"))} persen.`,
      state: { arus: "ekspor", fokus: "3" },
    },
    {
      id: "s3",
      teks: `Sebaliknya di mesin dan alat angkut. Ekspor mesin dan perlengkapan listrik naik ${angka1(
        g("77", "ekspor")
      )} persen, dan ekspor semikonduktor serta komponen elektronik naik dari ${miliar(
        nilaiArus(node("776"), "ekspor", "2024")
      )} menjadi ${miliar(nilaiArus(node("776"), "ekspor", "2025"))} miliar USD.`,
      state: { arus: "ekspor", fokus: "7" },
    },
    {
      id: "s4",
      teks: `Di sisi impor polanya berbeda. Impor pangan turun ${angka1(-g("0", "impor"))} persen dan impor bahan bakar mineral turun ${angka1(
        -g("3", "impor")
      )} persen, sementara impor mesin dan alat angkut naik ${angka1(g("7", "impor"))} persen.`,
      state: { arus: "impor", fokus: "root" },
    },
    {
      id: "s5",
      teks: `Kenaikan impor terkonsentrasi di barang elektronik dan kendaraan: komputer naik ${angka1(
        g("752", "impor")
      )} persen, peralatan telekomunikasi ${angka1(g("764", "impor"))} persen, dan mobil penumpang ${angka1(
        g("781", "impor")
      )} persen.`,
      state: { arus: "impor", fokus: "7" },
    },
  ] satisfies Step4[],

  penutupLabel: "Berikutnya, Bab 5",
  penutup:
    "Sejauh ini semua angka adalah angka nasional. Bab berikutnya turun ke tingkat kabupaten dan kota: di mana nilai ekonomi itu sebenarnya dihasilkan, dan seberapa merata.",
};

export { TREE };