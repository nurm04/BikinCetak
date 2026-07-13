/* eslint-disable @typescript-eslint/no-unused-vars */
import { slugify } from "@/lib/utils";
import { notFound } from "next/navigation";
import { getItems, getItemDetail, ItemDetailData, SkuDetail } from "@/services/itemService";
import ProductClientLayout from "./ProductClient";

import { getUserProfile } from "@/services/userService"; 
import { getAlamat } from "@/services/alamatService";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Produk({ params }: PageProps) {
  const { slug } = await params;
  
  const items = await getItems();
  const { data: userProfile } = await getUserProfile();
  
  const activeRoleId = userProfile?.customer?.id_role_customer || null;

  let idAlamatUtama = "";
  if (userProfile) {
      try {
          const responseAlamat = await getAlamat();
          const listAlamat = responseAlamat?.data || [];
          
          if (listAlamat.length > 0) {
              const alamatUtama = listAlamat.find((a) => a.is_default) || listAlamat[0];
              idAlamatUtama = alamatUtama.id_alamat;
          }
      } catch (error) {
          console.error("Gagal get alamat:", error);
      }
  }

  if (!items || items.length === 0) {
    return notFound();
  }

  const foundItemData = items.find(
    (item) => slugify(item.nama_produk.trim()) === slug.trim()
  ) || items.find((item) => item.id_produk === slug.trim());

  if (!foundItemData) {
    return notFound();
  }

  try {
    const itemDetail: ItemDetailData | null = await getItemDetail(foundItemData.id_produk);

    if (!itemDetail) return notFound();

    const initialSku: SkuDetail | null = itemDetail.skus && itemDetail.skus.length > 0 ? itemDetail.skus[0] : null;

    const recommendations = items
      .filter((item) => item.kategori === foundItemData.kategori && item.id_produk !== foundItemData.id_produk)
      .slice(0, 4)
      .map((item) => ({
        id: item.id_produk,
        name: item.nama_produk,
        image: item.gambar_urls || "/images/placeholder-product.jpg",
        harga_mulai_dari: item.harga_mulai_dari,
        diskon_roles: item.diskon_roles
      }));

    return (
      <ProductClientLayout 
        itemDetail={itemDetail}
        initialSku={initialSku}
        recommendations={recommendations}
        activeRoleId={activeRoleId} 
        idAlamatUtama={idAlamatUtama}
      />
    );
    
  } catch (error) {
    return notFound();
  }
}