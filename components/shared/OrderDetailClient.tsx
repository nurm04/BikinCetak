"use client";

import { ArrowLeft, Printer, Package, CreditCard, User, History } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// --- DEFINISI INTERFACE (ANTI-ANY) ---
interface OrderItem {
  name: string;
  qty: number;
  price: number;
  total: number;
}

interface PaymentLedger {
  date: string;
  method: string;
  amount: number;
  ref: string;
}

interface OrderDetail {
  id: string;
  customer: string;
  phone: string;
  email: string;
  date: string;
  status: string;
  payment_status: string;
  total: number;
  total_paid: number;
  items: OrderItem[];
  payments: PaymentLedger[];
}

interface OrderDetailClientProps {
  data: OrderDetail;
}

export default function OrderDetailClient({ data }: OrderDetailClientProps) {
  const router = useRouter();
  const outstanding = data.total - data.total_paid;

  return (
    <div className="space-y-8 pb-20">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <button 
          onClick={() => router.back()} 
          className="btn btn-ghost btn-sm gap-2 uppercase font-black text-[10px] w-fit"
        >
          <ArrowLeft size={14} /> Kembali
        </button>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm rounded-xl gap-2 font-black text-[10px] uppercase">
            <Printer size={14} /> Cetak Invoice
          </button>
          {outstanding > 0 && (
            <Link 
              href={`/dashboard/orders/${data.id}/bayar`} 
              className="btn btn-primary btn-sm rounded-xl gap-2 font-black text-[10px] uppercase shadow-lg shadow-primary/20"
            >
              <CreditCard size={14} /> Input Pelunasan
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KOLOM KIRI: INFO PRODUK & ORDER */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 border border-base-content/5 shadow-sm rounded-[2.5rem] overflow-hidden">
            <div className="p-6 bg-base-200/50 flex justify-between items-center border-b border-base-content/5">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-primary" />
                <h3 className="font-black uppercase text-xs tracking-widest">Detail Produk</h3>
              </div>
              <span className="badge badge-primary font-black text-[9px] uppercase px-3 italic">{data.status}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="text-[10px] uppercase font-black opacity-40">
                  <tr>
                    <th>Item Description</th>
                    <th className="text-center">Qty</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-bold uppercase">
                  {data.items.map((item, i) => (
                    <tr key={i} className="hover:bg-base-200/30 transition-colors">
                      <td className="font-black tracking-tight">{item.name}</td>
                      <td className="text-center">{item.qty}</td>
                      <td className="text-right font-medium">Rp {item.price.toLocaleString("id-ID")}</td>
                      <td className="text-right font-black text-primary">Rp {item.total.toLocaleString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-8 bg-base-200/20 border-t border-base-content/5">
               <div className="flex justify-end">
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Grand Total</p>
                    <p className="text-3xl font-black italic tracking-tighter" suppressHydrationWarning>
                      Rp {data.total.toLocaleString("id-ID")}
                    </p>
                  </div>
               </div>
            </div>
          </div>

          {/* Data Pembayaran (Ledger) */}
          <div className="card bg-base-100 border border-base-content/5 shadow-sm rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-base-content/5 pb-4">
              <CreditCard className="text-primary" size={20} />
              <h2 className="font-black uppercase text-sm tracking-widest">Riwayat Pembayaran</h2>
            </div>
            <div className="space-y-4">
              {data.payments.map((p, i) => (
                <div key={i} className="flex justify-between items-center p-5 bg-base-200/30 rounded-3xl border-l-4 border-success group hover:bg-base-200 transition-all">
                  <div>
                    <p className="text-[9px] font-black uppercase opacity-40 mb-1">{p.date}</p>
                    <p className="font-black text-xs uppercase tracking-tight">{p.method}</p>
                    <p className="text-[10px] opacity-50 font-bold mt-1">REF: {p.ref}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-success text-sm" suppressHydrationWarning>+ Rp {p.amount.toLocaleString("id-ID")}</p>
                    <div className="badge badge-success badge-outline border-none text-[8px] font-black p-0 h-fit uppercase tracking-widest">Verified</div>
                  </div>
                </div>
              ))}
              {data.payments.length === 0 && (
                <div className="text-center py-12 bg-base-200/20 rounded-lg border-2 border-dashed border-base-content/5">
                  <History className="mx-auto opacity-10 mb-2" size={32} />
                  <p className="opacity-30 italic text-[10px] uppercase font-black">Belum ada riwayat pembayaran</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: INFO CUSTOMER & STATUS */}
        <div className="space-y-6">
          {/* Status Tagihan Card */}
          <div className="card bg-base-100 border border-base-content/5 shadow-sm rounded-[2.5rem] p-8 overflow-hidden relative">
             <div className="text-center space-y-6 relative z-10">
                <div className={`p-6 rounded-lg ${outstanding === 0 ? 'bg-success/10 text-success ring-1 ring-success/20' : 'bg-error/10 text-error ring-1 ring-error/20'}`}>
                   <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-1">Status Tagihan</p>
                   <p className="text-2xl font-black uppercase italic tracking-tighter">{data.payment_status}</p>
                </div>
                
                {outstanding > 0 && (
                  <div className="bg-base-200/50 p-6 rounded-lg border border-base-content/5">
                     <p className="text-[10px] font-black uppercase opacity-40 italic tracking-widest">Sisa Outstanding</p>
                     <p className="text-2xl font-black text-error mt-1" suppressHydrationWarning>
                       Rp {outstanding.toLocaleString("id-ID")}
                     </p>
                  </div>
                )}

                <div className="flex justify-between items-center px-4 pt-4 border-t border-base-content/5">
                  <div className="text-left">
                    <p className="text-[8px] font-black uppercase opacity-30">Paid</p>
                    <p className="font-black text-xs" suppressHydrationWarning>Rp {data.total_paid.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black uppercase opacity-30">Grand Total</p>
                    <p className="font-black text-xs" suppressHydrationWarning>Rp {data.total.toLocaleString("id-ID")}</p>
                  </div>
                </div>
             </div>
          </div>

          {/* Customer Data Card */}
          <div className="card bg-base-100 border border-base-content/5 shadow-sm rounded-[2.5rem] p-8 space-y-6">
             <div className="flex items-center gap-3 border-b border-base-content/5 pb-4">
                <User className="text-primary" size={20} />
                <h2 className="font-black uppercase text-sm tracking-widest">Profil Pelanggan</h2>
             </div>
             <div className="space-y-4">
                <div>
                  <p className="text-[9px] font-black uppercase opacity-30 tracking-widest mb-1">Nama Member</p>
                  <p className="font-black text-lg uppercase tracking-tighter leading-none">{data.customer}</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-base-200/50 p-3 rounded-2xl">
                    <p className="text-[8px] font-black uppercase opacity-40 mb-1 tracking-widest">WhatsApp</p>
                    <p className="text-xs font-black italic">{data.phone}</p>
                  </div>
                  <div className="bg-base-200/50 p-3 rounded-2xl">
                    <p className="text-[8px] font-black uppercase opacity-40 mb-1 tracking-widest">Email</p>
                    <p className="text-xs font-black truncate">{data.email}</p>
                  </div>
                </div>
             </div>
             <button className="btn btn-ghost btn-block btn-sm rounded-xl uppercase font-black text-[9px] bg-base-200 hover:bg-primary hover:text-white transition-all tracking-widest">
               Buka CRM Customer
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}