"use client";

import { useEffect, useState } from "react";
import styles from "./ui.module.css";

/** Daftar bab. `siap: false` = bab belum dibuat, tampil redup dan tidak bisa diklik. */
export const BAB = [
  { id: "skala", nomor: 0, nama: "Skala", siap: true },
  { id: "energi", nomor: 1, nama: "Energi", siap: false },
  { id: "aliran", nomor: 2, nama: "Aliran dagang", siap: false },
  { id: "treemap", nomor: 3, nama: "Komoditas", siap: false },
  { id: "sunburst", nomor: 4, nama: "Perubahan", siap: false },
  { id: "pdrb", nomor: 5, nama: "PDRB", siap: false },
  { id: "massa", nomor: 6, nama: "Massa ekonomi", siap: false },
  { id: "spasial", nomor: 7, nama: "Pola spasial", siap: false },
  { id: "penutup", nomor: 8, nama: "Penutup", siap: false },
] as const;

export default function SiteHeader({ aktif }: { aktif: string }) {
  const [progres, setProgres] = useState(0);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgres(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <a href="#" className={styles.brand}>
          Kaya di Atas Kertas, Merata di Mana?
        </a>
        <nav aria-label="Daftar bab" className={styles.nav}>
          <ol>
            {BAB.map((b) => (
              <li key={b.id}>
                {b.siap ? (
                  <a
                    href={`#${b.id}`}
                    aria-current={b.id === aktif ? "true" : undefined}
                    className={styles.navLink}
                  >
                    <span className={styles.navNum}>{b.nomor}</span> {b.nama}
                  </a>
                ) : (
                  <span className={styles.navLinkDisabled} aria-disabled="true">
                    <span className={styles.navNum}>{b.nomor}</span> {b.nama}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
      <div
        className={styles.progress}
        style={{ transform: `scaleX(${progres})` }}
        role="presentation"
      />
    </header>
  );
}
