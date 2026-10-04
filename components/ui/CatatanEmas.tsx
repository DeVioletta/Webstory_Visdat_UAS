import { cariJalur, TREE } from "@/content/chapter3";
import ch0 from "@/data/processed/chapter0.json";
import { angka1, miliar, pertumbuhan } from "@/lib/format";
import styles from "./CatatanEmas.module.css";

/**
 * Catatan yang menjelaskan mengapa total pada hirarki komoditas (Bab 3 dan 4)
 * sedikit berbeda dari total di Bab 0, dan bahwa emas nonmoneter (SITC 971) tetap termasuk.
 * Semua angka dihitung dari data, jadi ikut berubah bila data diperbarui.
 *
 * Pasang di awal bab, sebelum grafik hirarki:
 *   <CatatanEmas id="catatan-emas-bab3" babLain="Bab 4" />
 */

type Tahun = "2024" | "2025";
type Arus = "ekspor" | "impor";

const KOLOM: { arus: Arus; tahun: Tahun }[] = [
  { arus: "ekspor", tahun: "2024" },
  { arus: "ekspor", tahun: "2025" },
  { arus: "impor", tahun: "2024" },
  { arus: "impor", tahun: "2025" },
];

const totalBab0 = (a: Arus, t: Tahun) => ch0.totals[t][a]; // juta USD, termasuk emas moneter
const totalHirarki = (a: Arus, t: Tahun) => TREE.nilai[t][a === "ekspor" ? "e" : "i"]; // juta USD, tanpa emas moneter
const emasMoneter = (a: Arus, t: Tahun) => totalBab0(a, t) - totalHirarki(a, t);

/** Selisih yang sangat kecil ditulis "< 0,1" supaya tidak terbaca sebagai angka nol yang keliru */
const fmt = (jutaUSD: number) => (jutaUSD > 0 && jutaUSD < 50 ? "< 0,1" : miliar(jutaUSD));

const jalur971 = cariJalur("971");
const emas971 = jalur971 ? jalur971[jalur971.length - 1] : null;
const persenEkspor2025 = (emasMoneter("ekspor", "2025") / totalBab0("ekspor", "2025")) * 100;
// Pertumbuhan ekspor 2024 ke 2025: dengan emas moneter (Bab 0) dan tanpa emas moneter (hirarki)
const tumbuhBab0 = pertumbuhan(totalBab0("ekspor", "2024"), totalBab0("ekspor", "2025"));
const tumbuhHirarki = pertumbuhan(totalHirarki("ekspor", "2024"), totalHirarki("ekspor", "2025"));

interface Props {
  id: string;
  /** Bab lain yang memakai hirarki yang sama, mis. "Bab 4" di Bab 3 dan "Bab 3" di Bab 4 */
  babLain: string;
}

export default function CatatanEmas({ id, babLain }: Props) {
  return (
    <aside className={styles.note} aria-labelledby={id}>
      <p className={styles.label}>Catatan nilai</p>
      <h3 id={id} className={styles.title}>
        Kenapa total di bab ini sedikit berbeda dari Bab 0?
      </h3>
      <p className={styles.text}>
        <a href="#skala">Bab 0</a> memakai total ekspor dan impor resmi BPS, yang mencakup <strong>emas moneter</strong>. Bab
        ini dan {babLain} membahas komoditas yang diperdagangkan, jadi emas moneter dikeluarkan: emas jenis ini dipegang
        otoritas moneter sebagai cadangan devisa, bukan barang dagangan.
      </p>
      <p className={styles.text}>
        <strong>Emas non-moneter tetap masuk.</strong> Emas yang diperdagangkan sebagai barang tercatat pada kode SITC 971
        (Division 97) dan ada di diagram ini
        {emas971 ? (
          <>
            : pada 2025 ekspornya {miliar(emas971.nilai["2025"].e)} miliar USD dan impornya {miliar(emas971.nilai["2025"].i)}{" "}
            miliar USD
          </>
        ) : null}
        .
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>
            Selisih total ekspor dan impor antara Bab 0 dan hirarki komoditas, dalam miliar USD
          </caption>
          <thead>
            <tr>
              <th scope="col">&nbsp;</th>
              <th scope="col">Total di Bab 0 (resmi BPS)</th>
              <th scope="col">Dikurangi emas moneter</th>
              <th scope="col" className={styles.hasil}>
                Total di bab ini
              </th>
            </tr>
          </thead>
          <tbody>
            {KOLOM.map((k) => (
              <tr key={`${k.arus}-${k.tahun}`} className={k.arus === "impor" && k.tahun === "2024" ? styles.pisah : undefined}>
                <th scope="row">
                  {k.arus === "ekspor" ? "Ekspor" : "Impor"} {k.tahun}
                </th>
                <td>{miliar(totalBab0(k.arus, k.tahun))}</td>
                <td>{fmt(emasMoneter(k.arus, k.tahun))}</td>
                <td className={styles.hasil}>{miliar(totalHirarki(k.arus, k.tahun))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.sumber}>
        Satuan: miliar USD. Selisih ekspor 2025 hanya {angka1(persenEkspor2025)}% dari total; impor praktis tidak
        terpengaruh. Akibatnya pertumbuhan ekspor 2024 ke 2025 di bab ini ({angka1(tumbuhHirarki)}%) sedikit lebih rendah
        daripada di Bab 0 ({angka1(tumbuhBab0)}%). Sumber: BPS
      </p>
    </aside>
  );
}