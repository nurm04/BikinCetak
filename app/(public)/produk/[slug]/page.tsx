/* eslint-disable @typescript-eslint/no-unused-vars */
import { slugify } from "@/lib/utils";
import { notFound } from "next/navigation";
import { getItems, getItemDetail, ItemDetailData, SkuDetail, ItemData } from "@/services/itemService";
import ProductClientLayout from "./ProductClient";

import { getUserProfile } from "@/services/userService"; 
import { getAlamat } from "@/services/alamatService";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const findProductBySlug = (items: ItemData[], slug: string) => {
  const cleanSlug = slug.trim();
  
  for (const item of items) {
    if (item.id_produk === cleanSlug) return item;
    if (slugify(item.nama_produk.trim()) === cleanSlug) return item;
    if (item.dataSkus && item.dataSkus.length > 0) {
      const isSkuMatch = item.dataSkus.some(sku => slugify(sku.nama_sku) === cleanSlug);
      if (isSkuMatch) return item;
    }
  }
  
  return null;
};

const getAppropriateTitle = (item: ItemData, slug: string) => {
  const cleanSlug = slug.trim();
  
  if (item.dataSkus && item.dataSkus.length > 0) {
    const matchedSku = item.dataSkus.find(sku => slugify(sku.nama_sku) === cleanSlug);
    if (matchedSku) {
      return matchedSku.nama_sku.replace(/^[A-Za-z]+-\d+-/, '').replace(/-/g, ' ');
    }
  }
  return item.nama_produk;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const items = await getItems();

  const foundItemData = findProductBySlug(items, slug);

  if (!foundItemData) {
    return {
      title: "Produk Tidak Ditemukan",
      description: "Maaf, produk yang Anda cari tidak tersedia di BikinCetak.",
    };
  }

  const pageTitle = getAppropriateTitle(foundItemData, slug);

  return {
    title: pageTitle,
    description: `Beli ${pageTitle} dengan kualitas cetak premium. Pesan sekarang secara online di BikinCetak dengan harga terbaik!`,
    openGraph: {
      title: pageTitle,
      description: `Pesan ${pageTitle} dengan kualitas cetak premium. Pesan sekarang secara online di BikinCetak dengan harga terbaik!`,
      images: foundItemData.gambar_urls && foundItemData.gambar_urls.length > 0 
        ? [foundItemData.gambar_urls[0]] 
        : [],
    },
  };
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

  const foundItemData = findProductBySlug(items, slug);

  if (!foundItemData) {
    return notFound();
  }

  try {
    const itemDetail: ItemDetailData | null = await getItemDetail(foundItemData.id_produk);

    if (!itemDetail) return notFound();

    let initialSku: SkuDetail | null = null;
    
    if (itemDetail.skus && itemDetail.skus.length > 0) {
      const matchedSku = itemDetail.skus.find(sku => slugify(sku.nama_sku) === slug.trim());
      initialSku = matchedSku || itemDetail.skus[0];
    }

    const recommendations = items
      .filter((item) => item.kategori === foundItemData.kategori && item.id_produk !== foundItemData.id_produk)
      .slice(0, 4)
      .map((item) => ({
        id: item.id_produk,
        name: item.nama_produk,
        image: item.gambar_urls || [],
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