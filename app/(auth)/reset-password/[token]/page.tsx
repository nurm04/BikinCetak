import Image from "next/image";
import ResetPasswordForm from "./ResetPasswordForm";

// Tidak perlu lagi menerima params atau searchParams di sini
export default function ResetPasswordPage() {
  return (
    <main className="flex items-center justify-center min-h-screen px-4 py-10 bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-content/5 rounded-[2.5rem] overflow-hidden">
        <div className="p-8 card-body md:p-12">
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
            <h2 className="text-2xl font-black tracking-widest uppercase text-center text-primary">
              Password Baru
            </h2>
            <p className="mt-3 text-[10px] font-bold text-base-content/50 uppercase tracking-widest text-center leading-relaxed">
              Silakan buat password baru untuk akun Anda
            </p>
          </div>

          <ResetPasswordForm />
        </div>
      </div>
    </main>
  );
}