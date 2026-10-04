import data from "@/data/processed/chapter5.json";
import { angka1 } from "@/lib/format";

export type Lapisan = "pdrb" | "lisa";
export type Metode = "kuantil" | "jenks";
export type Wilayah = "indonesia" | "sumatera" | "jawa" | "kalimantan" | "sulawesi" | "nusatenggara" | "maluku" | "papua";

export interface PetaState {
  lapisan: Lapisan;
  metode: Metode;
  wilayah: Wilayah;
  sorot: string[]; // kode BPS
}

export interface Step5 {
  id: string;
  teks: string;
  state: PetaState;
}

export type Daerah = (typeof data.daerah)[number];

/** Batas tiap wilayah [lon barat, lat selatan, lon timur, lat utara] untuk tombol zoom */
export const WILAYAH: { id: Wilayah; label: string; bbox: [number, number, number, number] }[] = [
  { id: "indonesia", label: "Indonesia", bbox: [94.5, -11.2, 141.2, 6.2] },
  { id: "sumatera", label: "Sumatera", bbox: [95, -6.2, 108.5, 6] },
  { id: "jawa", label: "Jawa & Bali", bbox: [105, -9, 116, -5.4] },
  { id: "kalimantan", label: "Kalimantan", bbox: [108.5, -4.5, 119.5, 4.6] },
  { id: "sulawesi", label: "Sulawesi", bbox: [118.5, -6.5, 125.8, 2.2] },
  { id: "nusatenggara", label: "Nusa Tenggara", bbox: [115.5, -11.1, 125.5, -7.8] },
  { id: "maluku", label: "Maluku", bbox: [124.5, -8.5, 135, 3] },
  { id: "papua", label: "Papua", bbox: [130.5, -9.3, 141.2, 0.3] },
];

export const LABEL_LISA: Record<string, { singkat: string; arti: string }> = {
  HH: { singkat: "Tinggi-tinggi", arti: "PDRB per kapita tinggi, dikelilingi tetangga yang juga tinggi" },
  HL: { singkat: "Tinggi-rendah", arti: "PDRB per kapita tinggi, tetapi tetangganya rendah" },
  LH: { singkat: "Rendah-tinggi", arti: "PDRB per kapita rendah, tetapi tetangganya tinggi" },
  LL: { singkat: "Rendah-rendah", arti: "PDRB per kapita rendah, dikelilingi tetangga yang juga rendah" },
  NS: { singkat: "Tidak signifikan", arti: "Tidak membentuk pola yang signifikan secara statistik" },
};

/** Ribu rupiah -> "53,9" (juta rupiah) */
export const juta = (ribu: number) => angka1(ribu / 1000);

const urut = [...data.daerah].sort((a, b) => b.nilai - a.nilai);
const tertinggi = urut[0];
const terendah = urut[urut.length - 1];
const klaster = (k: string) => data.daerah.filter((d) => d.lisa === k);
const hitungKelas = (metode: Metode) => {
  const b = data.kelas[metode];
  return data.daerah.filter((d) => d.nilai <= b[0]).length;
};
const provTerbanyak = (k: string, n: number) => {
  const c: Record<string, number> = {};
  klaster(k).forEach((d) => (c[d.provinsi] = (c[d.provinsi] ?? 0) + 1));
  return Object.entries(c)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([p, j]) => `${p} (${j})`);
};
const daftar = (xs: string[]) => xs.join(", ").replace(/, ([^,]*)$/, ", dan $1");
const hl = klaster("HL");
const hlPapua = hl.filter((d) => d.provinsi.startsWith("Papua"));

const dasar: PetaState = { lapisan: "pdrb", metode: "kuantil", wilayah: "indonesia", sorot: [] };

export const chapter5Copy = {
  nomor: "Bab 5",
  judul: "Kaya di atas kertas",
  pengantar: `Semua angka sejauh ini adalah angka nasional. Bab ini turun ke ${data.ringkas.jumlah} kabupaten dan kota, memakai satu ukuran: PDRB per kapita, yaitu nilai produksi barang dan jasa di sebuah daerah dibagi jumlah penduduknya.`,
  catatanUkuran:
    "PDRB per kapita mengukur nilai produksi di wilayah itu, bukan pendapatan yang diterima penduduknya. Daerah dengan industri atau tambang besar bisa memiliki PDRB per kapita sangat tinggi meskipun sebagian hasilnya mengalir ke luar daerah. Karena itulah judul bab ini: kaya di atas kertas.",

  petaJudul: "PDRB per kapita atas dasar harga berlaku menurut kabupaten/kota, 2025",

  steps: [
    {
      id: "p1",
      teks: `Setengah kabupaten dan kota di Indonesia memiliki PDRB per kapita di bawah ${juta(
        data.ringkas.median
      )} juta rupiah per tahun. Warna paling gelap menandai seperlima daerah dengan nilai tertinggi, di atas ${juta(
        data.kelas.kuantil[3]
      )} juta rupiah.`,
      state: dasar,
    },
    {
      id: "p2",
      teks: `Jaraknya sangat lebar. Tertinggi ${tertinggi.nama} dengan ${juta(tertinggi.nilai)} juta rupiah, terendah ${
        terendah.nama
      } dengan ${juta(terendah.nilai)} juta rupiah: ${Math.round(tertinggi.nilai / terendah.nilai)} kali lipat. Lima daerah tertinggi dan lima terendah disorot di peta.`,
      state: { ...dasar, sorot: [...urut.slice(0, 5), ...urut.slice(-5)].map((d) => d.id) },
    },
    {
      id: "p3",
      teks: `Peta ini memakai kelas kuantil: setiap warna berisi jumlah daerah yang sama. Dengan metode natural breaks, ${hitungKelas(
        "jenks"
      )} dari ${data.ringkas.jumlah} daerah jatuh ke kelas terbawah, karena segelintir daerah bernilai sangat tinggi menarik batas kelas ke atas. Peta hampir seragam dan perbedaan di antara mayoritas daerah hilang.`,
      state: { ...dasar, metode: "jenks" },
    },
    {
      id: "p4",
      teks: `Apakah daerah kaya bertetangga dengan daerah kaya? Indeks Moran bernilai ${data.moran.I
        .toFixed(2)
        .replace(".", ",")} dengan p = ${data.moran.p
        .toFixed(3)
        .replace(".", ",")}: positif dan signifikan, artinya daerah dengan PDRB per kapita serupa cenderung berdekatan. Klaster tinggi-tinggi terkumpul di ${daftar(
        provTerbanyak("HH", 3)
      )}. Klaster rendah-rendah terbanyak di ${daftar(provTerbanyak("LL", 3))}.`,
      state: { ...dasar, lapisan: "lisa" },
    },
    {
      id: "p5",
      teks: `Pola paling mencolok ada di Papua. Dari ${hl.length} daerah tinggi-rendah, yaitu daerah dengan PDRB per kapita tinggi yang dikelilingi tetangga berpendapatan rendah, ${hlPapua.length} berada di provinsi-provinsi Papua, termasuk ${daftar(
        hlPapua.slice(0, 3).map((d) => d.nama)
      )}.`,
      state: { ...dasar, lapisan: "lisa", wilayah: "papua", sorot: hlPapua.map((d) => d.id) },
    },
  ] satisfies Step5[],

  distribusiJudul: "Sebaran PDRB per kapita 514 kabupaten/kota, 2025",
  distribusiTeks: `Histogram ini menjelaskan pilihan kelas di peta. Sumbu mendatar memakai skala logaritma, karena tanpanya hampir semua daerah akan bertumpuk di ujung kiri. Rata-rata (${juta(
    data.ringkas.rata
  )} juta) jauh di atas median (${juta(data.ringkas.median)} juta): segelintir daerah bernilai sangat tinggi menarik rata-rata ke atas.`,

  moranJudul: "Diagram sebar Moran",
  moranTeks:
    "Setiap titik adalah satu kabupaten/kota. Sumbu mendatar adalah PDRB per kapitanya sendiri, sumbu tegak adalah rata-rata tetangganya, keduanya dalam bentuk baku (logaritma, dikurangi rata-rata, dibagi simpangan baku). Klik satu kuadran untuk melihat daerahnya di peta.",

  penutupLabel: "Berikutnya, Bab 6",
  penutup:
    "PDRB per kapita menunjukkan tingkat, tapi tidak menunjukkan besarnya. Daerah kecil bisa tinggi per kapita namun kecil secara total. Bab berikutnya memetakan massa ekonomi: di mana nilai PDRB terbesar sebenarnya berada.",
};

export const chapter5Data = data;
