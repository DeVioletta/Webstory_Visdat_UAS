"use client";

import { useMemo, useState } from "react";
import Caption from "@/components/ui/Caption";
import PdrbMap, { kelasDari } from "@/components/chapter5/PdrbMap";
import { LABEL_LISA, type Wilayah } from "@/content/chapter5";
import { chapter7Copy, chapter7Data } from "@/content/chapter7";
import { PALET_PDRB, WARNA_LISA } from "@/lib/color";
import { angka1 } from "@/lib/format";
import styles from "./chapter7.module.css";

const { ch5, ch6 } = chapter7Data;
const PK = new Map(ch5.daerah.map((d) => [d.id, d]));
const MASSA = new Map(ch6.daerah.map((d) => [d.id, d]));
const PROV = new Map(ch6.provinsi.map((p) => [p.nama, p]));
const RANK_PK = new Map([...ch5.daerah].sort((a, b) => b.nilai - a.nilai).map((d, i) => [d.id, i + 1]));
const RANK_TOTAL = new Map(ch6.daerah.map((d, i) => [d.id, i + 1]));
const SARAN = ["Kab. Morowali", "Kota Surabaya", "Kab. Bogor", "Kab. Puncak Jaya", "Kota Yogyakarta"];
const jt = (ribu: number) => angka1(ribu / 1000);

/** Kode provinsi -> wilayah zoom peta */
function wilayahDari(prov: string): Wilayah {
  const p = Number(prov);
  if (p < 30) return "sumatera";
  if (p < 40 || p === 51) return "jawa";
  if (p < 60) return "nusatenggara";
  if (p < 70) return "kalimantan";
  if (p < 80) return "sulawesi";
  if (p < 90) return "maluku";
  return "papua";
}

// Strip sebaran: posisi daerah terpilih di antara 514 daerah, skala logaritma
const LOG_MIN = Math.log10(5000);
const LOG_MAKS = Math.log10(1_200_000);

export default function CekDaerah() {
  const [cari, setCari] = useState("Kab. Morowali");
  const terpilih = useMemo(() => ch5.daerah.find((d) => d.nama.toLowerCase() === cari.trim().toLowerCase()) ?? null, [cari]);

  const pk = terpilih ? PK.get(terpilih.id)! : null;
  const ms = terpilih ? MASSA.get(terpilih.id) : undefined;
  const prov = terpilih ? PROV.get(terpilih.provinsi) : undefined;
  const dalamProv = terpilih ? ch5.daerah.filter((d) => d.provinsi === terpilih.provinsi).sort((a, b) => b.nilai - a.nilai) : [];
  const rankProv = terpilih ? dalamProv.findIndex((d) => d.id === terpilih.id) + 1 : 0;
  const nasional = ch6.nasional.perKapitaTertimbang;
  const xStrip = (ribu: number) => ((Math.log10(ribu) - LOG_MIN) / (LOG_MAKS - LOG_MIN)) * 100;

  return (
    <figure className={styles.figure}>
      <div className={styles.searchRow}>
        <label className={styles.search}>
          <span>Kabupaten/kota</span>
          <input
            type="search"
            list="cek-kabkota"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Ketik nama, mis. Kab. Bogor"
          />
          <datalist id="cek-kabkota">
            {ch5.daerah.map((d) => (
              <option key={d.id} value={d.nama}>
                {d.provinsi}
              </option>
            ))}
          </datalist>
        </label>
        <div className={styles.suggest} role="group" aria-label="Contoh daerah">
          {SARAN.map((n) => (
            <button key={n} type="button" aria-pressed={cari === n} onClick={() => setCari(n)}>
              {n.replace(/^Kab\.\s/, "")}
            </button>
          ))}
        </div>
      </div>

      {terpilih && pk ? (
        <div className={styles.profile}>
          <div className={styles.profileMain} aria-live="polite">
            <p className={styles.profileName}>
              {terpilih.nama}
              <span> {terpilih.provinsi}</span>
            </p>

            <dl className={styles.stats}>
              <div>
                <dt>PDRB per kapita</dt>
                <dd>{jt(pk.nilai)} juta Rp</dd>
                <small>
                  peringkat {RANK_PK.get(pk.id)} dari {ch5.daerah.length};{" "}
                  {pk.nilai >= nasional ? `${angka1(pk.nilai / nasional)} kali` : `${angka1((pk.nilai / nasional) * 100)}% dari`} rata-rata nasional
                </small>
              </div>
              <div>
                <dt>PDRB total</dt>
                <dd>{ms ? `${angka1(ms.total / 1000)} triliun Rp` : "\u2013"}</dd>
                <small>
                  {ms
                    ? `peringkat ${RANK_TOTAL.get(ms.id)} dari ${ch6.daerah.length}; ${angka1((ms.total / ch6.nasional.pdrbTotal) * 100)}% PDRB nasional`
                    : ""}
                </small>
              </div>
              <div>
                <dt>Di dalam provinsinya</dt>
                <dd>
                  ke-{rankProv} dari {dalamProv.length}
                </dd>
                <small>{prov ? `rata-rata provinsi ${jt(prov.nilai)} juta Rp` : ""}</small>
              </div>
              <div>
                <dt>Klaster LISA</dt>
                <dd>
                  <span className={styles.dot} style={{ background: WARNA_LISA[pk.lisa] }} />
                  {LABEL_LISA[pk.lisa].singkat}
                </dd>
                <small>{LABEL_LISA[pk.lisa].arti.replace(/^Tidak/, "tidak")}</small>
              </div>
            </dl>

            <div className={styles.strip} aria-hidden="true">
              <p className={styles.stripLabel}>Posisinya di antara 514 kabupaten/kota (PDRB per kapita, skala logaritma)</p>
              <div className={styles.stripTrack}>
                {ch5.daerah.map((d) => (
                  <span
                    key={d.id}
                    className={styles.stripTick}
                    style={{ left: `${xStrip(d.nilai)}%`, background: PALET_PDRB[kelasDari(d.nilai, ch5.kelas.kuantil)] }}
                  />
                ))}
                <span className={styles.stripNational} style={{ left: `${xStrip(nasional)}%` }}>
                  <em>nasional</em>
                </span>
                <span
                  className={styles.stripMark}
                  style={{ left: `${xStrip(pk.nilai)}%` }}
                  data-ujung={xStrip(pk.nilai) > 85 ? "kanan" : xStrip(pk.nilai) < 15 ? "kiri" : undefined}
                >
                  <em>{terpilih.nama.replace(/^Kab\.\s/, "")}</em>
                </span>
              </div>
              <div className={styles.stripAxis}>
                {[10, 50, 100, 500, 1000].map((t) => (
                  <span key={t} style={{ left: `${xStrip(t * 1000)}%` }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <PdrbMap
            ringkas
            judul="Lokasi pada peta PDRB per kapita"
            state={{ lapisan: "pdrb", metode: "kuantil", wilayah: wilayahDari(terpilih.prov), sorot: [terpilih.id] }}
          />
        </div>
      ) : (
        <p className={styles.empty}>Daerah tidak ditemukan. Pilih dari daftar yang muncul saat mengetik.</p>
      )}

      <Caption
        judul={`${chapter7Copy.cekJudul}: profil kabupaten/kota, 2025`}
        satuan="juta rupiah per penduduk (PDRB per kapita); triliun rupiah (PDRB total); atas dasar harga berlaku"
        catatan="Rata-rata nasional adalah PDRB seluruh kabupaten/kota dibagi jumlah penduduk turunan (Bab 6). Klaster LISA dan kelas warna sama dengan Bab 5."
      />
    </figure>
  );
}
