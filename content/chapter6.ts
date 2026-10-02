/**
 * Semua teks Bab 6. Angka dihitung dari data/processed/chapter6.json
 * (python3 scripts/prepare_massa.py) dan chapter5.json (kelas warna).
 *
 * Teks ini masih draf berbasis data. Silakan ganti gaya bahasanya.
 */
import data from "@/data/processed/chapter6.json";
import ch5 from "@/data/processed/chapter5.json";
import { angka1 } from "@/lib/format";
import type { Wilayah } from "@/content/chapter5";

export type Dasar = "provinsi" | "kabkota" | "polos";

export interface MassaState {
  dasar: Dasar;
  simbol: boolean;
  wilayah: Wilayah;
  sorot: string[]; // kode BPS kab/kota
}

export interface Step6 {
  id: string;
  teks: string;
  state: MassaState;
}

export type DaerahMassa = (typeof data.daerah)[number];
export type ProvinsiMassa = (typeof data.provinsi)[number];

/** Miliar rupiah -> "985,6" (triliun rupiah) */
export const triliun = (miliar: number) => angka1(miliar / 1000);
/** Ribu rupiah -> "54,0" (juta rupiah) */
export const jutaRp = (ribu: number) => angka1(ribu / 1000);

const N = data.nasional;
const byNama = (n: string) => {
  const d = data.daerah.find((x) => x.nama === n);
  if (!d) throw new Error(`Daerah ${n} tidak ada`);
  return d;
};
const prov = (n: string) => {
  const p = data.provinsi.find((x) => x.nama === n);
  if (!p) throw new Error(`Provinsi ${n} tidak ada`);
  return p;
};
const peringkatTotal = (id: string) => data.daerah.findIndex((d) => d.id === id) + 1;
const provUrut = [...data.provinsi].sort((a, b) => b.nilai - a.nilai);
const pb = prov("Papua Barat");
const jawa = data.pulau.find((p) => p.nama === "Jawa")!;
const bnt = data.pulau.find((p) => p.nama === "Bali & Nusa Tenggara")!;
const puncak = data.daerah[0];
const morowali = byNama("Kab. Morowali");
const idTertinggi = pb.tertinggi.nama;
const idTerendah = pb.terendah.nama;

export const chapter6Copy = {
  nomor: "Bab 6",
  judul: "Rata-rata yang menyembunyikan",
  pengantar:
    "Bab sebelumnya memetakan PDRB per kapita. Bab ini melihat dua hal yang tidak terlihat di sana: seberapa banyak perbedaan yang hilang ketika daerah dirata-rata ke tingkat provinsi, dan di mana sebenarnya nilai ekonomi terbesar dihasilkan.",

  petaJudul: {
    provinsi: "PDRB per kapita atas dasar harga berlaku menurut provinsi, 2025",
    kabkota: "PDRB per kapita atas dasar harga berlaku menurut kabupaten/kota, 2025",
    polos: "PDRB atas dasar harga berlaku menurut kabupaten/kota, 2025",
  } as Record<Dasar, string>,

  steps: [
    {
      id: "m1",
      teks: `Dilihat per provinsi, peta tampak tertata. PDRB per kapita tertinggi di ${provUrut[0].nama} (${jutaRp(
        provUrut[0].nilai
      )} juta rupiah), terendah di ${provUrut[provUrut.length - 1].nama} (${jutaRp(
        provUrut[provUrut.length - 1].nilai
      )} juta rupiah). Warnanya memakai kelas yang sama dengan peta kabupaten/kota di Bab 5.`,
      state: { dasar: "provinsi", simbol: false, wilayah: "indonesia", sorot: [] },
    },
    {
      id: "m2",
      teks: `Turun ke kabupaten/kota, gambarnya pecah. Papua Barat berwarna satu di peta provinsi (${jutaRp(
        pb.nilai
      )} juta rupiah), padahal di dalamnya ada ${idTertinggi} dengan ${jutaRp(pb.tertinggi.nilai)} juta dan ${idTerendah} dengan ${jutaRp(
        pb.terendah.nilai
      )} juta: ${Math.round(pb.tertinggi.nilai / pb.terendah.nilai)} kali lipat dalam satu provinsi.`,
      state: {
        dasar: "kabkota",
        simbol: false,
        wilayah: "papua",
        sorot: data.daerah.filter((d) => d.nama === idTertinggi || d.nama === idTerendah).map((d) => d.id),
      },
    },
    {
      id: "m3",
      teks: `Sekarang ukurannya diganti: luas lingkaran menunjukkan PDRB total, bukan per kapita. Terbesar ${puncak.nama} dengan ${triliun(
        puncak.total
      )} triliun rupiah. Hanya ${N.nSeparuh} dari ${data.daerah.length} kabupaten/kota menghasilkan separuh PDRB seluruh Indonesia.`,
      state: { dasar: "polos", simbol: true, wilayah: "indonesia", sorot: [] },
    },
    {
      id: "m4",
      teks: `Jawa menghasilkan ${angka1(jawa.porsiPdrb)} persen PDRB, hampir sama dengan porsinya atas penduduk (${angka1(
        jawa.porsiPenduduk
      )} persen). Jadi di tingkat pulau, Jawa tidak jauh lebih makmur per orang. Ketimpangannya ada di dalam pulau: lingkaran besar menumpuk di Jakarta dan segelintir kota.`,
      state: { dasar: "polos", simbol: true, wilayah: "jawa", sorot: [] },
    },
    {
      id: "m5",
      teks: `${morowali.nama} memiliki PDRB per kapita tertinggi di Indonesia, tetapi secara total hanya di peringkat ${peringkatTotal(
        morowali.id
      )}, dengan porsi ${angka1((morowali.total / N.pdrbTotal) * 100)} persen dari PDRB nasional. Tinggi per kapita belum tentu besar. Warna menunjukkan per kapita, lingkaran menunjukkan total.`,
      state: { dasar: "kabkota", simbol: true, wilayah: "sulawesi", sorot: [morowali.id] },
    },
  ] satisfies Step6[],

  ketimpanganJudul: "Seberapa timpang?",
  ketimpanganTeks: `Dua ukuran meringkas ketimpangan antarwilayah dalam satu angka. Keduanya menimbang setiap kabupaten/kota dengan jumlah penduduknya, sehingga kota kecil yang sangat kaya tidak dihitung sama dengan kabupaten berpenduduk jutaan. Separuh penduduk yang tinggal di daerah dengan PDRB per kapita terendah hanya menghasilkan ${angka1(
    N.porsiBawah50
  )} persen PDRB, sedangkan 10 persen penduduk di daerah tertinggi menghasilkan ${angka1(N.porsiAtas10)} persen.`,
  pulauJudul: "Porsi PDRB dan porsi penduduk menurut pulau, 2025",
  pulauTeks: `Di tingkat pulau, porsi PDRB dan porsi penduduk hampir sejajar, kecuali Bali dan Nusa Tenggara yang menampung ${angka1(
    bnt.porsiPenduduk
  )} persen penduduk tapi hanya menghasilkan ${angka1(bnt.porsiPdrb)} persen PDRB. Ketimpangan Indonesia lebih banyak terjadi di dalam pulau dan provinsi daripada antarpulau.`,

  penutupLabel: "Berikutnya, Bab 7",
  penutup:
    "Peta menunjukkan posisi tiap daerah hari ini. Bab berikutnya bertanya ke mana arahnya: apakah daerah yang tertinggal tumbuh lebih cepat untuk mengejar, atau justru semakin tertinggal.",
};

export const chapter6Data = data;
export const KELAS_PDRB = ch5.kelas.kuantil;
