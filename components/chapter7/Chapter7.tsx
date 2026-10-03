"use client";

import { useState } from "react";
import story from "@/components/ui/story.module.css";
import { chapter7Copy, PENULIS } from "@/content/chapter7";
import CekDaerah from "./CekDaerah";
import Metodologi from "./Metodologi";
import styles from "./chapter7.module.css";

export default function Chapter7() {
  const [tersalin, setTersalin] = useState(false);

  const salin = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2500);
    } catch {
      setTersalin(false);
    }
  };

  return (
    <section id="penutup" className={story.chapter} aria-labelledby="bab7-judul">
      <header className={story.opener}>
        <p className={story.chapterNum}>{chapter7Copy.nomor}</p>
        <h2 id="bab7-judul" className={story.headline}>
          {chapter7Copy.judul}
        </h2>
        <p className={story.lede}>{chapter7Copy.pengantar}</p>
      </header>

      {/* Diagram ringkasan: tiga sudut pandang, dari nasional ke wilayah */}
      <ol className={styles.findings} aria-label="Tiga temuan utama">
        {chapter7Copy.temuan.map((t, i) => (
          <li key={t.id} className={styles.finding}>
            <p className={styles.step}>
              <span>{i + 1}</span> {t.sudut}
            </p>
            <h3 className={styles.findingTitle}>{t.judul}</h3>
            <p className={styles.big}>{t.angka}</p>
            <p className={styles.bigNote}>{t.satuan}</p>
            <p className={styles.findingText}>{t.teks}</p>
            <p className={styles.links}>
              {t.tautan.map((l) => (
                <a key={l.href} href={l.href}>
                  {l.label}
                </a>
              ))}
            </p>
          </li>
        ))}
      </ol>
      <p className={styles.scale} aria-hidden="true">
        <span>nasional</span>
        <span className={styles.scaleLine} />
        <span>komoditas</span>
        <span className={styles.scaleLine} />
        <span>kabupaten/kota</span>
      </p>
      <p className={styles.sources}>Sumber: BPS, diolah. Angka sama dengan grafik di bab yang ditautkan.</p>

      <blockquote className={styles.quote}>{chapter7Copy.kutipan}</blockquote>

      <section className={styles.answer} aria-labelledby="bab7-jawaban">
        <h3 id="bab7-jawaban" className={story.sectionTitle}>
          {chapter7Copy.jawabanJudul}
        </h3>
        {chapter7Copy.jawaban.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p className={styles.limit}>{chapter7Copy.catatanBatas}</p>
      </section>

      <section className={story.section} aria-labelledby="bab7-cek">
        <div className={story.sectionHead}>
          <h3 id="bab7-cek" className={story.sectionTitle}>
            {chapter7Copy.cekJudul}
          </h3>
          <p className={story.sectionText}>{chapter7Copy.cekTeks}</p>
        </div>
        <CekDaerah />
      </section>

      <section className={story.section} aria-labelledby="bab7-metode">
        <div className={story.sectionHead}>
          <h3 id="bab7-metode" className={story.sectionTitle}>
            Catatan data dan metodologi
          </h3>
          <p className={story.sectionText}>
            Ringkasan sumber, rumus, dan keputusan pengolahan data yang dipakai di seluruh webstory.
          </p>
        </div>
        <Metodologi />
      </section>

      <div className={styles.actions}>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          Baca ulang dari awal
        </button>
        <button type="button" onClick={salin}>
          {tersalin ? "Tautan tersalin" : "Salin tautan webstory"}
        </button>
      </div>

      <footer className={styles.author} aria-label="Pembuat webstory">
        <p className={styles.authorLabel}>{PENULIS.judul}</p>
        <ul>
          {PENULIS.nama.map((n) => (
            <li key={n.nama}>
              <strong>{n.nama}</strong>
              {n.keterangan ? <span>{n.keterangan}</span> : null}
            </li>
          ))}
        </ul>
        <p className={styles.authorMeta}>
          {PENULIS.mataKuliah} &middot; {PENULIS.institusi} &middot; {PENULIS.tahun}
        </p>
        <p className={styles.authorMeta}>Sumber data utama: Badan Pusat Statistik (BPS).</p>
      </footer>
    </section>
  );
}
