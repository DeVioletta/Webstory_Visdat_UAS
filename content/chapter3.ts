/**
 * Semua teks Bab 3. Angka dihitung dari data/processed/chapter3.json
 * (python3 scripts/prepare_treemap.py).
 *
 * Teks ini masih draf berbasis data. Silakan ganti gaya bahasanya.
 */
import data from "@/data/processed/chapter3.json";
import { angka1, formatIsp, isp, miliar, pertumbuhan } from "@/lib/format";

export type Tahun3 = "2024" | "2025";

export interface SitcNode {
  id: string;
  label: string;
  labelEn: string;
  nilai: Record<Tahun3, { e: number; i: number }>;
  children?: SitcNode[];
}

export interface TreemapState {
  tahun: Tahun3;
  fokus: string; // "root", kode section ("7"), atau kode division ("77")
}

export interface Step3 {
  id: string;
  teks: string;
  state: TreemapState;
}

export const TREE = data.tree as SitcNode;

/** Cari node berdasarkan id, kembalikan juga jalurnya dari root */
export function cariJalur(id: string, node: SitcNode = TREE, jalur: SitcNode[] = []): SitcNode[] | null {
  const kini = [...jalur, node];
  if (node.id === id) return kini;
  for (const c of node.children ?? []) {
    const hasil = cariJalur(id, c, kini);
    if (hasil) return hasil;
  }
  return null;
}

const node = (id: string) => {
  const j = cariJalur(id);
  if (!j) throw new Error(`Node ${id} tidak ditemukan`);
  return j[j.length - 1];
};
const tot = (n: SitcNode, y: Tahun3) => n.nilai[y].e + n.nilai[y].i;
const ispN = (n: SitcNode, y: Tahun3) => isp(n.nilai[y].e, n.nilai[y].i);
const neraca = (n: SitcNode, y: Tahun3) => n.nilai[y].e - n.nilai[y].i;

const s7 = node("7");
const s4 = node("4");
const s3 = node("3");
const d32 = node("32");
const d33 = node("33");
const s0 = node("0");
const d04 = node("04");
const beras = node("042");
const telkom = node("764");
const komputer = node("752");
const d78 = node("78");

export const chapter3Copy = {
  nomor: "Bab 3",
  judul: "Yang dijual mentah, yang dibeli jadi",
  pengantar: `Total perdagangan barang Indonesia pada 2025, di luar emas moneter, mencapai ${miliar(
    tot(TREE, "2025")
  )} miliar USD, dari ${data.tree.children.reduce(
    (a, s) => a + s.children.reduce((b, d) => b + d.children.length, 0),
    0
  )} kelompok komoditas. Ukuran kotak menunjukkan seberapa besar perdagangannya, warnanya menunjukkan ke arah mana perdagangan itu condong.`,

  treemapJudul: "Struktur perdagangan Indonesia menurut kelompok komoditas SITC",

  // Penjelasan cara membaca, tampil di atas treemap
  bacaAngka:
    "Angka di dalam kotak adalah nilai perdagangan dalam miliar USD, yaitu ekspor ditambah impor. Totalnya tidak mencakup emas moneter, sehingga sedikit lebih kecil dari Bab 0 (lihat catatan di atas).",
  bacaWarna:
    "Warna adalah indeks spesialisasi perdagangan: (ekspor \u2212 impor) / (ekspor + impor). Nilainya +1 jika hanya ada ekspor, \u22121 jika hanya ada impor, dan 0 jika keduanya sama besar.",

  // Ringkasan di keterangan bawah treemap. Penjelasan lengkapnya ada di components/ui/CatatanEmas.tsx (awal bab)
  catatanEmas:
    "Emas moneter tidak dimasukkan (penjelasan di awal bab ini); emas non-moneter (SITC 971, Division 97) tetap termasuk.",

  steps: [
    {
      id: "t1",
      teks: `Kotak terbesar adalah mesin dan alat angkut, ${miliar(tot(s7, "2025"))} miliar USD. Warnanya oranye: impornya ${angka1(
        s7.nilai["2025"].i / s7.nilai["2025"].e
      )} kali ekspornya. Di ujung lain, minyak dan lemak nabati hampir seluruhnya ekspor, dengan indeks ${formatIsp(
        ispN(s4, "2025")
      )}.`,
      state: { tahun: "2025", fokus: "root" },
    },
    {
      id: "t2",
      teks: `Bahan bakar mineral terlihat hampir seimbang, indeksnya hanya ${formatIsp(
        ispN(s3, "2025")
      )}. Angka itu muncul karena dua hal saling menutupi: batu bara dan briket hampir seluruhnya diekspor (${formatIsp(
        ispN(d32, "2025")
      )}), sementara minyak bumi dan produknya lebih banyak diimpor (${formatIsp(
        ispN(d33, "2025")
      )}). Indonesia menjual batu bara, tapi membeli minyak. Pola yang sama terlihat di aliran energi pada Bab 1.`,
      state: { tahun: "2025", fokus: "3" },
    },
    {
      id: "t3",
      teks: `Pada 2024, perdagangan pangan defisit ${miliar(-neraca(s0, "2024"))} miliar USD. Kotak serealia besar dan oranye: impornya ${miliar(
        d04.nilai["2024"].i
      )} miliar USD, termasuk beras ${miliar(beras.nilai["2024"].i)} miliar USD.`,
      state: { tahun: "2024", fokus: "0" },
    },
    {
      id: "t4",
      teks: `Setahun kemudian kotak serealia menyusut. Impor beras turun ${angka1(
        Math.abs(pertumbuhan(beras.nilai["2024"].i, beras.nilai["2025"].i))
      )} persen menjadi ${miliar(beras.nilai["2025"].i)} miliar USD, dan perdagangan pangan berbalik surplus ${miliar(
        neraca(s0, "2025")
      )} miliar USD.`,
      state: { tahun: "2025", fokus: "0" },
    },
    {
      id: "t5",
      teks: `Di dalam mesin dan alat angkut, hampir semua kotak oranye. Hanya kendaraan jalan raya yang mendekati seimbang (${formatIsp(
        ispN(d78, "2025")
      )}). Impor peralatan telekomunikasi naik ${angka1(
        pertumbuhan(telkom.nilai["2024"].i, telkom.nilai["2025"].i)
      )} persen dan komputer ${angka1(pertumbuhan(komputer.nilai["2024"].i, komputer.nilai["2025"].i))} persen dalam setahun.`,
      state: { tahun: "2025", fokus: "7" },
    },
  ] satisfies Step3[],

  daftarJudul: "Surplus dan defisit terbesar menurut kelompok 3 digit",
  daftarTeks:
    "Treemap memperlihatkan struktur. Daftar di bawah memperlihatkan komoditas mana yang paling banyak menyumbang surplus dan defisit.",

  penutupLabel: "Berikutnya, Bab 4",
  penutup:
    "Treemap ini memotret satu tahun. Bab berikutnya memakai hirarki yang sama untuk melihat apa yang berubah: kelompok mana yang tumbuh dan mana yang menyusut dari 2024 ke 2025.",
};