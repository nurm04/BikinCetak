"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import { ItemData } from "@/services/itemService";
import { slugify } from "@/lib/utils";
  
interface ConditionalLayoutProps {
  children: React.ReactNode;
  items: ItemData[];
}

interface CategoryGroup {
  key: string;
  label: string;
  urutan: number;
  icon: string | null;
  submenu: Array<{ name: string }>;
}

export default function ConditionalLayout({ children, items }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const disableLayout = ["/login", "/register"].includes(pathname);

  if (disableLayout) {
    return <>{children}</>;
  }

  // ==========================================
  // LOGIC GROUPING KATEGORI 
  // Menggunakan Object Kategori (urutan, icon, label)
  // ==========================================
  const groupedCategories: Record<string, CategoryGroup> = {};
  
  items.forEach((item) => {
    if (item.is_active === 0) return;
    
    const catId = item.kategori?.id_kategori || "lainnya";
    const catName = item.kategori?.nama_kategori || "Lainnya";
    const catUrutan = item.kategori?.urutan ?? 999;
    const catIcon = item.kategori?.icon || null;

    if (!groupedCategories[catId]) {
      groupedCategories[catId] = {
        key: slugify(catName),
        label: catName,
        urutan: catUrutan,
        icon: catIcon,
        submenu: []
      };
    }
    groupedCategories[catId].submenu.push({ name: item.nama_produk });
  });

  const dynamicCategories = Object.values(groupedCategories)
    .sort((a, b) => a.urutan - b.urutan);

  return (
    <>
      <Navbar items={items} />
      
      <main className="grow pb-16 md:pb-0">
        {children}
      </main>
      
      {/* 
        DITAMBAHKAN pb-20 md:pb-0 agar di layar mobile (md ke bawah) 
        footer memiliki ruang kosong bawah sehingga tidak tertutup MobileBottomNav 
      */}
      <div className="pb-20 md:pb-0">
        <Footer items={items} />
      </div>

      <MobileBottomNav categories={dynamicCategories} />
    </>
  );
}