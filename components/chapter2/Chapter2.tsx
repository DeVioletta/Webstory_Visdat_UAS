"use client";

import { useEffect, useState } from "react";
import story from "@/components/ui/story.module.css";
import { useActiveStep } from "@/components/ui/useActiveStep";
import { chapter2Copy, type FlowState } from "@/content/chapter2";
import FlowMap from "./FlowMap";
import NeracaBars from "./NeracaBars";

export default function Chapter2() {
  const steps = chapter2Copy.steps;
  const { aktif, setRef } = useActiveStep(steps.length);

  // Pilihan pembaca menimpa keadaan langkah sampai pembaca pindah langkah
  const [manual, setManual] = useState<Partial<FlowState>>({});
  useEffect(() => setManual({}), [aktif]);
  const state: FlowState = { ...steps[aktif].state, ...manual };

  return (
    <section id="aliran" className={story.chapter} aria-labelledby="bab2-judul">
      <header className={story.opener}>
        <p className={story.chapterNum}>{chapter2Copy.nomor}</p>
        <h2 id="bab2-judul" className={story.headline}>
          {chapter2Copy.judul}
        </h2>
        <p className={story.lede}>{chapter2Copy.pengantar}</p>
      </header>

      <div
        className={story.scrolly}
        style={{ "--steps-fr": "0.5fr", "--chart-fr": "1.5fr" } as React.CSSProperties}
      >
        <div className={story.sticky}>
          <FlowMap
            state={state}
            onChange={(s) =>
              // Memilih filter manual menghapus sorotan langkah agar tidak membingungkan
              setManual((m) => ({ ...m, ...s, sorot: [] }))
            }
          />
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

      <section className={story.section} aria-labelledby="bab2-neraca">
        <div className={story.sectionHead}>
          <h3 id="bab2-neraca" className={story.sectionTitle}>
            {chapter2Copy.neracaSubjudul}
          </h3>
          <p className={story.sectionText}>{chapter2Copy.neracaTeks}</p>
        </div>
        <NeracaBars />
      </section>

      <aside className={story.next}>
        <p className={story.nextLabel}>{chapter2Copy.penutupLabel}</p>
        <p className={story.nextText}>{chapter2Copy.penutup}</p>
      </aside>
    </section>
  );
}
