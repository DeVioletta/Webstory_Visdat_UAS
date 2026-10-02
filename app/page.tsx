import SiteHeader from "@/components/ui/SiteHeader";
import Chapter0 from "@/components/chapter0/Chapter0";
import Chapter1 from "@/components/chapter1/Chapter1";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Chapter0 />
        <Chapter1 />
        {/* Bab berikutnya ditambahkan di sini: <Chapter2 />, <Chapter3 />, dst. */}
      </main>
    </>
  );
}
