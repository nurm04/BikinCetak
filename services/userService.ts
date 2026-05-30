/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { cookies } from "next/headers";

export interface UserProfile {
  email: string;
  customer_name?: string;
  mobile_no?: string;
  customer_group?: string;
}

export interface AddressItem {
  address_title: string;
  address_type: string;
  address_line1: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  city_id: string;
  province_id: string;
  subdistrict_id: string;
}

// Update return type di fungsi-fungsi terkait di userService.ts lu
// Contoh: export async function getUserAddresses(): Promise<{ data?: AddressItem[]; error?: string }>

const BASE_URL = "https://bikincetak-api.up.railway.app/v1/user";

// Helper buat ambil cookie JWT di server
async function getAuthHeader() {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");
  if (!jwtCookie) return null;
  return {
    "Content-Type": "application/json",
    "Cookie": `jwt=${jwtCookie.value}`
  };
}

// --- PROFILE ACTIONS ---

export async function getUserProfile(): Promise<{ data?: UserProfile; error?: string }> {
  try {
    const headers = await getAuthHeader();
    if (!headers) return { error: "Tidak ada sesi aktif" };

    const response = await fetch(`${BASE_URL}/profile`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const resData = await response.json();
    if (!response.ok) return { error: resData.message || "Gagal ambil profil" };

    return { data: resData.data };
  } catch (error) {
    return { error: "Koneksi terputus." };
  }
}

export async function updateUserProfile(payload: {
  customer_name?: string;
  mobile_no?: string;
  customer_group?: string;
  new_password?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = await getAuthHeader();
    if (!headers) return { error: "Sesi habis", success: false };

    const response = await fetch(`${BASE_URL}/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });

    const resData = await response.json();
    if (!response.ok) return { error: resData.message || "Gagal update profil", success: false };
    
    return { success: true };
  } catch (error) {
    return { error: "Koneksi backend bermasalah.", success: false };
  }
}

// --- ADDRESS ACTIONS ---

export async function getUserAddresses() {
  try {
    const headers = await getAuthHeader();
    if (!headers) return { error: "Sesi habis" };

    const response = await fetch(`${BASE_URL}/address`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const resData = await response.json();
    if (!response.ok) return { error: resData.message || "Gagal ambil alamat" };
    return { data: resData.data || resData };
  } catch (error) {
    return { error: "Gagal terhubung." };
  }
}

export async function createAddress(payload: AddressItem) {
  try {
    const headers = await getAuthHeader();
    if (!headers) return { error: "Sesi habis" };

    const response = await fetch(`${BASE_URL}/address`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const resData = await response.json();
    if (!response.ok) return { error: resData.message || "Gagal simpan alamat" };
    return { data: resData, success: true };
  } catch (error) {
    return { error: "Terjadi kesalahan koneksi." };
  }
}

export async function updateAddress(addressName: string, payload: AddressItem) {
  try {
    const headers = await getAuthHeader();
    if (!headers) return { error: "Sesi habis", success: false };

    const url = `${BASE_URL}/address/${encodeURIComponent(addressName)}`;

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });

    const resData = await response.json();
    if (!response.ok) return { error: resData.message || "Gagal", success: false };
    
    return { success: true };
  } catch (error) {
    return { error: "Koneksi gagal", success: false };
  }
}