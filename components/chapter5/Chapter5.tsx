"use client";

import { useEffect, useState } from "react";
import story from "@/components/ui/story.module.css";
import { useActiveStep } from "@/components/ui/useActiveStep";
import { chapter5Copy, type PetaState } from "@/content/chapter5";
import Histogram from "./Histogram";
import MoranScatter from "./MoranScatter";
import PdrbMap from "./PdrbMap";

export default function Chapter5() {
  const steps = chapter5Copy.steps;
  const { aktif, setRef } = useActiveStep(steps.length);

  // Pilihan pembaca menimpa keadaan langkah sampai pembaca pindah langkah
  const [manual, setManual] = useState<Partial<PetaState>>({});
  useEffect(() => setManual({}), [aktif]);
  const state: PetaState = { ...steps[aktif].state, ...manual };

  return (
    <section id="pdrb" className={story.chapter} aria-labelledby="bab5-judul">
      <header className={story.opener}>
        <p className={story.chapterNum}>{chapter5Copy.nomor}</p>
        <h2 id="bab5-judul" className={story.headline}>
          {chapter5Copy.judul}
        </h2>
        <p className={story.lede}>{chapter5Copy.pengantar}</p>
        <p className={story.note}>{chapter5Copy.catatanUkuran}</p>
      </header>

      <div className={story.scrolly} style={{ "--steps-fr": "0.5fr", "--chart-fr": "1.5fr" } as React.CSSProperties}>
        <div className={story.sticky}>
          <PdrbMap state={state} onChange={(s) => setManual((m) => ({ ...m, ...s }))} />
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

      <section className={story.section} aria-labelledby="bab5-distribusi">
        <div className={story.sectionHead}>
          <h3 id="bab5-distribusi" className={story.sectionTitle}>
            Kenapa kuantil, bukan natural breaks
          </h3>
          <p className={story.sectionText}>{chapter5Copy.distribusiTeks}</p>
        </div>
        <Histogram />
      </section>

      <section className={story.section} aria-labelledby="bab5-moran">
        <div className={story.sectionHead}>
          <h3 id="bab5-moran" className={story.sectionTitle}>
            Apakah tetangga ikut kaya?
          </h3>
          <p className={story.sectionText}>{chapter5Copy.moranTeks}</p>
        </div>
        <MoranScatter />
      </section>

      <aside className={story.next}>
        <p className={story.nextLabel}>{chapter5Copy.penutupLabel}</p>
        <p className={story.nextText}>{chapter5Copy.penutup}</p>
      </aside>
    </section>
  );
}
