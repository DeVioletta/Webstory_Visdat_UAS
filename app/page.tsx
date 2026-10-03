import SiteHeader from "@/components/ui/SiteHeader";
import Chapter0 from "@/components/chapter0/Chapter0";
import Chapter1 from "@/components/chapter1/Chapter1";
import Chapter2 from "@/components/chapter2/Chapter2";
import Chapter3 from "@/components/chapter3/Chapter3";
import Chapter4 from "@/components/chapter4/Chapter4";
import Chapter5 from "@/components/chapter5/Chapter5";
import Chapter6 from "@/components/chapter6/Chapter6";
import Chapter7 from "@/components/chapter7/Chapter7";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Chapter0 />
        <Chapter1 />
        <Chapter2 />
        <Chapter3 />
        <Chapter4 />
        <Chapter5 />
        <Chapter6 />
        <Chapter7 />
      </main>
    </>
  );
}
