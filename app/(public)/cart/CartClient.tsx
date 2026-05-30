// @/components/shared/CartClient.tsx
"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingBag, CreditCard } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getCartItems, updateCartItemQty, deleteCartItem } from "@/services/cartService";
import AlertPopup from "@/components/ui/AlertPopup";
import CartProductItem from "@/components/shared/CardProductItem";

interface VariantLainnyaAPI {
  item_code: string;
  price: number;
}

interface CartItemAPI {
  id: number;
  item_code: string;
  variant_name: string;
  qty: number;
  price: number;
  image_url?: string;
  variant_lainnya?: VariantLainnyaAPI[];
}

export default function CartClient() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemAPI[]>([]);
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

  /* eslint-disable react-hooks/set-state-in-effect */
  const fetchCart = useCallback(async () => {
    const res = await getCartItems();
    
    if (res.error) {
      if (res.error.toLowerCase().includes("sesi") || res.error.toLowerCase().includes("login")) {
        router.push("/login");
        return;
      }
      setError(res.error);
    } else {
      setCartItems(res.data?.items || []); 
      setError(null);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const selectedSubtotal = cartItems
  .filter((item) => selectedIds.includes(item.id))
  .reduce((total: number, item: CartItemAPI) => {
    const totalTambahan = (item.variant_lainnya || []).reduce(
      (acc: number, j: VariantLainnyaAPI) => acc + j.price, 
      0
    );
    const unitPriceTotal = item.price + totalTambahan;
    return total + (unitPriceTotal * item.qty);
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
        item.id === id ? { ...item, qty: newQty } : item
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
    
    // Panggil service tanpa token
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
    const itemsToBuy = cartItems.filter(item => selectedIds.includes(item.id));
    localStorage.setItem("checkout_items", JSON.stringify(itemsToBuy));
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
    <main className="min-h-screen bg-base-200 py-6 px-4 md:px-8 relative">
      
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
                      variant_name={item.variant_name}
                      price={item.price}
                      qty={item.qty}
                      image_url={item.image_url}
                      // Oper field variant_lainnya ke prop jasa_tambahan
                      jasa_tambahan={item.variant_lainnya || []} 
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
            <div className="sticky top-24 space-y-4">
              <div className="card bg-base-100 border-2 border-base-content/10 rounded-2xl overflow-hidden">
                <div className="p-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-8 flex items-center gap-2">
                    <CreditCard size={14} /> Ringkasan Pesanan
                  </h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[10px] font-bold uppercase opacity-60">Item Terpilih</span>
                      <span className="text-xs font-black">{selectedIds.length} Produk</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[10px] font-bold uppercase opacity-60">Subtotal</span>
                      <span className="font-bold">Rp {selectedSubtotal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="divider opacity-10 my-0"></div>
                    <div className="flex flex-col gap-1 pt-2">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Tagihan</span>
                      <span className="text-3xl font-black text-primary tracking-tighter leading-none">
                        Rp {selectedSubtotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <button 
                    disabled={selectedIds.length === 0}
                    onClick={handleCheckout}
                    className="btn btn-primary btn-block rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 h-16 text-xs"
                  >
                    Checkout Sekarang
                  </button>

                  <p className="text-[8px] text-center mt-4 opacity-40 font-bold uppercase tracking-tighter">
                    Harga sudah termasuk pajak & biaya layanan cetak.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}