"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { hierarchy, partition, type HierarchyRectangularNode } from "d3-hierarchy";
import { arc as d3arc } from "d3-shape";
import Caption from "@/components/ui/Caption";
import ui from "@/components/ui/ui.module.css";
import { cariJalur, type SitcNode } from "@/content/chapter3";
import { chapter4Copy, LABEL_ARUS, nilaiArus, TREE, tumbuh, type Arus, type SunburstState } from "@/content/chapter4";
import { BATAS_TUMBUH, GRADIEN_TUMBUH, teksDiAtasTumbuh, warnaTumbuh } from "@/lib/color";
import { angka1, bertanda, miliar } from "@/lib/format";
import styles from "./chapter4.module.css";

type P = HierarchyRectangularNode<SitcNode>;

const UKURAN = 600;
const PUSAT = UKURAN / 2;
const R0 = 74; // jari-jari lingkaran tengah
const TEBAL = (PUSAT - 6 - R0) / 3; // tebal tiap cincin
const DUA_PI = Math.PI * 2;

interface Pandang {
  x0: number;
  x1: number;
  d: number;
}

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

function teksTumbuh(n: SitcNode, arus: Arus): string {
  const g = tumbuh(n, arus);
  if (g === null) return nilaiArus(n, arus, "2025") > 0 ? "baru muncul" : "tidak ada";
  return `${bertanda(g, angka1(Math.abs(g)))}%`;
}

interface Props {
  state: SunburstState;
  onChange: (s: Partial<SunburstState>) => void;
}

export default function Sunburst({ state, onChange }: Props) {
  const { arus, fokus } = state;
  const [hover, setHover] = useState<P | null>(null);

  // Tata letak partisi: sudut = nilai 2025 arus terpilih, kedalaman = tingkat hirarki
  const akar = useMemo(() => {
    const h = hierarchy<SitcNode>(TREE, (d) => d.children)
      .sum((d) => (d.children && d.children.length ? 0 : nilaiArus(d, arus, "2025")))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    return partition<SitcNode>().size([DUA_PI, 4])(h);
  }, [arus]);

  const semua = useMemo(() => akar.descendants().filter((n) => (n.value ?? 0) > 0), [akar]);
  const fokusNode = useMemo(() => semua.find((n) => n.data.id === fokus) ?? akar, [semua, fokus, akar]);
  const jalur = cariJalur(fokusNode.data.id) ?? [TREE];

  // Animasi pandangan saat zoom: interpolasi rentang sudut & kedalaman pusat
  const target: Pandang = { x0: fokusNode.x0, x1: fokusNode.x1, d: fokusNode.depth };
  const [pandang, setPandang] = useState<Pandang>(target);
  const pandangRef = useRef(pandang);
  pandangRef.current = pandang;

  useEffect(() => {
    const awal = pandangRef.current;
    const kurangGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (kurangGerak) {
      setPandang(target);
      return;
    }
    let raf = 0;
    const mulai = performance.now();
    const langkah = (now: number) => {
      const t = ease(Math.min(1, (now - mulai) / 650));
      setPandang({
        x0: awal.x0 + (target.x0 - awal.x0) * t,
        x1: awal.x1 + (target.x1 - awal.x1) * t,
        d: awal.d + (target.d - awal.d) * t,
      });
      if (t < 1) raf = requestAnimationFrame(langkah);
    };
    raf = requestAnimationFrame(langkah);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.x0, target.x1, target.d]);

  const busur = d3arc<{ a0: number; a1: number; r0: number; r1: number }>()
    .startAngle((d) => d.a0)
    .endAngle((d) => d.a1)
    .innerRadius((d) => d.r0)
    .outerRadius((d) => d.r1)
    .padAngle(0.004)
    .padRadius(PUSAT);

  const irisan = semua
    .filter((n) => n.depth > 0)
    .map((n) => {
      const lebarSudut = pandang.x1 - pandang.x0 || 1;
      const a0 = Math.max(0, Math.min(DUA_PI, ((n.x0 - pandang.x0) / lebarSudut) * DUA_PI));
      const a1 = Math.max(0, Math.min(DUA_PI, ((n.x1 - pandang.x0) / lebarSudut) * DUA_PI));
      const cincin = n.depth - pandang.d; // 1 = cincin terdalam
      const r0 = Math.max(R0, Math.min(R0 + 3 * TEBAL, R0 + (cincin - 1) * TEBAL));
      const r1 = Math.max(R0, Math.min(R0 + 3 * TEBAL, R0 + cincin * TEBAL));
      return { n, a0, a1, r0, r1 };
    })
    .filter((s) => s.a1 - s.a0 > 0.0015 && s.r1 - s.r0 > 0.5);

  const tampil = hover ?? fokusNode;
  const gTampil = tumbuh(tampil.data, arus);

  const naik = () => {
    if (jalur.length > 1) onChange({ fokus: jalur[jalur.length - 2].id });
  };

  return (
    <figure className={styles.figure}>
      <div className={styles.head}>
        <h3 className={styles.title}>{chapter4Copy.sunburstJudul}</h3>
        <div role="group" aria-label="Pilih arus perdagangan" className={ui.segment}>
          {(
            [
              ["ekspor", "Ekspor"],
              ["impor", "Impor"],
              ["total", "Ekspor + impor"],
            ] as [Arus, string][]
          ).map(([a, l]) => (
            <button key={a} type="button" aria-pressed={arus === a} onClick={() => onChange({ arus: a })}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.howto}>
        <p>{chapter4Copy.bacaIrisan(arus)}</p>
        <p>{chapter4Copy.bacaWarna}</p>
      </div>

      <nav aria-label="Posisi dalam hirarki komoditas" className={styles.breadcrumb}>
        <ol>
          {jalur.map((n, i) => (
            <li key={n.id}>
              {i < jalur.length - 1 ? (
                <button type="button" onClick={() => onChange({ fokus: n.id })}>
                  {n.label}
                </button>
              ) : (
                <span aria-current="location">{n.id === "root" ? n.label : `${n.id} ${n.label}`}</span>
              )}
            </li>
          ))}
        </ol>
        {jalur.length > 1 ? (
          <button type="button" className={styles.up} onClick={naik}>
            Naik satu tingkat
          </button>
        ) : null}
      </nav>

      <div className={styles.body}>
        <div className={styles.chartBox} onMouseLeave={() => setHover(null)}>
          <svg
            viewBox={`0 0 ${UKURAN} ${UKURAN}`}
            className={styles.svg}
            role="img"
            aria-label={`Diagram sunburst ${LABEL_ARUS[arus]} menurut kelompok komoditas. Gunakan tombol Tab untuk memilih irisan.`}
          >
            <g transform={`translate(${PUSAT},${PUSAT})`}>
              {irisan.map(({ n, a0, a1, r0, r1 }) => {
                const g = tumbuh(n.data, arus);
                const warna = g === null ? warnaTumbuh(BATAS_TUMBUH) : warnaTumbuh(g);
                const punyaAnak = (n.children ?? []).length > 0;
                // Label radial jika irisan cukup lebar
                const tengahSudut = (a0 + a1) / 2;
                const rTengah = (r0 + r1) / 2;
                const muat = (a1 - a0) * rTengah > 13 && r1 - r0 > TEBAL * 0.8;
                const maksHuruf = Math.floor((TEBAL - 10) / 6.2);
                const label =
                  n.data.label.length > maksHuruf ? `${n.data.label.slice(0, maksHuruf - 1).trimEnd()}\u2026` : n.data.label;
                const deg = (tengahSudut * 180) / Math.PI;
                return (
                  <g
                    key={n.data.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`${n.data.label}: ${miliar(n.value ?? 0)} miliar USD, ${teksTumbuh(n.data, arus)}`}
                    className={styles.slice}
                    data-hover={hover?.data.id === n.data.id ? "true" : undefined}
                    onMouseEnter={() => setHover(n)}
                    onFocus={() => setHover(n)}
                    onBlur={() => setHover(null)}
                    onClick={() => (punyaAnak ? onChange({ fokus: n.data.id }) : setHover(n))}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && punyaAnak) {
                        e.preventDefault();
                        onChange({ fokus: n.data.id });
                      }
                    }}
                  >
                    <path d={busur({ a0, a1, r0, r1 }) ?? ""} fill={warna} />
                    {muat ? (
                      <text
                        transform={`rotate(${deg - 90}) translate(${rTengah},0) rotate(${deg > 180 ? 180 : 0})`}
                        dy="0.35em"
                        textAnchor="middle"
                        className={styles.sliceLabel}
                        fill={teksDiAtasTumbuh(g ?? BATAS_TUMBUH)}
                      >
                        {label}
                      </text>
                    ) : null}
                  </g>
                );
              })}

              {/* Lingkaran tengah: menampilkan irisan yang disorot, klik untuk naik satu tingkat */}
              <g
                className={styles.center}
                onClick={naik}
                role={jalur.length > 1 ? "button" : undefined}
                tabIndex={jalur.length > 1 ? 0 : -1}
                aria-label={jalur.length > 1 ? "Naik satu tingkat" : undefined}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    naik();
                  }
                }}
              >
                <circle r={R0 - 3} />
                <text y={-22} className={styles.centerSmall} textAnchor="middle">
                  {tampil.data.id === "root" ? "Semua" : `SITC ${tampil.data.id}`}
                </text>
                <text y={2} className={styles.centerBig} textAnchor="middle">
                  {miliar(tampil.value ?? 0)}
                </text>
                <text y={20} className={styles.centerSmall} textAnchor="middle">
                  miliar USD
                </text>
                <text y={40} className={styles.centerGrowth} textAnchor="middle">
                  {gTampil === null ? "baru" : `${bertanda(gTampil, angka1(Math.abs(gTampil)))}%`}
                </text>
              </g>
            </g>
          </svg>
        </div>

        <aside className={styles.side}>
          <div className={styles.legend}>
            <p className={styles.legendTitle}>Perubahan 2024 ke 2025</p>
            <span className={styles.gradient} style={{ backgroundImage: GRADIEN_TUMBUH }} aria-hidden="true">
              <i style={{ left: "0%" }}>{`\u2264\u2212${BATAS_TUMBUH}%`}</i>
              <i style={{ left: "50%" }}>0</i>
              <i style={{ left: "100%" }}>{`\u2265+${BATAS_TUMBUH}%`}</i>
            </span>
            <p className={styles.legendNote}>
              Perubahan di atas {BATAS_TUMBUH}% atau di bawah {"\u2212"}{BATAS_TUMBUH}% memakai warna terujung supaya
              komoditas bernilai kecil yang berubah ekstrem tidak menenggelamkan yang lain.
            </p>
          </div>

          <Rincian node={tampil} arus={arus} />
        </aside>
      </div>

      <Caption
        judul={`${chapter4Copy.sunburstJudul}, arus ${LABEL_ARUS[arus]}`}
        satuan={"miliar USD (lebar irisan, nilai 2025); persen perubahan dari 2024 (warna)"}
        catatan="Perubahan di tiap tingkat dihitung dari nilai yang dijumlahkan, bukan rata-rata perubahan di bawahnya. Emas moneter tidak dimasukkan (alasannya di Bab 3). Klik irisan untuk masuk, klik lingkaran tengah untuk keluar."
      />
    </figure>
  );
}

function Rincian({ node, arus }: { node: P; arus: Arus }) {
  const d = node.data;
  const v24 = nilaiArus(d, arus, "2024");
  const v25 = nilaiArus(d, arus, "2025");
  const induk = node.parent;
  return (
    <div className={styles.inspector} aria-live="polite">
      <p className={styles.inspectorTitle}>{d.label}</p>
      <p className={styles.inspectorSub}>
        {d.id === "root" ? "Seluruh kelompok komoditas" : `SITC ${d.id}${d.label !== d.labelEn ? `: ${d.labelEn}` : ""}`}
      </p>
      <dl className={styles.inspectorGrid}>
        <div>
          <dt>{LABEL_ARUS[arus]} 2024</dt>
          <dd>{miliar(v24)}</dd>
        </div>
        <div>
          <dt>{LABEL_ARUS[arus]} 2025</dt>
          <dd>{miliar(v25)}</dd>
        </div>
        <div>
          <dt>Perubahan</dt>
          <dd>{teksTumbuh(d, arus)}</dd>
        </div>
        <div>
          <dt>Selisih</dt>
          <dd>
            {bertanda(v25 - v24, miliar(Math.abs(v25 - v24)))}
          </dd>
        </div>
        {induk ? (
          <div className={styles.full}>
            <dt>Porsi dari {induk.data.id === "root" ? "total" : induk.data.label.toLowerCase()}, 2025</dt>
            <dd>{angka1(((node.value ?? 0) / (induk.value || 1)) * 100)}%</dd>
          </div>
        ) : null}
      </dl>
      <p className={styles.unit}>Nilai dalam miliar USD. Arahkan kursor atau ketuk irisan untuk melihat rinciannya.</p>
    </div>
  );
}
