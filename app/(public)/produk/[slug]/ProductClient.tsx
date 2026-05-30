/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo, ReactNode } from "react";
import FormPesan from "../../../../components/shared/FormPesan";
import { VariantDetail, getVariantDetail, ItemTemplate, VariantLainnya } from "@/services/itemService"; 
import { addToCart } from "@/services/cartService";
import { useRouter } from "next/navigation";
import ProductCarousel from "@/components/shared/ProductCarousel";
import ProductRow from "@/components/shared/ProductRow";
import FileUpload from "@/components/ui/FileUpload";
import { ShoppingBag, CreditCard, Award, CheckCircle, Truck, ShieldCheck, Info } from "lucide-react";
import AlertPopup from "@/components/ui/AlertPopup";
import { parseVariantsToFields, DynamicFormField } from "@/lib/variantHelper";

interface ApiError {
  message: string;
}

interface ProductClientLayoutProps {
  foundItem: ItemTemplate; 
  allVariants: VariantDetail[]; 
  initialVariant: VariantDetail | null;
  recommendations: { name: string; image: string }[];
}

export default function ProductClientLayout({ foundItem, allVariants, initialVariant, recommendations }: ProductClientLayoutProps) {
  const router = useRouter();
  const [variant, setVariant] = useState<VariantDetail | null>(initialVariant);
  const [loading, setLoading] = useState<boolean>(false);
  const [cartLoading, setCartLoading] = useState<boolean>(false);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, VariantLainnya | null>>({});

  const dynamicFields = useMemo<DynamicFormField[]>(() => {
    return parseVariantsToFields(allVariants, foundItem.item_name);
  }, [allVariants, foundItem.item_name]);

  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = { qty: "1" };
    dynamicFields.forEach(f => {
      if (f.options && f.options.length > 0) initial[f.name] = f.options[0];
    });
    return initial;
  });

  const [popup, setPopup] = useState<{
    isOpen: boolean; title: string; message: string; type: "success" | "error" | "warning" | "info";
  }>({ isOpen: false, title: "", message: "", type: "info" });

  const currentQty = parseInt(selectedAttrs.qty || "1", 10);

  const basePrice = useMemo(() => {
    if (!variant || !variant.pricing_rules) return 0;
    const rule = variant.pricing_rules.find(
      r => currentQty >= r.min_qty && (r.max_qty === 0 || currentQty <= r.max_qty)
    );
    return rule ? rule.rate : (variant.pricing_rules[0]?.rate || 0);
  }, [variant, currentQty]);

  const addonTotal = Object.values(selectedAddons).reduce((acc, curr) => acc + (curr?.price || 0), 0);
  const totalPrice = (basePrice + addonTotal) * currentQty;

  // Kelompokkan Jasa Tambahan
  const groupedAddons = useMemo(() => {
    const groups: Record<string, VariantLainnya[]> = {};
    variant?.variant_lainnya?.forEach((addon) => {
      if (!groups[addon.name_variant]) groups[addon.name_variant] = [];
      groups[addon.name_variant].push(addon);
    });
    return groups;
  }, [variant]);

  const handleAttributeChange = async (name: string, value: string) => {
    const updatedAttrs = { ...selectedAttrs, [name]: value };
    setSelectedAttrs(updatedAttrs);

    const isCoreAttribute = dynamicFields.some(f => f.name === name);

    if (isCoreAttribute) {
      setLoading(true);
      const data = await getVariantDetail(foundItem.item_name, updatedAttrs);
      if (data) {
        setVariant(data);
        setSelectedAddons({});
      }
      setLoading(false);
    } else if (groupedAddons[name]) {
      const addonObj = groupedAddons[name].find(a => a.item_code === value) || null;
      setSelectedAddons(prev => ({ ...prev, [name]: addonObj }));
    }
  };

  const handleAddToCart = async () => {
    if (!variant) return;
    
    setCartLoading(true);
    const imageUrl: string = foundItem.image_url || "";

    const variantLainnya = Object.values(selectedAddons)
      .filter((addon): addon is VariantLainnya => addon !== null)
      .map((addon) => ({
        item_code: addon.item_code,
        price: addon.price,
      }));

    try {
      const res = await addToCart({
        item_code: variant.item_code,
        variant_name: variant.variant_name,
        qty: currentQty,
        price: basePrice,
        image_url: imageUrl,
        variant_lainnya: variantLainnya
      });

      if (res.error) {
        if (res.error.toLowerCase().includes("login") || res.error.toLowerCase().includes("sesi")) {
          setPopup({ 
            isOpen: true, 
            title: "Perlu Login", 
            message: "Silakan login terlebih dahulu untuk menambahkan produk ke keranjang.", 
            type: "warning" 
          });
          return;
        }
        throw new Error(res.error);
      }

      setPopup({ 
        isOpen: true, 
        title: "Berhasil!", 
        message: "Produk berhasil dimasukkan ke keranjang.", 
        type: "success" 
      });

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
      setPopup({ 
        isOpen: true, 
        title: "Gagal", 
        message: errorMessage, 
        type: "error" 
      });
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-base-200 py-6 px-4 md:px-8 relative">
      <AlertPopup 
        isOpen={popup.isOpen}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        autoClose={popup.type === "success" ? 3000 : undefined} 
        onCancel={() => setPopup({ ...popup, isOpen: false })}
        onConfirm={popup.type === "warning" ? () => router.push("/login") : undefined} 
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 mt-2">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-base-100 p-6 rounded-2xl border border-base-content/5 shadow-sm">
            <ProductCarousel image={foundItem.image_url} name={foundItem.item_name} />
            
            <div className="flex flex-col">
              <h1 className="text-3xl font-black uppercase mb-6 tracking-tighter">{foundItem.item_name}</h1>
              
              <div className={`space-y-6 ${loading ? "opacity-40" : ""}`}>
                
                {/* 1. DESKRIPSI PRODUK */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1">
                    <Info size={12}/> Deskripsi Produk
                  </p>
                  <div className="bg-base-200/50 p-4 rounded-xl border border-base-content/5 text-xs leading-relaxed">
                    {variant?.description || "Tidak ada deskripsi spesifik untuk varian ini."}
                  </div>
                </div>

                {/* 2. PRICING RULES (HARGA GROSIR) */}
                {variant?.pricing_rules && variant.pricing_rules.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Daftar Harga Grosir ({variant.uom})</p>
                    <div className="overflow-hidden border border-base-content/10 rounded-xl">
                      <table className="table table-xs w-full bg-base-100">
                        <thead className="bg-base-200/50">
                          <tr>
                            <th className="font-black uppercase py-3">Jumlah</th>
                            <th className="font-black uppercase py-3 text-right">Harga Satuan</th>
                          </tr>
                        </thead>
                        <tbody className="font-bold">
                          {variant.pricing_rules.map((rule, idx) => (
                            <tr key={idx} className={currentQty >= rule.min_qty && (rule.max_qty === 0 || currentQty <= rule.max_qty) ? "bg-primary/10 text-primary" : ""}>
                              <td className="py-3">
                                {rule.max_qty === 0 ? `≥ ${rule.min_qty}` : `${rule.min_qty} - ${rule.max_qty}`} {variant.uom}
                              </td>
                              <td className="py-3 text-right">
                                Rp {rule.rate.toLocaleString("id-ID")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="divider opacity-5 my-0"></div>

                {/* 3. FORM PESAN & JASA TAMBAHAN */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Konfigurasi Pesanan</p>
                  <div className="bg-base-200/30 p-4 rounded-2xl border border-base-content/5 space-y-4">
                    <FormPesan 
                      fields={dynamicFields} 
                      values={selectedAttrs}
                      groupedAddons={groupedAddons}
                      onValueChange={handleAttributeChange} 
                    />
                  </div>
                </div>

                <div className="block lg:hidden space-y-6 pt-4 border-t border-base-content/10">
                  <FileUpload variant="minimal"/>
                  
                  <div className="bg-base-200/50 p-5 rounded-2xl border border-base-content/5">
                    <h3 className="text-[10px] font-black uppercase opacity-40 mb-4 flex items-center gap-2"><CreditCard size={14}/> Ringkasan</h3>
                    <div className="space-y-3 text-xs font-bold uppercase">
                      <div className="flex justify-between items-center">
                        <span className="opacity-60">Harga ({currentQty} {variant?.uom})</span>
                        <span>Rp {basePrice.toLocaleString("id-ID")}</span>
                      </div>
                      {addonTotal > 0 && (
                        <div className="flex justify-between items-center text-primary">
                          <span className="opacity-60">Jasa Tambahan</span>
                          <span>+ Rp {addonTotal.toLocaleString("id-ID")}</span>
                        </div>
                      )}
                      <div className="divider my-1 opacity-10"></div>
                      <div className="flex justify-between items-end">
                        <p className="text-[10px] opacity-40 mb-1">Total Estimasi</p>
                        <p className="text-2xl font-black text-primary tracking-tighter">Rp {totalPrice.toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <button onClick={handleAddToCart} disabled={cartLoading || loading || !variant} className="btn btn-primary mt-8 rounded-2xl font-black uppercase tracking-widest">
                {cartLoading ? <span className="loading loading-spinner"></span> : <><ShoppingBag size={18}/> Tambah Keranjang</>}
              </button>
            </div>
          </div>
          <ProductRow title="Produk Serupa" data={recommendations} />
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="card bg-base-100 p-6 rounded-2xl border border-base-content/10 shadow-sm">
             <h3 className="text-[10px] font-black uppercase opacity-40 mb-4 flex items-center gap-2"><CreditCard size={14}/> Ringkasan</h3>
             <div className="space-y-3 text-xs font-bold uppercase">
                <div className="flex justify-between items-center">
                  <span className="opacity-60">Harga ({currentQty} {variant?.uom})</span>
                  <span>Rp {basePrice.toLocaleString("id-ID")}</span>
                </div>
                {addonTotal > 0 && (
                  <div className="flex justify-between items-center text-primary">
                    <span className="opacity-60">Jasa Tambahan</span>
                    <span>+ Rp {addonTotal.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="divider my-1 opacity-10"></div>
                <div className="pt-1">
                   <p className="text-[10px] opacity-40 mb-1">Total Estimasi</p>
                   <p className="text-2xl font-black text-primary tracking-tighter">Rp {totalPrice.toLocaleString("id-ID")}</p>
                </div>
             </div>
            </div>
            <FileUpload />
            <div className="card bg-primary text-primary-content shadow-xl shadow-primary/20 rounded-2xl">
              <div className="card-body p-6 gap-4">
                <h3 className="font-bold flex items-center gap-2 underline underline-offset-4 uppercase text-sm">
                  <Award size={20}/> LAYANAN TERBAIK
                </h3>
                <div className="space-y-4 text-sm leading-tight">
                  <BenefitItem icon={<CheckCircle size={18} className="text-black"/>} title="CETAK ONLINE" desc="Mudah & praktis dari rumah." />
                  <BenefitItem icon={<Truck size={18} className="text-black"/>} title="PENGIRIMAN CEPAT" desc="Ekspedisi terpercaya." />
                  <BenefitItem icon={<ShieldCheck size={18} className="text-black"/>} title="JAMINAN KUALITAS" desc="QC ketat sebelum dikirim." />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const BenefitItem = ({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) => (
  <div className="flex gap-3">
    <div className="mt-1">{icon}</div>
    <div>
      <p className="font-black uppercase text-[10px] tracking-tighter leading-none mb-1">{title}</p>
      <p className="opacity-70 text-[9px] font-bold uppercase leading-tight">{desc}</p>
    </div>
  </div>
);