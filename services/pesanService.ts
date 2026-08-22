/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

async function getAuthHeader() {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");

  if (!jwtCookie) return null;

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${jwtCookie.value}`,
    Cookie: `jwt=${jwtCookie.value}`,
  };
}

// Tipe data strict untuk kolom json atribut_custom_snapshot
export type CustomAttributeValue = string | number | boolean;

export interface RincianDiskon {
  nama: string;
  nominal: number;
}

// 👇 TAMBAHAN: Interface untuk object File Desain
export interface FileDesainAPI {
  tipe: string;
  nilai: string;
}

export interface PesananItemFinishing {
  id: number;
  id_pesanan_item: number;
  id_sku_finishing: string;

  nama_finishing_snapshot: string;
  harga_finishing_snapshot: number;

  created_at?: string;
  updated_at?: string;
}

export interface PesananItem {
  id: number;

  id_pesan: string;
  id_sku: string;

  nama_produk_snapshot: string;

  jumlah: number;

  harga_satuan_snapshot: number;
  harga_pengerjaan_snapshot: number;
  
  harga_dasar_awal_snapshot?: number;
  total_diskon_snapshot?: number;
  
  // 👇 PERBAIKAN: Beri opsi string untuk jaga-jaga data lama
  rincian_diskon_snapshot?: RincianDiskon[] | string | null;

  estimasi_pengerjaan_snapshot?: string;

  // 👇 PERBAIKAN: Sesuaikan dengan object dari database
  file_desain?: FileDesainAPI | string | null;
  catatan?: string | null;
  
  // 👇 PERBAIKAN: Kasih opsi string
  atribut_custom_snapshot?: Record<string, CustomAttributeValue> | string | null; 

  created_at?: string;
  updated_at?: string;

  pesanan_item_finishing?: PesananItemFinishing[];
}

export interface AlamatPesanan {
  id_alamat: string;

  nama_penerima: string;
  no_hp: string;

  provinsi: string;
  kota: string;
  kecamatan: string;

  kode_pos: string;

  alamat_lengkap: string;
}

export interface Pesanan {
  id_pesan: string;
  kode_transaksi: string;

  id_customer: string;
  id_alamat: string;

  sumber_pesanan?: string;

  tanggal_pesan: string;
  tanggal_selesai?: string | null;

  status_operasional:
    | "keranjang"
    | "menunggu_diproses"
    | "proses_pengerjaan"
    | "proses_pengantaran"
    | "selesai"
    | "batal";

  status_pembayaran:
    | "belum_lunas"
    | "dibayar_sebagian"
    | "lunas";

  ekspedisi_nama?: string | null;
  ekspedisi_layanan?: string | null;
  harga_ongkir?: number;
  ekspedisi_estimasi?: string | null;
  nomor_resi?: string | null;
  kode_unik?: number;

  kode_voucher?: string | null;
  diskon_voucher_nominal?: number;

  total_tagihan?: number;
  total_dibayar?: number;
  sisa_tagihan?: number;

  alamat?: AlamatPesanan;

  pesanan_item?: PesananItem[];

  created_at?: string;
  updated_at?: string;
}

export interface PesanServiceResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export async function getPesanan(): Promise<PesanServiceResponse<Pesanan[]>> {
  try {
    const headers = await getAuthHeader();

    if (!headers) {
      return {
        error: "Silakan login terlebih dahulu.",
      };
    }

    const response = await fetch(
      `${API_URL}/pesanan`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        error:
          result.message ||
          "Gagal mengambil data pesanan.",
      };
    }

    return result;

  } catch (error) {
    return {
      error:
        "Terjadi kesalahan saat mengambil data pesanan.",
    };
  }
}

export async function getPesananByKodeTransaksi(
  kode_transaksi: string
): Promise<PesanServiceResponse<Pesanan>> {
  try {
    const headers = await getAuthHeader();

    if (!headers) {
      return {
        error: "Silakan login terlebih dahulu.",
      };
    }

    const response = await fetch(
      `${API_URL}/pesanan/${kode_transaksi}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        error:
          result.message ||
          "Gagal mengambil detail pesanan.",
      };
    }

    return result;

  } catch (error) {
    return {
      error:
        "Terjadi kesalahan saat mengambil detail pesanan.",
    };
  }
}

export async function getStatusPesanan(
    kode_transaksi: string
): Promise<PesanServiceResponse<Pesanan>> {
    try {
        const response = await fetch(
            `${API_URL}/pesanan/status/${kode_transaksi}`,
            {
                cache: "no-store",
            }
        );

        const result = await response.json();

        if (!response.ok) {
            return {
                error: result.message,
            };
        }

        return result;
    } catch {
        return {
            error: "Terjadi kesalahan.",
        };
    }
}

export async function cancelPesanan(
  id_pesan: string
): Promise<PesanServiceResponse<Pesanan>> {
  try {
    const headers = await getAuthHeader();

    if (!headers) {
      return {
        error: "Silakan login terlebih dahulu.",
      };
    }

    const response = await fetch(
      `${API_URL}/pesanan/${id_pesan}/cancel`,
      {
        method: "PATCH",
        headers,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        error:
          result.message ||
          "Gagal membatalkan pesanan.",
      };
    }

    return result;

  } catch (error) {
    return {
      error:
        "Terjadi kesalahan saat membatalkan pesanan.",
    };
  }
}

export async function completePesanan(
  id_pesan: string
): Promise<PesanServiceResponse<Pesanan>> {
  try {
    const headers = await getAuthHeader();

    if (!headers) {
      return {
        error: "Silakan login terlebih dahulu.",
      };
    }

    const response = await fetch(
      `${API_URL}/pesanan/${id_pesan}/selesai`,
      {
        method: "PUT",
        headers,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        error:
          result.message ||
          "Gagal menyelesaikan pesanan.",
      };
    }

    return result;

  } catch (error) {
    return {
      error:
        "Terjadi kesalahan saat menyelesaikan pesanan.",
    };
  }
}

export interface QrisData {
  order_id: string;
  amount: number;
  qr_string?: string;
  qr_url?: string;
}

export async function getQrisData(id_pesan: string, nominal?: number): Promise<PesanServiceResponse<QrisData>> {
  try {
    const endpointUrl = nominal 
      ? `${API_URL}/pembayaran/qris/${id_pesan}?nominal=${nominal}`
      : `${API_URL}/pembayaran/qris/${id_pesan}`;

    const response = await fetch(endpointUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      cache: "no-store", 
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        error: result.message || "Gagal mengambil data QRIS.",
      };
    }

    return result;
  } catch (error) {
    return {
      error: "Terjadi kesalahan server saat mengambil QRIS.",
    };
  }
}