"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { sankey, sankeyJustify, sankeyLinkHorizontal, type SankeyLink, type SankeyNode } from "d3-sankey";
import Caption from "@/components/ui/Caption";
import ui from "@/components/ui/ui.module.css";
import {
  chapter1Copy,
  chapter1Data,
  KELUARGA_ENERGI,
  WARNA_KELUARGA,
  type Fokus,
  type Keluarga,
} from "@/content/chapter1";
import { angka1, formatTJ } from "@/lib/format";
import styles from "./chapter1.module.css";

type NodeData = { id: string; label: string; peran: string; keluarga: string | null };
type LinkData = { source: string; target: string; value: number; keluarga: string };
type N = SankeyNode<NodeData, LinkData>;
type L = SankeyLink<NodeData, LinkData>;

const MIN_LEBAR = 760;

function warnaNode(n: NodeData): string {
  if (n.peran === "jenis" && n.keluarga) return WARNA_KELUARGA[n.keluarga as Keluarga];
  if (n.id === "kehilangan" || n.id === "selisih") return "var(--e-lainnya)";
  if (n.peran === "proses") return "var(--ink-soft)";
  return "var(--node-netral)";
}

const idDari = (x: string | number | N) => (typeof x === "object" ? x.id : String(x));

interface Props {
  fokus: Fokus;
  onFokus: (f: Fokus) => void;
}

interface Tip {
  x: number;
  y: number;
  judul: string;
  isi: string;
}

export default function SankeyChart({ fokus, onFokus }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [lebar, setLebar] = useState(900);
  const [ponsel, setPonsel] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);
  const [hoverLink, setHoverLink] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setLebar(Math.max(MIN_LEBAR, Math.floor(entry.contentRect.width)));
      setPonsel(window.innerWidth < 900);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const tinggi = ponsel ? 420 : 520;

  const graf = useMemo(() => {
    const gen = sankey<NodeData, LinkData>()
      .nodeId((d) => d.id)
      .nodeAlign(sankeyJustify)
      .nodeWidth(10)
      .nodePadding(ponsel ? 10 : 13)
      .extent([
        [1, 6],
        [lebar - 1, tinggi - 6],
      ]);
    return gen({
      nodes: chapter1Data.sankey.nodes.map((d) => ({ ...d })),
      links: chapter1Data.sankey.links.map((d) => ({ ...d })),
    });
  }, [lebar, tinggi, ponsel]);

  const nodes = graf.nodes as N[];
  const links = graf.links as L[];
  const path = sankeyLinkHorizontal<NodeData, LinkData>();

  // Aliran yang disorot sesuai fokus
  const sorot = useMemo(() => {
    const s = new Set<number>();
    links.forEach((l, i) => {
      if (fokus.jenis === "semua") s.add(i);
      else if (fokus.jenis === "keluarga" && l.keluarga === fokus.id) s.add(i);
      else if (fokus.jenis === "node" && (idDari(l.source) === fokus.id || idDari(l.target) === fokus.id)) s.add(i);
    });
    return s;
  }, [links, fokus]);

  const nodeTersorot = useMemo(() => {
    const s = new Set<string>();
    links.forEach((l, i) => {
      if (sorot.has(i)) {
        s.add(idDari(l.source));
        s.add(idDari(l.target));
      }
    });
    return s;
  }, [links, sorot]);

  const posisi = (e: React.PointerEvent | React.FocusEvent, fallback?: { x: number; y: number }) => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box) return { x: 0, y: 0 };
    if ("clientX" in e) return { x: e.clientX - box.left + (wrapRef.current?.scrollLeft ?? 0), y: e.clientY - box.top };
    return fallback ?? { x: 0, y: 0 };
  };

  const tampilLink = (e: React.PointerEvent, l: L, i: number) => {
    const src = l.source as N;
    const tgt = l.target as N;
    const totalSumber = src.value ?? l.value;
    setHoverLink(i);
    setTip({
      ...posisi(e),
      judul: `${src.label} ke ${tgt.label}`,
      isi: `${formatTJ(l.value)}, ${angka1((l.value / totalSumber) * 100)}% dari seluruh ${src.label.toLowerCase()}`,
    });
  };

  const tampilNode = (e: React.PointerEvent | React.FocusEvent, n: N) => {
    const masuk = (n.targetLinks ?? []).reduce((a, l) => a + l.value, 0);
    const keluar = (n.sourceLinks ?? []).reduce((a, l) => a + l.value, 0);
    const bagian = [masuk ? `masuk ${formatTJ(masuk)}` : null, keluar ? `keluar ${formatTJ(keluar)}` : null]
      .filter(Boolean)
      .join(", ");
    setTip({
      ...posisi(e, { x: (n.x1 ?? 0) + 8, y: ((n.y0 ?? 0) + (n.y1 ?? 0)) / 2 }),
      judul: n.label,
      isi: `${bagian}. Klik untuk menelusuri.`,
    });
  };

  const fokusNode = fokus.jenis === "node" ? nodes.find((n) => n.id === fokus.id) : null;

  return (
    <figure className={styles.figure}>
      <div className={styles.head}>
        <h3 className={styles.title}>{chapter1Copy.sankeyJudul}</h3>
        <div role="group" aria-label="Sorot jenis energi" className={ui.segment}>
          <button type="button" aria-pressed={fokus.jenis === "semua"} onClick={() => onFokus({ jenis: "semua" })}>
            Semua
          </button>
          {KELUARGA_ENERGI.map((k) => (
            <button
              key={k.id}
              type="button"
              aria-pressed={fokus.jenis === "keluarga" && fokus.id === k.id}
              onClick={() => onFokus({ jenis: "keluarga", id: k.id })}
            >
              <span className={styles.swatch} style={{ backgroundColor: k.warna }} aria-hidden="true" />
              {k.label}
            </button>
          ))}
        </div>
      </div>

      <p className={styles.hint}>
        {fokusNode ? (
          <>
            Menelusuri aliran masuk dan keluar <strong>{fokusNode.label}</strong>.{" "}
            <button type="button" className={styles.reset} onClick={() => onFokus({ jenis: "semua" })}>
              Tampilkan semua
            </button>
          </>
        ) : (
          <>
            Klik kotak mana pun (asal, proses, atau tujuan) untuk menelusuri alirannya. Pita abu-abu adalah energi yang
            hilang saat konversi.
          </>
        )}
      </p>

      <div
        ref={wrapRef}
        className={styles.scroller}
        onPointerLeave={() => {
          setTip(null);
          setHoverLink(null);
        }}
      >
        <svg
          width={lebar}
          height={tinggi}
          viewBox={`0 0 ${lebar} ${tinggi}`}
          role="img"
          aria-label={`${chapter1Copy.sankeyJudul}. Gunakan tombol di atas atau tombol Tab pada kotak untuk menelusuri.`}
          className={styles.svg}
        >
          <g fill="none">
            {links.map((l, i) => {
              const aktif = sorot.has(i);
              return (
                <path
                  key={i}
                  d={path(l) ?? undefined}
                  stroke={WARNA_KELUARGA[l.keluarga as Keluarga]}
                  strokeWidth={Math.max(1, l.width ?? 1)}
                  strokeOpacity={hoverLink === i ? 0.85 : aktif ? 0.5 : 0.07}
                  className={styles.link}
                  onPointerMove={(e) => tampilLink(e, l, i)}
                  onPointerDown={(e) => tampilLink(e, l, i)}
                />
              );
            })}
          </g>
          <g>
            {nodes.map((n) => {
              const h = (n.y1 ?? 0) - (n.y0 ?? 0);
              // Label di kanan kotak, kecuali dua kolom terakhir (label di kiri) supaya tidak menabrak kolom berikutnya
              const kiri = (n.x0 ?? 0) < lebar * 0.8 && (n.sourceLinks?.length ?? 0) > 0;
              const redup = !nodeTersorot.has(n.id);
              return (
                <g
                  key={n.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`${n.label}, ${formatTJ(n.value ?? 0)}`}
                  className={styles.node}
                  opacity={redup ? 0.3 : 1}
                  onClick={() =>
                    onFokus(fokus.jenis === "node" && fokus.id === n.id ? { jenis: "semua" } : { jenis: "node", id: n.id })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onFokus({ jenis: "node", id: n.id });
                    }
                  }}
                  onPointerMove={(e) => tampilNode(e, n)}
                  onFocus={(e) => tampilNode(e, n)}
                  onBlur={() => setTip(null)}
                >
                  <rect
                    x={n.x0}
                    y={n.y0}
                    width={(n.x1 ?? 0) - (n.x0 ?? 0)}
                    height={Math.max(1, h)}
                    fill={warnaNode(n)}
                  />
                  {/* Area klik yang lebih besar untuk node tipis */}
                  <rect
                    x={(n.x0 ?? 0) - 4}
                    y={(n.y0 ?? 0) - 4}
                    width={(n.x1 ?? 0) - (n.x0 ?? 0) + 8}
                    height={Math.max(1, h) + 8}
                    fill="transparent"
                  />
                  <text
                    x={kiri ? (n.x1 ?? 0) + 6 : (n.x0 ?? 0) - 6}
                    y={((n.y0 ?? 0) + (n.y1 ?? 0)) / 2}
                    dy="0.35em"
                    textAnchor={kiri ? "start" : "end"}
                    className={styles.label}
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {tip ? (
          <div
            className={styles.tooltip}
            style={{
              left: Math.min(tip.x + 14, lebar - 250),
              top: Math.max(4, tip.y - 12),
            }}
            role="status"
          >
            <p className={styles.tooltipTitle}>{tip.judul}</p>
            <p>{tip.isi}</p>
          </div>
        ) : null}
      </div>
      {ponsel ? <p className={styles.swipe}>Geser diagram ke samping untuk melihat seluruh aliran.</p> : null}

      <Caption
        judul={chapter1Copy.sankeyJudul}
        satuan="terajoule (TJ); ketebalan pita sebanding dengan jumlah energi"
        catatan="Angka 2024 merupakan angka sementara"
      />
    </figure>
  );
}
