/**
 * Proyeksi dan logika zoom peta Indonesia untuk Bab 6 dan 7.
 * (Bab 5 memakai salinan logika yang sama di PdrbMap.tsx dan sengaja tidak diubah.)
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { WILAYAH, type Wilayah } from "@/content/chapter5";

export const PETA_W = 1000;
export const PETA_H = 440;
export const K_MAKS = 14;

export const proyeksiIndonesia = geoMercator().fitExtent(
  [
    [8, 8],
    [PETA_W - 8, PETA_H - 8],
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
export const jalurIndonesia = geoPath(proyeksiIndonesia);

export interface Zoom {
  k: number;
  tx: number;
  ty: number;
}
export const ZOOM_AWAL: Zoom = { k: 1, tx: 0, ty: 0 };

export function zoomWilayah(id: Wilayah): Zoom {
  const w = WILAYAH.find((x) => x.id === id);
  if (!w || id === "indonesia") return ZOOM_AWAL;
  const [x0, y0] = proyeksiIndonesia([w.bbox[0], w.bbox[3]]) ?? [0, 0];
  const [x1, y1] = proyeksiIndonesia([w.bbox[2], w.bbox[1]]) ?? [PETA_W, PETA_H];
  const k = Math.min(K_MAKS, 0.94 * Math.min(PETA_W / (x1 - x0), PETA_H / (y1 - y0)));
  return { k, tx: PETA_W / 2 - k * ((x0 + x1) / 2), ty: PETA_H / 2 - k * ((y0 + y1) / 2) };
}

/**
 * Zoom & geser: tombol, Ctrl + gulir / cubit trackpad, klik ganda, seret saat diperbesar,
 * dan cubit dua jari di layar sentuh. Gulir biasa tetap untuk menggulir halaman.
 */
export function usePetaZoom(wilayah: Wilayah) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<Zoom>(ZOOM_AWAL);
  const [seret, setSeret] = useState(false);
  const pointer = useRef(new Map<number, { x: number; y: number }>());
  const awal = useRef<{ x: number; y: number; z: Zoom; jarak?: number } | null>(null);

  useEffect(() => setZoom(zoomWilayah(wilayah)), [wilayah]);

  const skala = () => PETA_W / (wrapRef.current?.clientWidth || PETA_W);
  const sekitarPusat = (z: Zoom, k: number): Zoom => {
    if (k <= 1) return ZOOM_AWAL;
    const cx = (PETA_W / 2 - z.tx) / z.k;
    const cy = (PETA_H / 2 - z.ty) / z.k;
    return { k, tx: PETA_W / 2 - k * cx, ty: PETA_H / 2 - k * cy };
  };
  const perbesar = (f: number) => setZoom((z) => sekitarPusat(z, Math.max(1, Math.min(K_MAKS, z.k * f))));

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

  /** Posisi pointer relatif terhadap kotak peta: piksel layar (px, py) dan satuan viewBox (x, y) */
  const posisi = (clientX: number, clientY: number) => {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box) return { x: 0, y: 0, px: 0, py: 0 };
    return { x: (clientX - box.left) * skala(), y: (clientY - box.top) * skala(), px: clientX - box.left, py: clientY - box.top };
  };

  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      pointer.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const pts = [...pointer.current.values()];
      awal.current = {
        x: e.clientX,
        y: e.clientY,
        z: zoom,
        jarak: pts.length === 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : undefined,
      };
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!pointer.current.has(e.pointerId)) return;
      pointer.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const a = awal.current;
      if (!a) return;
      const pts = [...pointer.current.values()];
      if (pts.length === 2 && a.jarak) {
        const j = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        setSeret(true);
        setZoom(sekitarPusat(a.z, Math.max(1, Math.min(K_MAKS, a.z.k * (j / a.jarak)))));
        return;
      }
      if (zoom.k <= 1) return;
      const dx = (e.clientX - a.x) * skala();
      const dy = (e.clientY - a.y) * skala();
      if (Math.abs(dx) + Math.abs(dy) > 3) {
        setSeret(true);
        setZoom({ ...a.z, tx: a.z.tx + dx, ty: a.z.ty + dy });
      }
    },
    onPointerUp: (e: React.PointerEvent) => {
      pointer.current.delete(e.pointerId);
      awal.current = null;
      setTimeout(() => setSeret(false), 0);
    },
    onPointerCancel: (e: React.PointerEvent) => {
      pointer.current.delete(e.pointerId);
      awal.current = null;
      setSeret(false);
    },
    onDoubleClick: (e: React.MouseEvent) => {
      const p = posisi(e.clientX, e.clientY);
      setZoom((z) => {
        const k = Math.min(K_MAKS, z.k * 2);
        const cx = (p.x - z.tx) / z.k;
        const cy = (p.y - z.ty) / z.k;
        return { k, tx: PETA_W / 2 - k * cx, ty: PETA_H / 2 - k * cy };
      });
    },
  };

  const gayaGrup: React.CSSProperties = {
    transform: `translate(${zoom.tx}px, ${zoom.ty}px) scale(${zoom.k})`,
    transformOrigin: "0 0",
    transition: seret ? "none" : "transform 650ms cubic-bezier(0.22, 1, 0.36, 1)",
  };

  /** Titik peta dasar -> posisi layar (untuk simbol & label yang tidak ikut membesar) */
  const keLayar = (x: number, y: number) => ({ x: zoom.tx + zoom.k * x, y: zoom.ty + zoom.k * y });

  return { wrapRef, zoom, setZoom, seret, perbesar, handlers, gayaGrup, keLayar, posisi };
}
