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
