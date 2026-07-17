import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import LoginForm from "@/app/(auth)/login/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Bikin Cetak melayani berbagai kebutuhan promosi bisnis Anda mulai dari Sticker, Banner, Merchandise hingga kebutuhan kantor dengan proses cepat dan harga kompetitif.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-10">
      <Link 
        href="/" 
        className="z-10 absolute top-6 left-6 btn btn-ghost btn-sm gap-2 uppercase font-black text-[10px] opacity-50 hover:opacity-100"
      >
        <ArrowLeft size={16} /> Kembali
      </Link>

      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-content/5 rounded-[2.5rem] overflow-hidden">
        <div className="card-body p-8 md:p-12">
          <div className="flex flex-col items-center mb-10">
            <div className="relative w-16 h-16 mb-2">
              <Image 
                src="/favicon.ico" 
                alt="Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <div className="h-1.5 w-8 bg-primary rounded-full"></div>
          </div>

          <LoginForm />

          <p className="mt-10 text-center text-[11px] font-medium opacity-50 uppercase tracking-wider">
            Belum punya akun?{" "}
            <Link href="/register" className="text-primary font-black link-hover ml-1 underline underline-offset-4">
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}