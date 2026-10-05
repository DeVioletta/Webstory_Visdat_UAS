import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kaya di Atas Kertas, Merata di Mana?",
  description:
    "Webstory tentang arus energi, struktur perdagangan, dan perbedaan ekonomi antarwilayah Indonesia. Sumber data: BPS.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
       <Analytics /> 
    </html>
  );
}
