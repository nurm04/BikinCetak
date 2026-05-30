"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ItemData } from "@/services/itemService"; // Sesuaikan path ini jika berbeda

interface ConditionalLayoutProps {
  children: React.ReactNode;
  items: ItemData[];
}

export default function ConditionalLayout({ children, items }: ConditionalLayoutProps) {
  const pathname = usePathname();
  // Tambahkan path lain di sini jika ada halaman yang tidak butuh Navbar/Footer
  const disableLayout = ["/login", "/register"].includes(pathname);

  if (disableLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar items={items} />
      <main className="flex-grow">{children}</main>
      <Footer items={items} />
    </>
  );
}