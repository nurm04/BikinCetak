/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { cookies } from "next/headers";

const BASE_URL = "https://bikincetak-api.up.railway.app/v1/auth";

// Interface untuk Register
export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
  number: string;
}

export interface AuthResponse {
  message: string;
  status?: string;
  token?: string;
  data?: {
    id: string;
    name: string;
    email: string;
  };
  error?: string;
}

export async function registerUser(payload: RegisterPayload) {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { error: data.message || "Gagal mendaftar. Silakan coba lagi." };
    }

    return data;
  } catch (err) {
    return { error: "Gagal terhubung ke server percetakan." };
  }
}

export async function loginUser(payload: Pick<RegisterPayload, 'email' | 'password'>) {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || "Email atau password salah" };
    }

    // ==========================================
    // BAGIAN PENTING: TANGKAP & TERUSKAN COOKIE
    // ==========================================
    // 1. Ambil array Set-Cookie dari response Golang
    const setCookies = response.headers.getSetCookie();

    if (setCookies && setCookies.length > 0) {
      const jwtCookieStr = setCookies.find(c => c.startsWith("jwt="));

      if (jwtCookieStr) {
        const tokenValue = jwtCookieStr.split(";")[0].substring(4);

        const cookieStore = await cookies();
        cookieStore.set({
          name: "jwt",
          value: tokenValue,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 
        });
      }
    }

    return data;
  } catch (err) {
    return { error: "Gagal terhubung ke server." };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("jwt");
}