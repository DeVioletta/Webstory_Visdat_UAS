import styles from "./ui.module.css";

interface CaptionProps {
  judul: string;
  satuan: string;
  catatan?: string;
}

/**
 *
 * Memenuhi syarat tugas: judul, satuan, dan "Sumber: BPS"
 */
export default function Caption({ judul, satuan, catatan }: CaptionProps) {
  return (
    <figcaption className={styles.caption}>
      <span className={styles.captionJudul}>{judul}</span>
      <span>Satuan: {satuan}.</span>
      {catatan ? <span>{catatan}</span> : null}
      <span className={styles.captionSumber}>Sumber: BPS</span>
    </figcaption>
  );
}
