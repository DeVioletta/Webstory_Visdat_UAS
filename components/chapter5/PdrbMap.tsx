"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import Caption from "@/components/ui/Caption";
import ui from "@/components/ui/ui.module.css";
import {
  chapter5Copy,
  chapter5Data,
  juta,
  LABEL_LISA,
  WILAYAH,
  type Daerah,
  type Lapisan,
  type Metode,
  type PetaState,
  type Wilayah,
} from "@/content/chapter5";
import { PALET_PDRB, WARNA_LISA } from "@/lib/color";
import { useKabKota } from "./useKabKota";
import styles from "./chapter5.module.css";

const W = 1000;
const H = 440;
const K_MAKS = 14;

const DAERAH = new Map(chapter5Data.daerah.map((d) => [d.id, d]));
const PERINGKAT = new Map([...chapter5Data.daerah].sort((a, b) => b.nilai - a.nilai).map((d, i) => [d.id, i + 1]));

// Proyeksi tetap untuk Indonesia; zoom dilakukan dengan transform pada grup peta
const proyeksi = geoMercator().fitExtent(
  [
    [8, 8],
    [W - 8, H - 8],
  ],
  // MultiPoint dua sudut: aman dari masalah arah putaran poligon pada geometri bola
  {
    type: "MultiPoint",
    coordinates: [
      [94.5, -11.2],
      [141.2, 6.2],
    ],
  }
);
const jalurGeo = geoPath(proyeksi);

interface Zoom {
  k: number;
  tx: number;
  ty: number;
}
const ZOOM_AWAL: Zoom = { k: 1, tx: 0, ty: 0 };

function zoomWilayah(id: Wilayah): Zoom {
  const w = WILAYAH.find((x) => x.id === id);
  if (!w || id === "indonesia") return ZOOM_AWAL;
  const [x0, y0] = proyeksi([w.bbox[0], w.bbox[3]]) ?? [0, 0];
  const [x1, y1] = proyeksi([w.bbox[2], w.bbox[1]]) ?? [W, H];
  const k = Math.min(K_MAKS, 0.94 * Math.min(W / (x1 - x0), H / (y1 - y0)));
  return { k, tx: W / 2 - k * ((x0 + x1) / 2), ty: H / 2 - k * ((y0 + y1) / 2) };
}

export function kelasDari(nilai: number, batas: number[]): number {
  const i = batas.findIndex((b) => nilai <= b);
  return i === -1 ? batas.length - 1 : i;
}

interface Props {
  state: PetaState;
  onChange?: (s: Partial<PetaState>) => void;
  /** Mode ringkas: tanpa kontrol lapisan/klasifikasi, untuk peta pendamping */
  ringkas?: boolean;
  judul?: string;
}

export default function PdrbMap({ state, onChange, ringkas = false, judul }: Props) {
  const { lapisan, metode, wilayah, sorot } = state;
  const { data, galat } = useKabKota();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<Zoom>(ZOOM_AWAL);
  const [seret, setSeret] = useState(false);
  const [batasProv, setBatasProv] = useState(true);
  const [hover, setHover] = useState<{ d: Daerah; x: number; y: number } | null>(null);
  const [pilih, setPilih] = useState<Daerah | null>(null);
  const [cari, setCari] = useState("");
  const pointer = useRef(new Map<number, { x: number; y: number }>());
  const awalGeser = useRef<{ x: number; y: number; z: Zoom; jarak?: number } | null>(null);

  // Pindah wilayah saat langkah cerita atau tombol wilayah berubah
  useEffect(() => setZoom(zoomWilayah(wilayah)), [wilayah]);

  const jalur = useMemo(
    () => (data ? data.kabkota.map((f) => ({ id: f.properties.id, d: jalurGeo(f) ?? "", c: jalurGeo.centroid(f) })) : []),
    [data]
  );
  const jalurProv = useMemo(() => (data ? jalurGeo(data.batasProvinsi) ?? "" : ""), [data]);

  const batas = chapter5Data.kelas[metode];
  const warna = (d: Daerah | undefined) => {
    if (!d) return "#ccc";
    return lapisan === "lisa" ? WARNA_LISA[d.lisa] : PALET_PDRB[kelasDari(d.nilai, batas)];
  };
  const adaSorot = sorot.length > 0;
  const tersorot = new Set(sorot);

  const skalaLayar = () => W / (wrapRef.current?.clientWidth || W);
  const perbesar = (f: number) =>
    setZoom((z) => {
      const k = Math.max(1, Math.min(K_MAKS, z.k * f));
      if (k === 1) return ZOOM_AWAL;
      const cx = (W / 2 - z.tx) / z.k;
      const cy = (H / 2 - z.ty) / z.k;
      return { k, tx: W / 2 - k * cx, ty: H / 2 - k * cy };
    });

  // Ctrl + gulir / cubit trackpad. Gulir biasa dibiarkan untuk menggulir halaman.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const roda = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      perbesar(Math.exp(-e.deltaY * 0.01));
    };
    el.addEventListener("wheel", roda, { passive: false });
    return () => el.removeEventListener("wheel", roda);
  }, []);

  const keSvg = (clientX: number, clientY: number) => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box) return { x: 0, y: 0, px: 0, py: 0 };
    return { x: (clientX - box.left) * skalaLayar(), y: (clientY - box.top) * skalaLayar(), px: clientX - box.left, py: clientY - box.top };
  };

  const pilihDaerah = (d: Daerah | null) => {
    setPilih(d);
    if (d && onChange) onChange({ sorot: [d.id] });
  };

  const legenda =
    lapisan === "pdrb"
      ? batas.map((b, i) => ({
          warna: PALET_PDRB[i],
          label: i === 0 ? `\u2264 ${juta(b)}` : `${juta(batas[i - 1])} \u2013 ${juta(b)}`,
          n: chapter5Data.daerah.filter((d) => kelasDari(d.nilai, batas) === i).length,
        }))
      : (["HH", "HL", "LH", "LL", "NS"] as const).map((k) => ({
          warna: WARNA_LISA[k],
          label: LABEL_LISA[k].singkat,
          n: chapter5Data.daerah.filter((d) => d.lisa === k).length,
        }));

  const tampil = pilih ?? null;

  return (
    <figure className={styles.figure}>
      {!ringkas ? (
        <>
          <div className={styles.head}>
            <h3 className={styles.title}>{lapisan === "pdrb" ? chapter5Copy.petaJudul : "Klaster LISA PDRB per kapita kabupaten/kota, 2025"}</h3>
          </div>
          <div className={styles.controls}>
            <div role="group" aria-label="Lapisan peta" className={ui.segment}>
              {(
                [
                  ["pdrb", "PDRB per kapita"],
                  ["lisa", "Klaster LISA"],
                ] as [Lapisan, string][]
              ).map(([l, t]) => (
                <button key={l} type="button" aria-pressed={lapisan === l} onClick={() => onChange?.({ lapisan: l })}>
                  {t}
                </button>
              ))}
            </div>
            {lapisan === "pdrb" ? (
              <div role="group" aria-label="Metode klasifikasi" className={ui.segment}>
                {(
                  [
                    ["kuantil", "Kuantil"],
                    ["jenks", "Natural breaks"],
                  ] as [Metode, string][]
                ).map(([m, t]) => (
                  <button key={m} type="button" aria-pressed={metode === m} onClick={() => onChange?.({ metode: m })}>
                    {t}
                  </button>
                ))}
              </div>
            ) : null}
            <label className={styles.check}>
              <input type="checkbox" checked={batasProv} onChange={(e) => setBatasProv(e.target.checked)} />
              Batas provinsi
            </label>
            <label className={styles.select}>
              <span>Wilayah</span>
              <select value={wilayah} onChange={(e) => onChange?.({ wilayah: e.target.value as Wilayah })}>
                {WILAYAH.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.search}>
              <span className={styles.srOnly}>Cari kabupaten atau kota</span>
              <input
                type="search"
                list="daftar-kabkota"
                placeholder="Cari kab/kota..."
                value={cari}
                onChange={(e) => {
                  setCari(e.target.value);
                  const d = chapter5Data.daerah.find((x) => x.nama.toLowerCase() === e.target.value.toLowerCase());
                  if (d) pilihDaerah(d);
                }}
              />
              <datalist id="daftar-kabkota">
                {chapter5Data.daerah.map((d) => (
                  <option key={d.id} value={d.nama}>
                    {d.provinsi}
                  </option>
                ))}
              </datalist>
            </label>
          </div>
        </>
      ) : judul ? (
        <p className={styles.miniTitle}>{judul}</p>
      ) : null}

      <ul className={styles.legend} aria-label="Legenda">
        {legenda.map((l) => (
          <li key={l.label}>
            <span className={styles.swatch} style={{ background: l.warna }} />
            {l.label}
            <small> ({l.n})</small>
          </li>
        ))}
        {lapisan === "pdrb" ? <li className={styles.legendUnit}>juta rupiah per tahun (jumlah daerah)</li> : null}
      </ul>

      <div
        ref={wrapRef}
        className={styles.mapWrap}
        data-zoom={zoom.k > 1 ? "true" : undefined}
        data-ringkas={ringkas ? "true" : undefined}
        onPointerDown={(e) => {
          pointer.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          const pts = [...pointer.current.values()];
          awalGeser.current = {
            x: e.clientX,
            y: e.clientY,
            z: zoom,
            jarak: pts.length === 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : undefined,
          };
        }}
        onPointerMove={(e) => {
          if (!pointer.current.has(e.pointerId)) return;
          pointer.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          const a = awalGeser.current;
          if (!a) return;
          const pts = [...pointer.current.values()];
          if (pts.length === 2 && a.jarak) {
            // Cubit dua jari di layar sentuh
            const j = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            const k = Math.max(1, Math.min(K_MAKS, a.z.k * (j / a.jarak)));
            const cx = (W / 2 - a.z.tx) / a.z.k;
            const cy = (H / 2 - a.z.ty) / a.z.k;
            setSeret(true);
            setZoom(k === 1 ? ZOOM_AWAL : { k, tx: W / 2 - k * cx, ty: H / 2 - k * cy });
            return;
          }
          if (zoom.k <= 1) return;
          const dx = (e.clientX - a.x) * skalaLayar();
          const dy = (e.clientY - a.y) * skalaLayar();
          if (Math.abs(dx) + Math.abs(dy) > 3) {
            setSeret(true);
            setHover(null);
            setZoom({ ...a.z, tx: a.z.tx + dx, ty: a.z.ty + dy });
          }
        }}
        onPointerUp={(e) => {
          pointer.current.delete(e.pointerId);
          awalGeser.current = null;
          setTimeout(() => setSeret(false), 0);
        }}
        onPointerCancel={(e) => {
          pointer.current.delete(e.pointerId);
          awalGeser.current = null;
          setSeret(false);
        }}
        onPointerLeave={() => setHover(null)}
        onDoubleClick={(e) => {
          const p = keSvg(e.clientX, e.clientY);
          setZoom((z) => {
            const k = Math.min(K_MAKS, z.k * 2);
            const cx = (p.x - z.tx) / z.k;
            const cy = (p.y - z.ty) / z.k;
            return { k, tx: W / 2 - k * cx, ty: H / 2 - k * cy };
          });
        }}
      >
        <div className={styles.zoomControls} role="group" aria-label="Kontrol zoom peta">
          <button type="button" onClick={() => perbesar(1.6)} aria-label="Perbesar" disabled={zoom.k >= K_MAKS}>
            +
          </button>
          <button type="button" onClick={() => perbesar(1 / 1.6)} aria-label="Perkecil" disabled={zoom.k <= 1}>
            {"\u2212"}
          </button>
          <button type="button" onClick={() => (onChange ? onChange({ wilayah: "indonesia" }) : setZoom(ZOOM_AWAL))}>
            Semua
          </button>
        </div>

        {galat ? <p className={styles.error}>{galat}</p> : null}
        {!data && !galat ? <p className={styles.loading}>Memuat peta...</p> : null}

        <svg viewBox={`0 0 ${W} ${H}`} className={styles.map} role="img" aria-label={`${chapter5Copy.petaJudul}. Gunakan kotak pencarian untuk memilih daerah.`}>
          <g
            style={{
              transform: `translate(${zoom.tx}px, ${zoom.ty}px) scale(${zoom.k})`,
              transformOrigin: "0 0",
              transition: seret ? "none" : "transform 650ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {jalur.map((j) => {
              const d = DAERAH.get(j.id);
              const redup = adaSorot && !tersorot.has(j.id);
              return (
                <path
                  key={j.id}
                  d={j.d}
                  fill={warna(d)}
                  className={styles.region}
                  data-redup={redup ? "true" : undefined}
                  vectorEffect="non-scaling-stroke"
                  onPointerMove={(e) => {
                    if (!d || seret) return;
                    const p = keSvg(e.clientX, e.clientY);
                    setHover({ d, x: p.px, y: p.py });
                  }}
                  onClick={() => {
                    if (!d || seret) return;
                    setPilih(d);
                  }}
                />
              );
            })}
            {batasProv ? <path d={jalurProv} className={styles.provLine} vectorEffect="non-scaling-stroke" /> : null}
            {/* Garis tebal untuk daerah yang disorot, digambar paling atas */}
            {jalur
              .filter((j) => tersorot.has(j.id) || hover?.d.id === j.id || pilih?.id === j.id)
              .map((j) => (
                <path key={`s-${j.id}`} d={j.d} className={styles.highlight} vectorEffect="non-scaling-stroke" />
              ))}
          </g>
          {/* Label daerah yang disorot: ukurannya tidak ikut membesar saat zoom */}
          <g>
            {sorot.length <= 12
              ? jalur
                  .filter((j) => tersorot.has(j.id))
                  .map((j) => {
                    const d = DAERAH.get(j.id);
                    const x = zoom.tx + zoom.k * j.c[0];
                    const y = zoom.ty + zoom.k * j.c[1];
                    return (
                      <text key={`l-${j.id}`} x={x + 6} y={y - 6} className={styles.mapLabel}>
                        {d?.nama.replace(/^Kab\.\s/, "")}
                      </text>
                    );
                  })
              : null}
          </g>
        </svg>

        {hover ? (
          <div
            className={styles.tooltip}
            style={{
              left: Math.max(4, Math.min(hover.x + 14, (wrapRef.current?.clientWidth ?? W) - 236)),
              top: Math.max(4, hover.y - 10),
            }}
            role="status"
          >
            <Isi d={hover.d} lapisan={lapisan} metode={metode} />
          </div>
        ) : null}
      </div>

      {!ringkas ? (
        <>
          <p className={styles.zoomHint}>
            Perbesar dengan tombol, klik ganda, cubit dua jari, atau Ctrl + gulir. Saat diperbesar, seret untuk menggeser.
            Klik daerah untuk menyematkan rinciannya.
          </p>
          <div className={styles.inspector} aria-live="polite">
            {tampil ? (
              <>
                <Isi d={tampil} lapisan={lapisan} metode={metode} />
                <button
                  type="button"
                  className={styles.clear}
                  onClick={() => {
                    setPilih(null);
                    setCari("");
                    onChange?.({ sorot: [] });
                  }}
                >
                  Hapus pilihan
                </button>
              </>
            ) : (
              <p className={styles.muted}>Arahkan kursor ke peta, atau cari nama daerah, untuk melihat rinciannya.</p>
            )}
          </div>
          <Caption
            judul={lapisan === "pdrb" ? chapter5Copy.petaJudul : "Klaster LISA PDRB per kapita kabupaten/kota, 2025"}
            satuan={lapisan === "pdrb" ? "juta rupiah per penduduk per tahun, atas dasar harga berlaku" : "kategori klaster (\u03b1 = 0,05)"}
            catatan={
              lapisan === "pdrb"
                ? `Klasifikasi ${metode === "kuantil" ? "kuantil, 5 kelas dengan jumlah daerah yang sama" : "natural breaks (Fisher-Jenks), 5 kelas"}. Palet sequential YlGnBu, aman untuk buta warna. PDRB per kapita adalah rasio, sehingga layak dipetakan sebagai choropleth. Batas wilayah: GeoJSON kab/kota (kode Kemendagri), dicocokkan dengan kode BPS melalui nama daerah.`
                : `LISA dihitung dari logaritma PDRB per kapita, bobot queen contiguity dengan standarisasi baris, ${chapter5Data.moran.permutasi} permutasi. ${chapter5Data.moran.jumlahPulau} daerah kepulauan tanpa tetangga darat diberi satu tetangga terdekat. Batas wilayah: GeoJSON kab/kota (kode Kemendagri).`
            }
          />
        </>
      ) : null}
    </figure>
  );
}

function Isi({ d, lapisan, metode }: { d: Daerah; lapisan: Lapisan; metode: Metode }) {
  const kelas = kelasDari(d.nilai, chapter5Data.kelas[metode]) + 1;
  return (
    <>
      <p className={styles.tipTitle}>
        {d.nama} <span>{d.provinsi}</span>
      </p>
      <dl className={styles.tipGrid}>
        <div>
          <dt>PDRB per kapita</dt>
          <dd>{juta(d.nilai)} juta Rp</dd>
        </div>
        <div>
          <dt>Peringkat</dt>
          <dd>
            {PERINGKAT.get(d.id)} dari {chapter5Data.daerah.length}
          </dd>
        </div>
        <div>
          <dt>{lapisan === "pdrb" ? `Kelas (${metode === "kuantil" ? "kuantil" : "natural breaks"})` : "Klaster LISA"}</dt>
          <dd>{lapisan === "pdrb" ? `${kelas} dari 5` : LABEL_LISA[d.lisa].singkat}</dd>
        </div>
        {lapisan === "lisa" ? (
          <div>
            <dt>p (permutasi)</dt>
            <dd>{d.p.toFixed(3).replace(".", ",")}</dd>
          </div>
        ) : null}
      </dl>
      {lapisan === "lisa" ? <p className={styles.tipNote}>{LABEL_LISA[d.lisa].arti}.</p> : null}
    </>
  );
}
