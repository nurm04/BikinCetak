"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

async function getAuthHeader() {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");

  if (!jwtCookie) return null;

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwtCookie.value}`,
  };
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const result = await response.json();

  if (!response.ok) {
    return {
      error:
        result.message ||
        result.error ||
        "Terjadi kesalahan",
    };
  }

  return result as ApiResponse<T>;
}

export interface Voucher {
  id_voucher: number;
  kode_voucher: string;
  nama_promo: string;
  tipe_target: "semua_pesanan" | "produk_tertentu";
  id_sku_target?: string | null;
  persentase_diskon: number;
  maksimal_potongan_rupiah?: number | null;
  minimal_transaksi_rupiah: number;
  kuota_penggunaan?: number | null;
  berlaku_dari: string;
  berlaku_sampai: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getVouchers(): Promise<ApiResponse<Voucher[]>> {
  try {
    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
    };

    const response = await fetch(`${API_URL}/vouchers`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return await handleResponse<Voucher[]>(response);
  } catch {
    return {
      error: "Terjadi kesalahan saat mengambil daftar promo.",
    };
  }
}

export async function cekVoucher(
  kode_voucher: string
): Promise<ApiResponse<Voucher>> {
  try {
    const headers = await getAuthHeader();

    if (!headers) {
      return { error: "Silakan login terlebih dahulu untuk klaim voucher." };
    }

    const response = await fetch(`${API_URL}/vouchers/${kode_voucher}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return await handleResponse<Voucher>(response);
  } catch {
    return {
      error: "Terjadi kesalahan sistem saat memvalidasi voucher.",
    };
  }
}