"use client";

import { useState } from "react";
import { Lock, Save, Mail } from "lucide-react";
import AuthInput from "@/components/ui/AuthInput";
import Alert from "@/components/ui/Alert";
import Link from "next/link";
import { resetPassword } from "@/services/authService";
import { useParams, useSearchParams } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Bikin Cetak melayani berbagai kebutuhan promosi bisnis Anda mulai dari Sticker, Banner, Merchandise hingga kebutuhan kantor dengan proses cepat dan harga kompetitif.",
};

export default function ResetPasswordForm() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const token = (params?.token as string) || "";
  const email = searchParams.get("email") || "";

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const password_confirmation = formData.get("password_confirmation") as string;

    if (password !== password_confirmation) {
      setError("Konfirmasi password tidak cocok!");
      setLoading(false);
      return;
    }

    const payload = {
      token,
      email,
      password,
      password_confirmation,
    };

    try {
      const res = await resetPassword(payload);
      
      if (res.error) {
        setError(res.error);
        return;
      }

      setSuccessMsg(res.message || "Password Anda berhasil diperbarui!");
      setSuccess(true);
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal mengatur ulang password. Terjadi kesalahan sistem.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <Alert type="success" message={successMsg} />
        <Link href="/login" className="flex items-center justify-center w-full mt-6 tracking-widest uppercase shadow-xl btn btn-primary rounded-2xl font-black h-14">
          Ke Halaman Login
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleReset}>
      {error && <Alert type="error" message={error} onClose={() => setError("")} />}
      
      {/* Alamat Email otomatis terisi dari URL dan dikunci (readOnly) */}
      <AuthInput 
        label="Alamat Email" 
        name="email" 
        type="email" 
        defaultValue={email}
        readOnly={true}
        icon={<Mail size={18} />} 
      />
      
      <AuthInput 
        label="Password Baru" 
        name="password" 
        type="password" 
        placeholder="••••••••" 
        required
        icon={<Lock size={18} />}
      />

      <AuthInput 
        label="Konfirmasi Password" 
        name="password_confirmation" 
        type="password" 
        placeholder="••••••••" 
        required
        icon={<Lock size={18} />}
      />

      <button 
        type="submit" 
        disabled={loading} 
        className="w-full mt-6 tracking-widest uppercase shadow-xl btn btn-primary rounded-2xl shadow-primary/30 font-black h-14"
      >
        {loading ? (
          <span className="loading loading-spinner"></span>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span>Simpan Password</span>
            <Save size={18} />
          </div>
        )}
      </button>
    </form>
  );
}