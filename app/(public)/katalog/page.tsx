import { getItems } from "@/services/itemService";
import { getUserProfile } from "@/services/userService"; 
import { Metadata } from "next";
import KatalogClient from "./KatalogClient";

export const metadata: Metadata = {
  title: "Katalog Produk - Bikin Cetak",
  description: "Pilih dan temukan berbagai kebutuhan promosi dan cetak Anda.",
};

export default async function KatalogPage() {
  const items = await getItems();
  const { data: userProfile } = await getUserProfile();
  const activeRoleId = userProfile?.customer?.id_role_customer || null;

  const processedItems = items
    .filter((item) => item.is_active !== 0)
    .filter((item) => {
      const cat = (item.kategori || "Lainnya").toLowerCase();
      return cat !== "services" && cat !== "jasa";
    })
    .map((item) => ({
      id: item.id_produk,
      name: item.nama_produk,
      kategori: item.kategori || "Lainnya",
      image: item.gambar_urls || [],
      harga_mulai_dari: item.harga_mulai_dari || 0,
      diskon_roles: item.diskon_roles || {},
    }));

  return (
    <KatalogClient
      initialItems={processedItems} 
      activeRoleId={activeRoleId} 
    />
  );
}