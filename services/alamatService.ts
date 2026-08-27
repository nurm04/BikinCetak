"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/";

async function getAuthHeader(): Promise<Record<string, string> | null> {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");

  if (!jwtCookie) return null;

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwtCookie.value}`,
  };
}

export interface RajaOngkirStatus {
  code: number;
  description: string;
}

export interface ProvinceResult {
  province_id: string;
  province: string;
}

export interface CityResult {
  city_id: string;
  province_id: string;
  province: string;
  type: string;
  city_name: string;
  postal_code: string;
}

export interface DistrictResult {
  subdistrict_id: string;
  province_id: string;
  province: string;
  city_id: string;
  city: string;
  type: string;
  subdistrict_name: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  rajaongkir?: {
    status?: RajaOngkirStatus;
    results?: unknown;
  };
  meta?: {
    status: string;
    message?: string;
  };
}

export interface Alamat {
  id_alamat: string;
  id_customer: string;
  label?: string | null;
  nama_penerima: string;
  no_hp: string;
  provinsi_id: string;
  kota_id: string;
  kecamatan_id: string;
  provinsi: string;
  kota: string;
  kecamatan: string;
  kode_pos: string;
  alamat_lengkap: string;
  latitude?: number | null;
  longitude?: number | null;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AlamatPayload {
  label?: string;
  nama_penerima: string;
  no_hp: string;
  provinsi_id: string;
  kota_id: string;
  kecamatan_id: string;
  provinsi: string;
  kota: string;
  kecamatan: string;
  kode_pos: string;
  alamat_lengkap: string;
  latitude?: number | null;
  longitude?: number | null;
  is_default?: boolean;
}

export interface AlamatServiceResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
  error?: string;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const result = await response.json() as ApiResponse<T>;

  if (!response.ok) {
    return {
      error:
        result.message ||
        result.error ||
        "Terjadi kesalahan",
    };
  }

  return result;
}


export async function getAlamat(): Promise<ApiResponse<Alamat[]>> {
  try {
    const headers = await getAuthHeader();
    if (!headers) return { error: "Silakan login terlebih dahulu." };

    const response = await fetch(`${API_URL}/api/alamat`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return await handleResponse<Alamat[]>(response);
  } catch {
    return { error: "Terjadi kesalahan saat mengambil alamat." };
  }
}

export async function getAlamatById(id_alamat: string): Promise<ApiResponse<Alamat>> {
  try {
    const headers = await getAuthHeader();
    if (!headers) return { error: "Silakan login terlebih dahulu." };

    const response = await fetch(`${API_URL}/api/alamat/${id_alamat}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return await handleResponse<Alamat>(response);
  } catch {
    return { error: "Terjadi kesalahan saat mengambil alamat." };
  }
}

export async function createAlamat(data: AlamatPayload): Promise<ApiResponse<Alamat>> {
  try {
    const headers = await getAuthHeader();
    if (!headers) return { error: "Silakan login terlebih dahulu." };

    const response = await fetch(`${API_URL}/api/alamat`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    return await handleResponse<Alamat>(response);
  } catch {
    return { error: "Terjadi kesalahan saat menambahkan alamat." };
  }
}

export async function updateAlamat(id_alamat: string, data: AlamatPayload): Promise<ApiResponse<Alamat>> {
  try {
    const headers = await getAuthHeader();
    if (!headers) return { error: "Silakan login terlebih dahulu." };

    const response = await fetch(`${API_URL}/api/alamat/${id_alamat}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    return await handleResponse<Alamat>(response);
  } catch {
    return { error: "Terjadi kesalahan saat memperbarui alamat." };
  }
}

export async function deleteAlamat(id_alamat: string): Promise<ApiResponse<null>> {
  try {
    const headers = await getAuthHeader();
    if (!headers) return { error: "Silakan login terlebih dahulu." };

    const response = await fetch(`${API_URL}/api/alamat/${id_alamat}`, {
      method: "DELETE",
      headers,
    });

    return await handleResponse<null>(response);
  } catch {
    return { error: "Terjadi kesalahan saat menghapus alamat." };
  }
}

export async function setDefaultAlamat(id_alamat: string): Promise<AlamatServiceResponse> {
  try {
    const headers = await getAuthHeader();
    if (!headers) return { error: "Silakan login terlebih dahulu." };

    const response = await fetch(`${API_URL}/api/alamat/${id_alamat}/default`, {
      method: "PATCH",
      headers,
    });

    return await handleResponse(response);
  } catch {
    return { error: "Terjadi kesalahan saat mengubah alamat utama." };
  }
}

export async function getProvinces(): Promise<ApiResponse<ProvinceResult[]>> {
  try {
    const response = await fetch(`${API_URL}/api/shipping/provinces`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "force-cache",
    });

    return await handleResponse<ProvinceResult[]>(response);
  } catch {
    return { error: "Terjadi kesalahan saat mengambil data provinsi." };
  }
}

export async function getCities(provinceId: string | number): Promise<ApiResponse<CityResult[]>> {
  try {
    const response = await fetch(`${API_URL}/api/shipping/cities/${provinceId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "force-cache",
    });

    return await handleResponse<CityResult[]>(response);
  } catch {
    return { error: "Terjadi kesalahan saat mengambil data kota/kabupaten." };
  }
}

export async function getDistricts(cityId: string | number): Promise<ApiResponse<DistrictResult[]>> {
  try {
    const response = await fetch(`${API_URL}/api/shipping/districts/${cityId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "force-cache",
    });

    return await handleResponse<DistrictResult[]>(response);
  } catch {
    return { error: "Terjadi kesalahan saat mengambil data kecamatan." };
  }
}