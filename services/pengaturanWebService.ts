/* eslint-disable @typescript-eslint/no-unused-vars */
// @/services/pengaturanWebService.ts
"use server";

import redis from "@/lib/redis";

// ==========================================
// 🌟 INTERFACE & TYPES
// ==========================================

export interface BannerData {
  id: number;
  judul: string;
  gambar_url: string | null;
  link_tujuan: string | null;
}

// 👇 TYPE DEFINITION BARU UNTUK PENGATURAN UMUM 👇
export interface LokasiWeb {
  email: string;
  alamat_lengkap: string;
  link_gmaps: string;
}

export interface WhatsappCS {
  id: string | number;
  nama: string;
  nomor: string;
  pesan_default?: string;
  is_active: boolean;
}

export interface SosmedItem {
  platform: string;
  url: string;
  icon: string;
  is_active: boolean;
}

export interface MetodePembayaran {
  id: string | number;
  nama_metode: string;
  no_rekening: string;
  atas_nama: string;
  icon_url: string;
  is_active: boolean;
}

export interface PengaturanData {
  // Identitas & SEO
  nama_website?: string;
  deskripsi_singkat?: string;
  keyword_seo?: string;
  logo_utama?: string;
  
  // Kontak & Sosmed
  informasi_lokasi?: LokasiWeb;
  daftar_whatsapp?: WhatsappCS[];
  daftar_sosmed?: SosmedItem[];
  
  // Pembayaran
  teks_info_pembayaran?: string;
  metode_pembayaran?: MetodePembayaran[];
  
  // Membiarkan sisa key dinamis (Flexible Fallback) jika ke depannya ada penambahan opsi baru di panel Admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; 
}
// 👆 ========================================= 👆

export interface HalamanStatisListData {
  id: number;
  judul: string;
  slug: string;
  tipe: string;
}

export interface HalamanStatisDetailData extends HalamanStatisListData {
  konten: string;
  updated_at: string;
}

export interface ApiBannerResponse {
  success: boolean;
  data: BannerData[];
}

export interface ApiPengaturanResponse {
  success: boolean;
  data: PengaturanData;
}

export interface ApiHalamanStatisListResponse {
  success: boolean;
  data: HalamanStatisListData[];
}

export interface ApiHalamanStatisDetailResponse {
  success: boolean;
  data: HalamanStatisDetailData;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// ==========================================
// 🌟 SERVICES
// ==========================================

export async function getBanners(): Promise<BannerData[]> {
  const cacheKey = "bikincetak:web:banners";

  try {
    let cachedData = null;
    try {
      cachedData = await redis.get(cacheKey);
    } catch (redisError) {}

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const response = await fetch(`${API_BASE_URL}/api/web/banners`, {
      method: "GET",
      cache: "no-store", 
    });

    if (!response.ok) return [];

    const result: ApiBannerResponse = await response.json();
    
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

export async function getPengaturan(): Promise<PengaturanData | null> {
  const cacheKey = "bikincetak:web:pengaturan";

  try {
    let cachedData = null;
    try {
      cachedData = await redis.get(cacheKey);
    } catch (redisError) {}

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const response = await fetch(`${API_BASE_URL}/api/web/pengaturan`, {
      method: "GET",
      cache: "no-store", 
    });

    if (!response.ok) return null;

    const result: ApiPengaturanResponse = await response.json();
    
    if (result.success) {
      try {
        await redis.set(cacheKey, JSON.stringify(result.data), "EX", 3600);
      } catch (setCacheError) {}
      return result.data;
    }

    return null;
  } catch (error) {
    return null;
  }
}

export async function getHalamanStatisList(): Promise<HalamanStatisListData[]> {
  const cacheKey = "bikincetak:web:halaman_statis_list";

  try {
    let cachedData = null;
    try {
      cachedData = await redis.get(cacheKey);
    } catch (redisError) {}

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const response = await fetch(`${API_BASE_URL}/api/web/halaman-statis`, {
      method: "GET",
      cache: "no-store", 
    });

    if (!response.ok) return [];

    const result: ApiHalamanStatisListResponse = await response.json();
    
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

export async function getHalamanStatisDetail(slug: string): Promise<HalamanStatisDetailData | null> {
  const cacheKey = `bikincetak:web:halaman_statis_detail:${slug}`;

  try {
    let cachedData = null;
    try {
      cachedData = await redis.get(cacheKey);
    } catch (redisError) {}

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const url = `${API_BASE_URL}/api/web/halaman-statis/${encodeURIComponent(slug)}`;
    const response = await fetch(url, { 
      method: "GET", 
      cache: "no-store" 
    });

    if (!response.ok) return null;

    const result: ApiHalamanStatisDetailResponse = await response.json();
    
    if (result.success) {
      try {
        await redis.set(cacheKey, JSON.stringify(result.data), "EX", 3600);
      } catch (setCacheError) {}
      return result.data;
    }

    return null;
  } catch (error) {
    return null;
  }
}