import SiteHeader from "@/components/ui/SiteHeader";
import Chapter0 from "@/components/chapter0/Chapter0";

export default function Home() {
  return (
    <>
      <SiteHeader aktif="skala" />
      <main>
        <Chapter0 />
        {/* Bab berikutnya ditambahkan di sini: <Chapter1 />, <Chapter2 />, dst. */}
      </main>
    </>
  );
}
