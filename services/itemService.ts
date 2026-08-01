/* eslint-disable @typescript-eslint/no-unused-vars */
// @/services/itemService.ts
"use server";

import redis from "@/lib/redis";

export interface ItemData {
  id_produk: string;
  nama_produk: string;
  kategori: string;
  is_active: number;
  gambar_urls: string[];
  harga_mulai_dari?: number;
  diskon_roles?: Record<string, number>;
  dataSkus?: { nama_sku: string; harga: number; tipe_kalkulasi?: string }[];
}

export interface PilihanVarian {
  id_pilihan: string;
  id_varian: string;
  nama_pilihan: string;
  created_at?: string;
  updated_at?: string;
}

export interface Varian {
  id_varian: string;
  nama_varian: string;
  created_at?: string;
  updated_at?: string;
  pilihan_varian: PilihanVarian[];
}

export interface HargaBertingkat {
  id: number;
  id_sku: string;
  min: number;
  max: number;
  tipe: "nominal" | "persen";
  nilai: number; 
}

export interface HargaPengerjaan {
  id: number;
  id_sku: string;
  pengerjaan: string;
  tipe: "nominal" | "persen";
  nilai: number; 
}

export interface DiskonCustomer {
  id: number;
  id_sku: string;
  id_role_customer: string;
  tipe: "nominal" | "persen";
  nilai: number;
}

export interface OpsiFinishing {
  id_sku_finishing: number;
  id_pilihan_finishing: string;
  kategori_finishing: string;
  nama_pilihan: string;
  minimum_pesan: number;
  harga_tambahan: number;
  tipe: "nominal" | "persen";
  kali_jumlah_pesan: boolean;
}

export interface SkuDetail {
  id_sku: string;
  nama_sku: string;
  deskripsi: string | null;
  tipe_kalkulasi: string;
  minimum_pesan: number;
  harga_dasar: number;
  kombinasi_pilihan: string[];
  harga_bertingkat: HargaBertingkat[];
  harga_pengerjaan: HargaPengerjaan[];
  diskon_customer: DiskonCustomer[];
  opsi_finishing: OpsiFinishing[];
}

export interface ItemDetailData extends ItemData {
  varians: Varian[];
  skus: SkuDetail[];
}

export interface ApiItemsResponse {
  success: boolean;
  data: ItemData[];
}

export interface ApiItemDetailResponse {
  success: boolean;
  data: ItemDetailData;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function getItems(): Promise<ItemData[]> {
  const cacheKey = "bikincetak:items_all";

  try {
    let cachedItems = null;
    try {
      cachedItems = await redis.get(cacheKey);
    } catch (redisError) {
      console.error("[getItems] Redis bermasalah, lanjut tembak API:", redisError instanceof Error ? redisError.message : String(redisError));
    }

    if (cachedItems) {
      console.log("[getItems] HIT - Mengambil dari Redis");
      return JSON.parse(cachedItems);
    }

    console.log("[getItems] MISS - Menembak API Laravel");
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: "GET",
      cache: "no-store", 
    });

    if (!response.ok) {
      const textRes = await response.text();
      console.error(`[getItems] Error ${response.status}:`, textRes);
      return [];
    }

    const result: ApiItemsResponse = await response.json();
    
    if (result.success) {
      try {
        await redis.set(cacheKey, JSON.stringify(result.data), "EX", 3600);
      } catch (setCacheError) {
        console.error("[getItems] Gagal set cache Redis, tapi data tetap dikirim ke user");
      }
      return result.data;
    }

    return [];
  } catch (error) {
    if (error instanceof Error) console.error("[getItems] Catch Error:", error.message);
    return [];
  }
}

export async function getItemDetail(idProduk: string): Promise<ItemDetailData | null> {
  const cacheKey = `bikincetak:item_detail:${idProduk}`;
  
  try {
    let cachedDetail = null;
    try {
      cachedDetail = await redis.get(cacheKey);
    } catch (redisError) {
      console.error(`[getItemDetail] Redis bermasalah, lanjut tembak API:`, redisError instanceof Error ? redisError.message : String(redisError));
    }

    if (cachedDetail) {
      console.log(`[getItemDetail] HIT - Mengambil dari Redis untuk ID: ${idProduk}`);
      return JSON.parse(cachedDetail);
    }

    console.log(`[getItemDetail] MISS - Menembak API Laravel untuk ID: ${idProduk}`);
    const url = `${API_BASE_URL}/item/${encodeURIComponent(idProduk)}`;
    const response = await fetch(url, { method: "GET", cache: "no-store" });

    if (!response.ok) {
      console.error(`[getItemDetail] Error ${response.status}`);
      return null;
    }

    const result: ApiItemDetailResponse = await response.json();
    
    if (result.success) {
      try {
        await redis.set(cacheKey, JSON.stringify(result.data), "EX", 3600);
      } catch (setCacheError) {
        console.error("[getItemDetail] Gagal set cache Redis, tapi data tetap dikirim ke user");
      }
      return result.data;
    }

    return null;
  } catch (error: unknown) {
    if (error instanceof Error) console.error("[getItemDetail] Catch Error:", error.message);
    return null;
  }
}

export async function findSkuByCombination(itemDetail: ItemDetailData, selectedPilihanIds: string[]): Promise<SkuDetail | null> {
   if (!itemDetail || !itemDetail.skus) return null;
   
   return itemDetail.skus.find(sku => {
     const hasAllSelections = selectedPilihanIds.every(id => sku.kombinasi_pilihan.includes(id));
     const sameLength = sku.kombinasi_pilihan.length === selectedPilihanIds.length;
     return hasAllSelections && sameLength;
   }) || null;
}