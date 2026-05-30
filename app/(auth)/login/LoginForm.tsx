/* eslint-disable @typescript-eslint/no-unused-vars */
// @/component/shared/LoginForm.tsx
"use client";

import { useState } from "react";
import { LogIn, Mail, Lock } from "lucide-react";
import AuthInput from "@/components/ui/AuthInput";
import Alert from "@/components/ui/Alert";
import Link from "next/link";
import { loginUser } from "@/services/authService";

export default function LoginForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      const res = await loginUser(payload);
      
      if (res.error) {
        setError(res.error); 
        setLoading(false);
        return;
      }

      window.location.href = "/"; 
      
    } catch (err: unknown) {
      setError("Terjadi kesalahan sistem yang tidak diketahui.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleLogin}>
      {error && <Alert type="error" message={error} onClose={() => setError("")} />}
      
      <AuthInput 
        label="Alamat Email" 
        name="email" 
        type="email" 
        placeholder="nama@email.com" 
        icon={<Mail size={18} />} 
      />
      
      <AuthInput 
        label="Kata Sandi" 
        name="password" 
        type="password" 
        placeholder="••••••••" 
        icon={<Lock size={18} />}
        rightLabel={
          <Link href="#" className="text-primary font-black text-[10px] uppercase hover:underline">
            Lupa?
          </Link>
        }
      />

      <button 
        type="submit" 
        disabled={loading} 
        className="btn btn-primary w-full rounded-2xl shadow-xl shadow-primary/30 uppercase font-black tracking-widest mt-4 h-14"
      >
        {loading ? (
          <span className="loading loading-spinner"></span>
        ) : (
          <div className="flex items-center gap-2">
            <span>Masuk Akun</span>
            <LogIn size={18} />
          </div>
        )}
      </button>
    </form>
  );
}