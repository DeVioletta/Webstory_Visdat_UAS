"use client";

import { useState } from "react";
import Caption from "@/components/ui/Caption";
import ui from "@/components/ui/ui.module.css";
import { chapter3Copy, TREE, type SitcNode, type Tahun3 } from "@/content/chapter3";
import { miliar, pctCss } from "@/lib/format";
import styles from "./chapter3.module.css";

const JUMLAH = 6;
const DAUN: SitcNode[] = TREE.children!.flatMap((s) => s.children!.flatMap((d) => d.children!));
const neraca = (n: SitcNode, t: Tahun3) => n.nilai[t].e - n.nilai[t].i;

export default function SurplusDefisit() {
  const [tahun, setTahun] = useState<Tahun3>("2025");
  const urut = [...DAUN].sort((a, b) => neraca(b, tahun) - neraca(a, tahun));
  const surplus = urut.slice(0, JUMLAH);
  const defisit = urut.slice(-JUMLAH).reverse();
  const maks = Math.max(...DAUN.flatMap((n) => [Math.abs(neraca(n, "2024")), Math.abs(neraca(n, "2025"))]));

  const Kolom = ({ judul, isi, warna }: { judul: string; isi: SitcNode[]; warna: string }) => (
    <div>
      <h4 className={styles.listTitle}>{judul}</h4>
      <ol className={styles.list}>
        {isi.map((n) => {
          const v = neraca(n, tahun);
          return (
            <li key={n.id} title={`SITC ${n.id}: ${n.labelEn}`}>
              <span className={styles.listName}>
                {n.label}
                <small> SITC {n.id}</small>
              </span>
              <span className={styles.listBar}>
                <span style={{ width: pctCss((Math.abs(v) / maks) * 100), backgroundColor: warna }} />
              </span>
              <span className={styles.listValue}>
                {v >= 0 ? "+" : "\u2212"}
                {miliar(Math.abs(v))}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );

  return (
    <figure className={styles.figure}>
      <div className={styles.head}>
        <h3 className={styles.title}>
          {chapter3Copy.daftarJudul}, {tahun}
        </h3>
        <div role="group" aria-label="Pilih tahun" className={ui.segment}>
          {(["2024", "2025"] as Tahun3[]).map((t) => (
            <button key={t} type="button" aria-pressed={tahun === t} onClick={() => setTahun(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.lists}>
        <Kolom judul="Surplus terbesar" isi={surplus} warna="var(--ekspor)" />
        <Kolom judul="Defisit terbesar" isi={defisit} warna="var(--impor)" />
      </div>
      <Caption
        judul={`${chapter3Copy.daftarJudul}, ${tahun}`}
        satuan="miliar USD; neraca = ekspor dikurangi impor"
        catatan="Panjang batang memakai skala yang sama untuk kedua kolom dan kedua tahun. Arahkan kursor ke nama untuk melihat nama resmi SITC."
      />
    </figure>
  );
}
