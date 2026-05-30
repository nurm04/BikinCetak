"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  ShoppingBag, 
  ArrowLeft, 
  Clock, 
  CreditCard,
  CircleDot
} from "lucide-react";

// Definisi Type untuk Status
type OrderStatus = "pending" | "dibayar" | "diproses" | "dikirim" | "selesai";

interface Step {
  id: OrderStatus;
  label: string;
  icon: React.ReactNode;
}

interface OrderData {
  id: string;
  date: string;
  total: number;
  status: OrderStatus;
}

interface StatusPageProps {
  params: { id: string };
}

export default function OrderStatusPage({ params }: StatusPageProps) {
  // Simulasi Data (Nanti lu fetch dari API Golang berdasarkan params.id)
  const orderData: OrderData = {
    id: params.id,
    date: "04 Mei 2026, 20:24",
    total: 180000,
    status: "dibayar", // Ini yang nentuin jalannya stepper
  };

  // Konfigurasi Stepper ala Shopee
  const steps: Step[] = useMemo(() => [
    { id: "pending", label: "Belum Bayar", icon: <CreditCard size={18} /> },
    { id: "dibayar", label: "Dibayar", icon: <CheckCircle2 size={18} /> },
    { id: "diproses", label: "Diproses", icon: <Package size={18} /> },
    { id: "dikirim", label: "Dikirim", icon: <Truck size={18} /> },
    { id: "selesai", label: "Selesai", icon: <ShoppingBag size={18} /> },
  ], []);

  const currentStepIndex = steps.findIndex(s => s.id === orderData.status);

  return (
    <main className="min-h-screen bg-base-200 py-6 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="btn btn-ghost btn-xs gap-2 uppercase font-bold opacity-60">
            <ArrowLeft size={14} /> Beranda
          </Link>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase opacity-40 leading-none">Order ID</p>
            <p className="text-sm font-black text-primary uppercase">{orderData.id}</p>
          </div>
        </div>

        {/* Hero Status Card */}
        <div className="card bg-base-100 shadow-sm border border-base-content/5 rounded-[2.5rem] overflow-hidden mb-6">
          <div className="bg-primary p-8 text-primary-content">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/20 rounded-3xl shadow-inner">
                <CheckCircle2 size={40} />
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight leading-none">Pembayaran Berhasil!</h1>
                <p className="text-xs font-bold opacity-80 mt-2 max-w-xs uppercase tracking-wider">
                  Pesanan Anda sedang kami siapkan untuk masuk tahap produksi.
                </p>
              </div>
            </div>
          </div>

          <div className="p-10">
            {/* Stepper Progres Dinamis */}
            <div className="relative flex justify-between items-start w-full">
              {/* Line Background */}
              <div className="absolute top-5 left-0 w-full h-1 bg-base-200 z-0"></div>
              
              {/* Line Active (Progress Fill) */}
              <div 
                className="absolute top-5 left-0 h-1 bg-primary transition-all duration-1000 ease-in-out z-0" 
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              ></div>

              {steps.map((step, index) => {
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.id} className="flex flex-col items-center gap-4 z-10 w-1/5">
                    <div className={`
                      w-11 h-11 rounded-full flex items-center justify-center border-4 border-base-100 shadow-sm transition-all duration-500
                      ${isActive ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content/20'}
                      ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}
                    `}>
                      {isCurrent ? <CircleDot className="animate-pulse" size={20} /> : step.icon}
                    </div>
                    <div className="text-center space-y-1">
                      <p className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${isActive ? 'text-primary' : 'opacity-30'}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ringkasan Informasi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-base-100 rounded-2xl p-7 border border-base-content/5 shadow-sm">
            <div className="flex items-center gap-3 mb-5 opacity-40">
              <Clock size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Waktu Pemesanan</span>
            </div>
            <p className="font-bold text-sm tracking-tight">{orderData.date}</p>
          </div>

          <div className="bg-base-100 rounded-2xl p-7 border border-base-content/5 shadow-sm">
            <div className="flex items-center gap-3 mb-5 opacity-40">
              <CreditCard size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Total Pembayaran</span>
            </div>
            <p className="font-black text-2xl text-primary tracking-tighter">
              Rp {orderData.total.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col gap-4">
          <button className="btn btn-primary btn-lg rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 h-16 text-xs">
            Lihat Detail Pesanan
          </button>
          <Link href="/" className="btn btn-ghost btn-block rounded-2xl font-black uppercase tracking-widest opacity-40 hover:opacity-100">
            Belanja Produk Lain
          </Link>
        </div>

      </div>
    </main>
  );
}