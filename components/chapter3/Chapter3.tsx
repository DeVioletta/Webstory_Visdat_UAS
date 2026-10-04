"use client";

import { useEffect, useState } from "react";
import story from "@/components/ui/story.module.css";
import CatatanEmas from "@/components/ui/CatatanEmas";
import { useActiveStep } from "@/components/ui/useActiveStep";
import { chapter3Copy, type TreemapState } from "@/content/chapter3";
import SurplusDefisit from "./SurplusDefisit";
import Treemap from "./Treemap";

export default function Chapter3() {
  const steps = chapter3Copy.steps;
  const { aktif, setRef } = useActiveStep(steps.length);

  // Pilihan pembaca menimpa keadaan langkah sampai pembaca pindah langkah
  const [manual, setManual] = useState<Partial<TreemapState>>({});
  useEffect(() => setManual({}), [aktif]);
  const state: TreemapState = { ...steps[aktif].state, ...manual };

  return (
    <section id="treemap" className={story.chapter} aria-labelledby="bab3-judul">
      <header className={story.opener}>
        <p className={story.chapterNum}>{chapter3Copy.nomor}</p>
        <h2 id="bab3-judul" className={story.headline}>
          {chapter3Copy.judul}
        </h2>
        <p className={story.lede}>{chapter3Copy.pengantar}</p>
        <CatatanEmas id="catatan-emas-bab3" babLain="Bab 4" />
      </header>

      <div
        className={story.scrolly}
        style={{ "--steps-fr": "0.55fr", "--chart-fr": "1.45fr" } as React.CSSProperties}
      >
        <div className={story.sticky}>
          <Treemap state={state} onChange={(s) => setManual((m) => ({ ...m, ...s }))} />
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

      <section className={story.section} aria-labelledby="bab3-daftar">
        <div className={story.sectionHead}>
          <p id="bab3-daftar" className={story.sectionText}>
            {chapter3Copy.daftarTeks}
          </p>
        </div>
        <SurplusDefisit />
      </section>

      <aside className={story.next}>
        <p className={story.nextLabel}>{chapter3Copy.penutupLabel}</p>
        <p className={story.nextText}>{chapter3Copy.penutup}</p>
      </aside>
    </section>
  );
}