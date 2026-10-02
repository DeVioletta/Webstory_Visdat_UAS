"use client";

import { useState } from "react";
import Caption from "@/components/ui/Caption";
import { chapter0Copy, chapter0Data, type ChartState, type ModeNilai, type Tahun } from "@/content/chapter0";
import { angka1, bertanda, miliar, pertumbuhan } from "@/lib/format";
import styles from "./chapter0.module.css";
import ui from "@/components/ui/ui.module.css";

type Row = (typeof chapter0Data.ranking)[number];

const WARNA_SOROT: Record<string, string> = {
  "321": "var(--batubara)",
  "422": "var(--sawit)",
};

const nilaiEkspor = (r: Row, t: Tahun) => (t === "2024" ? r.ekspor2024 : r.ekspor2025);
const pangsa = (r: Row, t: Tahun) => (t === "2024" ? r.share2024 : r.share2025);
const peringkat = (r: Row, t: Tahun) => (t === "2024" ? r.rank2024 : r.rank2025);

interface Props {
  state: ChartState;
  onTahun: (t: Tahun) => void;
  onMode: (m: ModeNilai) => void;
}

export default function RankingChart({ state, onTahun, onMode }: Props) {
  const { tahun, mode, sorot, tampilkanSelisih } = state;
  const [aktifKode, setAktifKode] = useState<string | null>(null);
  const rows = chapter0Data.ranking;

  // Skala tetap untuk kedua tahun, supaya perubahan panjang batang mencerminkan perubahan nilai
  const maks =
    mode === "nilai"
      ? Math.max(...rows.flatMap((r) => [r.ekspor2024, r.ekspor2025]))
      : Math.max(...rows.flatMap((r) => [r.share2024, r.share2025]));

  const warnaBatang = (r: Row, rank: number) => {
    if (sorot.length === 0) return rank <= 10 ? "var(--ekspor)" : "var(--bar-netral)";
    if (!sorot.includes(r.kode)) return "var(--bar-netral)";
    return WARNA_SOROT[r.kode] ?? "var(--sorot-lain)";
  };

  const aktif = rows.find((r) => r.kode === aktifKode) ?? null;
  const legenda = sorot
    .map((k) => rows.find((r) => r.kode === k))
    .filter((r): r is Row => Boolean(r));

  return (
    <figure className={styles.chart}>
      <div className={styles.chartHead}>
        <h3 className={styles.chartTitle}>
          {chapter0Copy.rankingJudul}, {tahun}
        </h3>
        <div className={styles.controls}>
          <div role="group" aria-label="Pilih tahun" className={ui.segment}>
            {(["2024", "2025"] as Tahun[]).map((t) => (
              <button key={t} type="button" aria-pressed={tahun === t} onClick={() => onTahun(t)}>
                {t}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Pilih ukuran" className={ui.segment}>
            {(
              [
                ["nilai", "Nilai"],
                ["pangsa", "Pangsa"],
              ] as [ModeNilai, string][]
            ).map(([m, label]) => (
              <button key={m} type="button" aria-pressed={mode === m} onClick={() => onMode(m)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {legenda.length > 0 ? (
        <ul className={styles.legend}>
          {legenda.map((r) => (
            <li key={r.kode}>
              <span
                className={styles.swatch}
                style={{ background: WARNA_SOROT[r.kode] ?? "var(--sorot-lain)" }}
              />
              {r.label}
            </li>
          ))}
          <li>
            <span className={styles.swatch} style={{ background: "var(--bar-netral)" }} />
            Komoditas lain
          </li>
        </ul>
      ) : null}

      <div className={styles.rows} onMouseLeave={() => setAktifKode(null)}>
        {rows.map((r) => {
          const rank = peringkat(r, tahun);
          const v = mode === "nilai" ? nilaiEkspor(r, tahun) : pangsa(r, tahun);
          const selisih = r.ekspor2025 - r.ekspor2024;
          const labelNilai = mode === "nilai" ? miliar(v) : `${angka1(v)}%`;
          const tampilSelisih = tampilkanSelisih && tahun === "2025" && sorot.includes(r.kode);
          return (
            <button
              key={r.kode}
              type="button"
              className={styles.row}
              data-luar={rank > 10 ? "true" : undefined}
              data-aktif={aktifKode === r.kode ? "true" : undefined}
              style={{
                transform: `translateY(calc(var(--row-h) * ${rank - 1} + ${rank > 10 ? "var(--gap)" : "0px"}))`,
              }}
              onMouseEnter={() => setAktifKode(r.kode)}
              onFocus={() => setAktifKode(r.kode)}
              onClick={() => setAktifKode((k) => (k === r.kode ? null : r.kode))}
              aria-label={`Peringkat ${rank}: ${r.label}, ${labelNilai}${mode === "nilai" ? " miliar US dolar" : " dari total ekspor"}`}
            >
              <span className={styles.rank}>{rank}</span>
              <span className={styles.rowLabel}>{r.label}</span>
              <span className={styles.track}>
                <span
                  className={styles.bar}
                  style={{ width: `${(v / maks) * 100}%`, background: warnaBatang(r, rank) }}
                />
              </span>
              <span className={styles.rowValue}>
                {labelNilai}
                {tampilSelisih ? (
                  <span className={styles.delta}>
                    {selisih >= 0 ? "\u25B2" : "\u25BC"} {bertanda(selisih, miliar(Math.abs(selisih)))}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
        <div className={styles.cutoff} aria-hidden="true">
          <span>di luar sepuluh besar</span>
        </div>
      </div>

      <div className={styles.inspector} aria-live="polite">
        {aktif ? (
          <>
            <p className={styles.inspectorTitle}>{aktif.label}</p>
            <p className={styles.inspectorSub}>
              SITC {aktif.kode}: {aktif.namaResmi}
            </p>
            <dl className={styles.inspectorGrid}>
              <div>
                <dt>Ekspor 2024</dt>
                <dd>{miliar(aktif.ekspor2024)} miliar US$</dd>
              </div>
              <div>
                <dt>Ekspor 2025</dt>
                <dd>{miliar(aktif.ekspor2025)} miliar US$</dd>
              </div>
              <div>
                <dt>Perubahan</dt>
                <dd>
                  {bertanda(
                    aktif.ekspor2025 - aktif.ekspor2024,
                    angka1(Math.abs(pertumbuhan(aktif.ekspor2024, aktif.ekspor2025)))
                  )}
                  %
                </dd>
              </div>
              <div>
                <dt>Peringkat</dt>
                <dd>
                  {aktif.rank2024} ke {aktif.rank2025}
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <p className={styles.inspectorHint}>Arahkan kursor atau ketuk satu baris untuk melihat rinciannya.</p>
        )}
      </div>

      <Caption
        judul={`${chapter0Copy.rankingJudul} Indonesia, ${tahun}, menurut kelompok SITC 3 digit`}
        satuan={mode === "nilai" ? "miliar US$" : "persen dari total ekspor tahun berjalan"}
        catatan="Emas moneter tidak dimasukkan dalam peringkat. Baris paling bawah adalah komoditas yang masuk sepuluh besar di salah satu tahun saja."
      />
    </figure>
  );
}
