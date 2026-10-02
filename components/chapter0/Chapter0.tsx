"use client";

import { useEffect, useState } from "react";
import { useActiveStep } from "@/components/ui/useActiveStep";
import { chapter0Copy, type ChartState, type ModeNilai, type Tahun } from "@/content/chapter0";
import HeadlineFigures from "./HeadlineFigures";
import RankingChart from "./RankingChart";
import styles from "./chapter0.module.css";

export default function Chapter0() {
  const steps = chapter0Copy.steps;
  const { aktif, setRef } = useActiveStep(steps.length);

  // Pilihan manual pembaca (tombol tahun/ukuran). Direset setiap pindah langkah,
  // supaya cerita kembali ke keadaan yang dirancang untuk langkah itu.
  const [manual, setManual] = useState<Partial<ChartState>>({});
  useEffect(() => setManual({}), [aktif]);

  const state: ChartState = { ...steps[aktif].chart, ...manual };

  return (
    <section id="skala" className={styles.chapter} aria-labelledby="bab0-judul">
      <header className={styles.opener}>
        <p className={styles.chapterNum}>{chapter0Copy.nomor}</p>
        <h2 id="bab0-judul" className={styles.headline}>
          {chapter0Copy.judul}
        </h2>
        <p className={styles.lede}>{chapter0Copy.pengantar}</p>
      </header>

      <HeadlineFigures />

      <div className={styles.scrolly}>
        <div className={styles.sticky}>
          <RankingChart
            state={state}
            onTahun={(t: Tahun) => setManual((m) => ({ ...m, tahun: t }))}
            onMode={(mo: ModeNilai) => setManual((m) => ({ ...m, mode: mo }))}
          />
        </div>
        <div className={styles.steps}>
          {steps.map((s, i) => (
            <article
              key={s.id}
              ref={setRef(i)}
              data-step={i}
              data-aktif={i === aktif ? "true" : undefined}
              className={styles.step}
            >
              <p>{s.teks}</p>
            </article>
          ))}
        </div>
      </div>

      <aside className={styles.next}>
        <p className={styles.nextLabel}>{chapter0Copy.penutupLabel}</p>
        <p className={styles.nextText}>{chapter0Copy.penutup}</p>
      </aside>
    </section>
  );
}
