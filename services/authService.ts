/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
  number: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  message?: string;
  success?: boolean;
  token?: string;
  data?: {
    id: string;
    name: string;
    email: string;
    no_hp?: string;
  };
  error?: string;
}

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  try {
    const laravelPayload = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      no_hp: payload.number,
    };

    const response = await fetch(`${BASE_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(laravelPayload),
    });

    const data = await response.json();
    
    if (!response.ok || data.success === false) {
      return { error: data.message || "Gagal mendaftar." };
    }

    return data;
  } catch (err) {
    return { error: "Gagal terhubung ke server percetakan." };
  }
}

export async function loginUser(payload: Pick<RegisterPayload, 'email' | 'password'>): Promise<AuthResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      return { error: data.message || "Email atau password salah" };
    }

    let tokenValue = "";
    const setCookies = response.headers.getSetCookie();

    if (setCookies && setCookies.length > 0) {
      const jwtCookieStr = setCookies.find(c => c.startsWith("jwt="));
      if (jwtCookieStr) {
        tokenValue = jwtCookieStr.split(";")[0].substring(4);
      }
    }

    if (!tokenValue && data.token) {
      tokenValue = data.token;
    } else if (!tokenValue && data.data?.token) {
      tokenValue = data.data.token;
    }

    if (tokenValue) {
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

    return data;
  } catch (err) {
    return { error: "Gagal terhubung ke server." };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("jwt");
}

export async function sendResetLink(payload: { email: string }): Promise<{ message?: string; error?: string }> {
  try {
    const response = await fetch(`${BASE_URL}/api/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      return { error: data.message || "Gagal mengirim link reset password. Pastikan email terdaftar." };
    }

    return { message: data.message || "Tautan reset password berhasil dikirim." };
  } catch (err) {
    return { error: "Gagal terhubung ke server." };
  }
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<{ message?: string; error?: string }> {
  try {
    const response = await fetch(`${BASE_URL}/api/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      return { error: data.message || "Gagal mengatur ulang password. Link mungkin kedaluwarsa." };
    }

    return { message: data.message || "Password berhasil diperbarui." };
  } catch (err) {
    return { error: "Gagal terhubung ke server." };
  }
}