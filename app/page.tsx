import SiteHeader from "@/components/ui/SiteHeader";
import Chapter0 from "@/components/chapter0/Chapter0";
import Chapter1 from "@/components/chapter1/Chapter1";
import Chapter2 from "@/components/chapter2/Chapter2";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Chapter0 />
        <Chapter1 />
        <Chapter2 />
        {/* Bab berikutnya ditambahkan di sini: <Chapter3 />, <Chapter4 />, dst. */}
      </main>
    </>
  );
}
