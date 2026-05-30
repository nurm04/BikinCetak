/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { cookies } from "next/headers";

const BASE_URL = "https://bikincetak-api.up.railway.app/v1/cart";

async function getAuthHeader() {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");
  if (!jwtCookie) return null;
  return {
    "Content-Type": "application/json",
    "Cookie": `jwt=${jwtCookie.value}`
  };
}

export interface VariantLainnya {
  item_code: string;
  price: number;
}

export interface CartPayload {
  item_code: string;
  variant_name: string;
  qty: number;
  price: number;
  image_url: string;
  variant_lainnya?: VariantLainnya[];
}

export async function addToCart(payload: CartPayload) {
  try {
    const headers = await getAuthHeader();
    if (!headers) return { error: "Silakan login terlebih dahulu untuk menambah keranjang." };

    const response = await fetch(`${BASE_URL}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { error: data.message || "Gagal menambahkan ke keranjang" };
    }

    return { success: true, message: "Berhasil ditambahkan!", data };
  } catch (error) {
    return { error: "Gagal terhubung ke server percetakan." };
  }
}

export async function getCartItems() {
  try {
    const headers = await getAuthHeader();
    if (!headers) return { error: "Sesi habis, silakan login ulang." };

    const response = await fetch(`${BASE_URL}`, {
      method: "GET",
      headers,
      cache: "no-store"
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { error: data.message || "Gagal mengambil data keranjang" };
    }

    return { data: data.data || data }; 
  } catch (error) {
    return { error: "Gagal terhubung ke server percetakan." };
  }
}

export async function updateCartItemQty(id: number, qty: number) {
  if (!id || id === 0) return { error: "ID pesanan tidak valid" };

  try {
    const headers = await getAuthHeader();
    if (!headers) return { error: "Sesi habis." };

    const url = `${BASE_URL}/${id}`;
    
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify({ qty: Number(qty) }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || "Gagal update jumlah" };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error("FETCH ERROR:", error);
    return { error: "Koneksi ke API terputus." };
  }
}

export async function deleteCartItem(id: number) {
  try {
    const headers = await getAuthHeader();
    if (!headers) return { error: "Sesi habis." };

    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers
    });

    const data = await response.json();
    if (!response.ok) return { error: data.message || "Gagal menghapus pesanan" };
    
    return { success: true, data };
  } catch (error) {
    return { error: "Gagal terhubung ke server." };
  }
}