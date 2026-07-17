// @/services/itemService.ts
"use server";

export interface ItemData {
  id_produk: string;
  nama_produk: string;
  kategori: string;
  is_active: number;
  gambar_urls: string[];
  harga_mulai_dari?: number;
  diskon_roles?: Record<string, number>;
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
  tipe: "nominal" | "persen"; // REVISI: Menggantikan harga
  nilai: number;              // REVISI: Menggantikan harga
}

export interface HargaPengerjaan {
  id: number;
  id_sku: string;
  pengerjaan: string;
  tipe: "nominal" | "persen"; // REVISI: Menggantikan harga
  nilai: number;              // REVISI: Menggantikan harga
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
}

export interface SkuDetail {
  id_sku: string;
  nama_sku: string;
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

const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function getItems(): Promise<ItemData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: "GET",
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const textRes = await response.text();
      console.error(`[getItems] Error ${response.status}:`, textRes);
      return [];
    }

    const result: ApiItemsResponse = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    if (error instanceof Error) console.error("[getItems] Catch Error:", error.message);
    return [];
  }
}

export async function getItemDetail(idProduk: string): Promise<ItemDetailData | null> {
  try {
    const url = `${API_BASE_URL}/item/${encodeURIComponent(idProduk)}`;
    const response = await fetch(url, { method: "GET", cache: "no-store" });

    if (!response.ok) {
      console.error(`[getItemDetail] Error ${response.status}`);
      return null;
    }

    const result: ApiItemDetailResponse = await response.json();
    return result.success ? result.data : null;
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