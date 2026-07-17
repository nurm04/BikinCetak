/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, MapPin, ShoppingBag, Loader2, ArrowLeft, Home, Truck, Ticket } from "lucide-react";
import { getAlamat, Alamat } from "@/services/alamatService";
import Link from "next/link";
import CartProductItem from "@/components/shared/CardProductItem";
import AlertPopup from "@/components/ui/AlertPopup";
import UbahAlamat from "./UbahAlamat";
import { checkoutCart, CheckoutPayload, getShippingCost, RincianDiskonAPI } from "@/services/cartService";
import { cekVoucher } from "@/services/voucherService";

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

  finishing: {
    id: number;
    nama_finishing: string;
    harga_tambahan: number;
  }[];
}

interface ShippingService {
  service: string;
  description: string;
  cost: number;
  etd: string;
}

interface CourierOption {
  code: string;
  name: string;
  costs: ShippingService[];
}

interface KomerceCostItem {
  code: string;
  name: string;
  service: string;
  description?: string;
  cost: number;
  etd?: string;
  estimation?: string;
}

interface RajaOngkirCostDetail {
  value: number;
  etd: string;
}

interface RajaOngkirServiceCost {
  service: string;
  description: string;
  cost: RajaOngkirCostDetail[];
}

interface RajaOngkirResult {
  code: string;
  name: string;
  costs: RajaOngkirServiceCost[];
}

interface OngkirAPIResponse {
  meta?: {
    status: string;
    message?: string;
  };
  data?: KomerceCostItem[];

  rajaongkir?: {
    status?: {
      code: number;
      description: string;
    };
    results?: RajaOngkirResult[];
  };
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

  const [inputVoucher, setInputVoucher] = useState("");
  const [isVerifyingVoucher, setIsVerifyingVoucher] = useState(false);
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

  useEffect(() => {
    loadInitialData();
    loadAlamatUtama();
  }, [loadInitialData, loadAlamatUtama]);

  useEffect(() => {
    if (!alamatUtama) return;

    const fetchOngkir = async () => {
      setLoadingOngkir(true);
      setSelectedShipping(null);
      setOngkirError(null);
      setCouriers([]);
      
      try {
        const result = await getShippingCost(alamatUtama.id_alamat);
        
        if (result.error) {
            setOngkirError(result.error);
            return;
        }

        const rawData = result.data as OngkirAPIResponse;

        if (rawData?.meta?.status === 'error') {
            setOngkirError(rawData.meta.message || "Gagal mendapatkan ongkos kirim.");
            return;
        }
        if (rawData?.rajaongkir?.status?.code && rawData.rajaongkir.status.code >= 400) {
            setOngkirError(rawData.rajaongkir.status.description || "Gagal mendapatkan ongkos kirim.");
            return;
        }

        let normalizedCouriers: CourierOption[] = [];

        if (rawData?.meta && Array.isArray(rawData?.data)) {
            const couriersMap: Record<string, CourierOption> = {};
            
            rawData.data.forEach((item: KomerceCostItem) => {
                if (!couriersMap[item.code]) {
                    couriersMap[item.code] = { code: item.code, name: item.name, costs: [] };
                }
                couriersMap[item.code].costs.push({
                    service: item.service,
                    description: item.description || item.service,
                    cost: item.cost,
                    etd: item.etd || item.estimation || "-"
                });
            });
            normalizedCouriers = Object.values(couriersMap);
        } 
        else if (rawData?.rajaongkir?.results && Array.isArray(rawData.rajaongkir.results)) {
            normalizedCouriers = rawData.rajaongkir.results.map((c: RajaOngkirResult) => ({
                code: c.code,
                name: c.name,
                costs: c.costs.map((srv: RajaOngkirServiceCost) => ({
                    service: srv.service,
                    description: srv.description,
                    cost: srv.cost[0]?.value || 0,
                    etd: srv.cost[0]?.etd || "-"
                }))
            }));
        }

        if (normalizedCouriers.length === 0) {
            setOngkirError("Tidak ada layanan kurir yang tersedia untuk alamat ini.");
        } else {
            setCouriers(normalizedCouriers);
        }
        
      } catch (error) {
        setOngkirError("Terjadi kesalahan sistem saat mengambil tarif logistik.");
      } finally {
        setLoadingOngkir(false);
      }
    };

    fetchOngkir();
  }, [alamatUtama]);


  const hitungRowTotal = (item: CheckoutItem) => {
    const finishingTotal = item.finishing.reduce((sum, fin) => sum + fin.harga_tambahan, 0);
    const hargaPerPcs = item.harga_satuan + finishingTotal;
    const biayaPengerjaan = item.harga_pengerjaan_snapshot || 0;
    return (hargaPerPcs * item.jumlah) + biayaPengerjaan;
  }

  const subTotal = items.reduce((acc, item) => acc + hitungRowTotal(item), 0);

  const handleApplyVoucher = async () => {
    if (!inputVoucher.trim()) return;
    
    setIsVerifyingVoucher(true);
    try {
        const response = await cekVoucher(inputVoucher.trim());
        
        if (!response.success || !response.data) {
            setPopup({ isOpen: true, title: "Voucher Ditolak", message: response.error || response.message || "Voucher tidak valid.", type: "error" });
            setAppliedVoucher(null);
            return;
        }

        const voucher = response.data;

        if (subTotal < Number(voucher.minimal_transaksi_rupiah)) {
            setPopup({ isOpen: true, title: "Belum Memenuhi Syarat", message: `Voucher ini membutuhkan minimal belanja Rp ${Number(voucher.minimal_transaksi_rupiah).toLocaleString("id-ID")}`, type: "warning" });
            setAppliedVoucher(null);
            return;
        }

        let kalkulasiDiskon = 0;
        const persen = Number(voucher.persentase_diskon);

        if (voucher.tipe_target === 'semua_pesanan') {
            kalkulasiDiskon = (subTotal * persen) / 100;
        } else if (voucher.tipe_target === 'produk_tertentu') {
            const totalProdukTarget = items
                .filter(item => item.id_sku === voucher.id_sku_target)
                .reduce((sum, item) => sum + hitungRowTotal(item), 0);
            
            if(totalProdukTarget === 0){
                setPopup({ isOpen: true, title: "Produk Tidak Sesuai", message: "Voucher ini tidak berlaku untuk produk di keranjang Anda.", type: "warning" });
                setAppliedVoucher(null);
                return;
            }
            kalkulasiDiskon = (totalProdukTarget * persen) / 100;
        }

        const maksPotongan = Number(voucher.maksimal_potongan_rupiah);
        if (maksPotongan > 0 && kalkulasiDiskon > maksPotongan) {
            kalkulasiDiskon = maksPotongan;
        }

        setAppliedVoucher({
            kode_voucher: voucher.kode_voucher,
            nama_promo: voucher.nama_promo,
            nominal_diskon: Math.round(kalkulasiDiskon)
        });

        setPopup({ isOpen: true, title: "Voucher Berhasil", message: `Hore! Diskon senilai Rp ${Math.round(kalkulasiDiskon).toLocaleString("id-ID")} berhasil diterapkan.`, type: "success" });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Voucher tidak valid atau terjadi kesalahan.";
        
        setPopup({ isOpen: true, title: "Voucher Ditolak", message: errorMessage, type: "error" });
        setAppliedVoucher(null);
    } finally {
        setIsVerifyingVoucher(false);
    }
  };

  const hapusVoucher = () => {
      setAppliedVoucher(null);
      setInputVoucher("");
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
        setPopup({
          isOpen: true, title: "Checkout Gagal", message: result.error || result.message || "Terjadi kesalahan.", type: "error",
        });
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
    <main className="min-h-screen bg-base-200 py-6 px-4 md:px-8 relative">
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
                        <>
                          {alamatUtama.nama_penerima} {" ("}{alamatUtama.no_hp}{") • "}
                          {alamatUtama.alamat_lengkap}, {alamatUtama.kecamatan}, {alamatUtama.kota}, {alamatUtama.provinsi} {alamatUtama.kode_pos}
                        </>
                      ) : (
                        "Silakan atur alamat di profil."
                      )}
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
              ) : ongkirError ? (
                <div className="py-6 px-4 text-center text-xs font-bold text-error uppercase tracking-wider bg-error/10 rounded-xl border border-dashed border-error/30">
                  {ongkirError}
                </div>
              ) : couriers.length === 0 ? (
                <div className="py-6 text-center text-xs font-bold text-base-content/50 uppercase tracking-wider bg-base-200/50 rounded-xl border border-dashed border-base-300">
                  {alamatUtama 
                    ? "Tidak ada opsi pengiriman tersedia. Pastikan alamat valid atau coba lagi nanti." 
                    : "Pilih alamat terlebih dahulu untuk melihat ongkos kirim."}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {couriers.map((courier) => (
                    courier.costs.map((srv, idx) => {
                      const isSelected = selectedShipping?.courier_code === courier.code && selectedShipping?.service === srv.service;
                      
                      return (
                        <div 
                          key={`${courier.code}-${idx}`}
                          onClick={() => setSelectedShipping({
                            courier_code: courier.code,
                            courier_name: courier.name,
                            service: srv.service,
                            cost: srv.cost,
                            etd: srv.etd
                          })}
                          className={`cursor-pointer transition-all p-4 rounded-xl border-2 flex items-center justify-between ${
                            isSelected ? 'border-primary bg-primary/5' : 'border-base-200 hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="radio-input">
                              <input type="radio" name="shipping" className="radio radio-primary radio-sm" checked={isSelected} readOnly />
                            </div>
                            <div>
                              <p className="font-black text-sm uppercase tracking-tight">
                                {courier.name} - {srv.service}
                              </p>
                              <p className="text-[10px] font-bold opacity-60 mt-1">
                                Estimasi sampai: {srv.etd} Hari
                              </p>
                            </div>
                          </div>
                          <div className="text-right font-black text-primary">
                            Rp {srv.cost.toLocaleString("id-ID")}
                          </div>
                        </div>
                      );
                    })
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">

              {/* CARD VOUCHER */}
              <div className="card bg-base-100 border-2 border-base-content/10 rounded-2xl overflow-hidden">
                <div className="p-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-4 flex items-center gap-2">
                        <Ticket size={14} /> Voucher & Promo
                    </h3>

                    {appliedVoucher ? (
                        <div className="bg-success/10 border border-success/30 p-4 rounded-xl flex justify-between items-center">
                            <div>
                                <p className="text-success font-black text-xs uppercase tracking-wider">{appliedVoucher.kode_voucher}</p>
                                <p className="text-[10px] font-bold opacity-70 mt-0.5">{appliedVoucher.nama_promo}</p>
                            </div>
                            <button onClick={hapusVoucher} className="btn btn-ghost btn-xs text-error">Hapus</button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Masukkan Kode..." 
                                className="input input-bordered input-sm w-full uppercase"
                                value={inputVoucher}
                                onChange={(e) => setInputVoucher(e.target.value.toUpperCase())}
                                disabled={isVerifyingVoucher}
                            />
                            <button 
                                onClick={handleApplyVoucher} 
                                disabled={!inputVoucher.trim() || isVerifyingVoucher}
                                className="btn btn-primary btn-sm uppercase font-black"
                            >
                                {isVerifyingVoucher ? <Loader2 size={16} className="animate-spin" /> : 'Pakai'}
                            </button>
                        </div>
                    )}
                </div>
              </div>

              <div className="card bg-base-100 border-2 border-base-content/10 rounded-2xl overflow-hidden">
                <div className="p-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-8 flex items-center gap-2">
                    <CreditCard size={14} /> Detail Pembayaran
                  </h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[10px] font-bold uppercase opacity-60">Total Pesanan</span>
                      <span className="font-bold">Rp {subTotal.toLocaleString("id-ID")}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[10px] font-bold uppercase opacity-60">Ongkos Kirim</span>
                      <span className="font-bold text-success">
                        {selectedShipping ? `+ Rp ${selectedShipping.cost.toLocaleString("id-ID")}` : "-"}
                      </span>
                    </div>

                    {appliedVoucher && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[10px] font-bold uppercase opacity-60">Potongan Diskon</span>
                            <span className="font-black text-error">
                                - Rp {appliedVoucher.nominal_diskon.toLocaleString("id-ID")}
                            </span>
                        </div>
                    )}

                    <div className="divider opacity-10 my-0"></div>
                    <div className="flex flex-col gap-1 pt-2">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Tagihan</span>
                      <span className="text-3xl font-black text-primary tracking-tighter leading-none">
                        Rp {totalBill.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={handleCheckout} 
                    disabled={loading || items.length === 0 || !selectedShipping} 
                    className="btn btn-primary btn-block rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 h-16 text-xs"
                  >
                    {loading ? (<Loader2 className="animate-spin" />) : ("Konfirmasi Pesanan")}
                  </button>

                  <p className="text-[9px] text-center mt-6 opacity-60 font-bold uppercase tracking-tighter leading-relaxed">
                    Silakan lakukan pembayaran <span className="text-primary font-black">Transfer Manual</span> sesuai instruksi pada halaman selanjutnya.
                  </p>
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
        onSelect={(alamat) => {
          setAlamatUtama(alamat);
          setShowAlamatModal(false);
        }}
      />
    </main>
  );
}