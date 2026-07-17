import "./globals.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

// 🚀 UPGRADE METADATA DI SINI
export const metadata: Metadata = {
  title: {
    template: "%s | BikinCetak",
    default: "BikinCetak - Platform Digital Printing Modern & Cepat",
  },
  description: "Pesan kebutuhan cetak Anda secara online dengan mudah, cepat, dan berkualitas tinggi di BikinCetak. Melayani cetak sticker, banner, dan merchandise.",
  keywords: ["percetakan online", "digital printing", "cetak stiker", "cetak banner", "bikin cetak", "cetak kalender"],
  authors: [{ name: "BikinCetak Team" }],
  openGraph: {
    title: "BikinCetak - Platform Digital Printing Modern",
    description: "Percetakan online terlengkap untuk kebutuhan promosi bisnis Anda.",
    url: "https://bikincetak.com",
    siteName: "BikinCetak",
    images: [
      {
        url: "/PRD.png",
        width: 1200,
        height: 630,
        alt: "BikinCetak Cover",
      }
    ],
    locale: "id_ID",
    type: "website",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-theme="light">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}