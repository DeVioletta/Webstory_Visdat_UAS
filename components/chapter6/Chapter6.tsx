"use client";

import { useEffect, useState } from "react";
import story from "@/components/ui/story.module.css";
import { useActiveStep } from "@/components/ui/useActiveStep";
import { chapter6Copy, type MassaState } from "@/content/chapter6";
import { Lorenz, PulauBars } from "./Ketimpangan";
import MassaMap from "./MassaMap";

export default function Chapter6() {
  const steps = chapter6Copy.steps;
  const { aktif, setRef } = useActiveStep(steps.length);

  // Pilihan pembaca menimpa keadaan langkah sampai pembaca pindah langkah
  const [manual, setManual] = useState<Partial<MassaState>>({});
  useEffect(() => setManual({}), [aktif]);
  const state: MassaState = { ...steps[aktif].state, ...manual };

  return (
    <section id="massa" className={story.chapter} aria-labelledby="bab6-judul">
      <header className={story.opener}>
        <p className={story.chapterNum}>{chapter6Copy.nomor}</p>
        <h2 id="bab6-judul" className={story.headline}>
          {chapter6Copy.judul}
        </h2>
        <p className={story.lede}>{chapter6Copy.pengantar}</p>
      </header>

      <div className={story.scrolly} style={{ "--steps-fr": "0.5fr", "--chart-fr": "1.5fr" } as React.CSSProperties}>
        <div className={story.sticky}>
          <MassaMap state={state} onChange={(s) => setManual((m) => ({ ...m, ...s }))} />
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

      <section className={story.section} aria-labelledby="bab6-timpang">
        <div className={story.sectionHead}>
          <h3 id="bab6-timpang" className={story.sectionTitle}>
            {chapter6Copy.ketimpanganJudul}
          </h3>
          <p className={story.sectionText}>{chapter6Copy.ketimpanganTeks}</p>
        </div>
        <Lorenz />
      </section>

      <section className={story.section} aria-labelledby="bab6-pulau">
        <div className={story.sectionHead}>
          <h3 id="bab6-pulau" className={story.sectionTitle}>
            {chapter6Copy.pulauJudul}
          </h3>
          <p className={story.sectionText}>{chapter6Copy.pulauTeks}</p>
        </div>
        <PulauBars />
      </section>

      <aside className={story.next}>
        <p className={story.nextLabel}>{chapter6Copy.penutupLabel}</p>
        <p className={story.nextText}>{chapter6Copy.penutup}</p>
      </aside>
    </section>
  );
}
