"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { hierarchy, treemap, treemapSquarify, type HierarchyRectangularNode } from "d3-hierarchy";
import Caption from "@/components/ui/Caption";
import ui from "@/components/ui/ui.module.css";
import { cariJalur, chapter3Copy, type SitcNode, type Tahun3, type TreemapState } from "@/content/chapter3";
import { GRADIEN_ISP, teksDiAtas, warnaIsp } from "@/lib/color";
import { angka1, bertanda, formatIsp, isp, miliar, pertumbuhan } from "@/lib/format";
import styles from "./chapter3.module.css";

type R = HierarchyRectangularNode<SitcNode>;

const total = (n: SitcNode, t: Tahun3) => n.nilai[t].e + n.nilai[t].i;
const ispNode = (n: SitcNode, t: Tahun3) => isp(n.nilai[t].e, n.nilai[t].i);

interface Props {
  state: TreemapState;
  onChange: (s: Partial<TreemapState>) => void;
}

export default function Treemap({ state, onChange }: Props) {
  const { tahun, fokus } = state;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [lebar, setLebar] = useState(800);
  const [ponsel, setPonsel] = useState(false);
  const [aktif, setAktif] = useState<{ node: SitcNode; induk: SitcNode } | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setLebar(Math.floor(e.contentRect.width));
      setPonsel(window.innerWidth < 900);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const tinggi = ponsel ? 400 : 420;
  const jalur = useMemo(() => cariJalur(fokus) ?? cariJalur("root")!, [fokus]);
  const fokusNode = jalur[jalur.length - 1];
  // Dua tingkat ditampilkan sekaligus: kelompok (kedalaman 1) dan isinya (kedalaman 2)
  const duaTingkat = (fokusNode.children ?? []).some((c) => (c.children ?? []).length > 0);

  const layout = useMemo(() => {
    const h = hierarchy<SitcNode>(fokusNode, (d) => d.children)
      .sum((d) => (d.children && d.children.length ? 0 : total(d, tahun)))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    return treemap<SitcNode>()
      .size([lebar, tinggi])
      .tile(treemapSquarify.ratio(1.3))
      .paddingInner(duaTingkat ? 3 : 2)
      // paddingOuter harus sebelum paddingTop, karena paddingOuter ikut mengatur sisi atas
      .paddingOuter((d) => (duaTingkat && d.depth === 1 ? 1 : 0))
      .paddingTop((d) => (duaTingkat && d.depth === 1 ? 20 : 0))
      .round(true)(h);
  }, [fokusNode, tahun, lebar, tinggi, duaTingkat]);

  const kelompok = (layout.children ?? []).filter((n) => (n.value ?? 0) > 0) as R[];
  const ubin = duaTingkat
    ? (kelompok.flatMap((g) => (g.children ?? []).filter((n) => (n.value ?? 0) > 0)) as R[])
    : kelompok;

  const masukKe = (id: string) => onChange({ fokus: id });

  const tampilRinci = (n: R) => setAktif({ node: n.data, induk: (n.parent ?? layout).data });

  return (
    <figure className={styles.figure}>
      <div className={styles.head}>
        <h3 className={styles.title}>
          {chapter3Copy.treemapJudul}, {tahun}
        </h3>
        <div role="group" aria-label="Pilih tahun" className={ui.segment}>
          {(["2024", "2025"] as Tahun3[]).map((t) => (
            <button key={t} type="button" aria-pressed={tahun === t} onClick={() => onChange({ tahun: t })}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.howto}>
        <p>{chapter3Copy.bacaAngka}</p>
        <p>{chapter3Copy.bacaWarna}</p>
      </div>

      <nav aria-label="Posisi dalam hirarki komoditas" className={styles.breadcrumb}>
        <ol>
          {jalur.map((n, i) => (
            <li key={n.id}>
              {i < jalur.length - 1 ? (
                <button type="button" onClick={() => masukKe(n.id)}>
                  {n.label}
                </button>
              ) : (
                <span aria-current="location">
                  {n.id === "root" ? n.label : `${n.id} ${n.label}`}
                </span>
              )}
            </li>
          ))}
        </ol>
        {jalur.length > 1 ? (
          <button type="button" className={styles.up} onClick={() => masukKe(jalur[jalur.length - 2].id)}>
            Naik satu tingkat
          </button>
        ) : null}
      </nav>

      <div className={styles.legend}>
        <span>Hanya impor</span>
        <span className={styles.gradient} style={{ background: GRADIEN_ISP }} aria-hidden="true">
          <i style={{ left: "0%" }}>{"\u22121"}</i>
          <i style={{ left: "50%" }}>0</i>
          <i style={{ left: "100%" }}>+1</i>
        </span>
        <span>Hanya ekspor</span>
      </div>

      <div
        ref={wrapRef}
        className={styles.canvas}
        style={{ height: tinggi }}
        onMouseLeave={() => setAktif(null)}
      >
        {duaTingkat
          ? kelompok.map((g) => (
              <button
                key={`g-${g.data.id}`}
                type="button"
                className={styles.group}
                style={{ left: g.x0, top: g.y0, width: g.x1 - g.x0, height: g.y1 - g.y0 }}
                onClick={() => masukKe(g.data.id)}
                onMouseEnter={() => tampilRinci(g)}
                onFocus={() => tampilRinci(g)}
                aria-label={`${g.data.label}: ${miliar(g.value ?? 0)} miliar USD. Klik untuk melihat isinya.`}
              >
                {g.x1 - g.x0 > 50 ? (
                  <span className={styles.groupLabel}>
                    {g.data.label}
                    {g.x1 - g.x0 > 150 ? <em> {miliar(g.value ?? 0)}</em> : null}
                  </span>
                ) : null}
              </button>
            ))
          : null}

        {ubin.map((n) => {
          const w = n.x1 - n.x0;
          const h = n.y1 - n.y0;
          const v = ispNode(n.data, tahun);
          const bisaMasuk = duaTingkat || (n.data.children ?? []).length > 0;
          const tujuan = duaTingkat ? (n.parent as R).data.id : n.data.id;
          return (
            <button
              key={`t-${n.data.id}`}
              type="button"
              className={styles.tile}
              data-aktif={aktif?.node.id === n.data.id ? "true" : undefined}
              style={{
                left: n.x0,
                top: n.y0,
                width: w,
                height: h,
                background: warnaIsp(v),
                color: teksDiAtas(v),
              }}
              onMouseEnter={() => tampilRinci(n)}
              onFocus={() => tampilRinci(n)}
              onClick={() => (bisaMasuk ? masukKe(tujuan) : tampilRinci(n))}
              aria-label={`${n.data.label}, ${miliar(n.value ?? 0)} miliar USD, indeks ${formatIsp(v)}${
                bisaMasuk ? ". Klik untuk memperbesar." : ""
              }`}
            >
              {w > 58 && h > 24 ? <span className={styles.tileLabel}>{n.data.label}</span> : null}
              {w > 50 && h > 44 ? <span className={styles.tileValue}>{miliar(n.value ?? 0)}</span> : null}
            </button>
          );
        })}
      </div>

      <Rincian aktif={aktif} tahun={tahun} />

      <Caption
        judul={`${chapter3Copy.treemapJudul}, ${tahun}`}
        satuan={"miliar USD (angka di kotak); indeks spesialisasi perdagangan, \u22121 sampai +1 (warna)"}
        catatan={`${chapter3Copy.catatanEmas} Hirarki: Section (1 digit), Division (2 digit), Group (3 digit). Indeks di tiap tingkat dihitung dari ekspor dan impor yang dijumlahkan, bukan dari rata-rata indeks di bawahnya. Label Section dan Division adalah terjemahan bebas nomenklatur SITC Rev.4.`}
      />
    </figure>
  );
}

function Rincian({ aktif, tahun }: { aktif: { node: SitcNode; induk: SitcNode } | null; tahun: Tahun3 }) {
  if (!aktif) {
    return (
      <div className={styles.inspector} aria-live="polite">
        <p className={styles.hint}>
          Arahkan kursor atau ketuk kotak untuk melihat rinciannya. Klik kotak untuk masuk ke tingkat berikutnya.
        </p>
      </div>
    );
  }
  const { node, induk } = aktif;
  const e = node.nilai[tahun].e;
  const i = node.nilai[tahun].i;
  const t = e + i;
  const lain: Tahun3 = tahun === "2025" ? "2024" : "2025";
  const tLain = total(node, lain);
  return (
    <div className={styles.inspector} aria-live="polite">
      <p className={styles.inspectorTitle}>
        {node.label}
        <span>
          {" "}
          SITC {node.id}
          {node.label !== node.labelEn ? `: ${node.labelEn}` : ""}
        </span>
      </p>
      <dl className={styles.inspectorGrid}>
        <div>
          <dt>Ekspor</dt>
          <dd>{miliar(e)}</dd>
        </div>
        <div>
          <dt>Impor</dt>
          <dd>{miliar(i)}</dd>
        </div>
        <div>
          <dt>{e - i >= 0 ? "Surplus" : "Defisit"}</dt>
          <dd>{miliar(Math.abs(e - i))}</dd>
        </div>
        <div>
          <dt>Indeks</dt>
          <dd>{formatIsp(isp(e, i))}</dd>
        </div>
        <div>
          <dt>Porsi dari {induk.id === "root" ? "total" : induk.label.toLowerCase()}</dt>
          <dd>{angka1((t / total(induk, tahun)) * 100)}%</dd>
        </div>
        <div>
          <dt>
            {tahun === "2025" ? "Perubahan dari 2024" : "Perubahan ke 2025"}
          </dt>
          <dd>
            {tLain > 0 && t > 0
              ? `${bertanda(
                  tahun === "2025" ? t - tLain : tLain - t,
                  angka1(Math.abs(tahun === "2025" ? pertumbuhan(tLain, t) : pertumbuhan(t, tLain)))
                )}%`
              : "tidak ada"}
          </dd>
        </div>
      </dl>
      <p className={styles.unit}>Nilai dalam miliar USD, tahun {tahun}.</p>
    </div>
  );
}
