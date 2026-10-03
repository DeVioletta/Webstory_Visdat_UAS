"use client";

import { useEffect, useRef, useState } from "react";
import Caption from "@/components/ui/Caption";
import { chapter5Copy, chapter5Data, juta, LABEL_LISA, type Daerah } from "@/content/chapter5";
import { WARNA_LISA } from "@/lib/color";
import PdrbMap from "./PdrbMap";
import styles from "./chapter5.module.css";

type Klaster = "HH" | "HL" | "LH" | "LL";
const D = chapter5Data.daerah;
const BATAS = Math.ceil(Math.max(...D.flatMap((d) => [Math.abs(d.z), Math.abs(d.lag)])) * 2) / 2;

export default function MoranScatter() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [lebar, setLebar] = useState(480);
  const [pilih, setPilih] = useState<Klaster | null>(null);
  const [hover, setHover] = useState<Daerah | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setLebar(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const m = 34;
  const s = Math.min(lebar, 460);
  const sisi = s - 2 * m;
  const sx = (v: number) => m + ((v + BATAS) / (2 * BATAS)) * sisi;
  const sy = (v: number) => m + sisi - ((v + BATAS) / (2 * BATAS)) * sisi;
  const I = chapter5Data.moran.I;

  // Kuadran: kanan atas HH, kiri atas LH, kiri bawah LL, kanan bawah HL
  const kuadran: { k: Klaster; x: number; y: number }[] = [
    { k: "HH", x: sx(0), y: m },
    { k: "LH", x: m, y: m },
    { k: "LL", x: m, y: sy(0) },
    { k: "HL", x: sx(0), y: sy(0) },
  ];
  const idSorot = pilih ? D.filter((d) => d.lisa === pilih).map((d) => d.id) : [];

  return (
    <figure className={styles.figure}>
      <div className={styles.head}>
        <h3 className={styles.title}>{chapter5Copy.moranJudul}</h3>
        <p className={styles.moranStat}>
          I = {I.toFixed(3).replace(".", ",")} &middot; p = {chapter5Data.moran.p.toFixed(3).replace(".", ",")} &middot;{" "}
          {chapter5Data.moran.permutasi} permutasi
        </p>
      </div>

      <div role="group" aria-label="Pilih klaster" className={styles.clusterButtons}>
        {(["HH", "HL", "LH", "LL"] as Klaster[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={pilih === k}
            onClick={() => setPilih((p) => (p === k ? null : k))}
          >
            <span className={styles.swatch} style={{ backgroundColor: WARNA_LISA[k] }} />
            {LABEL_LISA[k].singkat} ({D.filter((d) => d.lisa === k).length})
          </button>
        ))}
      </div>

      <div className={styles.moranGrid}>
        <div ref={wrapRef} className={styles.scatterWrap} onPointerLeave={() => setHover(null)}>
          <svg width={s} height={s} role="img" aria-label="Diagram sebar Moran: PDRB per kapita baku terhadap rata-rata tetangga">
            {kuadran.map((q) => (
              <rect
                key={q.k}
                x={q.x}
                y={q.y}
                width={sisi / 2}
                height={sisi / 2}
                className={styles.quadrant}
                data-aktif={pilih === q.k ? "true" : undefined}
                onClick={() => setPilih((p) => (p === q.k ? null : q.k))}
              />
            ))}
            <line x1={m} x2={m + sisi} y1={sy(0)} y2={sy(0)} stroke="var(--ink-soft)" />
            <line x1={sx(0)} x2={sx(0)} y1={m} y2={m + sisi} stroke="var(--ink-soft)" />
            {/* Garis regresi: kemiringannya sama dengan Moran's I */}
            <line
              x1={sx(-BATAS)}
              y1={sy(-BATAS * I)}
              x2={sx(BATAS)}
              y2={sy(BATAS * I)}
              stroke="var(--ink)"
              strokeWidth={1.5}
              strokeDasharray="5 4"
            />
            {D.map((d) => {
              const aktif = !pilih || d.lisa === pilih;
              return (
                <circle
                  key={d.id}
                  cx={sx(d.z)}
                  cy={sy(d.lag)}
                  r={hover?.id === d.id ? 6 : d.lisa === "NS" ? 2.6 : 3.6}
                  fill={WARNA_LISA[d.lisa]}
                  stroke={d.lisa === "NS" ? "var(--muted)" : "var(--surface)"}
                  strokeWidth={0.6}
                  opacity={aktif ? 1 : 0.15}
                  onPointerMove={() => setHover(d)}
                  onPointerDown={() => setHover(d)}
                />
              );
            })}
            {kuadran.map((q) => (
              <text
                key={`t-${q.k}`}
                x={q.k === "HH" || q.k === "HL" ? m + sisi - 6 : m + 6}
                y={q.k === "HH" || q.k === "LH" ? m + 14 : m + sisi - 8}
                textAnchor={q.k === "HH" || q.k === "HL" ? "end" : "start"}
                className={styles.quadLabel}
              >
                {LABEL_LISA[q.k].singkat}
              </text>
            ))}
            <text x={m + sisi} y={s - 6} textAnchor="end" className={styles.axis}>
              PDRB per kapita daerah (baku) &rarr;
            </text>
            <text transform={`translate(12, ${m}) rotate(90)`} className={styles.axis}>
              rata-rata tetangga (baku) &rarr;
            </text>
          </svg>
          <div className={styles.inspector} aria-live="polite">
            {hover ? (
              <p>
                <strong>{hover.nama}</strong>, {hover.provinsi}: Rp{juta(hover.nilai)} juta. {LABEL_LISA[hover.lisa].arti}
                {hover.lisa === "NS" ? "" : ` (p = ${hover.p.toFixed(3).replace(".", ",")})`}.
              </p>
            ) : (
              <p className={styles.muted}>
                Titik berwarna signifikan pada α = 0,05; titik abu-abu tidak. Garis putus-putus memiliki kemiringan sama dengan
                Moran&apos;s I.
              </p>
            )}
          </div>
        </div>

        <PdrbMap
          ringkas
          judul={pilih ? `Daerah ${LABEL_LISA[pilih].singkat.toLowerCase()} (${idSorot.length})` : "Semua klaster LISA"}
          state={{ lapisan: "lisa", metode: "kuantil", wilayah: "indonesia", sorot: idSorot }}
        />
      </div>

      <Caption
        judul="Diagram sebar Moran dan klaster LISA PDRB per kapita kabupaten/kota, 2025"
        satuan="nilai baku dari logaritma PDRB per kapita (kedua sumbu)"
        catatan={`${chapter5Data.moran.bobot}. Signifikansi dari ${chapter5Data.moran.permutasi} permutasi acak, α = 0,05. Batas wilayah: GeoJSON kab/kota (kode Kemendagri).`}
      />
    </figure>
  );
}
