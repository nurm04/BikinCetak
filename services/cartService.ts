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

export type CustomAttributeValue = string | number | boolean;

export interface FinishingItemAPI {
  id?: number;
  id_sku_finishing?: number;
  nama_finishing_snapshot: string;
  harga_finishing_snapshot: number;
  hpp_finishing_snapshot?: number;
  kali_jumlah_pesan?: number | boolean;
}

export interface FileDesainAPI {
  tipe: string;
  nilai: string;
}

export interface CartItemAPI {
  id: number;
  id_pesan: string;
  id_sku?: string;
  nama_produk_snapshot: string; 
  harga_satuan_snapshot: number; 
  jumlah: number;
  gambar_url?: string | null;
  catatan?: string | null;
  

  pesanan_item_finishing?: FinishingItemAPI[];

  harga_dasar_awal_snapshot?: number;
  total_diskon_snapshot?: number;
  rincian_diskon_snapshot?: RincianDiskonAPI[] | string;
  
  estimasi_pengerjaan_snapshot?: string;
  harga_pengerjaan_snapshot?: number;

  file_desain?: FileDesainAPI | string | null;
  
  atribut_custom_snapshot?: Record<string, CustomAttributeValue> | string | null;
  subtotal?: number;
}

export interface AddCartFinishing {
  id_sku_finishing: number;
  kategori_finishing?: string;
  nama_finishing_snapshot: string;
  harga_finishing_snapshot: number;
  tipe?: string;
  kali_jumlah_pesan: number | boolean;
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
  finishings?: AddCartFinishing[];
  file_desain?: File | null; 
  tipe_file?: "upload" | "link" | "email";
  link_file?: string;

  atribut_custom_snapshot?: Record<string, CustomAttributeValue>;
}

export interface CartServiceResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface CartDataAPI {
  id_pesan: string;
  kode_transaksi: string;
  id_customer: string;
  status_operasional: string;
  status_pembayaran: string;
  pesanan_item?: CartItemAPI[];
  subtotal: number;
  kode_unik: number;
  ongkir: number;
  diskon_voucher: number;
  total_tagihan: number;
  total_dibayar: number;
  sisa_tagihan: number;
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

export async function getCartItems(): Promise<CartServiceResponse<CartDataAPI>> {
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

      if (item.tipe_file) {
        formData.append(`items[${index}][tipe_file]`, item.tipe_file);
      }

      if (item.tipe_file === "upload" && item.file_desain) {
        formData.append(`items[${index}][file_desain]`, item.file_desain);
      }
      
      if (item.tipe_file === "link" && item.link_file) {
        formData.append(`items[${index}][link_file]`, item.link_file);
      }

      if (item.finishings && item.finishings.length > 0) {
        item.finishings.forEach((fin, fIdx) => {
          formData.append(`items[${index}][finishings][${fIdx}][id_sku_finishing]`, String(fin.id_sku_finishing));
          formData.append(`items[${index}][finishings][${fIdx}][nama_finishing_snapshot]`, fin.nama_finishing_snapshot);
          formData.append(`items[${index}][finishings][${fIdx}][harga_finishing_snapshot]`, String(fin.harga_finishing_snapshot));
          formData.append(`items[${index}][finishings][${fIdx}][kali_jumlah_pesan]`, String(fin.kali_jumlah_pesan));
          
          if (fin.kategori_finishing) {
            formData.append(`items[${index}][finishings][${fIdx}][kategori_finishing]`, fin.kategori_finishing);
          }
          if (fin.tipe) {
            formData.append(`items[${index}][finishings][${fIdx}][tipe]`, fin.tipe);
          }
        });
      }

      // Handle JSON conversion untuk form data atribut custom
      if (item.atribut_custom_snapshot && Object.keys(item.atribut_custom_snapshot).length > 0) {
        formData.append(`items[${index}][atribut_custom_snapshot]`, JSON.stringify(item.atribut_custom_snapshot));
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

export async function checkoutCart(payload: CheckoutPayload): Promise<CartServiceResponse<{ id_pesan: string, kode_transaksi: string }>> {
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