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
  dataSkus?: { nama_sku: string; harga: number; satuan?: string; tipe_kalkulasi?: string }[];
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
  jenis_varian?: "utama" | "tambahan"; 
  created_at?: string;
  updated_at?: string;
  pilihan_varian: PilihanVarian[];
}

export interface HargaBertingkat {
  id?: number; 
  id_sku?: string;
  pengerjaan: string; 
  min: number;
  max: number;
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
  kali_dimensi: boolean; // 👈 TAMBAHAN DARI BACKEND
  harga_bertingkat?: HargaBertingkat[]; 
}

export interface SkuDetail {
  id_sku: string;
  nama_sku: string;
  gambar?: string[] | null; 
  satuan?: string;        
  deskripsi: string | null;
  tipe_kalkulasi: string;
  minimum_pesan: number;
  kelipatan_pesan: number;
  harga_dasar: number;
  harga_tambahan_dimensi: number; // 👈 TAMBAHAN DARI BACKEND
  kombinasi_pilihan: string[];
  harga_bertingkat: HargaBertingkat[];
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function getItems(): Promise<ItemData[]> {
  const cacheKey = "bikincetak:items_all";

  try {
    try { await redis.del(cacheKey); } catch(e) {}

    let cachedItems = null;
    try {
      cachedItems = await redis.get(cacheKey);
    } catch (redisError) {}

    if (cachedItems) {
      return JSON.parse(cachedItems);
    }

    const response = await fetch(`${API_BASE_URL}/api/items`, {
      method: "GET",
      cache: "no-store", 
    });

    if (!response.ok) return [];

    const result: ApiItemsResponse = await response.json();
    
    if (result.success) {
      try {
        await redis.set(cacheKey, JSON.stringify(result.data), "EX", 3600);
      } catch (setCacheError) {}
      return result.data;
    }

    return [];
  } catch (error) {
    return [];
  }
}

export async function getItemDetail(idProduk: string): Promise<ItemDetailData | null> {
  const cacheKey = `bikincetak:item_detail:${idProduk}`;
  
  try {
    // Hapus cache lama biar data baru (kali_dimensi dkk) langsung terbaca
    try { await redis.del(cacheKey); } catch(e) {}

    let cachedDetail = null;
    try {
      cachedDetail = await redis.get(cacheKey);
    } catch (redisError) {}

    if (cachedDetail) {
      return JSON.parse(cachedDetail);
    }

    const url = `${API_BASE_URL}/api/item/${encodeURIComponent(idProduk)}`;
    const response = await fetch(url, { method: "GET", cache: "no-store" });

    if (!response.ok) return null;

    const result: ApiItemDetailResponse = await response.json();
    
    if (result.success) {
      try {
        await redis.set(cacheKey, JSON.stringify(result.data), "EX", 3600);
      } catch (setCacheError) {}
      return result.data;
    }

    return null;
  } catch (error: unknown) {
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