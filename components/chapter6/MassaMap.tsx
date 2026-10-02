"use client";

import { useMemo, useState } from "react";
import Caption from "@/components/ui/Caption";
import ui from "@/components/ui/ui.module.css";
import { WILAYAH, type Wilayah } from "@/content/chapter5";
import {
  chapter6Copy,
  chapter6Data,
  jutaRp,
  KELAS_PDRB,
  triliun,
  type Dasar,
  type DaerahMassa,
  type MassaState,
  type ProvinsiMassa,
} from "@/content/chapter6";
import { PALET_PDRB } from "@/lib/color";
import { angka1 } from "@/lib/format";
import { jalurIndonesia, K_MAKS, PETA_H, PETA_W, proyeksiIndonesia, usePetaZoom } from "@/lib/petaIndonesia";
import { useKabKota } from "@/components/chapter5/useKabKota";
import { kelasDari } from "@/components/chapter5/PdrbMap";
import { useProvinsi } from "./useProvinsi";
import styles from "./chapter6.module.css";

const DAERAH = new Map(chapter6Data.daerah.map((d) => [d.id, d]));
const PROVINSI = new Map(chapter6Data.provinsi.map((p) => [p.id, p]));
const PERINGKAT_TOTAL = new Map(chapter6Data.daerah.map((d, i) => [d.id, i + 1]));
const PERINGKAT_PK = new Map([...chapter6Data.daerah].sort((a, b) => b.perKapita - a.perKapita).map((d, i) => [d.id, i + 1]));
const TOTAL_MAKS = chapter6Data.daerah[0].total;
const R_MAKS = 30; // jari-jari lingkaran terbesar, dalam satuan viewBox
const jariJari = (miliar: number) => R_MAKS * Math.sqrt(miliar / TOTAL_MAKS); // luas sebanding nilai
const LEGENDA_SIMBOL = [50_000, 250_000, 900_000]; // miliar rupiah

// Titik simbol diproyeksikan sekali; urut besar ke kecil supaya lingkaran kecil tetap di atas
const SIMBOL = chapter6Data.daerah
  .map((d) => {
    const p = proyeksiIndonesia([d.lon, d.lat]) ?? [0, 0];
    return { d, x: p[0], y: p[1], r: jariJari(d.total) };
  })
  .sort((a, b) => b.r - a.r);

type Hover = { jenis: "kab"; d: DaerahMassa; x: number; y: number } | { jenis: "prov"; p: ProvinsiMassa; x: number; y: number };

interface Props {
  state: MassaState;
  onChange: (s: Partial<MassaState>) => void;
}

export default function MassaMap({ state, onChange }: Props) {
  const { dasar, simbol, wilayah, sorot } = state;
  const { data: kab } = useKabKota();
  const prov = useProvinsi();
  const { wrapRef, zoom, seret, perbesar, handlers, gayaGrup, keLayar, posisi } = usePetaZoom(wilayah);
  const [hover, setHover] = useState<Hover | null>(null);

  const jalurKab = useMemo(
    () => (kab ? kab.kabkota.map((f) => ({ id: f.properties.id, d: jalurIndonesia(f) ?? "" })) : []),
    [kab]
  );
  const jalurBatasProv = useMemo(() => (kab ? jalurIndonesia(kab.batasProvinsi) ?? "" : ""), [kab]);
  const jalurProv = useMemo(
    () => (prov ? prov.map((f) => ({ id: f.properties.prov, d: jalurIndonesia(f) ?? "" })) : []),
    [prov]
  );

  const tersorot = new Set(sorot);
  const adaSorot = sorot.length > 0;

  const warnaKab = (id: string) => {
    if (dasar === "polos") return "var(--paper-deep)";
    const d = DAERAH.get(id);
    return d ? PALET_PDRB[kelasDari(d.perKapita, KELAS_PDRB)] : "#ccc";
  };

  const tampilKab = (e: React.PointerEvent, d: DaerahMassa) => {
    if (seret) return;
    const p = posisi(e.clientX, e.clientY);
    setHover({ jenis: "kab", d, x: p.px, y: p.py });
  };

  return (
    <figure className={styles.figure}>
      <h3 className={styles.title}>
        {simbol && dasar !== "polos" ? "PDRB per kapita (warna) dan PDRB total (lingkaran), 2025" : chapter6Copy.petaJudul[simbol ? "polos" : dasar]}
      </h3>

      <div className={styles.controls}>
        <div role="group" aria-label="Warna dasar peta" className={ui.segment}>
          {(
            [
              ["provinsi", "Per kapita provinsi"],
              ["kabkota", "Per kapita kab/kota"],
              ["polos", "Tanpa warna"],
            ] as [Dasar, string][]
          ).map(([d, t]) => (
            <button key={d} type="button" aria-pressed={dasar === d} onClick={() => onChange({ dasar: d })}>
              {t}
            </button>
          ))}
        </div>
        <label className={styles.check}>
          <input type="checkbox" checked={simbol} onChange={(e) => onChange({ simbol: e.target.checked })} />
          Lingkaran PDRB total
        </label>
        <label className={styles.select}>
          <span>Wilayah</span>
          <select value={wilayah} onChange={(e) => onChange({ wilayah: e.target.value as Wilayah })}>
            {WILAYAH.map((w) => (
              <option key={w.id} value={w.id}>
                {w.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.legends}>
        {dasar !== "polos" ? (
          <ul className={styles.legend} aria-label="Legenda warna">
            {KELAS_PDRB.map((b, i) => (
              <li key={b}>
                <span className={styles.swatch} style={{ background: PALET_PDRB[i] }} />
                {i === 0 ? `\u2264 ${jutaRp(b)}` : `${jutaRp(KELAS_PDRB[i - 1])} \u2013 ${jutaRp(b)}`}
              </li>
            ))}
            <li className={styles.unit}>juta rupiah per penduduk</li>
          </ul>
        ) : null}
        {simbol ? (
          <div className={styles.symbolLegend} aria-label="Legenda lingkaran">
            <svg width={2 * R_MAKS + 4} height={2 * R_MAKS + 4} aria-hidden="true">
              {LEGENDA_SIMBOL.map((v) => (
                <circle
                  key={v}
                  cx={R_MAKS + 2}
                  cy={2 * R_MAKS + 2 - jariJari(v)}
                  r={jariJari(v)}
                  className={styles.legendCircle}
                />
              ))}
            </svg>
            <ul>
              {[...LEGENDA_SIMBOL].reverse().map((v) => (
                <li key={v}>{triliun(v)}</li>
              ))}
              <li className={styles.unit}>triliun rupiah</li>
            </ul>
          </div>
        ) : null}
      </div>

      <div
        ref={wrapRef}
        className={styles.mapWrap}
        data-zoom={zoom.k > 1 ? "true" : undefined}
        {...handlers}
        onPointerLeave={() => setHover(null)}
      >
        <div className={styles.zoomControls} role="group" aria-label="Kontrol zoom peta">
          <button type="button" onClick={() => perbesar(1.6)} aria-label="Perbesar" disabled={zoom.k >= K_MAKS}>
            +
          </button>
          <button type="button" onClick={() => perbesar(1 / 1.6)} aria-label="Perkecil" disabled={zoom.k <= 1}>
            {"\u2212"}
          </button>
          <button type="button" onClick={() => onChange({ wilayah: "indonesia" })}>
            Semua
          </button>
        </div>
        {!kab ? <p className={styles.loading}>Memuat peta...</p> : null}

        <svg viewBox={`0 0 ${PETA_W} ${PETA_H}`} className={styles.map} role="img" aria-label={chapter6Copy.petaJudul[dasar]}>
          <g style={gayaGrup}>
            {dasar === "provinsi"
              ? jalurProv.map((j) => {
                  const p = PROVINSI.get(j.id);
                  return (
                    <path
                      key={j.id}
                      d={j.d}
                      fill={p ? PALET_PDRB[kelasDari(p.nilai, KELAS_PDRB)] : "#ccc"}
                      className={styles.region}
                      vectorEffect="non-scaling-stroke"
                      onPointerMove={(e) => {
                        if (!p || seret || simbol) return;
                        const q = posisi(e.clientX, e.clientY);
                        setHover({ jenis: "prov", p, x: q.px, y: q.py });
                      }}
                    />
                  );
                })
              : jalurKab.map((j) => {
                  const d = DAERAH.get(j.id);
                  return (
                    <path
                      key={j.id}
                      d={j.d}
                      fill={warnaKab(j.id)}
                      className={styles.region}
                      data-redup={adaSorot && !tersorot.has(j.id) && !simbol ? "true" : undefined}
                      vectorEffect="non-scaling-stroke"
                      onPointerMove={(e) => d && !simbol && tampilKab(e, d)}
                    />
                  );
                })}
            {dasar !== "provinsi" ? <path d={jalurBatasProv} className={styles.provLine} vectorEffect="non-scaling-stroke" /> : null}
            {!simbol
              ? jalurKab
                  .filter((j) => tersorot.has(j.id))
                  .map((j) => <path key={`s-${j.id}`} d={j.d} className={styles.highlight} vectorEffect="non-scaling-stroke" />)
              : null}
          </g>

          {/* Lingkaran tidak ikut membesar saat zoom, supaya ukurannya tetap sesuai legenda */}
          {simbol ? (
            <g>
              {SIMBOL.map((s) => {
                const p = keLayar(s.x, s.y);
                const aktif = hover?.jenis === "kab" && hover.d.id === s.d.id;
                return (
                  <circle
                    key={s.d.id}
                    cx={p.x}
                    cy={p.y}
                    r={Math.max(1.2, s.r)}
                    className={styles.symbol}
                    data-sorot={tersorot.has(s.d.id) ? "true" : undefined}
                    data-aktif={aktif ? "true" : undefined}
                    data-redup={adaSorot && !tersorot.has(s.d.id) ? "true" : undefined}
                    onPointerMove={(e) => tampilKab(e, s.d)}
                    onPointerDown={(e) => tampilKab(e, s.d)}
                  />
                );
              })}
            </g>
          ) : null}

          {/* Label daerah yang disorot */}
          <g>
            {sorot.slice(0, 8).map((id) => {
              const s = SIMBOL.find((x) => x.d.id === id);
              if (!s) return null;
              const p = keLayar(s.x, s.y);
              return (
                <text key={`l-${id}`} x={p.x + (simbol ? s.r : 0) + 6} y={p.y - 6} className={styles.mapLabel}>
                  {s.d.nama.replace(/^Kab\.\s/, "")}
                </text>
              );
            })}
          </g>
        </svg>

        {hover ? (
          <div
            className={styles.tooltip}
            style={{
              left: Math.max(4, Math.min(hover.x + 14, (wrapRef.current?.clientWidth ?? PETA_W) - 246)),
              top: Math.max(4, hover.y - 10),
            }}
            role="status"
          >
            {hover.jenis === "kab" ? <IsiKab d={hover.d} /> : <IsiProv p={hover.p} />}
          </div>
        ) : null}
      </div>

      <p className={styles.hint}>
        Arahkan kursor ke daerah atau lingkaran. Perbesar dengan tombol, klik ganda, cubit, atau Ctrl + gulir; seret untuk
        menggeser saat diperbesar.
      </p>

      <Caption
        judul={simbol && dasar !== "polos" ? "PDRB per kapita (warna) dan PDRB total (lingkaran) menurut kabupaten/kota, 2025" : chapter6Copy.petaJudul[simbol ? "polos" : dasar]}
        satuan={
          simbol
            ? "triliun rupiah, atas dasar harga berlaku (luas lingkaran)" + (dasar !== "polos" ? "; juta rupiah per penduduk (warna)" : "")
            : "juta rupiah per penduduk per tahun, atas dasar harga berlaku"
        }
        catatan={`${
          simbol
            ? "Luas lingkaran sebanding dengan PDRB total (jari-jari memakai akar kuadrat), sehingga lingkaran dua kali lebih luas berarti nilai dua kali lebih besar. PDRB total adalah angka absolut, karena itu digambar sebagai simbol, bukan diwarnai seperti choropleth. "
            : ""
        }${
          dasar !== "polos"
            ? "Kelas warna sama dengan peta Bab 5 (kuantil dari 514 kabupaten/kota), supaya peta provinsi dan kabupaten/kota bisa dibandingkan langsung. "
            : ""
        }Batas provinsi adalah gabungan batas kabupaten/kota dari GeoJSON yang sama.`}
      />
    </figure>
  );
}

function IsiKab({ d }: { d: DaerahMassa }) {
  return (
    <>
      <p className={styles.tipTitle}>
        {d.nama} <span>{d.provinsi}</span>
      </p>
      <dl className={styles.tipGrid}>
        <div>
          <dt>PDRB total</dt>
          <dd>{triliun(d.total)} triliun</dd>
        </div>
        <div>
          <dt>Peringkat total</dt>
          <dd>{PERINGKAT_TOTAL.get(d.id)} dari 514</dd>
        </div>
        <div>
          <dt>PDRB per kapita</dt>
          <dd>{jutaRp(d.perKapita)} juta</dd>
        </div>
        <div>
          <dt>Peringkat per kapita</dt>
          <dd>{PERINGKAT_PK.get(d.id)} dari 514</dd>
        </div>
        <div className={styles.full}>
          <dt>Porsi dari PDRB nasional</dt>
          <dd>{angka1((d.total / chapter6Data.nasional.pdrbTotal) * 100)}%</dd>
        </div>
      </dl>
    </>
  );
}

function IsiProv({ p }: { p: ProvinsiMassa }) {
  return (
    <>
      <p className={styles.tipTitle}>{p.nama}</p>
      <dl className={styles.tipGrid}>
        <div>
          <dt>PDRB per kapita provinsi</dt>
          <dd>{jutaRp(p.nilai)} juta</dd>
        </div>
        <div>
          <dt>Jumlah kab/kota</dt>
          <dd>{p.jumlahKab}</dd>
        </div>
        <div className={styles.full}>
          <dt>Rentang di dalamnya</dt>
          <dd>
            {p.terendah.nama} {jutaRp(p.terendah.nilai)} juta sampai {p.tertinggi.nama} {jutaRp(p.tertinggi.nilai)} juta
          </dd>
        </div>
      </dl>
    </>
  );
}
