"use client";

import { ArrowLeft, CheckCircle2, CircleDot, Clock, CreditCard, Package, ShoppingBag, Truck, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getPesananById, Pesanan } from "@/services/pesanService";

interface Props {params: Promise<{id_pesan: string}>}

type StepId =
  | "belum_lunas"
  | "menunggu_diproses"
  | "proses_pengerjaan"
  | "proses_pengantaran"
  | "selesai";

export default function StatusPesananPage({params}: Props) {
  const [pesanan, setPesanan] = useState<Pesanan | null>(null);
  const [loading, setLoading] = useState(true);
  const [idPesan, setIdPesan] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const { id_pesan } = await params;
      setIdPesan(id_pesan);

      const result = await getPesananById(id_pesan);
      if (result.success && result.data) {
        setPesanan(result.data as Pesanan);
      }

      setLoading(false);
    };

    loadData();
  }, [params]);

  const steps = useMemo(
    () => [
      {
        id: "belum_lunas",
        label: "Menunggu Bayar",
        icon: (
          <CreditCard size={18} />
        ),
      },
      {
        id: "menunggu_diproses",
        label: "Dibayar",
        icon: (
          <CheckCircle2 size={18} />
        ),
      },
      {
        id: "proses_pengerjaan",
        label: "Diproses",
        icon: (
          <Package size={18} />
        ),
      },
      {
        id: "proses_pengantaran",
        label: "Dikirim",
        icon: (
          <Truck size={18} />
        ),
      },
      {
        id: "selesai",
        label: "Selesai",
        icon: (
          <ShoppingBag size={18} />
        ),
      },
    ],
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!pesanan) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <p className="font-black">Pesanan tidak ditemukan</p>
        </div>
      </div>
    );
  }

  if (pesanan.status_operasional === "batal") {
    return (
      <main className="min-h-screen bg-base-200 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-base-100 rounded-3xl p-10 text-center border border-base-content/5">
            <XCircle size={64} className="mx-auto text-error mb-4"/>
            <h1 className="text-2xl font-black uppercase">Pesanan Dibatalkan</h1>
            <p className="opacity-60 mt-2">Pesanan ini sudah dibatalkan.</p>
          </div>
        </div>
      </main>
    );
  }

  let currentStep: StepId = "belum_lunas";

  if (pesanan.status_pembayaran === "lunas" || pesanan.status_pembayaran === "dibayar_sebagian") {
    currentStep = pesanan.status_operasional as StepId;
  }

  const currentIndex =steps.findIndex((s) => s.id === currentStep);

  const hitungTotalTagihan = (psn: Pesanan) => {
    const subTotal = psn.pesanan_item?.reduce((sum, item) => {
        const finishingTotal = item.pesanan_item_finishing?.reduce((acc, fin) => acc + (Number(fin.harga_finishing_snapshot) || 0), 0) ?? 0;
        const sla = Number(item.harga_pengerjaan_snapshot) || 0;
        const qty = Number(item.jumlah) || 1;
        const hargaIncludeFinishing = Number(item.harga_satuan_snapshot) || 0;
        
        return sum + ((hargaIncludeFinishing + finishingTotal) * qty) + sla;
    }, 0) ?? 0;

    const ongkir = Number(psn.harga_ongkir) || 0;
    const diskonVoucher = Number(psn.diskon_voucher_nominal) || 0;
    const grandTotal = (subTotal + ongkir) - diskonVoucher;
    return grandTotal > 0 ? grandTotal : 0;
  };

  const totalBill = hitungTotalTagihan(pesanan);

  return (
    <main className="min-h-screen bg-base-200 py-6 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/pesan" className="btn btn-ghost btn-sm">
            <ArrowLeft size={16} />
            Kembali
          </Link>

          <div className="text-right">
            <p className="text-[10px] uppercase opacity-50 font-bold">ID Pesanan</p>
            <p className="font-black text-primary">{idPesan}</p>
          </div>
        </div>

        <div className="bg-base-100 rounded-2xl overflow-hidden border border-base-content/5 mb-6">
          <div className="bg-primary text-primary-content p-8">
            <h1 className="text-2xl font-black uppercase">Status Pesanan</h1>
            <p className="text-sm opacity-80 mt-2">Pantau perkembangan pesananmu secara realtime.</p>
          </div>

          <div className="p-8">
            <div className="relative flex justify-between">
              <div className="absolute top-5 left-0 h-1 w-full bg-base-200"></div>
              <div
                className="absolute top-5 left-0 h-1 bg-primary transition-all"
                style={{width: `${(currentIndex / (steps.length - 1)) * 100}%`}}
              />

              {steps.map(
                (step, index) => {
                  const active = index <= currentIndex;
                  const current = index === currentIndex;
                  return (
                    <div key={step.id} className="z-10 flex flex-col items-center w-1/5">
                      <div
                        className={`
                        w-11 h-11 rounded-full flex items-center justify-center
                        border-4 border-base-100
                        ${active ? "bg-primary text-white" : "bg-base-200"}
                        ${current ? "ring-4 ring-primary/20" : ""}
                      `}
                      >
                        {current ? (<CircleDot />) : (step.icon)}
                      </div>

                      <p
                        className={`
                        text-[10px] text-center mt-3 font-black uppercase
                        ${active ? "text-primary" : "opacity-40"}
                      `}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-base-100 rounded-2xl p-6 border border-base-content/5">
            <div className="flex items-center gap-2 mb-3 opacity-50">
              <Clock size={16} />
              <span className="text-[10px] font-black uppercase">Tanggal Pesan</span>
            </div>

            <p className="font-bold">
              {new Date(pesanan.tanggal_pesan).toLocaleString("id-ID")}
            </p>
          </div>

          <div className="bg-base-100 rounded-2xl p-6 border border-base-content/5">
            <div className="flex items-center gap-2 mb-3 opacity-50">
              <CreditCard size={16} />
              <span className="text-[10px] font-black uppercase">Total Tagihan</span>
            </div>

            <p className="text-2xl font-black text-primary">
              Rp {totalBill.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
        <div className="mt-8">
          <Link href={`/pesan/${idPesan}`} className="btn btn-primary btn-block h-14 rounded-2xl font-black uppercase">
            Lihat Detail Pesanan
          </Link>
        </div>
      </div>
    </main>
  );
}