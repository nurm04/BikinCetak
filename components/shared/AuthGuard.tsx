"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
    const [authorized, setAuthorized] = useState<boolean>(false);

    useEffect(() => {
    const checkAuth = () => {
        const token = localStorage.getItem("token");
        if (!token) {
        router.push("/login");
        } else {
        setAuthorized(true);
        }
    };

    checkAuth();
    }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="ml-4 font-black uppercase italic tracking-widest">Mengecek Akses...</p>
      </div>
    );
  }

  return <>{children}</>;
}