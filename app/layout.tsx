import "./globals.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import { getPengaturan } from "@/services/pengaturanWebService";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const pengaturan = await getPengaturan();

  const fallbackName = "BikinCetak - Platform Digital Printing Modern & Cepat";
  const fallbackDesc = "Pesan kebutuhan cetak Anda secara online dengan mudah, cepat, dan berkualitas tinggi di BikinCetak. Melayani cetak sticker, banner, dan merchandise.";
  const fallbackKeywords = "percetakan online, digital printing, cetak stiker, cetak banner, bikin cetak, cetak kalender";
  const fallbackLogo = "https://admin.bikincetak.co.id/storage/img_web/logobikincetak.png";

  const namaWebsite = pengaturan?.nama_website || fallbackName;
  const deskripsi = pengaturan?.deskripsi_singkat || fallbackDesc;
  const keywordsStr = pengaturan?.keyword_seo || fallbackKeywords;
  const logoUtama = pengaturan?.logo_utama || fallbackLogo;

  const namaBrand = namaWebsite.split('-')[0].trim();

  const keywordsArray = keywordsStr.split(',').map((kw) => kw.trim());

  return {
    title: {
      template: `%s | ${namaBrand}`, 
      default: namaWebsite,
    },
    description: deskripsi,
    keywords: keywordsArray,
    authors: [{ name: `${namaBrand} Team` }],
    openGraph: {
      title: namaWebsite,
      description: deskripsi,
      url: "https://bikincetak.co.id", 
      siteName: namaBrand,
      images: [
        {
          url: logoUtama,
          width: 1200,
          height: 630,
          alt: `${namaBrand} Cover`,
        }
      ],
      locale: "id_ID",
      type: "website",
    }
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-theme="light">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}