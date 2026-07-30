import { getItems } from "@/services/itemService";
import { getUserProfile } from "@/services/userService"; 
import { Metadata } from "next";
import { slugify } from "@/lib/utils";
import KatalogClient from "./KatalogClient";

export const metadata: Metadata = {
  title: "Katalog Produk - Bikin Cetak",
  description: "Pilih dan temukan berbagai kebutuhan promosi dan cetak Anda.",
};

interface SidebarProduct {
  id: string;
  name: string;
  slug: string;
}

interface SkuGridItem {
  id_sku: string;
  nama_sku_bersih: string;
  slug: string;
  kategori: string;
  parent_slug: string;
  harga: number;
  image: string;
  diskon_roles: Record<string, number>;
}

export default async function KatalogPage() {
  const items = await getItems();
  const { data: userProfile } = await getUserProfile();
  const activeRoleId = userProfile?.customer?.id_role_customer || null;

  const sidebarData: Record<string, SidebarProduct[]> = {};
  const skuItems: SkuGridItem[] = [];

  items.forEach((item) => {
    if (item.is_active === 0) return;
    const cat = item.kategori || "Lainnya";
    if (cat.toLowerCase() === "services" || cat.toLowerCase() === "jasa") return;

    const productSlug = slugify(item.nama_produk);

    if (!sidebarData[cat]) sidebarData[cat] = [];
    sidebarData[cat].push({
      id: item.id_produk,
      name: item.nama_produk,
      slug: productSlug,
    });

    if (item.dataSkus && item.dataSkus.length > 0) {
      item.dataSkus.forEach((sku) => {
        const cleanSkuName = sku.nama_sku.replace(/^[A-Za-z]+-\d+-/, '').replace(/-/g, ' ');; 
        
        skuItems.push({
          id_sku: sku.nama_sku,
          nama_sku_bersih: cleanSkuName, 
          slug: slugify(sku.nama_sku),   
          kategori: cat,
          parent_slug: productSlug,      
          harga: sku.harga,              
          image: item.gambar_urls?.[0] || "/favicon.ico", 
          diskon_roles: item.diskon_roles || {},
        });
      });
    }
  });

  return (
    <KatalogClient
      sidebarData={sidebarData} 
      skuItems={skuItems}
      activeRoleId={activeRoleId} 
    />
  );
}