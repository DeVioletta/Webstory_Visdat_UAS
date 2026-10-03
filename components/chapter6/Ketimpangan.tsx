"use client";

import { useEffect, useRef, useState } from "react";
import Caption from "@/components/ui/Caption";
import { chapter6Data } from "@/content/chapter6";
import { angka1, pctCss } from "@/lib/format";
import styles from "./chapter6.module.css";

const N = chapter6Data.nasional;
const fmt3 = (v: number) => v.toFixed(3).replace(".", ",");

/** Kurva Lorenz PDRB terhadap penduduk, ditambah kartu Indeks Williamson dan Gini */
export function Lorenz() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [lebar, setLebar] = useState(420);
  const [titik, setTitik] = useState<[number, number] | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setLebar(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const s = Math.min(lebar, 420);
  const m = 40;
  const w = s - m - 24;
  const x = (v: number) => m + v * w;
  const y = (v: number) => 12 + w - v * w;
  const kurva = chapter6Data.lorenz.map(([a, b]) => `${x(a)},${y(b)}`).join(" ");
  const area = `${x(0)},${y(0)} ${kurva} ${x(1)},${y(1)}`;

  const pilih = (clientX: number) => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box) return;
    const v = Math.max(0, Math.min(1, (clientX - box.left - m) / w));
    const i = Math.round(v * 100);
    setTitik(chapter6Data.lorenz[i] as [number, number]);
  };

  return (
    <figure className={styles.figure}>
      <div className={styles.cards}>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Indeks Williamson</p>
          <p className={styles.cardValue}>{fmt3(N.williamson)}</p>
          <p className={styles.cardNote}>
            Simpangan PDRB per kapita tiap daerah dari rata-rata nasional, ditimbang porsi penduduk, dibagi rata-rata nasional.
            0 berarti merata sempurna; makin besar makin timpang.
          </p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Indeks Gini antarwilayah</p>
          <p className={styles.cardValue}>{fmt3(N.gini)}</p>
          <p className={styles.cardNote}>
            Luas daerah antara garis merata dan kurva Lorenz, dibagi luas segitiga di bawah garis merata. 0 merata sempurna, 1
            timpang sempurna.
          </p>
        </div>
      </div>

      <div className={styles.lorenzGrid}>
        <div ref={wrapRef} className={styles.lorenzWrap} onPointerMove={(e) => pilih(e.clientX)} onPointerDown={(e) => pilih(e.clientX)} onPointerLeave={() => setTitik(null)}>
          <svg width={s} height={w + 12 + 40} role="img" aria-label={`Kurva Lorenz PDRB terhadap penduduk antar kabupaten/kota, indeks Gini ${fmt3(N.gini)}`}>
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <g key={t}>
                <line x1={x(0)} x2={x(1)} y1={y(t)} y2={y(t)} stroke="var(--rule)" />
                <text x={m - 6} y={y(t)} dy="0.35em" textAnchor="end" className={styles.axis}>
                  {t * 100}%
                </text>
                <text x={x(t)} y={y(0) + 16} textAnchor="middle" className={styles.axis}>
                  {t * 100}%
                </text>
              </g>
            ))}
            <polygon points={area} className={styles.lorenzArea} />
            <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} stroke="var(--ink-soft)" strokeDasharray="5 4" />
            <polyline points={kurva} fill="none" stroke="var(--ink)" strokeWidth={2.5} />
            <text x={x(0.52)} y={y(0.58)} className={styles.axis} transform={`rotate(-45 ${x(0.52)} ${y(0.58)})`}>
              garis merata sempurna
            </text>
            {titik ? (
              <g>
                <line x1={x(titik[0])} x2={x(titik[0])} y1={y(0)} y2={y(titik[1])} stroke="var(--ink)" strokeDasharray="2 3" />
                <line x1={x(0)} x2={x(titik[0])} y1={y(titik[1])} y2={y(titik[1])} stroke="var(--ink)" strokeDasharray="2 3" />
                <circle cx={x(titik[0])} cy={y(titik[1])} r={5} fill="var(--ink)" />
              </g>
            ) : null}
            <text x={x(1)} y={y(0) + 34} textAnchor="end" className={styles.axis}>
              porsi penduduk kumulatif, dari daerah termiskin &rarr;
            </text>
          </svg>
        </div>
        <div className={styles.lorenzSide} aria-live="polite">
          {titik ? (
            <p>
              <strong>{angka1(titik[0] * 100)}% penduduk</strong> yang tinggal di daerah dengan PDRB per kapita terendah menghasilkan{" "}
              <strong>{angka1(titik[1] * 100)}% PDRB</strong>.
            </p>
          ) : (
            <p className={styles.muted}>
              Sumbu tegak adalah porsi PDRB kumulatif. Kalau setiap daerah sama makmurnya, kurva akan menempel di garis putus-putus.
              Arahkan kursor ke grafik untuk membaca titik mana pun.
            </p>
          )}
        </div>
      </div>

      <Caption
        judul="Kurva Lorenz PDRB terhadap penduduk antarkabupaten/kota, 2025"
        satuan="persen kumulatif (kedua sumbu)"
        catatan={`${chapter6Data.daerah.length} kabupaten/kota diurutkan dari PDRB per kapita terendah. Penduduk diturunkan dari PDRB dibagi PDRB per kapita (keduanya BPS), total ${angka1(
          N.pendudukTurunan / 1e6
        )} juta jiwa. Indeks ini mengukur ketimpangan antarwilayah, bukan ketimpangan antarpenduduk di dalam wilayah.`}
      />
    </figure>
  );
}

/** Batang berpasangan: porsi PDRB dan porsi penduduk per pulau */
export function PulauBars() {
  const maks = Math.max(...chapter6Data.pulau.flatMap((p) => [p.porsiPdrb, p.porsiPenduduk]));
  return (
    <figure className={styles.figure}>
      <ul className={styles.pulauLegend} aria-hidden="true">
        <li>
          <span className={styles.swatch} style={{ backgroundColor: "var(--ink)" }} /> Porsi PDRB
        </li>
        <li>
          <span className={styles.swatch} style={{ backgroundColor: "var(--e-gas)" }} /> Porsi penduduk
        </li>
      </ul>
      <ul className={styles.pulau}>
        {chapter6Data.pulau.map((p) => {
          const rasio = p.porsiPdrb / p.porsiPenduduk;
          return (
            <li key={p.nama} aria-label={`${p.nama}: ${angka1(p.porsiPdrb)} persen PDRB, ${angka1(p.porsiPenduduk)} persen penduduk`}>
              <span className={styles.pulauName}>{p.nama}</span>
              <span className={styles.pulauBars}>
                <span style={{ width: pctCss((p.porsiPdrb / maks) * 82), backgroundColor: "var(--ink)" }}>
                  <em>{angka1(p.porsiPdrb)}%</em>
                </span>
                <span style={{ width: pctCss((p.porsiPenduduk / maks) * 82), backgroundColor: "var(--e-gas)" }}>
                  <em>{angka1(p.porsiPenduduk)}%</em>
                </span>
              </span>
              <span className={styles.pulauRatio} title="Porsi PDRB dibagi porsi penduduk">
                {angka1(rasio).replace(",0", "")}&times;
              </span>
            </li>
          );
        })}
      </ul>
      <Caption
        judul="Porsi PDRB dan porsi penduduk menurut pulau, 2025"
        satuan="persen dari total Indonesia"
        catatan="Angka di kanan adalah porsi PDRB dibagi porsi penduduk: di atas 1 berarti menghasilkan lebih banyak dari porsi penduduknya. Penduduk diturunkan dari PDRB dibagi PDRB per kapita kabupaten/kota."
      />
    </figure>
  );
}
