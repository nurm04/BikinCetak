/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingBag, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  getCartItems, 
  updateCartItemQty, 
  deleteCartItem, 
  CartServiceResponse, 
  CartDataAPI,
  RincianDiskonAPI,
  CustomAttributeValue,
  FileDesainAPI
} from "@/services/cartService";
import AlertPopup from "@/components/ui/AlertPopup";
import CartProductItem from "@/components/shared/CardProductItem"; 

// Interface lokal yang dimodifikasi khusus untuk kebutuhan UI keranjang
interface ExtendedCartItemAPI {
  id: number;
  id_pesan: string;
  jumlah: number;
  nama_sku: string;
  harga_satuan: number;
  harga_dasar_awal_snapshot?: number;
  total_diskon_snapshot?: number;
  rincian_diskon_snapshot?: RincianDiskonAPI[];
  estimasi_pengerjaan?: string;
  harga_pengerjaan_snapshot?: number;
  file_desain?: FileDesainAPI | null; 
  catatan?: string | null;
  atribut_custom_snapshot?: Record<string, CustomAttributeValue> | null;
  finishing?: Array<{
    id?: number;
    nama_finishing: string;
    harga_tambahan: number;
    kali_jumlah_pesan?: number | boolean;
  }>;
}

export default function CartClient() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<ExtendedCartItemAPI[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [popup, setPopup] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    idToDelete: number | null;
    autoClose?: number;
  }>({ 
    isOpen: false, 
    type: "warning", 
    title: "", 
    message: "", 
    idToDelete: null 
  });

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = (await getCartItems()) as CartServiceResponse<CartDataAPI>;
        
        if (res.error) {
          if (res.error.toLowerCase().includes("sesi") || res.error.toLowerCase().includes("login")) {
            router.push("/login");
            return;
          }
          setError(res.error);
        } else {
          const rawData = res.data;
          let itemsList: ExtendedCartItemAPI[] = [];

          if (
            rawData &&
            typeof rawData === "object" &&
            Array.isArray(rawData.pesanan_item)
          ) {
            itemsList = rawData.pesanan_item.map((item) => {
                
                // Parse Rincian Diskon
                let parsedRincianDiskon: RincianDiskonAPI[] = [];
                if (item.rincian_diskon_snapshot) {
                  try {
                      parsedRincianDiskon = typeof item.rincian_diskon_snapshot === 'string' 
                          ? JSON.parse(item.rincian_diskon_snapshot) 
                          : item.rincian_diskon_snapshot;
                  } catch (e) {
                      console.error("Gagal parse rincian diskon", e);
                  }
                }

                let parsedFileDesain: FileDesainAPI | null = null;
                if (item.file_desain) {
                  try {
                      parsedFileDesain = typeof item.file_desain === 'string' 
                          ? JSON.parse(item.file_desain) 
                          : item.file_desain;
                  } catch (e) {
                      console.error("Gagal parse file desain", e);
                  }
                }

                // Parse Atribut Custom (JSON)
                let parsedAtributCustom: Record<string, CustomAttributeValue> | null = null;
                if (item.atribut_custom_snapshot) {
                  try {
                      parsedAtributCustom = typeof item.atribut_custom_snapshot === 'string'
                          ? JSON.parse(item.atribut_custom_snapshot)
                          : item.atribut_custom_snapshot;
                  } catch (e) {
                      console.error("Gagal parse atribut custom", e);
                  }
                }

                return {
                  id: item.id,
                  id_pesan: item.id_pesan || "",
                  jumlah: item.jumlah,
                  nama_sku: item.nama_produk_snapshot,
                  harga_satuan: item.harga_satuan_snapshot, 
                  
                  harga_dasar_awal_snapshot: item.harga_dasar_awal_snapshot,
                  total_diskon_snapshot: item.total_diskon_snapshot,
                  rincian_diskon_snapshot: parsedRincianDiskon,
                  estimasi_pengerjaan: item.estimasi_pengerjaan_snapshot,
                  harga_pengerjaan_snapshot: item.harga_pengerjaan_snapshot,
                  catatan: item.catatan,
                  file_desain: parsedFileDesain,
                  atribut_custom_snapshot: parsedAtributCustom,

                  finishing: item.pesanan_item_finishing?.map((fin) => ({
                      id: fin.id,
                      nama_finishing: fin.nama_finishing_snapshot,
                      harga_tambahan: fin.harga_finishing_snapshot,
                      kali_jumlah_pesan: fin.kali_jumlah_pesan, 
                  })) ?? [],
                };
            });
          }

          setCartItems(itemsList); 
          setError(null);
        }
      } catch (err) {
        setError("Terjadi kesalahan saat mengambil data keranjang.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [router]);

  // LOGIKA SINKRON DENGAN BACKEND & VUE (Detail.vue & OrderItemsTable.vue)
  const selectedSubtotal = cartItems
    .filter((item) => selectedIds.includes(item.id))
    .reduce((total: number, item: ExtendedCartItemAPI) => {
      let hargaAwal = item.harga_satuan || 0;
      const attr = item.atribut_custom_snapshot;
      const finishings = item.finishing || [];

      // 1. CARI "SISI CETAK" DARI NAMA FINISHING
      let sisi = 1; 
      finishings.forEach(f => {
          const namaFin = (f.nama_finishing || "").toLowerCase();
          if (namaFin.includes('dua sisi') || namaFin.includes('2 sisi') || namaFin.includes('bolak')) {
              sisi = 2;
          }
      });

      // 2. HITUNG BIAYA HALAMAN (Hanya jika produk tersebut butuh input halaman)
      if (attr && attr['Jumlah Halaman'] !== undefined) {
          let hal = parseInt(String(attr['Jumlah Halaman']), 10);
          if (isNaN(hal) || hal < 1) hal = 1;
          hargaAwal += (Math.max(0, hal - 1) * sisi * 1500);
      }

      let subtotalItem = hargaAwal * item.jumlah;

      // 3. HITUNG BIAYA FINISHING
      finishings.forEach((f) => {
        // Validasi ketat untuk status kali_jumlah_pesan
        const isKaliQty = f.kali_jumlah_pesan === true || f.kali_jumlah_pesan === 1;
        const val = f.harga_tambahan || 0;
        
        subtotalItem += isKaliQty ? (val * item.jumlah) : val;
      });

      const biayaPengerjaan = item.harga_pengerjaan_snapshot || 0;
      
      return total + subtotalItem + biayaPengerjaan;
    }, 0);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === cartItems.length ? [] : cartItems.map(i => i.id));
  };

  const handleUpdateQty = async (id: number, newQty: number) => {
    if (newQty < 1) return;
    
    setActionLoading(id);
    const res = await updateCartItemQty(id, newQty);
    
    if (res.error) {
      setError(res.error);
    } else {
      const newCart = cartItems.map(item => 
        item.id === id ? { ...item, jumlah: newQty } : item
      );
      setCartItems(newCart);
    }
    setActionLoading(null);
  };

  const triggerDelete = (id: number) => {
    setPopup({ 
      isOpen: true, 
      type: "warning",
      title: "Hapus Pesanan?", 
      message: "Pesanan ini akan dihapus permanen dari keranjang belanja Anda.",
      idToDelete: id 
    });
  };

  const confirmDelete = async () => {
    const id = popup.idToDelete;
    if (!id) return;

    setActionLoading(id);
    const res = await deleteCartItem(id);

    if (res.error) {
      setPopup({
        isOpen: true,
        type: "error",
        title: "Gagal Menghapus",
        message: res.error,
        idToDelete: null
      });
    } else {
      const newCart = cartItems.filter(item => item.id !== id);
      setCartItems(newCart);
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));

      setPopup({
        isOpen: true,
        type: "success",
        title: "Berhasil Dihapus",
        message: "Item telah dikeluarkan dari keranjang.",
        idToDelete: null,
        autoClose: 2000
      });
    }
    setActionLoading(null);
  };

  const handleCheckout = () => {
    const selectedItems = cartItems.filter(item =>
      selectedIds.includes(item.id)
    );

    localStorage.setItem(
      "checkout_items",
      JSON.stringify(selectedItems)
    );

    localStorage.setItem(
      "checkout_item_ids",
      JSON.stringify(selectedIds)
    );

    router.push("/pesan/checkout");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-base-200 py-6 px-4 md:px-8 pb-36 lg:pb-8 relative">
      <AlertPopup 
        isOpen={popup.isOpen}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        isLoading={actionLoading === popup.idToDelete && actionLoading !== null}
        autoClose={popup.autoClose}
        onCancel={() => setPopup(prev => ({ ...prev, isOpen: false }))}
        onConfirm={popup.type === "warning" ? confirmDelete : undefined}
        confirmText="Ya, Hapus"
        cancelText={popup.type === "success" ? "Oke" : "Batal"}
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="breadcrumbs text-[10px] uppercase font-black opacity-40 tracking-widest">
            <ul>
              <li><Link href="/">Home</Link></li>
              <li>Keranjang Belanja</li>
            </ul>
          </div>
          <Link href="/" className="btn btn-ghost btn-xs gap-2 uppercase font-bold opacity-60">
            <ArrowLeft size={14} /> Lanjut Belanja
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-content/5">
              <div className="flex items-center justify-between mb-6 border-b border-base-content/5 pb-4">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-primary checkbox-sm rounded-lg" 
                    checked={selectedIds.length === cartItems.length && cartItems.length > 0}
                    onChange={toggleSelectAll}
                  />
                  <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <ShoppingBag className="text-primary" size={20} />
                    Pesanan Anda ({cartItems.length})
                  </h2>
                </div>
              </div>

              {error && (
                <div className="alert alert-error text-xs font-bold rounded-2xl mb-4">
                  {error}
                </div>
              )}

              {cartItems.length === 0 && !error ? (
                <div className="text-center py-12 opacity-50">
                  <p className="font-bold">Keranjang Anda masih kosong.</p>
                </div>
              ) : (
                <div className="divide-y divide-base-content/5">
                  {cartItems.map((item) => (
                    <CartProductItem
                      key={item.id}
                      id={item.id}
                      nama_sku={item.nama_sku || "Produk Cetak"}
                      harga_satuan={item.harga_satuan || 0}
                      jumlah={item.jumlah}
                      finishing={item.finishing || []} 

                      total_diskon_snapshot={item.total_diskon_snapshot}
                      rincian_diskon_snapshot={item.rincian_diskon_snapshot}
                      estimasi_pengerjaan={item.estimasi_pengerjaan}
                      harga_pengerjaan_snapshot={item.harga_pengerjaan_snapshot}
                      catatan={item.catatan}
                      file_desain={item.file_desain}

                      atribut_custom_snapshot={item.atribut_custom_snapshot}

                      isSelected={selectedIds.includes(item.id)}
                      onToggleSelect={toggleSelect}
                      onUpdateQty={handleUpdateQty}
                      onDelete={triggerDelete}
                      isLoading={actionLoading === item.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-base-100 border-t border-base-content/10 px-4 pt-4 pb-20 shadow-[0_-10px_20px_rgba(0,0,0,0.08)] lg:static lg:bg-transparent lg:border-none lg:p-0 lg:shadow-none lg:z-auto">
              
              <div className="lg:sticky lg:top-24 lg:card lg:bg-base-100 lg:p-8 lg:border-2 lg:border-base-content/10 lg:rounded-2xl lg:shadow-sm">
                
                <h3 className="hidden lg:flex text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-8 items-center gap-2">
                  <CreditCard size={14} /> Ringkasan Pesanan
                </h3>
                
                <div className="flex flex-row justify-between items-center lg:flex-col lg:items-stretch lg:space-y-4">
                  
                  <div className="hidden lg:block space-y-4 lg:mb-8">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[10px] font-bold uppercase opacity-60">Item Terpilih</span>
                      <span className="text-xs font-black">{selectedIds.length} Produk</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[10px] font-bold uppercase opacity-60">Subtotal Keranjang</span>
                      <span className="font-bold">Rp {selectedSubtotal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="divider opacity-10 my-0"></div>
                  </div>

                  <div className="flex flex-col gap-0 lg:gap-1 lg:pt-2">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Tagihan</span>
                    <span className="text-[17px] md:text-xl lg:text-3xl font-black text-primary tracking-tighter leading-none">
                      Rp {selectedSubtotal.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <button 
                    disabled={selectedIds.length === 0}
                    onClick={handleCheckout}
                    className="btn btn-primary lg:btn-block rounded-xl lg:rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 h-12 lg:h-16 text-xs w-[55%] lg:w-full"
                  >
                    Checkout <span className="hidden lg:inline">Sekarang</span>
                    <span className="lg:hidden ml-1">({selectedIds.length})</span>
                  </button>

                </div>

                <p className="hidden lg:block text-[8px] text-center mt-4 opacity-40 font-bold uppercase tracking-tighter">
                  Harga sudah termasuk biaya layanan cetak. Belum termasuk ongkos kirim.
                </p>

              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}