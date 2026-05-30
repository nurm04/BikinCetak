"use client";

import { useState } from "react";
import { Banknote, ArrowLeft, CheckCircle, Wallet, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderPaymentProps {
  order: {
    id: string;
    customer: string;
    total: number;
    total_paid: number;
    product: string;
  };
}

export default function PaymentFormClient({ order }: OrderPaymentProps) {
  const router = useRouter();
  const outstanding = order.total - order.total_paid;
  const [payAmount, setPayAmount] = useState(outstanding);
  const [method, setMethod] = useState("Cash");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Pembayaran Rp ${payAmount.toLocaleString()} berhasil dicatat!`);
    router.push("/dashboard/orders");
  };

  return (
    <div className="space-y-6">
      <button 
        onClick={() => router.back()}
        className="btn btn-ghost btn-sm gap-2 uppercase font-black text-[10px] opacity-50 hover:opacity-100"
      >
        <ArrowLeft size={14} /> Kembali
      </button>

      <div className="card bg-base-100 border border-base-content/5 shadow-xl rounded-[2.5rem] overflow-hidden">
        <div className="p-8 bg-primary text-primary-content relative overflow-hidden">
          <Banknote className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Payment Entry</p>
          <h2 className="text-3xl font-black italic tracking-tighter mt-1">{order.id}</h2>
          <p className="text-xs font-bold mt-4 opacity-90 uppercase">{order.customer} • {order.product}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Ringkasan Tagihan */}
          <div className="flex justify-between items-center p-6 bg-base-200/50 rounded-3xl">
            <div>
              <p className="text-[10px] font-black uppercase opacity-40">Sisa Tagihan</p>
              <p className="text-2xl font-black" suppressHydrationWarning>
                Rp {outstanding.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase opacity-40">Total Order</p>
              <p className="font-bold opacity-60 italic">Rp {order.total.toLocaleString("id-ID")}</p>
            </div>
          </div>

          {/* Input Nominal */}
          <div className="form-control w-full">
            <label className="label uppercase font-black text-[10px] opacity-50 tracking-widest">Nominal Bayar Sekarang</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-xl opacity-20">Rp</span>
              <input 
                type="number" 
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="input input-bordered w-full pl-16 py-8 rounded-lg text-2xl font-black bg-base-200/30 border-none focus:ring-2 ring-primary"
                max={outstanding}
                required
              />
            </div>
          </div>

          {/* Pilih Metode */}
          <div className="space-y-3">
            <label className="label uppercase font-black text-[10px] opacity-50 tracking-widest">Metode Pembayaran</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setMethod("Cash")}
                className={`btn h-20 rounded-3xl border-2 flex flex-col gap-1 transition-all ${method === 'Cash' ? 'border-primary bg-primary/5' : 'border-base-content/5 bg-transparent'}`}
              >
                <Wallet size={20} />
                <span className="font-black text-[10px] uppercase">Tunai / Cash</span>
              </button>
              <button 
                type="button"
                onClick={() => setMethod("Transfer")}
                className={`btn h-20 rounded-3xl border-2 flex flex-col gap-1 transition-all ${method === 'Transfer' ? 'border-primary bg-primary/5' : 'border-base-content/5 bg-transparent'}`}
              >
                <CreditCard size={20} />
                <span className="font-black text-[10px] uppercase">Bank Transfer</span>
              </button>
            </div>
          </div>

          {/* Tombol Submit */}
          <button className="btn btn-primary btn-block h-16 rounded-lg font-black uppercase tracking-widest gap-3 shadow-lg shadow-primary/30">
            <CheckCircle size={20} /> Konfirmasi Pembayaran
          </button>
        </form>
      </div>
    </div>
  );
}