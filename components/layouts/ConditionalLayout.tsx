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

export default function ConditionalLayout({ children, items }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const disableLayout = ["/login", "/register"].includes(pathname);

  if (disableLayout) {
    return <>{children}</>;
  }

  const groupedItems: Record<string, Array<{ name: string }>> = {};
  
  items.forEach((item) => {
    if (item.is_active === 0) return;
    
    const categoryName = item.kategori || "Lainnya";

    if (!groupedItems[categoryName]) {
      groupedItems[categoryName] = [];
    }
    groupedItems[categoryName].push({ name: item.nama_produk });
  });

  const dynamicCategories = Object.keys(groupedItems).map((categoryKey) => ({
    key: slugify(categoryKey),
    label: categoryKey,
    submenu: groupedItems[categoryKey],
  }));

  return (
    <>
      <Navbar items={items} />
      
      <main className="grow pb-16 md:pb-0">
        {children}
      </main>
      
      <Footer items={items} />

      <MobileBottomNav categories={dynamicCategories} />
    </>
  );
}