import { KETERANGAN_TUGAS } from "@/content/keteranganTugas";
import styles from "./KeteranganTugas.module.css";


function gabungNama(nama: string[]): string {
  if (nama.length <= 1) return nama[0] ?? "";
  if (nama.length === 2) return `${nama[0]} dan ${nama[1]}`;
  return `${nama.slice(0, -1).join(", ")}, dan ${nama[nama.length - 1]}`;
}
export default function KeteranganTugas() {
  const { judul, teks, labelDosen, dosen } = KETERANGAN_TUGAS;
  return (
    <aside className={styles.tugas} aria-label={judul}>
      <p className={styles.label}>{judul}</p>
      <p className={styles.teks}>{teks}</p>
      {dosen.length > 0 ? (
        <p className={styles.dosen}>
          {labelDosen}: <strong>{gabungNama(dosen)}</strong>
        </p>
      ) : null}
    </aside>
  );
}