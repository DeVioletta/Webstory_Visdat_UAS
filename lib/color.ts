/**
 * Skala warna diverging untuk Indeks Spesialisasi Perdagangan (ISP).
 * -1 (hanya impor) oranye tua, 0 abu-abu netral, +1 (hanya ekspor) biru tua.
 * Pasangan biru-oranye aman untuk buta warna merah-hijau dan konsisten dengan
 * konvensi webstory (ekspor biru, impor oranye).
 */
const STOP: [number, [number, number, number]][] = [
  [-1, [166, 75, 0]], // #a64b00
  [-0.5, [230, 145, 70]], // #e69146
  [0, [222, 226, 231]], // #dee2e7
  [0.5, [100, 165, 210]], // #64a5d2
  [1, [0, 92, 150]], // #005c96
];

function rgb(v: number): [number, number, number] {
  const x = Math.max(-1, Math.min(1, v));
  for (let i = 0; i < STOP.length - 1; i++) {
    const [a, ca] = STOP[i];
    const [b, cb] = STOP[i + 1];
    if (x >= a && x <= b) {
      const t = (x - a) / (b - a);
      return [0, 1, 2].map((j) => Math.round(ca[j] + (cb[j] - ca[j]) * t)) as [number, number, number];
    }
  }
  return STOP[STOP.length - 1][1];
}

export function warnaIsp(v: number): string {
  const [r, g, b] = rgb(v);
  return `rgb(${r}, ${g}, ${b})`;
}

/** Warna teks yang terbaca di atas warna ISP (putih untuk latar gelap) */
export function teksDiAtas(v: number): string {
  const [r, g, b] = rgb(v);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum < 0.55 ? "#ffffff" : "var(--ink)";
}

/** Gradien CSS untuk legenda */
export const GRADIEN_ISP = `linear-gradient(to right, ${STOP.map(
  ([v, c]) => `rgb(${c.join(",")}) ${((v + 1) / 2) * 100}%`
).join(", ")})`;

/**
 * Skala warna diverging untuk pertumbuhan (Bab 4): cokelat = turun, hijau kebiruan = naik.
 * Sengaja berbeda dari biru-oranye ISP supaya pembaca tidak mencampur dua arti warna.
 * Palet BrBG (ColorBrewer), aman untuk buta warna. Nilai di luar +/-50% memakai warna terujung.
 */
const STOP_TUMBUH: [number, [number, number, number]][] = [
  [-50, [140, 81, 10]], // #8c510a
  [-25, [216, 179, 101]], // #d8b365
  [0, [230, 227, 220]], // #e6e3dc
  [25, [90, 180, 172]], // #5ab4ac
  [50, [1, 102, 94]], // #01665e
];
export const BATAS_TUMBUH = 50;

function rgbTumbuh(persen: number): [number, number, number] {
  const x = Math.max(-BATAS_TUMBUH, Math.min(BATAS_TUMBUH, persen));
  for (let i = 0; i < STOP_TUMBUH.length - 1; i++) {
    const [a, ca] = STOP_TUMBUH[i];
    const [b, cb] = STOP_TUMBUH[i + 1];
    if (x >= a && x <= b) {
      const t = (x - a) / (b - a);
      return [0, 1, 2].map((j) => Math.round(ca[j] + (cb[j] - ca[j]) * t)) as [number, number, number];
    }
  }
  return STOP_TUMBUH[STOP_TUMBUH.length - 1][1];
}

export function warnaTumbuh(persen: number): string {
  const [r, g, b] = rgbTumbuh(persen);
  return `rgb(${r}, ${g}, ${b})`;
}

export function teksDiAtasTumbuh(persen: number): string {
  const [r, g, b] = rgbTumbuh(persen);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5 ? "#ffffff" : "#14213d";
}

export const GRADIEN_TUMBUH = `linear-gradient(to right, ${STOP_TUMBUH.map(
  ([v, c]) => `rgb(${c.join(",")}) ${((v + BATAS_TUMBUH) / (2 * BATAS_TUMBUH)) * 100}%`
).join(", ")})`;

/** Bab 5: palet sequential 5 kelas untuk PDRB per kapita (ColorBrewer YlGnBu, aman buta warna) */
export const PALET_PDRB = ["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"];

/** Bab 5: warna klaster LISA. Merah-biru dapat dibedakan pembaca buta warna merah-hijau. */
export const WARNA_LISA: Record<string, string> = {
  HH: "#b2182b",
  HL: "#ef8a62",
  LH: "#67a9cf",
  LL: "#2166ac",
  NS: "#e3e6ea",
};
