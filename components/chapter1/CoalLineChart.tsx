"use client";

import { useEffect, useRef, useState } from "react";
import Caption from "@/components/ui/Caption";
import { chapter1Copy, chapter1Data } from "@/content/chapter1";
import { formatTJ, jutaTJ } from "@/lib/format";
import styles from "./chapter1.module.css";

type Kunci = "produksi" | "ekspor" | "pemakaianDalamNegeri";

/** Warna + pola garis + bentuk penanda: makna tidak bergantung pada warna saja */
const SERI: { kunci: Kunci; label: string; pendek: string; warna: string; dash?: string; penanda: "lingkaran" | "kotak" | "segitiga" }[] = [
  { kunci: "produksi", label: "Produksi", pendek: "Produksi", warna: "var(--e-batubara)", penanda: "lingkaran" },
  { kunci: "ekspor", label: "Ekspor", pendek: "Ekspor", warna: "var(--ekspor)", penanda: "kotak" },
  {
    kunci: "pemakaianDalamNegeri",
    label: "Pemakaian dalam negeri",
    pendek: "Dalam negeri",
    warna: "var(--domestik)",
    dash: "6 4",
    penanda: "segitiga",
  },
];

const DATA = chapter1Data.batubara;
const MARGIN = { top: 28, right: 140, bottom: 32, left: 44 };

function Penanda({ x, y, bentuk, warna }: { x: number; y: number; bentuk: string; warna: string }) {
  if (bentuk === "kotak") return <rect x={x - 4} y={y - 4} width={8} height={8} fill={warna} />;
  if (bentuk === "segitiga")
    return <path d={`M${x},${y - 5} L${x + 5},${y + 4} L${x - 5},${y + 4} Z`} fill={warna} />;
  return <circle cx={x} cy={y} r={4.5} fill={warna} />;
}

export default function CoalLineChart() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [lebar, setLebar] = useState(800);
  const [aktif, setAktif] = useState<Record<Kunci, boolean>>({
    produksi: true,
    ekspor: true,
    pemakaianDalamNegeri: true,
  });
  const [idxTahun, setIdxTahun] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setLebar(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const sempit = lebar < 560;
  const m = { ...MARGIN, right: sempit ? 16 : MARGIN.right };
  const tinggi = sempit ? 280 : 340;
  const w = lebar - m.left - m.right;
  const h = tinggi - m.top - m.bottom;

  const yMaks = 25_000_000;
  const x = (i: number) => m.left + (i / (DATA.length - 1)) * w;
  const y = (v: number) => m.top + h - (v / yMaks) * h;
  const ticks = [0, 5, 10, 15, 20, 25].map((t) => t * 1_000_000);

  const pilihTahun = (clientX: number) => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box) return;
    const rel = (clientX - box.left - m.left) / w;
    setIdxTahun(Math.max(0, Math.min(DATA.length - 1, Math.round(rel * (DATA.length - 1)))));
  };

  const d = idxTahun !== null ? DATA[idxTahun] : null;

  return (
    <figure className={styles.figure}>
      <div className={styles.head}>
        <h3 className={styles.title}>Batu bara, 2020-2024</h3>
        <div role="group" aria-label="Tampilkan atau sembunyikan garis" className={styles.toggles}>
          {SERI.map((s) => (
            <button
              key={s.kunci}
              type="button"
              aria-pressed={aktif[s.kunci]}
              onClick={() => setAktif((a) => ({ ...a, [s.kunci]: !a[s.kunci] }))}
            >
              <svg width="14" height="10" aria-hidden="true">
                <line x1="0" y1="5" x2="14" y2="5" stroke={s.warna} strokeWidth="2.5" strokeDasharray={s.dash} />
              </svg>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={wrapRef}
        className={styles.lineWrap}
        onPointerMove={(e) => pilihTahun(e.clientX)}
        onPointerDown={(e) => pilihTahun(e.clientX)}
        onPointerLeave={() => setIdxTahun(null)}
      >
        <svg
          width={lebar}
          height={tinggi}
          role="img"
          aria-label="Grafik garis produksi, ekspor, dan pemakaian dalam negeri batu bara 2020 sampai 2024"
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={m.left} x2={m.left + w} y1={y(t)} y2={y(t)} stroke="var(--rule)" strokeWidth={t === 0 ? 1.5 : 1} />
              <text x={m.left - 8} y={y(t)} dy="0.35em" textAnchor="end" className={styles.axis}>
                {t / 1_000_000}
              </text>
            </g>
          ))}
          <text x={m.left - 30} y={m.top - 14} className={styles.axis}>
            juta TJ
          </text>
          {DATA.map((r, i) => (
            <text key={r.tahun} x={x(i)} y={tinggi - 8} textAnchor="middle" className={styles.axis}>
              {r.tahun}
            </text>
          ))}

          {idxTahun !== null ? (
            <line x1={x(idxTahun)} x2={x(idxTahun)} y1={m.top} y2={m.top + h} stroke="var(--ink-soft)" strokeDasharray="2 3" />
          ) : null}

          {SERI.filter((s) => aktif[s.kunci]).map((s) => {
            const pts = DATA.map((r, i) => `${x(i)},${y(r[s.kunci])}`).join(" ");
            const akhir = DATA[DATA.length - 1][s.kunci];
            return (
              <g key={s.kunci}>
                <polyline points={pts} fill="none" stroke={s.warna} strokeWidth={2.5} strokeDasharray={s.dash} />
                {DATA.map((r, i) => (
                  <Penanda key={i} x={x(i)} y={y(r[s.kunci])} bentuk={s.penanda} warna={s.warna} />
                ))}
                {!sempit ? (
                  <text x={x(DATA.length - 1) + 10} y={y(akhir)} dy="0.35em" className={styles.endLabel}>
                    {s.pendek} {jutaTJ(akhir)}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      <div className={styles.lineDetail} aria-live="polite">
        {d ? (
          <>
            <p className={styles.tooltipTitle}>{d.tahun}</p>
            <dl>
              <div>
                <dt>Produksi</dt>
                <dd>{formatTJ(d.produksi)}</dd>
              </div>
              <div>
                <dt>Ekspor</dt>
                <dd>
                  {formatTJ(d.ekspor)} ({Math.round((d.ekspor / d.produksi) * 100)}% produksi)
                </dd>
              </div>
              <div>
                <dt>Pemakaian dalam negeri</dt>
                <dd>{formatTJ(d.pemakaianDalamNegeri)}</dd>
              </div>
              <div>
                <dt>Rinciannya</dt>
                <dd>
                  dikonversi {formatTJ(d.konversi)}, langsung dipakai industri {formatTJ(d.konsumsiAkhir)}
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <p className={styles.hintInline}>Arahkan kursor atau ketuk grafik untuk melihat angka tiap tahun.</p>
        )}
      </div>

      <Caption
        judul={chapter1Copy.garisCaption}
        satuan="juta terajoule (TJ)"
        catatan="Pemakaian dalam negeri adalah batu bara yang dikonversi (terutama di pembangkit listrik) ditambah konsumsi akhir langsung oleh industri. Angka 2024 merupakan angka sementara."
      />
    </figure>
  );
}
