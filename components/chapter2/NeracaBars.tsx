"use client";

import { useState } from "react";
import Caption from "@/components/ui/Caption";
import ui from "@/components/ui/ui.module.css";
import { CATATAN_NILAI, chapter2Copy, chapter2Data, neraca, type Mitra, type Tahun2 } from "@/content/chapter2";
import { miliar, pctCss } from "@/lib/format";
import styles from "./chapter2.module.css";

const JUMLAH = 15;

export default function NeracaBars() {
  const [tahun, setTahun] = useState<Tahun2>("2025");
  const [aktif, setAktif] = useState<Mitra | null>(null);

  const total = (m: Mitra) => m[`ekspor${tahun}`] + m[`impor${tahun}`];
  const rows = [...chapter2Data.mitra]
    .sort((a, b) => total(b) - total(a))
    .slice(0, JUMLAH)
    .sort((a, b) => neraca(b, tahun) - neraca(a, tahun));

  // Skala simetris tetap untuk kedua tahun
  const maks = Math.max(...chapter2Data.mitra.flatMap((m) => [Math.abs(neraca(m, "2024")), Math.abs(neraca(m, "2025"))]));

  return (
    <figure className={styles.figure}>
      <div className={styles.head}>
        <h3 className={styles.title}>
          {chapter2Copy.neracaJudul}, {tahun}
        </h3>
        <div role="group" aria-label="Pilih tahun" className={ui.segment}>
          {(["2024", "2025"] as Tahun2[]).map((t) => (
            <button key={t} type="button" aria-pressed={tahun === t} onClick={() => setTahun(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.barAxisHead} aria-hidden="true">
        <span>Defisit (impor lebih besar)</span>
        <span>Surplus (ekspor lebih besar)</span>
      </div>

      <ul className={styles.bars} onMouseLeave={() => setAktif(null)}>
        {rows.map((m) => {
          const n = neraca(m, tahun);
          const lebar = (Math.abs(n) / maks) * 50;
          return (
            <li key={m.iso3}>
              <button
                type="button"
                className={styles.barRow}
                data-aktif={aktif?.iso3 === m.iso3 ? "true" : undefined}
                onMouseEnter={() => setAktif(m)}
                onFocus={() => setAktif(m)}
                onClick={() => setAktif((a) => (a?.iso3 === m.iso3 ? null : m))}
                aria-label={`${m.nama}: ${n >= 0 ? "surplus" : "defisit"} ${miliar(Math.abs(n))} miliar USD`}
              >
                <span className={styles.barName}>{m.nama}</span>
                <span className={styles.barTrack}>
                  <span
                    className={styles.barFill}
                    style={{
                      left: n >= 0 ? "50%" : pctCss(50 - lebar),
                      width: pctCss(lebar),
                      backgroundColor: n >= 0 ? "var(--ekspor)" : "var(--impor)",
                    }}
                  />
                </span>
                <span className={styles.barValue}>
                  {n >= 0 ? "+" : "\u2212"}
                  {miliar(Math.abs(n))}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className={styles.barDetail} aria-live="polite">
        {aktif ? (
          <p>
            <strong>{aktif.nama}</strong>: ekspor {miliar(aktif[`ekspor${tahun}`])}, impor {miliar(aktif[`impor${tahun}`])},{" "}
            {neraca(aktif, tahun) >= 0 ? "surplus" : "defisit"} {miliar(Math.abs(neraca(aktif, tahun)))} miliar USD.
          </p>
        ) : (
          <p className={styles.muted}>Arahkan kursor atau ketuk satu baris untuk melihat ekspor dan impornya.</p>
        )}
      </div>

      <Caption
        judul={`${chapter2Copy.neracaJudul} (menurut total ekspor dan impor), ${tahun}`}
        satuan="miliar USD; neraca = ekspor dikurangi impor"
        catatan={`${CATATAN_NILAI} Biru = surplus, oranye = defisit; tanda + dan \u2212 menunjukkan hal yang sama.`}
      />
    </figure>
  );
}
