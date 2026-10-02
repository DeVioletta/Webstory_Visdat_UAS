"use client";

import { useEffect, useRef, useState } from "react";
import Caption from "@/components/ui/Caption";
import ui from "@/components/ui/ui.module.css";
import { chapter5Copy, chapter5Data, juta, type Metode } from "@/content/chapter5";
import { PALET_PDRB } from "@/lib/color";
import { kelasDari } from "./PdrbMap";
import styles from "./chapter5.module.css";

const NILAI = chapter5Data.daerah.map((d) => d.nilai); // ribu rupiah
const LOG_MIN = Math.log10(5000);
const LOG_MAKS = Math.log10(1_200_000);
const JUMLAH_BIN = 30;
const LEBAR_BIN = (LOG_MAKS - LOG_MIN) / JUMLAH_BIN;
const BIN = Array.from({ length: JUMLAH_BIN }, (_, i) => {
  const a = LOG_MIN + i * LEBAR_BIN;
  const isi = chapter5Data.daerah.filter((d) => {
    const l = Math.log10(d.nilai);
    return l >= a && (l < a + LEBAR_BIN || (i === JUMLAH_BIN - 1 && l <= a + LEBAR_BIN));
  });
  return { a, b: a + LEBAR_BIN, isi };
});
const N_MAKS = Math.max(...BIN.map((b) => b.isi.length));
const TICK = [10, 20, 50, 100, 200, 500, 1000]; // juta rupiah

export default function Histogram() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [lebar, setLebar] = useState(800);
  const [metode, setMetode] = useState<Metode>("kuantil");
  const [aktif, setAktif] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setLebar(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const m = { l: 40, r: 16, t: 44, b: 40 };
  const tinggi = lebar < 560 ? 240 : 280;
  const w = lebar - m.l - m.r;
  const h = tinggi - m.t - m.b;
  const x = (log: number) => m.l + ((log - LOG_MIN) / (LOG_MAKS - LOG_MIN)) * w;
  const y = (n: number) => m.t + h - (n / N_MAKS) * h;
  const batas = chapter5Data.kelas[metode];
  const median = Math.log10(chapter5Data.ringkas.median);
  const rata = Math.log10(chapter5Data.ringkas.rata);
  const b = aktif !== null ? BIN[aktif] : null;

  return (
    <figure className={styles.figure}>
      <div className={styles.head}>
        <h3 className={styles.title}>{chapter5Copy.distribusiJudul}</h3>
        <div role="group" aria-label="Metode klasifikasi" className={ui.segment}>
          {(
            [
              ["kuantil", "Batas kuantil"],
              ["jenks", "Batas natural breaks"],
            ] as [Metode, string][]
          ).map(([k, t]) => (
            <button key={k} type="button" aria-pressed={metode === k} onClick={() => setMetode(k)}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div ref={wrapRef} className={styles.histWrap} onPointerLeave={() => setAktif(null)}>
        <svg width={lebar} height={tinggi} role="img" aria-label="Histogram PDRB per kapita kabupaten/kota dengan skala logaritma">
          {Array.from({ length: Math.floor(N_MAKS / 10) + 1 }, (_, i) => i * 10).map((t) => (
            <g key={t}>
              <line x1={m.l} x2={m.l + w} y1={y(t)} y2={y(t)} stroke="var(--rule)" />
              <text x={m.l - 6} y={y(t)} dy="0.35em" textAnchor="end" className={styles.axis}>
                {t}
              </text>
            </g>
          ))}
          <text x={0} y={m.t - 30} className={styles.axis}>
            jumlah daerah
          </text>
          {BIN.map((bin, i) => {
            const tengah = Math.pow(10, (bin.a + bin.b) / 2);
            return (
              <rect
                key={i}
                x={x(bin.a) + 1}
                y={y(bin.isi.length)}
                width={Math.max(1, x(bin.b) - x(bin.a) - 2)}
                height={m.t + h - y(bin.isi.length)}
                fill={PALET_PDRB[kelasDari(tengah, batas)]}
                stroke={aktif === i ? "var(--ink)" : "var(--ink-soft)"}
                strokeWidth={aktif === i ? 2 : 0.5}
                onPointerMove={() => setAktif(i)}
                onPointerDown={() => setAktif(i)}
              />
            );
          })}
          {batas.slice(0, -1).map((v) => (
            <line key={v} x1={x(Math.log10(v))} x2={x(Math.log10(v))} y1={m.t - 6} y2={m.t + h} className={styles.breakLine} />
          ))}
          {[
            { v: median, t: "median" },
            { v: rata, t: "rata-rata" },
          ].map((r, i) => (
            <g key={r.t}>
              <line x1={x(r.v)} x2={x(r.v)} y1={m.t - 16 + i * 12} y2={m.t + h} stroke="var(--ink)" strokeWidth={1.5} />
              <text x={x(r.v) + 4} y={m.t - 20 + i * 12} className={styles.axisStrong}>
                {r.t} {juta(Math.pow(10, r.v))}
              </text>
            </g>
          ))}
          {TICK.map((t) => (
            <text key={t} x={x(Math.log10(t * 1000))} y={m.t + h + 16} textAnchor="middle" className={styles.axis}>
              {t}
            </text>
          ))}
          <text x={m.l + w} y={tinggi - 4} textAnchor="end" className={styles.axis}>
            juta rupiah per penduduk (skala logaritma)
          </text>
        </svg>
      </div>
      <div className={styles.inspector} aria-live="polite">
        {b ? (
          <p>
            <strong>{b.isi.length} daerah</strong> dengan PDRB per kapita {juta(Math.pow(10, b.a))} sampai{" "}
            {juta(Math.pow(10, b.b))} juta rupiah
            {b.isi.length && b.isi.length <= 6 ? `: ${b.isi.map((d) => d.nama).join(", ")}` : ""}.
          </p>
        ) : (
          <p className={styles.muted}>
            Arahkan kursor ke batang. Garis putus-putus adalah batas kelas yang dipakai peta. Dengan natural breaks, empat batas
            kelas berada di ekor kanan yang hanya berisi sedikit daerah.
          </p>
        )}
      </div>
      <Caption
        judul={chapter5Copy.distribusiJudul}
        satuan="jumlah kabupaten/kota (tinggi batang); juta rupiah per penduduk per tahun, skala logaritma (sumbu mendatar)"
        catatan={`${NILAI.length} kabupaten/kota. Warna batang mengikuti kelas peta untuk metode yang dipilih.`}
      />
    </figure>
  );
}
