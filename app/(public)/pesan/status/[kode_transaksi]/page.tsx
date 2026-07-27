"use client";

import { ArrowLeft, CheckCircle2, CircleDot, Clock, CreditCard, Package, Truck, XCircle, Copy } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, use } from "react";
import { getStatusPesanan, Pesanan } from "@/services/pesanService";

interface Props {params: Promise<{kode_transaksi: string}>}

type StepId =
  | "belum_lunas"
  | "menunggu_diproses"
  | "proses_pengerjaan"
  | "proses_pengantaran"
  | "selesai";

export default function StatusPesananPage({params}: Props) {
  const unwrappedParams = use(params);
  const kode_transaksi = unwrappedParams.kode_transaksi;
  const [pesanan, setPesanan] = useState<Pesanan | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedRekening, setCopiedRekening] = useState(false);
  const [copiedNominal, setCopiedNominal] = useState(false);

  useEffect(() => {
    if (!kode_transaksi) return;

    const loadData = async () => {
      const result = await getStatusPesanan(kode_transaksi);
      if (result.success && result.data) {
        setPesanan(result.data as Pesanan);
      }

      setLoading(false);
    };

    loadData();
  }, [kode_transaksi]);

  const steps = useMemo(
    () => [
      {
        id: "belum_lunas",
        label: "Menunggu Dibayar",
        icon: <CreditCard size={18} />,
      },
      {
        id: "proses_pengerjaan",
        label: "Proses Produksi",
        icon: <Package size={18} />,
      },
      {
        id: "proses_pengantaran",
        label: "Proses Pengiriman",
        icon: <Truck size={18} />,
      },
      {
        id: "selesai",
        label: "Diterima",
        icon: <CheckCircle2 size={18} />,
      },
    ],
    []
  );

  const bankName = process.env.NEXT_PUBLIC_BANK_NAME || "BCA";
  const bankNumber = process.env.NEXT_PUBLIC_BANK_NUMBER || "1234567890";
  const bankOwner = process.env.NEXT_PUBLIC_BANK_OWNER || "Bikin Cetak";

  const batasWaktuTransfer = useMemo(() => {
    if (!pesanan?.tanggal_pesan) return "";
    const tglPesan = new Date(pesanan.tanggal_pesan);
    tglPesan.setDate(tglPesan.getDate() + 3);
    return tglPesan.toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";
  }, [pesanan]);

  const handleCopyRekening = () => {
    navigator.clipboard.writeText(bankNumber);
    setCopiedRekening(true);
    setTimeout(() => setCopiedRekening(false), 2000);
  };

  const handleCopyNominal = (nominal: number) => {
    navigator.clipboard.writeText(nominal.toString());
    setCopiedNominal(true);
    setTimeout(() => setCopiedNominal(false), 2000);
  };

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
          <p className="font-black">Transaksi tidak ditemukan</p>
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
            <h1 className="text-2xl font-black uppercase">Transaksi Dibatalkan</h1>
            <p className="opacity-60 mt-2">Transaksi ini sudah dibatalkan.</p>
          </div>
        </div>
      </main>
    );
  }

  let currentStep: StepId = "belum_lunas";

  if (pesanan.status_pembayaran === "lunas" || pesanan.status_pembayaran === "dibayar_sebagian") {
    currentStep = pesanan.status_operasional as StepId;
  }

  let currentIndex = steps.findIndex((s) => s.id === currentStep);
  
  if (currentStep === "menunggu_diproses") {
    currentIndex = 1;
  }

  const total_tagihan = Number(pesanan.total_tagihan) || 0;
  const kodeUnikPesanan = Number(pesanan.kode_unik) || 0;

  return (
    <main className="min-h-screen bg-base-200 py-6 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/pesan" className="btn btn-ghost btn-sm">
            <ArrowLeft size={16} />
            Kembali
          </Link>

          <div className="text-right">
            <p className="text-[10px] uppercase opacity-50 font-bold">Kode Transaksi</p>
            <p className="font-black text-primary">{kode_transaksi}</p>
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
                    <div key={step.id} className="z-10 flex flex-col items-center w-1/4">
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

        {currentStep === "belum_lunas" && (
          <div className="bg-base-100 rounded-2xl p-6 border-2 border-warning/30 shadow-md mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-base-200 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-black uppercase text-warning tracking-wider flex items-center gap-2">
                  ⚠️ Segera Selesaikan Pembayaran
                </h3>
                <p className="text-xs opacity-65 mt-1">Transfer tepat hingga <strong className="text-base-content font-black">3 digit terakhir</strong> agar otomatis terverifikasi.</p>
              </div>
              <div className="bg-warning/10 text-warning px-4 py-2 rounded-xl text-center md:text-right border border-warning/20">
                <p className="text-[9px] font-black uppercase tracking-tight opacity-60">Batas Waktu Transfer</p>
                <p className="text-xs font-black">{batasWaktuTransfer}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-base-200/50 p-4 rounded-xl border border-base-content/5">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase opacity-40">Bank Tujuan</span>
                <span className="text-lg font-black text-base-content uppercase mt-0.5">{bankName}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase opacity-40">Nomor Rekening</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-lg font-black text-primary tracking-wider">{bankNumber}</span>
                  <button 
                    onClick={handleCopyRekening} 
                    className="btn btn-ghost btn-xs btn-circle text-primary tooltip tooltip-bottom" 
                    data-tip={copiedRekening ? "Tersalin!" : "Salin No. Rek"}
                  >
                    <Copy size={14} className={copiedRekening ? "text-success" : ""} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase opacity-40">Nama Pemilik</span>
                <span className="text-sm font-bold text-base-content mt-1">{bankOwner}</span>
              </div>
            </div>

            <div className="mt-4 bg-warning/5 border border-warning/20 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <span className="text-[10px] font-black uppercase opacity-60">Total Harus Ditransfer</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-black text-warning">Rp {total_tagihan.toLocaleString("id-ID")}</span>
                  <button 
                    onClick={() => handleCopyNominal(total_tagihan)} 
                    className="btn btn-ghost btn-xs btn-circle text-warning tooltip tooltip-top" 
                    data-tip={copiedNominal ? "Tersalin!" : "Salin Nominal"}
                  >
                    <Copy size={14} className={copiedNominal ? "text-success" : ""} />
                  </button>
                </div>
              </div>
              
              <div className="text-right text-xs font-bold opacity-70 bg-base-100 p-3 rounded-lg border border-base-content/5 w-full md:w-auto">
                <div className="flex justify-between gap-6 mb-1">
                  <span>Subtotal Tagihan:</span>
                  <span>Rp {(total_tagihan - kodeUnikPesanan).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between gap-6 text-warning">
                  <span>Kode Unik:</span>
                  <span>+ Rp {kodeUnikPesanan.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>
          </div>
        )}

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
              Rp {total_tagihan.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
        <div className="mt-8">
          <Link href={`/pesan/${kode_transaksi}`} className="btn btn-primary btn-block h-14 rounded-2xl font-black uppercase">
            Lihat Detail Transaksi
          </Link>
        </div>
      </div>
    </main>
  );
}