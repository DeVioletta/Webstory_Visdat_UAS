// Semua nilai mentah dalam juta USD. Ditampilkan dalam miliar US$ dengan format Indonesia.

const fmt1 = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** 282505.28 (juta USD) -> "282,5" (miliar US$) */
export function miliar(jutaUSD: number): string {
  return fmt1.format(jutaUSD / 1000);
}

/** 6.0 -> "6,0" */
export function angka1(n: number): string {
  return fmt1.format(n);
}

/** Persentase perubahan dua nilai */
export function pertumbuhan(lama: number, baru: number): number {
  return ((baru - lama) / lama) * 100;
}

/** Tanda +/− dengan karakter minus yang benar */
export function bertanda(n: number, teks: string): string {
  if (n > 0) return `+${teks}`;
  if (n < 0) return `\u2212${teks}`;
  return teks;
}

const fmt2 = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const fmt0 = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

/** Energi dalam terajoule -> teks ringkas. 21018820 -> "21,02 juta TJ" */
export function formatTJ(tj: number): string {
  if (tj >= 1_000_000) return `${fmt2.format(tj / 1_000_000)} juta TJ`;
  if (tj >= 1_000) return `${fmt1.format(tj / 1_000)} ribu TJ`;
  return `${fmt0.format(tj)} TJ`;
}

/** 21018820 -> "21,0" (juta TJ, satu desimal) */
export function jutaTJ(tj: number): string {
  return fmt1.format(tj / 1_000_000);
}

/** Persen dengan satu desimal, tanpa tanda */
export function persen(bagian: number, total: number): string {
  return fmt1.format((bagian / total) * 100);
}

/** Persen dibulatkan ke bilangan bulat */
export function persenBulat(bagian: number, total: number): string {
  return fmt0.format((bagian / total) * 100);
}

/** Indeks Spesialisasi Perdagangan: (ekspor - impor) / (ekspor + impor), -1 sampai 1 */
export function isp(ekspor: number, impor: number): number {
  const t = ekspor + impor;
  return t > 0 ? (ekspor - impor) / t : 0;
}

/** ISP dengan dua desimal dan tanda minus yang benar */
export function formatIsp(v: number): string {
  const s = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(v));
  return v < 0 ? `\u2212${s}` : v > 0 ? `+${s}` : s;
}

/**
 * Nilai persen untuk CSS (left/width), dibulatkan 3 desimal.
 * Angka desimal panjang bisa diserialisasi berbeda oleh server dan browser
 * sehingga memicu peringatan hydration mismatch di React.
 */
export function pctCss(v: number): string {
  return `${Math.round(v * 1000) / 1000}%`;
}
