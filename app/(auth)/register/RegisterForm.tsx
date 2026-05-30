"use client";

import { useState } from "react";
import { UserPlus, Mail, Lock, User, Phone } from "lucide-react";
import AuthInput from "@/components/ui/AuthInput";
import Alert from "../../../components/ui/Alert";
import { useRouter } from "next/navigation";
import { registerUser, RegisterPayload } from "@/services/authService";

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<{msg: string, type: "success" | "error"} | null>(null);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload: RegisterPayload = {
      email: formData.get("email") as string,
      name: formData.get("name") as string,
      password: formData.get("password") as string,
      number: formData.get("number") as string,
    };

    try {
      const res = await registerUser(payload);
      
      if (res.error) {
        setError({ msg: res.error, type: "error" });
        setLoading(false);
        return;
      }

      setError({ msg: "Pendaftaran Berhasil! Mengalihkan...", type: "success" });
      setTimeout(() => router.push("/login"), 2000);
      
    } catch (err) {
      setError({ msg: "Terjadi kesalahan sistem yang tidak diketahui.", type: "error" });
    } finally {
      if (error?.type === "error") {
          setLoading(false);
      }
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleRegister}>
      {error && <Alert type={error.type} message={error.msg} onClose={() => setError(null)} />}
      <AuthInput label="Nama Lengkap" name="name" type="text" placeholder="nama" icon={<User size={18} />} />
      <AuthInput label="Alamat Email" name="email" type="email" placeholder="email@email.com" icon={<Mail size={18} />} />
      <AuthInput label="WhatsApp" name="number" type="text" placeholder="0812..." icon={<Phone size={18} />} />
      <AuthInput label="Kata Sandi" name="password" type="password" placeholder="••••••••" icon={<Lock size={18} />} />

      <button type="submit" disabled={loading} className="btn btn-primary w-full rounded-2xl shadow-xl shadow-primary/20 uppercase font-black tracking-widest mt-6 h-14">
        {loading ? <span className="loading loading-spinner"></span> : <div className="flex items-center gap-2"><UserPlus size={18} /><span>Buat Akun</span></div>}
      </button>
    </form>
  );
}