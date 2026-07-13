/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";
import { cookies } from "next/headers";

const API_URL = "http://127.0.0.1:8000/api";

async function getAuthHeader(isFormData = false) {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");

  if (!jwtCookie) return null;

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${jwtCookie.value}`,
    Cookie: `jwt=${jwtCookie.value}`,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

export interface FinishingItemAPI {
  id?: number;
  nama_finishing: string;
  harga_tambahan: number;
}

export interface CartItemAPI {
  id: number;
  id_pesan: string;
  nama_sku: string;
  harga_satuan: number;
  jumlah: number;
  gambar_url?: string | null;
  catatan?: string | null;
  finishing?: FinishingItemAPI[];

  harga_dasar_awal_snapshot?: number;
  total_diskon_snapshot?: number;
  rincian_diskon_snapshot?: RincianDiskonAPI[];
  estimasi_pengerjaan?: string;
  harga_pengerjaan_snapshot?: number;
}

export interface AddCartFinishing {
  id_sku_finishing: number;
  kategori_finishing?: string;
  nama_finishing_snapshot: string;
  harga_finishing_snapshot: number;
}

export interface RincianDiskonAPI {
  nama: string;
  nominal: number;
}

export interface AddCartItem {
  id_sku: string;
  jumlah: number;
  nama_produk_snapshot: string;
  harga_satuan_snapshot: number;

  harga_dasar_awal_snapshot?: number;
  total_diskon_snapshot?: number;
  rincian_diskon_snapshot?: RincianDiskonAPI[];

  estimasi_pengerjaan?: string;
  harga_pengerjaan_snapshot?: number;
  catatan?: string;
  file_desain?: File[]; 
  finishings?: AddCartFinishing[];
}

export interface CartServiceResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface CheckoutPayload {
  items: number[];
  id_alamat: string;
  ekspedisi_nama: string;
  ekspedisi_layanan: string;
  harga_ongkir: number;
  ekspedisi_estimasi: string;
  kode_voucher?: string;
  diskon_voucher_nominal?: number;
}

export async function getCartItems(): Promise<CartServiceResponse<unknown>> {
  try {
    const headers = await getAuthHeader();

    if (!headers) {
      return { error: "Silakan login terlebih dahulu." };
    }

    const response = await fetch(`${API_URL}/cart`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        error: result.message || "Gagal mengambil keranjang.",
      };
    }

    return result;
  } catch (error) {
    return {
      error: "Terjadi kesalahan saat mengambil keranjang.",
    };
  }
}

export async function addCart(id_alamat: string, items: AddCartItem[]): Promise<CartServiceResponse<{ id_pesan: string }>> {
  try {
    const headers = await getAuthHeader(true);

    if (!headers) {
      return {
        error: "Silakan login terlebih dahulu.",
      };
    }

    const formData = new FormData();
    formData.append("id_alamat", id_alamat);

    items.forEach((item, index) => {
      formData.append(`items[${index}][id_sku]`, item.id_sku);
      formData.append(`items[${index}][jumlah]`, String(item.jumlah));
      formData.append(`items[${index}][nama_produk_snapshot]`, item.nama_produk_snapshot);
      formData.append(`items[${index}][harga_satuan_snapshot]`, String(item.harga_satuan_snapshot));

      if (item.harga_dasar_awal_snapshot !== undefined) {
        formData.append(`items[${index}][harga_dasar_awal_snapshot]`, String(item.harga_dasar_awal_snapshot));
      }
      
      if (item.total_diskon_snapshot !== undefined) {
        formData.append(`items[${index}][total_diskon_snapshot]`, String(item.total_diskon_snapshot));
      }

      if (item.rincian_diskon_snapshot && item.rincian_diskon_snapshot.length > 0) {
        item.rincian_diskon_snapshot.forEach((rincian, rIdx) => {
          formData.append(`items[${index}][rincian_diskon_snapshot][${rIdx}][nama]`, rincian.nama);
          formData.append(`items[${index}][rincian_diskon_snapshot][${rIdx}][nominal]`, String(rincian.nominal));
        });
      }

      formData.append(`items[${index}][estimasi_pengerjaan]`, item.estimasi_pengerjaan || "Reguler");
      formData.append(`items[${index}][harga_pengerjaan_snapshot]`, String(item.harga_pengerjaan_snapshot || 0));

      if (item.catatan) {
        formData.append(`items[${index}][catatan]`, item.catatan);
      }

      if (item.file_desain && item.file_desain.length > 0) {
        item.file_desain.forEach((file, fIdx) => {
           formData.append(`items[${index}][file_desain][${fIdx}]`, file);
        });
      }

      if (item.finishings && item.finishings.length > 0) {
        formData.append(`items[${index}][finishings]`, JSON.stringify(item.finishings));
      }
    });

    const response = await fetch(`${API_URL}/cart`, {
      method: "POST",
      headers,
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        error: result.error || result.message || JSON.stringify(result),
      };
    }

    return result;

  } catch (error) {
    console.error("ADD CART SERVICE ERROR:", error);
    return {
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function updateCartItemQty(id: number, jumlah: number): Promise<CartServiceResponse<unknown>> {
  try {
    const headers = await getAuthHeader();

    if (!headers) {
      return { error: "Silakan login terlebih dahulu." };
    }

    const response = await fetch(`${API_URL}/cart/item/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ jumlah }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        error: result.message || "Gagal memperbarui jumlah.",
      };
    }

    return result;
  } catch (error) {
    return {
      error: "Terjadi kesalahan saat memperbarui jumlah.",
    };
  }
}

export async function deleteCartItem(id: number): Promise<CartServiceResponse<null>> {
  try {
    const headers = await getAuthHeader();

    if (!headers) {
      return { error: "Silakan login terlebih dahulu." };
    }

    const response = await fetch(`${API_URL}/cart/item/${id}`, {
      method: "DELETE",
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        error: result.message || "Gagal menghapus item.",
      };
    }

    return result;
  } catch (error) {
    return {
      error: "Terjadi kesalahan saat menghapus item.",
    };
  }
}

export async function checkoutCart(payload: CheckoutPayload): Promise<CartServiceResponse<{ id_pesan: string }>> {
  try {
    const headers = await getAuthHeader();

    if (!headers) {
      return { error: "Silakan login terlebih dahulu." };
    }

    const response = await fetch(`${API_URL}/cart/checkout`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        error: result.message || result.error || "Gagal melakukan checkout.",
      };
    }

    return result;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Terjadi kesalahan saat checkout.",
    };
  }
}

export async function getShippingCost(id_alamat: string): Promise<CartServiceResponse<unknown>> {
  try {
    const headers = await getAuthHeader();

    if (!headers) {
      return { error: "Silakan login terlebih dahulu." };
    }

    const response = await fetch(`${API_URL}/shipping/cost`, {
      method: "POST",
      headers,
      body: JSON.stringify({ id_alamat }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.message || "Gagal menghitung ongkos kirim." };
    }

    return { success: true, data: result }; 
  } catch (error) {
    return { error: "Terjadi kesalahan sistem saat mengambil ongkos kirim." };
  }
}