"use client";

import { useEffect, useState } from "react";
import story from "@/components/ui/story.module.css";
import CatatanEmas from "@/components/ui/CatatanEmas";
import { useActiveStep } from "@/components/ui/useActiveStep";
import { chapter4Copy, type SunburstState } from "@/content/chapter4";
import Sunburst from "./Sunburst";

export default function Chapter4() {
  const steps = chapter4Copy.steps;
  const { aktif, setRef } = useActiveStep(steps.length);

  // Pilihan pembaca menimpa keadaan langkah sampai pembaca pindah langkah
  const [manual, setManual] = useState<Partial<SunburstState>>({});
  useEffect(() => setManual({}), [aktif]);
  const state: SunburstState = { ...steps[aktif].state, ...manual };

  return (
    <section id="sunburst" className={story.chapter} aria-labelledby="bab4-judul">
      <header className={story.opener}>
        <p className={story.chapterNum}>{chapter4Copy.nomor}</p>
        <h2 id="bab4-judul" className={story.headline}>
          {chapter4Copy.judul}
        </h2>
        <p className={story.lede}>{chapter4Copy.pengantar}</p>
        {/* <CatatanEmas id="catatan-emas-bab4" babLain="Bab 3" /> */}
      </header>

      <div
        className={story.scrolly}
        style={{ "--steps-fr": "0.55fr", "--chart-fr": "1.45fr" } as React.CSSProperties}
      >
        <div className={story.sticky}>
          <Sunburst state={state} onChange={(s) => setManual((m) => ({ ...m, ...s }))} />
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

      <aside className={story.next}>
        <p className={story.nextLabel}>{chapter4Copy.penutupLabel}</p>
        <p className={story.nextText}>{chapter4Copy.penutup}</p>
      </aside>
    </section>
  );
}