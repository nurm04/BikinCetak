import "./globals.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BikinCetak",
  description: "Solusi Percetakan Anda",
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