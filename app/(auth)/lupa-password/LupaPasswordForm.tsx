"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";
import AuthInput from "@/components/ui/AuthInput";
import Alert from "@/components/ui/Alert";
import { sendResetLink } from "@/services/authService";

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleForgot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      email: formData.get("email") as string,
    };

    try {
      // Memanggil fungsi API dari authService
      const res = await sendResetLink(payload);
      
      // Handle jika API mengembalikan error dari backend
      if (res.error) {
        setError(res.error);
        return;
      }
      
      setSuccess(res.message || "Tautan reset password berhasil dikirim. Silakan cek kotak masuk email Anda.");
      
    } catch (err: unknown) {
      // Mengganti 'any' dengan 'unknown' dan melakukan pengecekan tipe (Type Guard)
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan saat memproses permintaan.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleForgot}>
      {error && <Alert type="error" message={error} onClose={() => setError("")} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess("")} />}
      
      <AuthInput 
        label="Alamat Email" 
        name="email" 
        type="email" 
        placeholder="nama@email.com" 
        icon={<Mail size={18} />} 
        required
      />

      <button 
        type="submit" 
        disabled={loading} 
        className="btn btn-primary w-full rounded-2xl shadow-xl shadow-primary/30 uppercase font-black tracking-widest mt-4 h-14"
      >
        {loading ? (
          <span className="loading loading-spinner"></span>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span>Kirim Link Reset</span>
            <Send size={18} />
          </div>
        )}
      </button>
    </form>
  );
}