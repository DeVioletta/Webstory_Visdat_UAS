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
