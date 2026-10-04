import data from "@/data/processed/chapter0.json";
import { angka1, miliar, pertumbuhan } from "@/lib/format";

export type Tahun = "2024" | "2025";
export type ModeNilai = "nilai" | "pangsa";

export interface ChartState {
  tahun: Tahun;
  mode: ModeNilai;
  sorot: string[]; // kode SITC yang disorot
  tampilkanSelisih: boolean;
}

export interface Step {
  id: string;
  teks: string;
  chart: ChartState;
}

const byKode = (k: string) => {
  const row = data.ranking.find((r) => r.kode === k);
  if (!row) throw new Error(`Kode ${k} tidak ada di data ranking`);
  return row;
};

const batuBara = byKode("321");
const sawit = byKode("422");
const t24 = data.totals["2024"];
const t25 = data.totals["2025"];

export const chapter0Copy = {
  nomor: "Bab 0",
  judul: "Ekspor naik, juaranya berganti",
  pengantar: `Nilai ekspor Indonesia pada 2025 mencapai ${miliar(t25.ekspor)} miliar US$, naik ${angka1(
    pertumbuhan(t24.ekspor, t25.ekspor)
  )} persen dari tahun sebelumnya. Angka total itu baru permukaan. Yang lebih menarik adalah komoditas apa yang kini berada di urutan teratas.`,

  figurJudul: "Ekspor, impor, dan neraca perdagangan Indonesia, 2024 dan 2025",

  rankingJudul: "Sepuluh komoditas ekspor terbesar",

  steps: [
    {
      id: "s1",
      teks: `Pada 2024, batu bara adalah komoditas ekspor terbesar Indonesia, senilai ${miliar(
        batuBara.ekspor2024
      )} miliar US$ atau ${angka1(batuBara.share2024)} persen dari seluruh ekspor.`,
      chart: { tahun: "2024", mode: "nilai", sorot: ["321"], tampilkanSelisih: false },
    },
    {
      id: "s2",
      teks: `Setahun kemudian urutannya bertukar. Minyak nabati, kelompok tempat minyak sawit tercatat, naik ke posisi pertama dengan ${miliar(
        sawit.ekspor2025
      )} miliar US$.`,
      chart: { tahun: "2025", mode: "nilai", sorot: ["422", "321"], tampilkanSelisih: false },
    },
    {
      id: "s3",
      teks: `Batu bara turun ${miliar(
        batuBara.ekspor2024 - batuBara.ekspor2025
      )} miliar US$ dalam setahun, hampir sebesar kenaikan minyak nabati yang ${miliar(
        sawit.ekspor2025 - sawit.ekspor2024
      )} miliar US$. Di bagian bawah, bijih tembaga keluar dari sepuluh besar dan perhiasan masuk.`,
      chart: {
        tahun: "2025",
        mode: "nilai",
        sorot: ["321", "422", "283", "897"],
        tampilkanSelisih: true,
      },
    },
    {
      id: "s4",
      teks: `Dari ${data.jumlahKodeEkspor2025} kelompok komoditas yang diekspor pada 2025, sepuluh teratas ini saja menyumbang ${angka1(
        data.top10Share["2025"]
      )} persen nilai ekspor.`,
      chart: { tahun: "2025", mode: "pangsa", sorot: [], tampilkanSelisih: false },
    },
  ] satisfies Step[],

  penutupLabel: "Berikutnya, Bab 1",
  penutup:
    "Batu bara memang turun, tapi energi tetap menjadi salah satu penopang utama ekspor. Bab berikutnya menelusuri dari mana energi Indonesia berasal dan ke mana ia mengalir.",
};

export const chapter0Data = data;
