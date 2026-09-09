/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, MapPin, ShoppingBag, Loader2, ArrowLeft, Home, Truck, Ticket, ChevronRight, X, Search } from "lucide-react";
import { getAlamat, Alamat } from "@/services/alamatService";
import Link from "next/link";
import CartProductItem from "@/components/shared/CardProductItem";
import AlertPopup from "@/components/ui/AlertPopup";
import UbahAlamat from "./UbahAlamat";
// 👇 IMPORT CourierOption DARI cartService
import { checkoutCart, CheckoutPayload, getShippingCost, RincianDiskonAPI, CustomAttributeValue, CourierOption } from "@/services/cartService";
import { cekVoucher, getVouchers, Voucher } from "@/services/voucherService";

interface CheckoutItem {
  id: number;
  nama_sku: string;
  harga_satuan: number;
  jumlah: number;
  gambar_url: string | null;
  
  id_sku?: string;

  harga_dasar_awal_snapshot?: number;
  total_diskon_snapshot?: number;
  rincian_diskon_snapshot?: RincianDiskonAPI[];
  estimasi_pengerjaan?: string;
  harga_pengerjaan_snapshot?: number;
  catatan?: string | null;

  atribut_custom_snapshot?: Record<string, CustomAttributeValue> | string | null;

  finishing: {
    id: number;
    nama_finishing: string;
    harga_tambahan: number;
    kali_jumlah_pesan?: number | boolean;
  }[];
}

interface PopupState {
  isOpen: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

export default function PesanClient() {
  const router = useRouter();
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [alamatUtama, setAlamatUtama] = useState<Alamat | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isMounting, setIsMounting] = useState<boolean>(true);
  const [alamatList, setAlamatList] = useState<Alamat[]>([]);
  const [showAlamatModal, setShowAlamatModal] = useState(false);
  const [couriers, setCouriers] = useState<CourierOption[]>([]);
  const [loadingOngkir, setLoadingOngkir] = useState(false);
  const [ongkirError, setOngkirError] = useState<string | null>(null);
  
  const [selectedShipping, setSelectedShipping] = useState<{
    courier_code: string;
    courier_name: string;
    service: string;
    cost: number;
    etd: string;
  } | null>(null);

  // VOUCHER STATES (Shopee Style)
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [manualVoucherCode, setManualVoucherCode] = useState("");
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  
  const [appliedVoucher, setAppliedVoucher] = useState<{
    kode_voucher: string;
    nominal_diskon: number;
    nama_promo: string;
  } | null>(null);

  const [popup, setPopup] = useState<PopupState>({
    isOpen: false, title: "", message: "", type: "info"
  });

  const loadInitialData = useCallback(() => {
    const savedData = localStorage.getItem("checkout_items");
    if (!savedData) {
      router.push("/cart");
      return;
    }
    try {
      const parsed: CheckoutItem[] = JSON.parse(savedData);
      setItems(parsed);
    } catch {
      router.push("/cart");
    } finally {
      setIsMounting(false);
    }
  }, [router]);

  const loadAlamatUtama = useCallback(async () => {
    try {
      const result = await getAlamat();
      if (result.success && Array.isArray(result.data)) {
        const data = result.data as Alamat[];
        setAlamatList(data);
        const alamatDefault = data.find((item) => item.is_default) || data[0] || null;
        if (alamatDefault) {
          setAlamatUtama(alamatDefault);
          return;
        }
      }
      setPopup({
        isOpen: true, title: "Alamat Kosong", message: "Silakan tambahkan alamat terlebih dahulu sebelum checkout.", type: "warning",
      });
    } catch {
      setPopup({ isOpen: true, title: "Gagal", message: "Gagal mengambil alamat.", type: "error" });
    }
  }, []);

  const loadVouchersList = useCallback(async () => {
    try {
      const res = await getVouchers();
      if (res.success && res.data) {
        setAvailableVouchers(res.data);
      }
    } catch (err) {
      console.error("Gagal load voucher", err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
    loadAlamatUtama();
    loadVouchersList();
  }, [loadInitialData, loadAlamatUtama, loadVouchersList]);

  // ONGKIR LOGIC...
  useEffect(() => {
    if (!alamatUtama) return;

    const fetchOngkir = async () => {
      setLoadingOngkir(true);
      setSelectedShipping(null);
      setOngkirError(null);
      setCouriers([]);

      const manualPickup: CourierOption = {
        code: "toko",
        name: "Ambil di Toko",
        logo_url: "",
        costs: [{ service: "Ambil Sendiri", description: "Ambil pesanan langsung di toko kami", cost: 0, etd: "0" }]
      };

      const requestCargo: CourierOption = {
        code: "cargo",
        name: "Request Expedisi Cargo",
        logo_url: "",
        costs: [{ service: "Cargo / Custom", description: "Pembayaran ongkir bisa tujuan / transfer belakangan", cost: 0, etd: "Menyesuaikan" }]
      };
      
      try {
        const result = await getShippingCost(alamatUtama.id_alamat);
        
        if (result.error) {
          setOngkirError(result.error);
          setCouriers([manualPickup, requestCargo]);
          return;
        }

        // Karena hasil udah dirapikan sama cartService.ts, kita tinggal pake data-nya
        const apiCouriers = (result.data as CourierOption[]) || [];
        const finalCouriers = [manualPickup, requestCargo, ...apiCouriers];

        if (finalCouriers.length === 2) {
            setOngkirError("Tidak ada layanan pengiriman otomatis ke alamat ini. Anda masih bisa menggunakan opsi manual.");
        } 
        setCouriers(finalCouriers);
      } catch (error) {
        setOngkirError("Terjadi kesalahan sistem saat mengambil tarif logistik.");
        setCouriers([manualPickup, requestCargo]);
      } finally {
        setLoadingOngkir(false);
      }
    };
    fetchOngkir();
  }, [alamatUtama]);

  const hitungRowTotal = (item: CheckoutItem) => {
    let hargaDasar = item.harga_satuan || 0;
    let atribut: Record<string, CustomAttributeValue> = {};
    if (item.atribut_custom_snapshot) {
      if (typeof item.atribut_custom_snapshot === "string") {
        try { atribut = JSON.parse(item.atribut_custom_snapshot) as Record<string, CustomAttributeValue>; } catch (e) {}
      } else {
        atribut = item.atribut_custom_snapshot;
      }
    }

    let sisi = 1;
    item.finishing.forEach((fin) => {
      const label = fin.nama_finishing.toLowerCase();
      if (label.includes("2 sisi") || label.includes("dua sisi") || label.includes("bolak")) sisi = 2;
    });

    let jumlahHalaman = 1;
    if (atribut["Jumlah Halaman"]) {
      const val = parseInt(String(atribut["Jumlah Halaman"]), 10);
      if (!isNaN(val) && val > 0) jumlahHalaman = val;
    }
    if (jumlahHalaman > 1) hargaDasar += (jumlahHalaman - 1) * sisi * 1500;

    let multiplierLuas = 1;
    if (atribut["Luas Dihargai (m2)"] !== undefined) {
        multiplierLuas = parseFloat(String(atribut["Luas Dihargai (m2)"]));
        if (isNaN(multiplierLuas) || multiplierLuas < 1) multiplierLuas = 1;
    }

    let subtotalItem = (hargaDasar * multiplierLuas) * item.jumlah;

    item.finishing.forEach((fin) => {
      const isKaliQty = fin.kali_jumlah_pesan === true || fin.kali_jumlah_pesan === 1;
      const val = fin.harga_tambahan || 0;
      subtotalItem += isKaliQty ? (val * item.jumlah) : val;
    });

    return subtotalItem + (item.harga_pengerjaan_snapshot || 0);
  };

  const subTotal = items.reduce((acc, item) => acc + hitungRowTotal(item), 0);

  // LOGIKA KELAYAKAN VOUCHER
  const getVoucherEligibility = useCallback((v: Voucher) => {
    let subtotalTarget = 0;
    let isTargetFound = false;

    if (v.tipe_target === 'semua_pesanan') {
        subtotalTarget = subTotal;
        isTargetFound = items.length > 0;
    } else if (v.tipe_target === 'produk_tertentu') {
        const itemsTarget = items.filter(i => {
            const textSumber = i.id_sku || i.nama_sku || "";
            const match = textSumber.match(/PRD-\d+/);
            const idProduk = match ? match[0] : "";
            
            return idProduk === v.id_produk_target;
        });
        subtotalTarget = itemsTarget.reduce((total, item) => total + hitungRowTotal(item), 0);
        isTargetFound = itemsTarget.length > 0;
    } else if (v.tipe_target === 'sku_tertentu') {
        const itemsTarget = items.filter(i => {
             const textSumber = i.id_sku || i.nama_sku || "";
             return textSumber.includes(v.id_sku_target || "XXX");
        });
        subtotalTarget = itemsTarget.reduce((total, item) => total + hitungRowTotal(item), 0);
        isTargetFound = itemsTarget.length > 0;
    }

    if (!isTargetFound || subtotalTarget === 0) {
        return { eligible: false, reason: "Produk tidak sesuai", subtotalTarget: 0, hide: true };
    }

    if (subtotalTarget < Number(v.minimal_transaksi_rupiah)) {
        return { eligible: false, reason: `Min. belanja Rp ${Number(v.minimal_transaksi_rupiah).toLocaleString("id-ID")}`, subtotalTarget, hide: false };
    }

    return { eligible: true, reason: "", subtotalTarget, hide: false };
  }, [items, subTotal]);

  const vouchersWithStatus = useMemo(() => {
    return availableVouchers.map(v => ({
       ...v,
       ...getVoucherEligibility(v)
    }));
  }, [availableVouchers, getVoucherEligibility]);

  const eligibleVouchers = vouchersWithStatus.filter(v => v.eligible && !v.hide);
  const ineligibleVouchers = vouchersWithStatus.filter(v => !v.eligible && !v.hide);

  const applySelectedVoucher = (v: Voucher & ReturnType<typeof getVoucherEligibility>) => {
      if (!v.eligible) return;

      const persen = Number(v.persentase_diskon);
      let kalkulasiDiskon = (v.subtotalTarget * persen) / 100;
      
      const maksPotongan = Number(v.maksimal_potongan_rupiah);
      if (maksPotongan > 0 && kalkulasiDiskon > maksPotongan) {
          kalkulasiDiskon = maksPotongan;
      }

      setAppliedVoucher({
          kode_voucher: v.kode_voucher,
          nama_promo: v.nama_promo,
          nominal_diskon: Math.round(kalkulasiDiskon)
      });
      setShowVoucherModal(false);
      setManualVoucherCode("");
      setPopup({ isOpen: true, title: "Voucher Terpasang", message: `Voucher ${v.kode_voucher} berhasil digunakan.`, type: "success" });
  };

  const handleManualInputVoucher = async () => {
      if (!manualVoucherCode.trim()) return;
      setIsApplyingVoucher(true);

      try {
          const localMatch = vouchersWithStatus.find(v => v.kode_voucher.toLowerCase() === manualVoucherCode.toLowerCase());
          
          if (localMatch) {
              if (localMatch.eligible) {
                  applySelectedVoucher(localMatch);
              } else {
                  setPopup({ isOpen: true, title: "Tidak Memenuhi Syarat", message: localMatch.reason, type: "warning" });
              }
              return;
          }

          const response = await cekVoucher(manualVoucherCode.trim());
          if (!response.success || !response.data) {
              setPopup({ isOpen: true, title: "Kode Salah", message: response.error || response.message || "Voucher tidak ditemukan.", type: "error" });
              return;
          }

          const apiVoucher = response.data;
          const status = getVoucherEligibility(apiVoucher);
          
          if (status.eligible) {
              applySelectedVoucher({ ...apiVoucher, ...status });
          } else {
              setPopup({ isOpen: true, title: "Tidak Memenuhi Syarat", message: status.reason, type: "warning" });
          }
      } catch (err) {
          setPopup({ isOpen: true, title: "Error", message: "Gagal memvalidasi kode voucher.", type: "error" });
      } finally {
          setIsApplyingVoucher(false);
      }
  };

  const diskonNominal = appliedVoucher?.nominal_diskon || 0;
  const rawTotalBill = subTotal + (selectedShipping?.cost || 0) - diskonNominal;
  const totalBill = rawTotalBill > 0 ? rawTotalBill : 0;

  const handleCheckout = async () => {
    if (!selectedShipping) {
        setPopup({ isOpen: true, title: "Peringatan", message: "Silakan pilih layanan pengiriman terlebih dahulu.", type: "warning" });
        return;
    }

    try {
      setLoading(true);
      const payload = {
        items: items.map(item => item.id),
        id_alamat: alamatUtama!.id_alamat,
        ekspedisi_nama: selectedShipping.courier_name,
        ekspedisi_layanan: selectedShipping.service,
        harga_ongkir: selectedShipping.cost,
        ekspedisi_estimasi: selectedShipping.etd,
        kode_voucher: appliedVoucher?.kode_voucher || null,
        diskon_voucher_nominal: appliedVoucher?.nominal_diskon || 0
      };

      const result = await checkoutCart(payload as CheckoutPayload);

      if (!result.success && !result.data) {
        setPopup({ isOpen: true, title: "Checkout Gagal", message: result.error || result.message || "Terjadi kesalahan.", type: "error" });
        return;
      }

      const kodeTransaksi = (result.data as {kode_transaksi: string})?.kode_transaksi;
      localStorage.removeItem("checkout_items");
      localStorage.removeItem("checkout_item_ids");
      router.push(`/pesan/status/${kodeTransaksi}`);

    } catch {
      setPopup({ isOpen: true, title: "Checkout Gagal", message: "Terjadi kesalahan saat melakukan checkout.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (isMounting) return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );

  return (
    <main className="min-h-screen bg-base-200 py-6 px-4 md:px-8 pb-48 lg:pb-8 relative">
      <AlertPopup 
        isOpen={popup.isOpen} title={popup.title} message={popup.message} type={popup.type}
        onCancel={() => setPopup(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          setPopup(prev => ({ ...prev, isOpen: false }));
          if (popup.title === "Alamat Kosong") router.push("/profil/edit");
        }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="breadcrumbs text-[10px] uppercase font-black opacity-40 tracking-widest">
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/cart">Keranjang</Link></li>
              <li>Checkout</li>
            </ul>
          </div>
          <Link href="/cart" className="btn btn-ghost btn-xs gap-2 uppercase font-bold opacity-60">
            <ArrowLeft size={14} /> Kembali ke Keranjang
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            
            {/* LOKASI PENGIRIMAN */}
            <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-content/5">
              <div className="flex items-center gap-3 mb-6 border-b border-base-content/5 pb-4">
                <MapPin className="text-primary" size={20} />
                <h2 className="text-xl font-black uppercase tracking-tight">Lokasi Pengiriman</h2>
              </div>
              <div className="bg-base-200/50 p-6 rounded-2xl border border-dashed border-base-300 flex justify-between items-center group">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Home size={20}/>
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase tracking-tighter">
                      {alamatUtama ? alamatUtama.label || "Alamat Utama" : "Alamat Belum Ada"}
                    </p>
                    <p className="text-[10px] font-bold opacity-60 mt-1 leading-tight">
                      {alamatUtama ? (
                        <>{alamatUtama.nama_penerima} {" ("}{alamatUtama.no_hp}{") • "} {alamatUtama.alamat_lengkap}, {alamatUtama.kecamatan}, {alamatUtama.kota}, {alamatUtama.provinsi} {alamatUtama.kode_pos}</>
                      ) : ("Silakan atur alamat di profil.")}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowAlamatModal(true)} type="button" className="btn btn-ghost btn-xs uppercase font-bold text-[10px] opacity-50 hover:opacity-100">
                  Ubah
                </button>
              </div>
            </div>

            {/* RINGKASAN PRODUK */}
            <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-content/5">
              <div className="flex items-center gap-3 mb-6 border-b border-base-content/5 pb-4">
                <ShoppingBag className="text-primary" size={20} />
                <h2 className="text-xl font-black uppercase tracking-tight">Ringkasan Produk ({items.length})</h2>
              </div>
              <div className="divide-y divide-base-content/5">
                {items.map((item) => (
                  <CartProductItem key={item.id} {...item} isReadOnly={true} />
                ))}
              </div>
            </div>

            {/* OPSI PENGIRIMAN */}
            <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-content/5">
              <div className="flex items-center gap-3 mb-6 border-b border-base-content/5 pb-4">
                <Truck className="text-primary" size={20} />
                <h2 className="text-xl font-black uppercase tracking-tight">Opsi Pengiriman</h2>
              </div>
              
              {loadingOngkir ? (
                <div className="py-10 flex flex-col items-center justify-center gap-3 text-base-content/50">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="text-xs font-bold uppercase tracking-widest">Menghitung Ongkos Kirim...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {ongkirError && (
                    <div className="py-4 px-4 text-center text-xs font-bold text-warning uppercase tracking-wider bg-warning/10 rounded-xl border border-dashed border-warning/30">
                      {ongkirError}
                    </div>
                  )}

                  {couriers.length === 0 ? (
                    <div className="py-6 text-center text-xs font-bold text-base-content/50 uppercase tracking-wider bg-base-200/50 rounded-xl border border-dashed border-base-300">
                      {alamatUtama ? "Tidak ada opsi pengiriman tersedia." : "Pilih alamat terlebih dahulu."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {couriers.map((courier) => (
                        courier.costs.map((srv, idx) => {
                          const isSelected = selectedShipping?.courier_code === courier.code && selectedShipping?.service === srv.service;
                          return (
                            <div 
                              key={`${courier.code}-${idx}`}
                              onClick={() => setSelectedShipping({ courier_code: courier.code, courier_name: courier.name, service: srv.service, cost: srv.cost, etd: srv.etd })}
                              className={`cursor-pointer transition-all p-4 rounded-xl border-2 flex items-center justify-between ${isSelected ? 'border-primary bg-primary/5' : 'border-base-200 hover:border-primary/30'}`}
                            >
                              <div className="flex items-center gap-4">
                                <input type="radio" className="radio radio-primary radio-sm" checked={isSelected} readOnly />
                                
                                <div className="w-12 h-10 bg-white rounded-lg border border-base-content/10 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                                  {courier.code === "toko" ? (
                                    <Home className="text-primary" size={24} />
                                  ) : courier.code === "cargo" ? (
                                    <Truck className="text-primary" size={24} />
                                  ) : courier.logo_url ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={courier.logo_url} alt={courier.name} className="w-full h-full object-contain" />
                                  ) : (
                                    <Truck className="text-base-content/30" size={20} /> 
                                  )}
                                </div>

                                <div>
                                  <p className="font-black text-sm uppercase tracking-tight">{courier.name} - {srv.service}</p>
                                  <p className="text-[10px] font-bold opacity-60 mt-1">{(courier.code === "toko" || courier.code === "cargo") ? srv.description : `Estimasi sampai: ${srv.etd} Hari`}</p>
                                </div>
                              </div>
                              <div className="text-right font-black text-primary text-xs sm:text-sm">
                                {courier.code === "cargo" ? "BAYAR TUJUAN" : srv.cost === 0 ? "GRATIS" : `Rp ${srv.cost.toLocaleString("id-ID")}`}
                              </div>
                            </div>
                          );
                        })
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          <div className="lg:col-span-4">
            
            <div className="fixed bottom-16 left-0 right-0 z-40 bg-base-100 border-t border-base-content/10 px-4 py-3 shadow-[0_-10px_20px_rgba(0,0,0,0.08)] lg:static lg:bg-transparent lg:border-none lg:p-0 lg:shadow-none lg:z-auto">
              <div className="lg:sticky lg:top-24 flex flex-col gap-0 lg:gap-6">
                
                {/* TOMBOL PILIH VOUCHER (SHOPEE STYLE) */}
                <div 
                    onClick={() => setShowVoucherModal(true)}
                    className="flex justify-between items-center p-3.5 lg:p-5 border-2 lg:rounded-2xl border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors mb-3 lg:mb-0"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-1.5 rounded-lg text-primary"><Ticket size={18}/></div>
                        <div>
                            {appliedVoucher ? (
                                <>
                                    <p className="text-xs font-black text-primary uppercase tracking-wider">{appliedVoucher.kode_voucher}</p>
                                    <p className="text-[9px] font-bold text-success mt-0.5">Berhasil dipasang (-Rp {appliedVoucher.nominal_diskon.toLocaleString("id-ID")})</p>
                                </>
                            ) : (
                                <p className="text-xs font-bold text-base-content/80">Makin hemat pakai <span className="font-black text-primary">Voucher</span></p>
                            )}
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-base-content/40" />
                </div>

                {/* CARD DETAIL PEMBAYARAN */}
                <div className="lg:p-8 lg:bg-base-100 lg:border-2 lg:border-base-content/10 lg:rounded-2xl">
                  <h3 className="hidden lg:flex text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-8 items-center gap-2">
                    <CreditCard size={14} /> Detail Pembayaran
                  </h3>
                  
                  <div className="hidden lg:block space-y-4 mb-8">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[10px] font-bold uppercase opacity-60">Total Pesanan</span>
                      <span className="font-bold">Rp {subTotal.toLocaleString("id-ID")}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[10px] font-bold uppercase opacity-60">Ongkos Kirim</span>
                      <span className="font-bold text-success">
                        {selectedShipping ? (selectedShipping.courier_code === "cargo" ? "Bayar Tujuan" : selectedShipping.cost === 0 ? "Gratis" : `+ Rp ${selectedShipping.cost.toLocaleString("id-ID")}`) : "-"}
                      </span>
                    </div>

                    {appliedVoucher && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[10px] font-bold uppercase opacity-60">Voucher BikinCetak</span>
                        <span className="font-black text-error">- Rp {appliedVoucher.nominal_diskon.toLocaleString("id-ID")}</span>
                      </div>
                    )}

                    <div className="divider opacity-10 my-0"></div>
                  </div>

                  <div className="flex flex-row justify-between items-center lg:flex-col lg:items-stretch gap-4">
                    <div className="flex flex-col gap-0 lg:gap-1 lg:pt-2">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Tagihan</span>
                      <span className="text-[17px] md:text-xl lg:text-3xl font-black text-primary tracking-tighter leading-none">
                        Rp {totalBill.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <button 
                      onClick={handleCheckout} 
                      disabled={loading || items.length === 0 || !selectedShipping} 
                      className="btn btn-primary lg:btn-block rounded-xl lg:rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 h-11 lg:h-16 text-[10px] lg:text-xs w-[55%] lg:w-full"
                    >
                      {loading ? (<Loader2 className="animate-spin" />) : (<>Konfirmasi <span className="hidden lg:inline">Pesanan</span></>)}
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      <UbahAlamat
        isOpen={showAlamatModal}
        alamatList={alamatList}
        selectedAlamatId={alamatUtama?.id_alamat}
        onClose={() => setShowAlamatModal(false)}
        onSelect={(alamat) => { setAlamatUtama(alamat); setShowAlamatModal(false); }}
      />

      {/* MODAL LIST VOUCHER (SHOPEE STYLE) */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 transition-opacity">
            <div className="bg-base-200 w-full sm:w-120 h-[85vh] sm:h-162.5 sm:rounded-3xl rounded-t-3xl flex flex-col overflow-hidden animate-slide-up shadow-2xl">
                
                {/* Header Modal */}
                <div className="bg-base-100 p-4 border-b flex justify-between items-center sticky top-0 z-10">
                    <h3 className="font-black uppercase tracking-wider text-base-content/80 ml-2">Pilih Voucher BikinCetak</h3>
                    <button onClick={() => setShowVoucherModal(false)} className="btn btn-circle btn-ghost btn-sm"><X size={18}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    
                    {/* Input Manual Kode */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-3 text-base-content/40" />
                            <input 
                                type="text" 
                                placeholder="Masukkan Kode Voucher" 
                                className="input input-bordered w-full pl-9 uppercase focus:outline-primary font-bold text-sm"
                                value={manualVoucherCode}
                                onChange={(e) => setManualVoucherCode(e.target.value.toUpperCase())}
                            />
                        </div>
                        <button 
                            disabled={!manualVoucherCode.trim() || isApplyingVoucher} 
                            onClick={handleManualInputVoucher}
                            className="btn btn-primary px-6"
                        >
                            {isApplyingVoucher ? <Loader2 size={16} className="animate-spin"/> : 'Terapkan'}
                        </button>
                    </div>

                    {/* Jika Tidak Ada Voucher Sama Sekali */}
                    {availableVouchers.length === 0 && (
                        <div className="py-12 flex flex-col items-center justify-center opacity-40">
                            <Ticket size={48} className="mb-4" />
                            <p className="font-bold text-xs uppercase tracking-widest">Belum ada promo aktif</p>
                        </div>
                    )}

                    {/* List Voucher Bisa Dipakai */}
                    {eligibleVouchers.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-[10px] font-black tracking-widest uppercase opacity-40 pl-1">Bisa Digunakan</p>
                            {eligibleVouchers.map(v => (
                                <div key={v.kode_voucher} className="flex bg-base-100 rounded-2xl shadow-sm border border-primary/20 overflow-hidden relative group">
                                    <div className="w-1/3 bg-primary text-primary-content flex flex-col items-center justify-center p-4 border-r-2 border-dashed border-base-100">
                                        <span className="text-3xl font-black">{v.persentase_diskon}%</span>
                                        <span className="text-[9px] font-bold tracking-widest uppercase mt-1">Diskon</span>
                                    </div>
                                    <div className="w-2/3 p-4 flex flex-col justify-between">
                                        <div>
                                            <p className="font-bold text-sm leading-tight mb-1">{v.nama_promo}</p>
                                            <p className="text-[10px] opacity-60 leading-tight">Min. Belanja Rp {v.minimal_transaksi_rupiah.toLocaleString("id-ID")}</p>
                                            <p className="text-[10px] opacity-60 leading-tight">Maks. Potongan Rp {v.maksimal_potongan_rupiah ? v.maksimal_potongan_rupiah.toLocaleString("id-ID") : "Tanpa Batas"}</p>
                                        </div>
                                        <div className="flex justify-between items-end mt-4">
                                            <p className="text-[9px] font-bold text-error">Berakhir {new Date(v.berlaku_sampai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                            <button onClick={() => applySelectedVoucher(v)} className="btn btn-primary btn-sm px-5 h-8 min-h-0 text-xs rounded-xl shadow-md shadow-primary/20">Pilih</button>
                                        </div>
                                    </div>
                                    {appliedVoucher?.kode_voucher === v.kode_voucher && (
                                        <div className="absolute inset-0 border-2 border-primary rounded-2xl pointer-events-none"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* List Voucher Tidak Memenuhi Syarat */}
                    {ineligibleVouchers.length > 0 && (
                        <div className="space-y-3 pt-2">
                            <p className="text-[10px] font-black tracking-widest uppercase opacity-40 pl-1">Tidak Memenuhi Syarat</p>
                            {ineligibleVouchers.map(v => (
                                <div key={v.kode_voucher} className="flex bg-base-100/50 rounded-2xl border border-base-300 overflow-hidden opacity-60 grayscale relative">
                                    <div className="w-1/3 bg-base-300 text-base-content flex flex-col items-center justify-center p-4 border-r-2 border-dashed border-base-100">
                                        <span className="text-3xl font-black">{v.persentase_diskon}%</span>
                                        <span className="text-[9px] font-bold tracking-widest uppercase mt-1">Diskon</span>
                                    </div>
                                    <div className="w-2/3 p-4 flex flex-col justify-between">
                                        <div>
                                            <p className="font-bold text-sm leading-tight mb-1">{v.nama_promo}</p>
                                            <p className="text-[10px] leading-tight">Min. Belanja Rp {v.minimal_transaksi_rupiah.toLocaleString("id-ID")}</p>
                                        </div>
                                        <div className="flex justify-between items-end mt-4">
                                            <p className="text-[9px] font-black text-error bg-error/10 px-2 py-1 rounded">{v.reason}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Modal */}
                {appliedVoucher && (
                    <div className="bg-base-100 p-4 border-t shadow-[0_-10px_20px_rgba(0,0,0,0.05)] flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-bold uppercase opacity-50">Voucher Terpakai</p>
                            <p className="font-black text-primary text-sm">{appliedVoucher.kode_voucher}</p>
                        </div>
                        <button onClick={() => { setAppliedVoucher(null); setShowVoucherModal(false); }} className="btn btn-outline btn-error btn-sm rounded-xl">Lepas Voucher</button>
                    </div>
                )}
            </div>
        </div>
      )}

    </main>
  );
}