"use server";

import { cookies } from "next/headers";

export interface OrderRequest {
  address_name: string;
  selected_item_ids: string[];
}

export interface OrderResponse {
  message: string;
  snap_token: string;
  order_id: string;
}

const API_URL = "https://bikincetak-api.up.railway.app/v1/order";

async function getAuthHeader() {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");
  if (!jwtCookie) return null;
  return {
    "Content-Type": "application/json",
    "Cookie": `jwt=${jwtCookie.value}`
  };
}

export async function createOrder(data: OrderRequest): Promise<OrderResponse | null> {
  try {
    const headers = await getAuthHeader();
    
    if (!headers) {
      console.error("ORDER_SERVICE: Tidak ada sesi aktif.");
      return null;
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      cache: "no-store",
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("ALASAN DITOLAK GOLANG:", responseData);
      throw new Error(responseData.error || responseData.message || "Gagal membuat pesanan");
    }

    return responseData as OrderResponse;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Order Service Error:", error.message);
    }
    return null;
  }
}