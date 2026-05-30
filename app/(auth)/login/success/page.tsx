"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      router.push("/");
      router.refresh(); 
    } else {
      router.push("/login?error=TokenTidakDitemukan");
    }
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="loading loading-spinner loading-lg text-primary"></span>
      <p className="font-bold text-sm uppercase tracking-widest animate-pulse">
        Memverifikasi Akun Google...
      </p>
    </div>
  );
}

export default function LoginSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <Suspense fallback={
        <span className="loading loading-spinner loading-lg text-primary"></span>
      }>
        <LoginSuccessContent />
      </Suspense>
    </div>
  );
}