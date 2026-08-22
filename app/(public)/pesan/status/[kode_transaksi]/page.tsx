/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowLeft, CheckCircle2, CircleDot, Clock, CreditCard, Package, Truck, XCircle, Copy, Wallet, Coins } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, use } from "react";
import { getStatusPesanan, getQrisData, Pesanan, CustomAttributeValue, QrisData } from "@/services/pesanService";
import { QRCodeSVG } from "qrcode.react";

interface Props { params: Promise<{ kode_transaksi: string }> }

type StepId =
  | "belum_lunas"
  | "menunggu_diproses"
  | "proses_pengerjaan"
  | "proses_pengantaran"
  | "selesai";

export default function StatusPesananPage({ params }: Props) {
  const unwrappedParams = use(params);
  const kode_transaksi = unwrappedParams.kode_transaksi;
  
  const [pesanan, setPesanan] = useState<Pesanan | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedNominal, setCopiedNominal] = useState(false);

  const [qrisData, setQrisData] = useState<QrisData | null>(null);
  const [loadingQris, setLoadingQris] = useState(false);

  // State untuk Kasir (Opsi Pembayaran)
  const [opsiBayar, setOpsiBayar] = useState<"lunas" | "dp" | null>(null);
  const [nominalDp, setNominalDp] = useState<string>("");
  const [errorDp, setErrorDp] = useState<string>("");

  const loadData = async () => {
    if (!kode_transaksi) return;
    const result = await getStatusPesanan(kode_transaksi);
    if (result.success && result.data) {
      setPesanan(result.data as Pesanan);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [kode_transaksi]);

  useEffect(() => {
    // Polling hanya berjalan jika statusnya belum_lunas atau dibayar_sebagian (kalau masih ada tagihan sisa)
    if (!pesanan || (pesanan.status_pembayaran === 'lunas')) {
        return;
    }
    const interval = setInterval(() => {
        loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, [pesanan?.status_pembayaran, kode_transaksi]);

  // ==========================================
  // KALKULASI HARGA MURNI
  // ==========================================
  const total_tagihan_akurat = useMemo(() => {
    if (!pesanan) return 0;
    let totalHargaMurniProduk = 0;
    let totalBiayaPengerjaan = 0;

    pesanan.pesanan_item?.forEach((item) => {
      let hargaDasar = Number(item.harga_satuan_snapshot) || 0;
      let jumlahHalaman = 1;
      let atribut: Record<string, CustomAttributeValue> = {};

      if (item.atribut_custom_snapshot) {
        if (typeof item.atribut_custom_snapshot === "string") {
          try { atribut = JSON.parse(item.atribut_custom_snapshot); } catch (e) { console.error(e); }
        } else {
          atribut = item.atribut_custom_snapshot as Record<string, CustomAttributeValue>;
        }
        if (atribut && atribut["Jumlah Halaman"] !== undefined) {
          const val = parseInt(String(atribut["Jumlah Halaman"]), 10);
          if (!isNaN(val) && val > 0) jumlahHalaman = val;
        }
      }

      let multiplierLuas = 1;
      if (atribut && atribut["Luas Dihargai (m2)"] !== undefined) {
        multiplierLuas = parseFloat(String(atribut["Luas Dihargai (m2)"]));
        if (isNaN(multiplierLuas) || multiplierLuas < 1) multiplierLuas = 1;
      }

      let sisi = 1;
      item.pesanan_item_finishing?.forEach((fin) => {
        const label = (fin.nama_finishing_snapshot || "").toLowerCase();
        if (label.includes("2 sisi") || label.includes("dua sisi") || label.includes("bolak")) sisi = 2;
      });

      if (jumlahHalaman > 1) {
        hargaDasar += (jumlahHalaman - 1) * sisi * 1500;
      }

      const finishingTotal = item.pesanan_item_finishing?.reduce((acc, fin) => acc + (Number(fin.harga_finishing_snapshot) || 0), 0) ?? 0;
      const subtotalItem = ((hargaDasar * multiplierLuas) + finishingTotal) * (Number(item.jumlah) || 1);

      totalHargaMurniProduk += subtotalItem;
      totalBiayaPengerjaan += Number(item.harga_pengerjaan_snapshot) || 0;
    });

    const ongkir = Number(pesanan.harga_ongkir || 0);
    const diskon = Number(pesanan.diskon_voucher_nominal || 0);
    const kodeUnik = Number(pesanan.kode_unik || 0);

    return totalHargaMurniProduk + totalBiayaPengerjaan + ongkir - diskon + kodeUnik;
  }, [pesanan]);

  // Kalkulasi Sisa Tagihan (Berguna kalau sebelumnya udah bayar DP)
  const sisaTagihan = useMemo(() => {
    if (!pesanan) return 0;
    const dibayar = Number(pesanan.total_dibayar || 0);
    return Math.max(0, total_tagihan_akurat - dibayar);
  }, [pesanan, total_tagihan_akurat]);

  // ==========================================
  // FUNGSI GENERATE QRIS DINAMIS
  // ==========================================
  const handleGenerateQris = (nominal?: number) => {
    if (!pesanan?.id_pesan) return;
    setLoadingQris(true);
    setErrorDp("");
    
    getQrisData(pesanan.id_pesan, nominal).then((res) => {
      if (res.success && res.data) {
        setQrisData(res.data);
      } else {
        setErrorDp(res.error || "Gagal membuat QRIS. Silakan coba lagi.");
      }
      setLoadingQris(false);
    });
  };

  // 👇 INI USE-EFFECT YANG BENAR (SUDAH DI-MERGE) 👇
  useEffect(() => {
    // Kalau pesanan butuh dibayar DAN QRIS belum digenerate
    if (pesanan?.id_pesan && (pesanan.status_pembayaran === "belum_lunas" || pesanan.status_pembayaran === "dibayar_sebagian") && !qrisData && !loadingQris) {
      
      // Jika pesanan dari e-commerce (bukan kasir), langsung generate QRIS otomatis!
      if (pesanan.sumber_pesanan !== 'pos_kasir') {
        handleGenerateQris();
      }
      // Jika dari kasir, kita biarkan saja (jangan generate dulu) supaya opsi tampil.
    }
  }, [pesanan, qrisData]);

  // Handler untuk Submit Nominal DP dari Kasir
  // Handler untuk Submit Nominal DP dari Kasir
  const handleBayarDp = () => {
    const inputNominal = parseInt(nominalDp.replace(/\D/g, ""), 10);

    // Hapus aturan 50%, ganti dengan syarat minimal QRIS (Rp 1.000)
    if (isNaN(inputNominal) || inputNominal < 1000) {
      setErrorDp(`Minimal pembayaran QRIS adalah Rp 1.000`);
      return;
    }
    
    if (inputNominal > sisaTagihan) {
      setErrorDp(`Maksimal bayar adalah sisa tagihan (Rp ${sisaTagihan.toLocaleString("id-ID")})`);
      return;
    }

    handleGenerateQris(inputNominal);
  };


  const steps = useMemo(
    () => [
      { id: "belum_lunas", label: "Menunggu Dibayar", icon: <CreditCard size={18} /> },
      { id: "proses_pengerjaan", label: "Proses Produksi", icon: <Package size={18} /> },
      { id: "proses_pengantaran", label: "Proses Pengiriman", icon: <Truck size={18} /> },
      { id: "selesai", label: "Diterima", icon: <CheckCircle2 size={18} /> },
    ],
    []
  );

  const batasWaktuTransfer = useMemo(() => {
    if (!pesanan?.tanggal_pesan) return "";
    const tglPesan = new Date(pesanan.tanggal_pesan);
    tglPesan.setDate(tglPesan.getDate() + 3);
    return tglPesan.toLocaleString("id-ID", {
      weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    }) + " WIB";
  }, [pesanan]);

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
            <XCircle size={64} className="mx-auto text-error mb-4" />
            <h1 className="text-2xl font-black uppercase">Transaksi Dibatalkan</h1>
            <p className="opacity-60 mt-2">Transaksi ini sudah dibatalkan oleh sistem atau admin.</p>
          </div>
        </div>
      </main>
    );
  }

  let currentStep: StepId = "belum_lunas";
  // Menyesuaikan step jika statusnya lunas ATAU pembayaran dp namun operasional jalan
  if (pesanan.status_pembayaran === "lunas" || (pesanan.status_pembayaran === "dibayar_sebagian" && pesanan.status_operasional !== 'keranjang')) {
    currentStep = pesanan.status_operasional as StepId;
  }

  let currentIndex = steps.findIndex((s) => s.id === currentStep);
  if (currentStep === "menunggu_diproses") currentIndex = 1;

  const nomorResi = pesanan.nomor_resi;

  return (
    <main className="min-h-screen bg-base-200 py-6 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/pesan" className="btn btn-ghost btn-sm">
            <ArrowLeft size={16} /> Kembali
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
                style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
              />

              {steps.map((step, index) => {
                const active = index <= currentIndex;
                const current = index === currentIndex;
                return (
                  <div key={step.id} className="z-10 flex flex-col items-center w-1/4">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center border-4 border-base-100 ${active ? "bg-primary text-white" : "bg-base-200"} ${current ? "ring-4 ring-primary/20" : ""}`}>
                      {current ? (<CircleDot />) : (step.icon)}
                    </div>
                    <p className={`text-[10px] text-center mt-3 font-black uppercase ${active ? "text-primary" : "opacity-40"}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 👇 BLOK PEMBAYARAN QRIS 👇 */}
        {/* Tampilkan box ini JIKA status masih belum lunas ATAU masih dibayar_sebagian (ada sisa tagihan) */}
        {(pesanan.status_pembayaran === "belum_lunas" || pesanan.status_pembayaran === "dibayar_sebagian") && (
          <div className="bg-base-100 rounded-3xl p-6 md:p-10 border-2 border-primary/30 shadow-xl mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-black uppercase text-primary tracking-tighter">
                Bayar dengan QRIS {pesanan.sumber_pesanan}
              </h3>
              <p className="text-sm opacity-70 mt-2 max-w-md mx-auto">
                Scan QR Code di bawah ini menggunakan aplikasi M-Banking atau E-Wallet Anda (Gopay, OVO, Dana, ShopeePay, BCA Mobile, dll).
              </p>
              
              {/* Notif jika statusnya DP */}
              {pesanan.status_pembayaran === 'dibayar_sebagian' && (
                <div className="badge badge-warning mt-4 font-bold p-3">Sisa Tagihan: Rp {sisaTagihan.toLocaleString("id-ID")}</div>
              )}
            </div>

            {/* LOGIKA JIKA SUMBER PESANAN DARI KASIR & QR BELUM DIGENERATE */}
            {pesanan.sumber_pesanan === 'pos_kasir' && !qrisData && !loadingQris && (
              <div className="max-w-sm mx-auto mb-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => { setOpsiBayar('lunas'); setErrorDp(""); }}
                    className={`btn h-auto py-4 flex flex-col items-center gap-2 ${opsiBayar === 'lunas' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    <Wallet size={24} />
                    <span>Bayar Lunas</span>
                  </button>
                  <button 
                    onClick={() => { setOpsiBayar('dp'); setErrorDp(""); }}
                    // Disable opsi DP kalau statusnya emang udah DP (dibayar_sebagian) biar gak dobel DP
                    disabled={pesanan.status_pembayaran === 'dibayar_sebagian'}
                    className={`btn h-auto py-4 flex flex-col items-center gap-2 ${opsiBayar === 'dp' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    <Coins size={24} />
                    <span>Bayar Sebagian (DP)</span>
                  </button>
                </div>

                {opsiBayar === 'lunas' && (
                  <button onClick={() => handleGenerateQris(sisaTagihan)} className="btn btn-primary btn-block mt-4">
                    Tampilkan QRIS Lunas (Rp {sisaTagihan.toLocaleString("id-ID")})
                  </button>
                )}

                {opsiBayar === 'dp' && (
                  <div className="mt-4 p-4 bg-base-200 rounded-xl space-y-4">
                    <div>
                      <label className="label"><span className="label-text font-bold">Masukkan Nominal DP</span></label>
                      <input 
                        type="text" 
                        className="input input-bordered w-full font-black text-lg text-primary" 
                        placeholder="Rp 0"
                        value={nominalDp ? `Rp ${parseInt(nominalDp.replace(/\D/g, "") || "0", 10).toLocaleString("id-ID")}` : ""}
                        onChange={(e) => setNominalDp(e.target.value)}
                      />
                      {errorDp && <span className="label-text-alt text-error font-semibold mt-2 block">{errorDp}</span>}
                    </div>
                    <button onClick={handleBayarDp} className="btn btn-primary btn-block">
                      Tampilkan QRIS DP
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* AREA RENDER QRIS BILA SUDAH DIGENERATE ATAU SEDANG LOADING */}
            {(qrisData || loadingQris) && (
              <div className="flex flex-col items-center justify-center bg-base-200/50 p-8 rounded-3xl border border-base-content/5 mb-8 max-w-sm mx-auto relative">
                
                {/* Tombol Batal/Ubah Opsi (Khusus Kasir) */}
                {pesanan.sumber_pesanan === 'pos_kasir' && !loadingQris && (
                  <button 
                    onClick={() => { setQrisData(null); setOpsiBayar(null); setNominalDp(""); }}
                    className="absolute top-4 right-4 btn btn-xs btn-ghost text-error"
                  >
                    Ubah Nominal
                  </button>
                )}

                {loadingQris ? (
                  <div className="w-48 h-48 flex flex-col items-center justify-center gap-4">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <span className="text-xs font-bold opacity-50 uppercase tracking-widest">Menyiapkan QRIS...</span>
                  </div>
                ) : qrisData?.qr_string ? (
                  <div className="bg-white p-4 rounded-2xl shadow-sm hover:scale-105 transition-transform duration-300 cursor-pointer">
                    <QRCodeSVG value={qrisData.qr_string} size={220} />
                  </div>
                ) : qrisData?.qr_url ? (
                  <div className="bg-white p-4 rounded-2xl shadow-sm hover:scale-105 transition-transform duration-300 cursor-pointer">
                    <img src={qrisData.qr_url} alt="QRIS" className="w-55 h-55 object-contain" />
                  </div>
                ) : (
                  <div className="w-48 h-48 flex flex-col items-center justify-center text-center">
                    <XCircle size={32} className="text-error mb-2" />
                    <p className="text-xs font-bold text-error">{errorDp || "Gagal memuat QRIS"}</p>
                    <button onClick={() => window.location.reload()} className="btn btn-xs btn-outline mt-2">Muat Ulang Halaman</button>
                  </div>
                )}

                <div className="mt-8 text-center w-full">
                  <span className="text-[10px] font-black uppercase opacity-50 tracking-widest">
                    {pesanan.sumber_pesanan === 'kasir' && opsiBayar === 'dp' ? 'Nominal DP' : 'Tagihan Pembayaran'}
                  </span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <p className="text-4xl font-black text-primary">
                      Rp {(qrisData?.amount || sisaTagihan).toLocaleString("id-ID")}
                    </p>
                    <button 
                      onClick={() => handleCopyNominal(qrisData?.amount || sisaTagihan)} 
                      className="btn btn-ghost btn-sm btn-circle text-primary tooltip tooltip-top" 
                      data-tip={copiedNominal ? "Tersalin!" : "Salin Nominal"}
                    >
                      <Copy size={16} className={copiedNominal ? "text-success" : ""} />
                    </button>
                  </div>
                  <p className="text-[10px] font-bold opacity-50 mt-3 text-warning">
                    *Batas Pembayaran: {batasWaktuTransfer}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-primary/10 text-primary p-5 rounded-2xl text-center border border-primary/20">
              <p className="text-xs font-bold leading-relaxed">
                ✅ Pembayaran Anda akan diverifikasi secara <strong>Otomatis</strong> oleh sistem dalam hitungan detik setelah Anda berhasil scan dan bayar. Tidak perlu mengirimkan bukti transfer!
              </p>
            </div>
          </div>
        )}

        {/* ... (Blok Tanggal Pesan & Total Tagihan) ... */}
        <div className={`grid gap-4 ${nomorResi ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
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
              Rp {total_tagihan_akurat.toLocaleString("id-ID")}
            </p>
            {/* Tampilkan informasi telah dibayar jika statusnya DP */}
            {pesanan.total_dibayar && pesanan.total_dibayar > 0 && pesanan.status_pembayaran !== 'lunas' && (
              <p className="text-xs font-bold text-success mt-1">Telah Dibayar: Rp {Number(pesanan.total_dibayar).toLocaleString("id-ID")}</p>
            )}
          </div>

          {nomorResi && (
            <div className="bg-base-100 rounded-2xl p-6 border border-base-content/5">
              <div className="flex items-center gap-2 mb-3 opacity-50">
                <Truck size={16} />
                <span className="text-[10px] font-black uppercase">Nomor Resi</span>
              </div>
              <p className="text-lg font-black text-primary select-all tracking-wider truncate">
                {nomorResi}
              </p>
              {pesanan.ekspedisi_nama && (
                <p className="text-[9px] uppercase font-bold opacity-50 mt-1 line-clamp-1">
                  {pesanan.ekspedisi_nama} {pesanan.ekspedisi_layanan ? `- ${pesanan.ekspedisi_layanan}` : ''}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-8">
          <Link href={`/pesan/${kode_transaksi}`} className="btn btn-primary btn-block h-14 rounded-2xl font-black uppercase shadow-lg shadow-primary/20">
            Lihat Detail Transaksi
          </Link>
        </div>
      </div>
    </main>
  );
}