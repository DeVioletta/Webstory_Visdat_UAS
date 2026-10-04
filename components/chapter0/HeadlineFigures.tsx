import Caption from "@/components/ui/Caption";
import { chapter0Copy, chapter0Data } from "@/content/chapter0";
import { angka1, miliar, pertumbuhan, pctCss } from "@/lib/format";
import styles from "./chapter0.module.css";

type Kunci = "ekspor" | "impor" | "neraca";

const ITEMS: { kunci: Kunci; label: string; warna: string }[] = [
  { kunci: "ekspor", label: "Ekspor", warna: "var(--ekspor)" },
  { kunci: "impor", label: "Impor", warna: "var(--impor)" },
  { kunci: "neraca", label: "Neraca perdagangan", warna: "var(--ink)" },
];

export default function HeadlineFigures() {
  const t24 = chapter0Data.totals["2024"];
  const t25 = chapter0Data.totals["2025"];
  // Satu skala untuk semua batang 
  const maks = Math.max(t24.ekspor, t25.ekspor, t24.impor, t25.impor);

  return (
    <figure className={styles.figures}>
      <div className={styles.figuresGrid}>
        {ITEMS.map(({ kunci, label, warna }) => {
          const lama = t24[kunci];
          const baru = t25[kunci];
          const g = pertumbuhan(lama, baru);
          const arah = g >= 0 ? "naik" : "turun";
          return (
            <div key={kunci} className={styles.figure}>
              <p className={styles.figureLabel}>{label} 2025</p>
              <p className={styles.figureValue}>
                {miliar(baru)}
                <span className={styles.figureUnit}> miliar US$</span>
              </p>
              <p className={styles.figureDelta}>
                {arah} {angka1(Math.abs(g))}% dari 2024
              </p>
              <div className={styles.pair} aria-hidden="true">
                {[
                  { tahun: "2024", nilai: lama, opacity: 0.35 },
                  { tahun: "2025", nilai: baru, opacity: 1 },
                ].map((b) => (
                  <div key={b.tahun} className={styles.pairRow}>
                    <span className={styles.pairYear}>{b.tahun}</span>
                    <span className={styles.pairTrack}>
                      <span
                        className={styles.pairBar}
                        style={{
                          width: pctCss((b.nilai / maks) * 100),
                          backgroundColor: warna,
                          opacity: b.opacity,
                        }}
                      />
                    </span>
                    <span className={styles.pairValue}>{miliar(b.nilai)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <Caption
        judul={chapter0Copy.figurJudul}
        satuan="miliar US$"
        catatan="Panjang batang memakai skala yang sama untuk ketiga indikator. Total mencakup emas moneter, yang dikeluarkan pada Bab 3 dan 4 karena bukan barang dagangan (lihat catatan di awal Bab 3)."
      />
    </figure>
  );
}