"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mengembalikan indeks langkah (step) scrollytelling yang sedang berada
 * di tengah layar. Tanpa library tambahan, memakai IntersectionObserver.
 */
export function useActiveStep(jumlah: number) {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [aktif, setAktif] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.step);
            if (!Number.isNaN(idx)) setAktif(idx);
          }
        }
      },
      // Garis pemicu tepat di tengah layar
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );
    refs.current.slice(0, jumlah).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [jumlah]);

  const setRef = (i: number) => (el: HTMLElement | null) => {
    refs.current[i] = el;
  };

  return { aktif, setRef };
}
