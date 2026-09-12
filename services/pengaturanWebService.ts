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

// Gunakan Record untuk dynamic key-value pengaturan umum
export type PengaturanData = Record<string, string | number | boolean | object | null>;

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

/**
 * Mengambil daftar Banner Slider yang aktif
 */
export async function getBanners(): Promise<BannerData[]> {
  const cacheKey = "bikincetak:web:banners";

  try {
    // Coba ambil dari Redis dulu
    let cachedData = null;
    try {
      cachedData = await redis.get(cacheKey);
    } catch (redisError) {}

    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // Kalau kosong, fetch dari API Laravel
    const response = await fetch(`${API_BASE_URL}/api/web/banners`, {
      method: "GET",
      cache: "no-store", 
    });

    if (!response.ok) return [];

    const result: ApiBannerResponse = await response.json();
    
    if (result.success) {
      try {
        // Simpan ke Redis selama 1 Jam (3600 detik)
        await redis.set(cacheKey, JSON.stringify(result.data), "EX", 3600);
      } catch (setCacheError) {}
      return result.data;
    }

    return [];
  } catch (error) {
    return [];
  }
}

/**
 * Mengambil data Pengaturan Umum (General Settings)
 */
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

/**
 * Mengambil daftar Halaman Statis (Hanya Info Dasar)
 */
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

/**
 * Mengambil detail Halaman Statis berdasarkan Slug (Termasuk Konten HTML)
 */
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