import ch1 from "@/data/processed/chapter1.json";
import ch2 from "@/data/processed/chapter2.json";
import ch3 from "@/data/processed/chapter3.json";
import ch5 from "@/data/processed/chapter5.json";
import ch6 from "@/data/processed/chapter6.json";
import sitc from "@/public/data/sitc_clean.json";
import { angka1, miliar, persenBulat } from "@/lib/format";

const nilai = (kode: string, kolom: "ekspor_2024" | "impor_2024") => sitc.find((r) => r.kode_3 === kode)?.[kolom] ?? 0;
const imporMinyak24 = nilai("333", "impor_2024") + nilai("334", "impor_2024");
const eksporBatubara24 = nilai("321", "ekspor_2024");

const akar = ch3.tree;
const s7 = akar.children.find((s) => s.id === "7")!;
const porsiImporMesin = (s7.nilai["2025"].i / akar.nilai["2025"].i) * 100;
const porsiEksporMesin = (s7.nilai["2025"].e / akar.nilai["2025"].e) * 100;

const chn = ch2.mitra.find((m) => m.iso3 === "CHN")!;
const defisitChina = chn.impor2025 - chn.ekspor2025;

const urutPk = [...ch5.daerah].sort((a, b) => b.nilai - a.nilai);
// Pasangan bertetangga (berbagi batas darat, dicek di prepare_pdrb.py dengan queen contiguity)
const bintuni = ch5.daerah.find((d) => d.nama === "Kab. Teluk Bintuni")!;
const arfak = ch5.daerah.find((d) => d.nama === "Kab. Pegunungan Arfak")!;
const jt = (ribu: number) => angka1(ribu / 1000);
const rasioPk = urutPk[0].nilai / urutPk[urutPk.length - 1].nilai;

export interface Temuan {
  id: string;
  sudut: string;
  judul: string;
  angka: string;
  satuan: string;
  teks: string;
  tautan: { label: string; href: string }[];
}

export const chapter7Copy = {
  nomor: "Penutup",
  judul: "Kaya di atas kertas, merata di mana?",
  pengantar:
    "Webstory ini melihat Indonesia dari tiga jarak: aliran energi dan barang, isi perdagangan, lalu kabupaten dan kota. Setiap kali diperbesar, angka yang tampak besar dan rapi dari jauh ternyata tersusun dari bagian-bagian yang sangat tidak sama.",

  temuan: [
    {
      id: "aliran",
      sudut: "Aliran",
      judul: "Batu bara keluar, minyak masuk",
      angka: `${persenBulat(ch1.ringkas.batubaraEkspor, ch1.ringkas.batubaraProduksi)}%`,
      satuan: "produksi batu bara 2024 yang diekspor",
      teks: `Energi yang keluar sebagian besar mentah, energi yang masuk sebagian besar olahan. Pada 2024 impor minyak mentah dan produk minyak olahan (${miliar(
        imporMinyak24
      )} miliar USD) lebih besar dari ekspor batu bara (${miliar(eksporBatubara24)} miliar USD). Di sisi mitra, defisit dengan Tiongkok mencapai ${miliar(
        defisitChina
      )} miliar USD pada 2025.`,
      tautan: [
        { label: "Bab 1: Energi", href: "#energi" },
        { label: "Bab 2: Aliran dagang", href: "#aliran" },
      ],
    },
    {
      id: "struktur",
      sudut: "Struktur",
      judul: "Yang dijual mentah, yang dibeli jadi",
      angka: `${angka1(porsiImporMesin)}%`,
      satuan: "impor 2025 berupa mesin dan alat angkut",
      teks: `Mesin dan alat angkut menyumbang ${angka1(porsiImporMesin)} persen impor, tetapi hanya ${angka1(
        porsiEksporMesin
      )} persen ekspor. Surplus terbesar datang dari minyak sawit, batu bara, dan besi kasar. Defisit terbesar dari produk minyak olahan, peralatan telekomunikasi, dan minyak mentah.`,
      tautan: [
        { label: "Bab 3: Komoditas", href: "#treemap" },
        { label: "Bab 4: Perubahan", href: "#sunburst" },
      ],
    },
    {
      id: "wilayah",
      sudut: "Wilayah",
      judul: "Rata-rata yang menyembunyikan",
      angka: `${ch6.nasional.nSeparuh} dari ${ch6.daerah.length}`,
      satuan: "kabupaten/kota menghasilkan separuh PDRB",
      teks: `PDRB per kapita tertinggi ${Math.round(rasioPk)} kali yang terendah. Separuh penduduk di daerah termiskin hanya menghasilkan ${angka1(
        ch6.nasional.porsiBawah50
      )} persen PDRB (Gini antarwilayah ${ch6.nasional.gini.toFixed(3).replace(".", ",")}). Ketimpangan itu lebih banyak terjadi di dalam pulau dan provinsi daripada antarpulau.`,
      tautan: [
        { label: "Bab 5: PDRB", href: "#pdrb" },
        { label: "Bab 6: Massa ekonomi", href: "#massa" },
      ],
    },
  ] satisfies Temuan[],

  kutipan: "Indonesia tampak besar dan rapi dari jauh, tetapi sangat beragam dari dekat.",

  jawabanJudul: "Jadi, merata di mana?",
  jawaban: [
    "Di tingkat nasional, Indonesia kaya: neraca perdagangan surplus dan ekspor terus naik. Tapi kekayaan itu bertumpu pada barang mentah, sementara barang yang lebih rumit dibeli dari luar.",
    "Di tingkat pulau, pembagiannya relatif sebanding dengan jumlah penduduk. Jawa menghasilkan porsi PDRB yang hampir sama dengan porsi penduduknya.",
    `Ketimpangan yang paling tajam ada di skala yang paling dekat: di antara kabupaten dan kota, sering di dalam provinsi yang sama. Teluk Bintuni, dengan PDRB per kapita ${jt(
      bintuni.nilai
    )} juta rupiah, berbatasan langsung dengan Pegunungan Arfak yang hanya ${jt(
      arfak.nilai
    )} juta. Di sanalah kekayaan yang tercatat di atas kertas paling jauh dari kata merata.`,
  ],
  catatanBatas:
    "Semua ukuran wilayah di webstory ini memakai PDRB, yaitu nilai produksi di suatu wilayah, bukan pendapatan atau kesejahteraan penduduknya. Untuk melihat kesejahteraan, ukuran seperti pengeluaran per kapita, angka kemiskinan, atau indeks pembangunan manusia perlu dibandingkan dengan peta ini.",

  cekJudul: "Cek daerahmu",
  cekTeks: "Pilih satu kabupaten atau kota untuk melihat posisinya dalam semua ukuran yang dipakai di webstory ini.",
};

export const PENULIS = {
  judul: "Disusun oleh",
  nama: [{ nama: "Amrestya Gaia Bujjhati Isbandi", keterangan: "222312969" }],
  mataKuliah: "Visualisasi Data",
  institusi: "Politeknik Statistika STIS",
  tahun: "2026",
};

export const chapter7Data = { ch5, ch6 };
