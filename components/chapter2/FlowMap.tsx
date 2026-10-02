"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";
import worldTopo from "world-atlas/countries-110m.json";
import Caption from "@/components/ui/Caption";
import ui from "@/components/ui/ui.module.css";
import {
  CATATAN_NILAI,
  chapter2Copy,
  chapter2Data,
  KAWASAN,
  neraca,
  type Arah,
  type FlowState,
  type Mitra,
  type Tahun2,
} from "@/content/chapter2";
import { angka1, bertanda, miliar, pertumbuhan } from "@/lib/format";
import styles from "./chapter2.module.css";

const W = 960;
const H = 470;
const ASAL: [number, number] = [117, -2.5]; // titik Indonesia

// Proyeksi dasar (tanpa zoom)
const proyeksiDasar = geoNaturalEarth1()
  .rotate([-120, 0])
  .fitExtent(
    [
      [4, 4],
      [W - 4, H - 4],
    ],
    { type: "Sphere" }
  );
const S0 = proyeksiDasar.scale();
const T0 = proyeksiDasar.translate();

// Zoom dihitung ulang di proyeksi, bukan dengan memperbesar SVG,
// sehingga tebal garis, panah, dan label tetap sesuai legenda di semua tingkat zoom.
interface Zoom {
  k: number; // faktor perbesaran
  c: [number, number]; // titik pusat tampilan, dalam koordinat peta dasar
}
const ZOOM_AWAL: Zoom = { k: 1, c: [W / 2, H / 2] };
const K_MAKS = 8;

function proyeksiZoom(z: Zoom): GeoProjection {
  return geoNaturalEarth1()
    .rotate([-120, 0])
    .scale(S0 * z.k)
    .translate([(T0[0] - z.c[0]) * z.k + W / 2, (T0[1] - z.c[1]) * z.k + H / 2]);
}

/** Batasi pusat tampilan agar peta tidak bisa digeser keluar layar */
function batasi(z: Zoom): Zoom {
  const k = Math.max(1, Math.min(K_MAKS, z.k));
  const mx = W / 2 / k;
  const my = H / 2 / k;
  return { k, c: [Math.max(mx, Math.min(W - mx, z.c[0])), Math.max(my, Math.min(H - my, z.c[1]))] };
}

const topo = worldTopo as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
const negaraGeo = feature(topo, topo.objects.countries) as unknown as FeatureCollection<Geometry, { name: string }>;

// Satu skala ketebalan untuk semua tahun & arah supaya bisa dibandingkan
const NILAI_MAKS = Math.max(...chapter2Data.mitra.flatMap((m) => [m.ekspor2024, m.ekspor2025, m.impor2024, m.impor2025]));
const tebal = (v: number) => 0.8 + 17 * (v / NILAI_MAKS);

const nilai = (m: Mitra, arah: "ekspor" | "impor", t: Tahun2) => m[`${arah}${t}` as const];

interface Busur {
  key: string;
  mitra: Mitra;
  arah: "ekspor" | "impor";
  d: string;
  lebar: number;
  ujung: [number, number];
}

function buatBusur(projection: GeoProjection, m: Mitra, arah: "ekspor" | "impor", v: number): Busur | null {
  const a = projection(ASAL);
  const b = projection([m.lon, m.lat]);
  if (!a || !b) return null;
  const [x1, y1] = a;
  const [x2, y2] = b;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const jarak = Math.hypot(dx, dy) || 1;
  // Ekspor melengkung ke satu sisi, impor ke sisi lain, supaya dua arah tidak bertumpuk
  const sisi = arah === "ekspor" ? 1 : -1;
  const lengkung = Math.min(0.32, 18 / jarak + 0.18) * jarak * sisi;
  const cx = (x1 + x2) / 2 - (dy / jarak) * lengkung;
  const cy = (y1 + y2) / 2 + (dx / jarak) * lengkung;
  const d = arah === "ekspor" ? `M${x1},${y1} Q${cx},${cy} ${x2},${y2}` : `M${x2},${y2} Q${cx},${cy} ${x1},${y1}`;
  return { key: `${m.iso3}-${arah}`, mitra: m, arah, d, lebar: tebal(v), ujung: [x2, y2] };
}

interface Props {
  state: FlowState;
  onChange: (s: Partial<FlowState>) => void;
}

export default function FlowMap({ state, onChange }: Props) {
  const { tahun, arah, kawasan, jumlah, sorot } = state;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [aktifIso, setAktifIso] = useState<string | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; m: Mitra } | null>(null);
  const [zoom, setZoom] = useState<Zoom>(ZOOM_AWAL);
  const geser = useRef<{ x: number; y: number; c: [number, number] } | null>(null);

  const projection = useMemo(() => proyeksiZoom(zoom), [zoom]);
  const pathGen = useMemo(() => geoPath(projection), [projection]);
  const petaDasar = useMemo(
    () => negaraGeo.features.map((f) => ({ id: String(f.id ?? ""), d: pathGen(f) ?? "" })),
    [pathGen]
  );

  /** Ubah piksel layar menjadi satuan viewBox peta */
  const keViewBox = () => W / (wrapRef.current?.clientWidth || W);

  const perbesar = (faktor: number, pusat?: [number, number]) =>
    setZoom((z) => batasi({ k: z.k * faktor, c: pusat ?? z.c }));

  // Pinch trackpad / Ctrl + roda mouse untuk zoom. Roda biasa tetap untuk menggulir halaman.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => batasi({ ...z, k: z.k * Math.exp(-e.deltaY * 0.01) }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const ukur = (m: Mitra) =>
    arah === "ekspor" ? nilai(m, "ekspor", tahun) : arah === "impor" ? nilai(m, "impor", tahun) : nilai(m, "ekspor", tahun) + nilai(m, "impor", tahun);

  const terpilih = useMemo(
    () =>
      chapter2Data.mitra
        .filter((m) => kawasan === "Semua" || m.kawasan === kawasan)
        .filter((m) => ukur(m) > 0)
        .sort((a, b) => ukur(b) - ukur(a))
        .slice(0, jumlah),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tahun, arah, kawasan, jumlah]
  );

  const busur = useMemo(() => {
    const list: Busur[] = [];
    for (const m of terpilih) {
      for (const a of ["ekspor", "impor"] as const) {
        if (arah !== "keduanya" && arah !== a) continue;
        const v = nilai(m, a, tahun);
        if (v <= 0) continue;
        const b = buatBusur(projection, m, a, v);
        if (b) list.push(b);
      }
    }
    return list.sort((p, q) => q.lebar - p.lebar); // yang tebal digambar dulu
  }, [terpilih, arah, tahun, projection]);

  const ccnTerpilih = new Set(terpilih.map((m) => m.ccn3).filter(Boolean));
  const adaSorot = sorot.length > 0;
  const tersorot = (iso: string) => !adaSorot || sorot.includes(iso) || aktifIso === iso;
  const labelIso = new Set([...terpilih.slice(0, Math.round(6 * zoom.k)).map((m) => m.iso3), ...sorot]);

  const tampilTip = (e: React.PointerEvent, m: Mitra) => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box) return;
    setAktifIso(m.iso3);
    setTip({ x: e.clientX - box.left, y: e.clientY - box.top, m });
  };

  const asal = projection(ASAL) ?? [0, 0];
  const cakupan =
    terpilih.reduce((a, m) => a + ukur(m), 0) /
    chapter2Data.mitra.reduce((a, m) => a + ukur(m), 0);

  return (
    <figure className={styles.figure}>
      <div className={styles.head}>
        <h3 className={styles.title}>
          {chapter2Copy.petaJudul}, {tahun}
        </h3>
      </div>

      <div className={styles.controls}>
        <div role="group" aria-label="Pilih tahun" className={ui.segment}>
          {(["2024", "2025"] as Tahun2[]).map((t) => (
            <button key={t} type="button" aria-pressed={tahun === t} onClick={() => onChange({ tahun: t })}>
              {t}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Pilih arah aliran" className={ui.segment}>
          {(
            [
              ["ekspor", "Ekspor"],
              ["impor", "Impor"],
              ["keduanya", "Keduanya"],
            ] as [Arah, string][]
          ).map(([a, l]) => (
            <button key={a} type="button" aria-pressed={arah === a} onClick={() => onChange({ arah: a })}>
              {l}
            </button>
          ))}
        </div>
        <label className={styles.select}>
          <span>Kawasan</span>
          <select value={kawasan} onChange={(e) => onChange({ kawasan: e.target.value })}>
            {KAWASAN.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <div role="group" aria-label="Jumlah mitra yang digambar" className={ui.segment}>
          {[20, 40].map((n) => (
            <button key={n} type="button" aria-pressed={jumlah === n} onClick={() => onChange({ jumlah: n })}>
              {n} mitra
            </button>
          ))}
        </div>
      </div>

      <div className={styles.legend}>
        {arah !== "impor" ? (
          <span>
            <svg width="30" height="10" aria-hidden="true">
              <line x1="0" y1="5" x2="22" y2="5" stroke="var(--ekspor)" strokeWidth="3" />
              <path d="M22,1 L29,5 L22,9 Z" fill="var(--ekspor)" />
            </svg>
            Ekspor, dari Indonesia ke mitra
          </span>
        ) : null}
        {arah !== "ekspor" ? (
          <span>
            <svg width="30" height="10" aria-hidden="true">
              <line x1="8" y1="5" x2="30" y2="5" stroke="var(--impor)" strokeWidth="3" />
              <path d="M8,1 L1,5 L8,9 Z" fill="var(--impor)" />
            </svg>
            Impor, dari mitra ke Indonesia
          </span>
        ) : null}
        <span className={styles.widthLegend}>
          Tebal garis:
          {[5000, 20000, 60000].map((v) => (
            <span key={v}>
              <svg width="24" height="20" aria-hidden="true">
                <line x1="0" y1="10" x2="24" y2="10" stroke="var(--ink-soft)" strokeWidth={tebal(v)} />
              </svg>
              {miliar(v)}
            </span>
          ))}
          miliar USD
        </span>
      </div>

      <div
        ref={wrapRef}
        className={styles.mapWrap}
        data-zoom={zoom.k > 1 ? "true" : undefined}
        onPointerLeave={() => {
          setTip(null);
          setAktifIso(null);
          geser.current = null;
        }}
        onPointerDown={(e) => {
          if (zoom.k <= 1) return;
          geser.current = { x: e.clientX, y: e.clientY, c: zoom.c };
        }}
        onPointerMove={(e) => {
          const g = geser.current;
          if (!g) return;
          const f = keViewBox() / zoom.k;
          setTip(null);
          setZoom((z) => batasi({ k: z.k, c: [g.c[0] - (e.clientX - g.x) * f, g.c[1] - (e.clientY - g.y) * f] }));
        }}
        onPointerUp={() => {
          geser.current = null;
        }}
        onDoubleClick={(e) => {
          const box = wrapRef.current?.getBoundingClientRect();
          if (!box) return;
          // Titik yang diklik (koordinat tampilan) diubah ke koordinat peta dasar
          const vx = (e.clientX - box.left) * keViewBox();
          const vy = (e.clientY - box.top) * keViewBox();
          perbesar(1.8, [zoom.c[0] + (vx - W / 2) / zoom.k, zoom.c[1] + (vy - H / 2) / zoom.k]);
        }}
      >
        <div className={styles.zoomControls} role="group" aria-label="Kontrol zoom peta">
          <button type="button" onClick={() => perbesar(1.6)} aria-label="Perbesar" disabled={zoom.k >= K_MAKS}>
            +
          </button>
          <button type="button" onClick={() => perbesar(1 / 1.6)} aria-label="Perkecil" disabled={zoom.k <= 1}>
            {"\u2212"}
          </button>
          <button
            type="button"
            onClick={() => {
              const p = proyeksiDasar([110, 12]);
              if (p) setZoom(batasi({ k: 2.6, c: [p[0], p[1]] }));
            }}
          >
            Asia
          </button>
          <button type="button" onClick={() => setZoom(ZOOM_AWAL)} disabled={zoom.k === 1}>
            Seluruh dunia
          </button>
        </div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={styles.map}
          role="img"
          aria-label={`Peta aliran ${arah === "keduanya" ? "ekspor dan impor" : arah} Indonesia dengan ${terpilih.length} mitra terbesar, ${tahun}`}
        >
          <defs>
            {(["ekspor", "impor"] as const).map((a) => (
              <marker
                key={a}
                id={`panah-${a}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="9"
                markerHeight="9"
                markerUnits="userSpaceOnUse"
                orient="auto"
              >
                <path d="M0,0 L10,5 L0,10 Z" fill={a === "ekspor" ? "var(--ekspor)" : "var(--impor)"} />
              </marker>
            ))}
          </defs>

          <clipPath id="bingkai-peta">
            <rect x={0} y={0} width={W} height={H} />
          </clipPath>
          <g clipPath="url(#bingkai-peta)">
          <path d={pathGen({ type: "Sphere" }) ?? ""} className={styles.sphere} />
          <g>
            {petaDasar.map((n, i) => (
              <path
                key={i}
                d={n.d}
                className={styles.land}
                data-mitra={ccnTerpilih.has(n.id) ? "true" : undefined}
              />
            ))}
          </g>

          <g fill="none">
            {busur.map((b) => (
              <path
                key={b.key}
                d={b.d}
                stroke={b.arah === "ekspor" ? "var(--ekspor)" : "var(--impor)"}
                strokeWidth={b.lebar}
                strokeLinecap="round"
                markerEnd={`url(#panah-${b.arah})`}
                strokeOpacity={tersorot(b.mitra.iso3) ? 0.78 : 0.12}
                className={styles.arc}
                onPointerMove={(e) => tampilTip(e, b.mitra)}
                onPointerDown={(e) => tampilTip(e, b.mitra)}
              />
            ))}
          </g>

          <g>
            {terpilih.map((m) => {
              const p = projection([m.lon, m.lat]);
              if (!p) return null;
              const tampilLabel = labelIso.has(m.iso3) || aktifIso === m.iso3;
              return (
                <g
                  key={m.iso3}
                  tabIndex={0}
                  role="button"
                  aria-label={`${m.nama}: ekspor ${miliar(m[`ekspor${tahun}`])}, impor ${miliar(m[`impor${tahun}`])} miliar USD`}
                  className={styles.dot}
                  opacity={tersorot(m.iso3) ? 1 : 0.35}
                  onPointerMove={(e) => tampilTip(e, m)}
                  onPointerDown={(e) => tampilTip(e, m)}
                  onFocus={() => {
                    setAktifIso(m.iso3);
                    setTip({ x: (p[0] / W) * (wrapRef.current?.clientWidth ?? W), y: (p[1] / H) * (wrapRef.current?.clientHeight ?? H), m });
                  }}
                  onBlur={() => {
                    setTip(null);
                    setAktifIso(null);
                  }}
                >
                  <circle cx={p[0]} cy={p[1]} r={8} fill="transparent" />
                  <circle cx={p[0]} cy={p[1]} r={3} className={styles.dotCore} />
                  {tampilLabel ? (
                    <text x={p[0] + 6} y={p[1] - 6} className={styles.mapLabel}>
                      {m.nama}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </g>

          <circle cx={asal[0]} cy={asal[1]} r={5} className={styles.origin} />
          <text x={asal[0] + 8} y={asal[1] + 16} className={styles.mapLabel}>
            Indonesia
          </text>
          </g>
        </svg>

        {tip ? (
          <Tooltip
            tip={{
              ...tip,
              x: Math.max(4, Math.min(tip.x + 12, (wrapRef.current?.clientWidth ?? W) - 232)),
              y: Math.max(4, tip.y - 40),
            }}
            tahun={tahun}
          />
        ) : null}
      </div>

      <p className={styles.zoomHint}>
        Perbesar dengan tombol, klik ganda, atau cubit di trackpad (Ctrl + gulir). Saat diperbesar, seret peta untuk
        menggeser.
      </p>
      <p className={styles.cover}>
        {terpilih.length} mitra yang digambar mencakup {angka1(cakupan * 100)} persen nilai{" "}
        {arah === "keduanya" ? "perdagangan" : arah}
        {kawasan === "Semua" ? "" : ` kawasan ${kawasan}`} tahun {tahun}.
      </p>

      <Caption
        judul={`${chapter2Copy.petaJudul}, ${tahun}`}
        satuan="miliar USD; tebal garis sebanding dengan nilai"
        catatan={`${CATATAN_NILAI} Titik negara besar diletakkan di sekitar pusat ekonominya. Peta dasar: Natural Earth.`}
      />
    </figure>
  );
}

function Tooltip({ tip, tahun }: { tip: { x: number; y: number; m: Mitra }; tahun: Tahun2 }) {
  const { m } = tip;
  const lalu: Tahun2 = "2024";
  const e = m[`ekspor${tahun}`];
  const i = m[`impor${tahun}`];
  const n = neraca(m, tahun);
  return (
    <div className={styles.tooltip} style={{ left: tip.x, top: tip.y }} role="status">
      <p className={styles.tooltipTitle}>
        {m.nama} <span>{m.kawasan}</span>
      </p>
      <dl>
        <div>
          <dt>Ekspor {tahun}</dt>
          <dd>{miliar(e)}</dd>
        </div>
        <div>
          <dt>Impor {tahun}</dt>
          <dd>{miliar(i)}</dd>
        </div>
        <div>
          <dt>{n >= 0 ? "Surplus" : "Defisit"}</dt>
          <dd>{miliar(Math.abs(n))}</dd>
        </div>
      </dl>
      {tahun === "2025" && m.ekspor2024 > 0 ? (
        <p className={styles.tooltipNote}>
          Ekspor {bertanda(e - m[`ekspor${lalu}`], angka1(Math.abs(pertumbuhan(m[`ekspor${lalu}`], e))))}% dari 2024
        </p>
      ) : null}
      <p className={styles.tooltipNote}>dalam miliar USD</p>
    </div>
  );
}
