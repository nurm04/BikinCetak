"use client";

import { 
  TrendingUp,
  AlertCircle, 
  PlusCircle, 
  ArrowRight, 
  Wallet, 
  Clock 
} from "lucide-react";
import Link from "next/link";

export default function OverviewClient() {
  return (
    <div className="space-y-8 pb-10">
      {/* Header Shift */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">Ringkasan Kasir</h1>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]">Monitoring Transaksi & Stok Real-time</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-success/10 text-success px-4 py-2 rounded-2xl border border-success/20 flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-ping"></div>
              <span className="text-[10px] font-black uppercase italic">Toko Buka</span>
           </div>
        </div>
      </div>

      {/* Stats Utama Kasir */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary text-primary-content p-8 rounded-[2.5rem] shadow-xl shadow-primary/20 relative overflow-hidden group">
          <Wallet className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
          <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Omzet Shift Ini</p>
          <p className="text-4xl font-black mt-2" suppressHydrationWarning>Rp 4.250.000</p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold bg-white/20 w-fit px-3 py-1 rounded-full">
            <TrendingUp size={12} /> ↗︎ 12% dari kemarin
          </div>
        </div>

        <div className="bg-base-100 border border-base-content/5 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Antrean Cetak</p>
            <p className="text-4xl font-black mt-2">18 <span className="text-sm font-normal opacity-50 italic">Pcs</span></p>
          </div>
          <p className="text-[10px] font-bold text-primary uppercase mt-4 italic">3 Pesanan butuh approval</p>
        </div>

        <div className="bg-base-100 border border-base-content/5 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Bahan Kritis</p>
            <p className="text-4xl font-black mt-2 text-error">4 <span className="text-sm font-normal opacity-50 italic">Items</span></p>
          </div>
          <Link href="/dashboard/inventory" className="text-[10px] font-black text-error uppercase mt-4 flex items-center gap-1 hover:underline">
            Cek Stok Sekarang <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-black uppercase text-xs tracking-widest ml-2 opacity-50">Aksi Cepat</h3>
          <Link href="/dashboard/orders" className="flex items-center justify-between p-6 bg-base-100 border border-base-content/5 rounded-lg hover:border-primary transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                <PlusCircle size={20} />
              </div>
              <span className="font-black uppercase text-xs">Buat Order Baru</span>
            </div>
            <ArrowRight size={16} className="opacity-20 group-hover:opacity-100" />
          </Link>
          <div className="p-6 bg-base-200/50 border border-dashed border-base-content/10 rounded-lg opacity-60">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-base-300 rounded-2xl">
                <AlertCircle size={20} />
              </div>
              <span className="font-black uppercase text-xs">Lapor Selisih Kas</span>
            </div>
          </div>
        </div>

        {/* Aktivitas Terakhir */}
        <div className="lg:col-span-2 card bg-base-100 border border-base-content/5 shadow-sm rounded-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black uppercase text-xs tracking-widest opacity-50">Log Transaksi Terakhir</h3>
            <Clock size={16} className="opacity-20" />
          </div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 group cursor-default">
                <div className="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10"></div>
                <div className="flex-1">
                   <p className="text-xs font-bold uppercase">Pesanan <span className="text-primary">#SO-26-00{i}</span></p>
                   <p className="text-[10px] opacity-40 font-medium">Pembayaran via Mandiri Transfer diterima</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase">Rp 125.000</p>
                   <p className="text-[9px] opacity-30 font-bold uppercase">2m ago</p>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-ghost btn-block btn-sm mt-8 rounded-xl uppercase font-black text-[10px] opacity-40">Lihat Semua Log</button>
        </div>
      </div>
    </div>
  );
}