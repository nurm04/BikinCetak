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

interface CategoryGroup {
  categoryName: string;
  urutan: number;
  products: SidebarProduct[];
}

export default async function KatalogPage() {
  const items = await getItems();
  const { data: userProfile } = await getUserProfile();
  const activeRoleId = userProfile?.customer?.id_role_customer || null;

  const rawSidebarData: Record<string, CategoryGroup> = {};
  const skuItems: SkuGridItem[] = [];

  items.forEach((item) => {
    if (item.is_active === 0) return;
    
    // 👇 Tarik nama kategori dari Object 👇
    const catName = item.kategori?.nama_kategori || "Lainnya";
    const catUrutan = item.kategori?.urutan ?? 999;
    
    if (catName.toLowerCase() === "services" || catName.toLowerCase() === "jasa") return;

    const productSlug = slugify(item.nama_produk);

    if (!rawSidebarData[catName]) {
      rawSidebarData[catName] = { categoryName: catName, urutan: catUrutan, products: [] };
    }
    
    rawSidebarData[catName].products.push({
      id: item.id_produk,
      name: item.nama_produk,
      slug: productSlug,
    });

    if (item.dataSkus && item.dataSkus.length > 0) {
      item.dataSkus.forEach((sku) => {
        const cleanSkuName = sku.nama_sku.replace(/^[A-Za-z]+-\d+-/, '').replace(/-/g, ' '); 
        
        skuItems.push({
          id_sku: sku.nama_sku,
          nama_sku_bersih: cleanSkuName, 
          slug: slugify(sku.nama_sku),   
          kategori: catName,
          parent_slug: productSlug,      
          harga: sku.harga,              
          image: item.gambar_urls?.[0] || "/favicon.ico", 
          diskon_roles: item.diskon_roles || {},
        });
      });
    }
  });

  // Konversi SidebarData jadi Array yang sudah terurut sesuai CMS Admin
  const sidebarDataArray = Object.values(rawSidebarData).sort((a, b) => a.urutan - b.urutan);

  return (
    <KatalogClient
      sidebarData={sidebarDataArray} 
      skuItems={skuItems}
      activeRoleId={activeRoleId} 
    />
  );
}