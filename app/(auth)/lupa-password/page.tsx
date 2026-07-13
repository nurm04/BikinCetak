import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import LupaPasswordForm from "./LupaPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-10">
      <Link 
        href="/login" 
        className="z-10 absolute top-6 left-6 btn btn-ghost btn-sm gap-2 uppercase font-black text-[10px] opacity-50 hover:opacity-100"
      >
        <ArrowLeft size={16} /> Kembali ke Login
      </Link>

      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-content/5 rounded-[2.5rem] overflow-hidden">
        <div className="card-body p-8 md:p-12">
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-16 h-16 mb-2">
              <Image 
                src="/favicon.ico" 
                alt="Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <div className="h-1.5 w-8 bg-primary rounded-full mb-6"></div>
            <h2 className="text-2xl font-black tracking-widest uppercase text-primary text-center">
              Lupa Password
            </h2>
            <p className="mt-3 text-[10px] font-bold text-base-content/50 uppercase tracking-widest text-center leading-relaxed">
              Masukkan alamat email Anda dan kami akan mengirimkan tautan untuk mengatur ulang password.
            </p>
          </div>

          <LupaPasswordForm />
        </div>
      </div>
    </main>
  );
}