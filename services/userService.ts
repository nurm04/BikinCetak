"use server";

import { cookies } from "next/headers";

export interface CustomerProfile {
  id_customer: string;
  user_id: number;
  no_hp: string;
  id_role_customer: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: string;
  created_at: string;
  updated_at: string;

  customer: CustomerProfile | null;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
async function getAuthHeader() {
  const cookieStore = await cookies();
  const jwtCookie = cookieStore.get("jwt");
  if (!jwtCookie) return null;
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${jwtCookie.value}`,
    "Cookie": `jwt=${jwtCookie.value}`
  };
}

function getCustomerRole(idRoleCustomer: string): string {
  const parts = idRoleCustomer.split("-");

  return parts.length >= 3 ? parts[2] : "UNKNOWN";
}

export async function getUserProfile(): Promise<{
  data?: UserProfile;
  error?: string;
}> {
  try {
    const headers = await getAuthHeader();

    if (!headers) {
      return {
        error: "Tidak ada sesi aktif",
      };
    }

    const response = await fetch(
      `${BASE_URL}/me`,
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
          "Gagal mengambil profil",
      };
    }

    const user = result.data
    return {
      data: {
        ...user,
        customer: user.customer
          ? {
              ...user.customer,
              role: getCustomerRole(
                user.customer.id_role_customer
              ),
            }
          : null,
      } as UserProfile,
    };
  } catch {
    return {
      error: "Koneksi terputus.",
    };
  }
}

export async function updateUserProfile(
  payload: {
    name?: string;
    email?: string;
    no_hp?: string;
  }
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const headers = await getAuthHeader();

    if (!headers) {
      return {
        success: false,
        error: "Sesi habis",
      };
    }

    const response = await fetch(
      `${BASE_URL}/profile`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error:
          result.message ||
          "Gagal update profil",
      };
    }

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      error: "Koneksi backend bermasalah.",
    };
  }
}

export async function updatePassword(
  payload: {
    old_password: string;
    password: string;
    password_confirmation: string;
  }
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const headers = await getAuthHeader();

    if (!headers) {
      return {
        success: false,
        error: "Sesi habis",
      };
    }

    const response = await fetch(
      `${BASE_URL}/profile/password`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error:
          result.message ||
          "Gagal mengganti password",
      };
    }

    return {
      success: true,
    };
  } catch {
    return {
      success: false,
      error: "Koneksi backend bermasalah.",
    };
  }
}