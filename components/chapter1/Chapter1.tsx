"use client";

import { useEffect, useState } from "react";
import story from "@/components/ui/story.module.css";
import { useActiveStep } from "@/components/ui/useActiveStep";
import { chapter1Copy, type Fokus } from "@/content/chapter1";
import CoalLineChart from "./CoalLineChart";
import SankeyChart from "./SankeyChart";

export default function Chapter1() {
  const steps = chapter1Copy.steps;
  const { aktif, setRef } = useActiveStep(steps.length);

  // Pilihan pembaca menimpa fokus langkah sampai pembaca pindah ke langkah lain
  const [manual, setManual] = useState<Fokus | null>(null);
  useEffect(() => setManual(null), [aktif]);
  const fokus = manual ?? steps[aktif].fokus;

  return (
    <section id="energi" className={story.chapter} aria-labelledby="bab1-judul">
      <header className={story.opener}>
        <p className={story.chapterNum}>{chapter1Copy.nomor}</p>
        <h2 id="bab1-judul" className={story.headline}>
          {chapter1Copy.judul}
        </h2>
        <p className={story.lede}>{chapter1Copy.pengantar}</p>
        <p className={story.note}>{chapter1Copy.catatanTahun}</p>
      </header>

      {/* Sankey butuh ruang lebar: kolom teks dipersempit lewat variabel CSS */}
      <div
        className={story.scrolly}
        style={{ "--steps-fr": "0.5fr", "--chart-fr": "1.5fr" } as React.CSSProperties}
      >
        <div className={story.sticky}>
          <SankeyChart fokus={fokus} onFokus={setManual} />
        </div>
        <div className={story.steps}>
          {steps.map((s, i) => (
            <article
              key={s.id}
              ref={setRef(i)}
              data-step={i}
              data-aktif={i === aktif ? "true" : undefined}
              className={story.step}
            >
              <p>{s.teks}</p>
            </article>
          ))}
        </div>
      </div>

      <section className={story.section} aria-labelledby="bab1-garis">
        <div className={story.sectionHead}>
          <h3 id="bab1-garis" className={story.sectionTitle}>
            {chapter1Copy.garisJudul}
          </h3>
          <p className={story.sectionText}>{chapter1Copy.garisTeks}</p>
        </div>
        <CoalLineChart />
      </section>

      <aside className={story.next}>
        <p className={story.nextLabel}>{chapter1Copy.penutupLabel}</p>
        <p className={story.nextText}>{chapter1Copy.penutup}</p>
      </aside>
    </section>
  );
}
