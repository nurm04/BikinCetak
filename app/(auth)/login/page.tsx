import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import LoginForm from "@/app/(auth)/login/LoginForm";

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

          <div className="divider my-8 text-[10px] font-black opacity-20 uppercase">Atau</div>

          <a 
            href="https://bikincetak-api.up.railway.app/v1/auth/google/login?prompt=select_account"
            className="btn bg-white text-black rounded-2xl border-base-content/10 w-full hover:bg-base-200 gap-3 font-bold text-xs shadow-sm flex items-center justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign In with Google
          </a>

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