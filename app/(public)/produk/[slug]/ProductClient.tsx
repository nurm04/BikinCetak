/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo, ReactNode, useEffect } from "react";
import FormPesan from "../../../../components/shared/FormPesan";
import { ItemDetailData, SkuDetail, OpsiFinishing } from "@/services/itemService"; 
import { addCart, RincianDiskonAPI } from "@/services/cartService"; 
import { useRouter } from "next/navigation";
import ProductCarousel from "@/components/shared/ProductCarousel";
import ProductRow from "@/components/shared/ProductRow";
import FileUpload from "@/components/ui/FileUpload";
import { ShoppingBag, CreditCard, Award, CheckCircle, Truck, ShieldCheck, Info, Clock } from "lucide-react";
import AlertPopup from "@/components/ui/AlertPopup";

interface ProductClientLayoutProps {
  itemDetail: ItemDetailData; 
  initialSku: SkuDetail | null;
  recommendations: { 
    name: string; 
    image: string[];
    id?: string; 
    harga_mulai_dari?: number; 
    diskon_roles?: Record<string, number>; 
  }[];
  activeRoleId?: string | null;
  idAlamatUtama?: string;
}

export default function ProductClientLayout({ itemDetail, initialSku, recommendations, activeRoleId, idAlamatUtama }: ProductClientLayoutProps) {
  const router = useRouter();
  const [cartLoading, setCartLoading] = useState<boolean>(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = { qty: "1", catatan: "" };
    if (itemDetail?.varians) {
      itemDetail.varians.forEach(v => {
        if (v.pilihan_varian && v.pilihan_varian.length > 0) {
          initial[v.id_varian] = v.pilihan_varian[0].id_pilihan;
        }
      });
    }
    return initial;
  });
  
  const [selectedFinishing, setSelectedFinishing] = useState<Record<string, OpsiFinishing | null>>({});
  const [selectedPengerjaanTitle, setSelectedPengerjaanTitle] = useState<string>("");
  
  // PERBAIKAN 1: Tambahkan state untuk menampung BANYAK file desain dari FileUpload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); 
  
  const [popup, setPopup] = useState<{
    isOpen: boolean; title: string; message: string; type: "success" | "error" | "warning" | "info";
  }>({ isOpen: false, title: "", message: "", type: "info" });

  const currentQty = parseInt(selectedOptions.qty || "1", 10);

  const sku = useMemo<SkuDetail | null>(() => {
    if (!itemDetail || !itemDetail.skus) return null;
    const pureVariantIds = itemDetail.varians.map(v => selectedOptions[v.id_varian]).filter(Boolean);
    return itemDetail.skus.find(s => {
      const hasAllSelections = pureVariantIds.every(id => s.kombinasi_pilihan.includes(id));
      const sameLength = s.kombinasi_pilihan.length === pureVariantIds.length;
      return hasAllSelections && sameLength;
    }) || null;
  }, [selectedOptions, itemDetail]);

  useEffect(() => {
    setSelectedFinishing({});
    setSelectedOptions(prev => {
      const cleaned: Record<string, string> = { qty: prev.qty || "1", catatan: prev.catatan || "" };
      if (itemDetail?.varians) {
        itemDetail.varians.forEach(v => {
          cleaned[v.id_varian] = prev[v.id_varian] || "";
        });
      }
      return cleaned;
    });
  }, [sku?.id_sku, itemDetail]);

  const availablePengerjaan = useMemo(() => sku?.harga_pengerjaan || [], [sku]);
  
  const activePengerjaan = useMemo(() => {
    if (availablePengerjaan.length === 0) return { pengerjaan: "Reguler", harga: 0 };
    const found = availablePengerjaan.find(p => p.pengerjaan === selectedPengerjaanTitle);
    return found || availablePengerjaan[0];
  }, [availablePengerjaan, selectedPengerjaanTitle]);

  const basePrice = useMemo<number>(() => {
    if (!sku) return 0;
    const tier = sku.harga_bertingkat?.find((h) => currentQty >= h.min && currentQty <= h.max);
    return tier ? tier.harga : (sku.harga_dasar || 0);
  }, [sku, currentQty]);

  const activeDiscount = useMemo(() => {
    if (!sku || !sku.diskon_customer || !activeRoleId) return null;
    return sku.diskon_customer.find(d => String(d.id_role_customer) === String(activeRoleId)) || null;
  }, [sku, activeRoleId]);

  const finalBasePrice = useMemo<number>(() => {
    let price = basePrice;
    if (activeDiscount) {
      if (activeDiscount.tipe === "persen") {
        price = price - (price * (activeDiscount.nilai / 100));
      } else if (activeDiscount.tipe === "nominal") {
        price = price - activeDiscount.nilai;
      }
    }
    return Math.max(0, price); 
  }, [basePrice, activeDiscount]);

  const groupedAddons = useMemo(() => {
    const groups: Record<string, OpsiFinishing[]> = {};
    sku?.opsi_finishing?.forEach((fin) => {
      if (!groups[fin.kategori_finishing]) groups[fin.kategori_finishing] = [];
      groups[fin.kategori_finishing].push(fin);
    });
    return groups;
  }, [sku]);

  const minimumQty = useMemo(() => {
    let min = 1;
    Object.values(selectedFinishing).forEach((fin) => {
      if (fin && fin.minimum_pesan > min) min = fin.minimum_pesan;
    });
    return min;
  }, [selectedFinishing]);

  useEffect(() => {
    setSelectedOptions((prev) => {
      const qty = parseInt(prev.qty || "1", 10);
      if (qty >= minimumQty) return prev;
      return { ...prev, qty: String(minimumQty) };
    });
  }, [minimumQty]);

  const addonTotal = Object.values(selectedFinishing).reduce((acc, curr) => acc + (curr?.harga_tambahan || 0), 0);
  const totalPrice = ((finalBasePrice + addonTotal) * currentQty) + activePengerjaan.harga;

  const dynamicFields = useMemo(() => {
    if (!itemDetail?.varians) return [];
    return itemDetail.varians.map(v => ({
      name: v.id_varian,
      label: v.nama_varian,
      options: v.pilihan_varian.map(p => ({ label: p.nama_pilihan, value: p.id_pilihan }))
    }));
  }, [itemDetail]);

  const handleAttributeChange = (name: string, value: string) => {
    if (groupedAddons[name]) {
      const finObj = groupedAddons[name].find((f) => f.id_pilihan_finishing === value) || null;
      setSelectedFinishing((prev) => {
        const updated = { ...prev, [name]: finObj };
        let minQty = 1;
        Object.values(updated).forEach((fin) => {
          if (fin && fin.minimum_pesan > minQty) minQty = fin.minimum_pesan;
        });
        setSelectedOptions((old) => {
          const currentQty = parseInt(old.qty || "1", 10);
          return { ...old, [name]: value, qty: currentQty < minQty ? String(minQty) : old.qty };
        });
        return updated;
      });
      return;
    }
    if (name === "qty") {
      const requestedQty = parseInt(value || "1", 10);
      const finalQty = requestedQty < minimumQty ? minimumQty : requestedQty;
      setSelectedOptions((prev) => ({ ...prev, qty: String(finalQty) }));
      return;
    }
    setSelectedOptions((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddToCart = async () => {
    if (!idAlamatUtama) {
      setPopup({ 
        isOpen: true, title: "Alamat Kosong", 
        message: "Silakan tambahkan alamat pengiriman di menu Profil terlebih dahulu sebelum memesan.", type: "warning" 
      });
      return;
    }

    if (!sku) return;
    setCartLoading(true);

    try {
      const finishings = Object.values(selectedFinishing)
        .filter((fin): fin is OpsiFinishing => fin !== null)
        .map((fin) => ({
          id_sku_finishing: fin.id_sku_finishing,
          kategori_finishing: fin.kategori_finishing,
          nama_finishing_snapshot: fin.nama_pilihan,
          harga_finishing_snapshot: fin.harga_tambahan,
        }));

      const rincianDiskon: RincianDiskonAPI[] = [];
      let totalDiskonSnapshot = 0;

      if (activeDiscount) {
         const diskonNominal = basePrice - finalBasePrice;
         totalDiskonSnapshot = diskonNominal;
         rincianDiskon.push({
             nama: activeDiscount.tipe === 'persen' ? `Diskon Member (${activeDiscount.nilai}%)` : `Diskon Member (Nominal)`,
             nominal: diskonNominal
         });
      }

      const result = await addCart(
        idAlamatUtama, 
        [
          {
            id_sku: sku.id_sku,
            jumlah: currentQty,
            nama_produk_snapshot: sku.nama_sku,
            harga_satuan_snapshot: finalBasePrice, 
            harga_dasar_awal_snapshot: basePrice,
            total_diskon_snapshot: totalDiskonSnapshot,
            rincian_diskon_snapshot: rincianDiskon,
            estimasi_pengerjaan: activePengerjaan.pengerjaan,
            harga_pengerjaan_snapshot: activePengerjaan.harga,
            catatan: selectedOptions.catatan || "",
            finishings,
            
            // PERBAIKAN 2: Sisipkan array file desain yang udah dipilih user
            file_desain: selectedFiles.length > 0 ? selectedFiles : undefined, 
          },
        ]
      );
      
      if (result.error) {
        if (result.error.toLowerCase().includes("login") || result.error.toLowerCase().includes("sesi")) {
          setPopup({ isOpen: true, title: "Perlu Login", message: "Silakan login terlebih dahulu.", type: "warning" });
          return;
        }
        throw new Error(result.error);
      }

      // Reset pilihan file setelah sukses add to cart
      setSelectedFiles([]); 
      setPopup({ isOpen: true, title: "Berhasil!", message: "Produk berhasil dimasukkan ke keranjang.", type: "success" });

    } catch (err) {
      setPopup({ isOpen: true, title: "Gagal", message: err instanceof Error ? err.message : "Terjadi kesalahan sistem.", type: "error" });
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-base-200 py-6 px-4 md:px-8 relative">
      <AlertPopup 
        isOpen={popup.isOpen} type={popup.type} title={popup.title} message={popup.message}
        autoClose={popup.type === "success" ? 3000 : undefined} 
        onCancel={() => setPopup({ ...popup, isOpen: false })}
        onConfirm={popup.type === "warning" ? () => router.push("/login") : undefined} 
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 mt-2">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-base-100 p-6 rounded-2xl border border-base-content/5 shadow-sm">
            <ProductCarousel images={itemDetail?.gambar_urls} name={itemDetail?.nama_produk || "Produk"} />
            
            <div className="flex flex-col">
              <h1 className="text-3xl font-black uppercase mb-6 tracking-tighter">{itemDetail?.nama_produk}</h1>
              
              <div className="space-y-6">
                
                <div className="space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1">
                    <Info size={12}/> Info & Deskripsi Produk
                  </div>
                  <div className="bg-base-200/50 p-4 rounded-xl border border-base-content/5 text-xs leading-relaxed space-y-3">
                    <div>
                      <span className="opacity-60">Kategori:</span> <span className="font-bold text-base-content">{itemDetail?.kategori || "Digital Printing"}</span> <br/>
                    </div>
                    <div className="border-t border-base-content/10 pt-2">
                      <p className="font-black uppercase text-[10px] tracking-tight opacity-50 mb-1">Deskripsi Cetak:</p>
                      <p className="opacity-80 text-justify">
                        Percetakan modern dengan hasil tajam dan presisi tinggi untuk kebutuhan bisnis Anda. Pastikan desain Anda dalam resolusi tinggi untuk hasil maksimal.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Daftar Harga Grosir</p>
                  <div className="overflow-hidden border border-base-content/10 rounded-xl">
                    <table className="table table-xs w-full bg-base-100">
                      <thead className="bg-base-200/50">
                        <tr>
                          <th className="font-black uppercase py-3">Jumlah (Pcs)</th>
                          <th className="font-black uppercase py-3 text-right">Harga Satuan</th>
                        </tr>
                      </thead>
                      <tbody className="font-bold">
                        {sku ? (
                          sku.harga_bertingkat && sku.harga_bertingkat.length > 0 ? (
                            sku.harga_bertingkat.map((rule, idx) => (
                              <tr key={idx} className={currentQty >= rule.min && currentQty <= rule.max ? "bg-primary/10 text-primary" : ""}>
                                <td className="py-3">{rule.min} - {rule.max} pcs</td>
                                <td className="py-3 text-right">Rp {rule.harga.toLocaleString("id-ID")}</td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan={2} className="py-4 text-center opacity-50 font-normal normal-case">Tidak ada jatah harga grosir khusus.</td></tr>
                          )
                        ) : (
                          <tr><td colSpan={2} className="py-4 text-center opacity-50 font-normal normal-case">Sedang memuat harga grosir...</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="divider opacity-5 my-0"></div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Konfigurasi Pesanan</p>
                  <div className="bg-base-200/30 p-4 rounded-2xl border border-base-content/5 space-y-4">
                    <FormPesan fields={dynamicFields} values={selectedOptions} groupedAddons={groupedAddons} onValueChange={handleAttributeChange} />
                  </div>
                </div>

                {/* PILIHAN SLA / ESTIMASI PENGERJAAN */}
                {availablePengerjaan.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Kecepatan Pengerjaan</p>
                    <div className="bg-base-200/30 p-4 rounded-2xl border border-base-content/5 flex flex-col gap-3">
                      {availablePengerjaan.map((p, idx) => (
                        <label
                          key={p.id || idx}
                          className={`flex items-center justify-between p-3 md:p-4 border rounded-xl cursor-pointer transition-all ${
                            activePengerjaan.pengerjaan === p.pengerjaan
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-base-content/10 hover:border-base-content/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="pengerjaan"
                              className="radio radio-primary radio-sm"
                              checked={activePengerjaan.pengerjaan === p.pengerjaan}
                              onChange={() => setSelectedPengerjaanTitle(p.pengerjaan)}
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold flex items-center gap-2">
                                <Clock size={14} className={activePengerjaan.pengerjaan === p.pengerjaan ? "text-primary" : "opacity-50"} />
                                {p.pengerjaan}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-black text-primary">
                            {p.harga > 0 ? `+ Rp ${p.harga.toLocaleString("id-ID")}` : "Gratis"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* MOBILE VIEW SUMMARY */}
                <div className="block lg:hidden space-y-6 pt-4 border-t border-base-content/10">
                  {/* PERBAIKAN 3: Kirim onChange ke FileUpload agar state tersinkron */}
                  <FileUpload variant="minimal" onChange={setSelectedFiles} />
                  <div className="bg-base-200/50 p-5 rounded-2xl border border-base-content/5">
                    <h3 className="text-[10px] font-black uppercase opacity-40 mb-4 flex items-center gap-2"><CreditCard size={14}/> Ringkasan</h3>
                    <div className="space-y-3 text-xs font-bold uppercase">
                      <div className="flex justify-between items-center">
                        <span className="opacity-60">Harga ({currentQty} pcs)</span>
                        <div className="text-right">
                           {activeDiscount && (
                             <span className="line-through text-error opacity-70 text-[10px] mr-1.5">Rp {basePrice.toLocaleString("id-ID")}</span>
                           )}
                           <span>Rp {finalBasePrice.toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                      
                      {activeDiscount && (
                        <div className="flex justify-end">
                          <span className="text-[9px] font-black uppercase tracking-widest text-success bg-success/10 px-2 py-0.5 rounded">
                              ✨ Diskon Member {activeDiscount.tipe === 'persen' ? `${activeDiscount.nilai}%` : `Rp ${activeDiscount.nilai.toLocaleString("id-ID")}`}
                          </span>
                        </div>
                      )}

                      {addonTotal > 0 && (
                        <div className="flex justify-between items-center text-primary mt-2">
                          <span className="opacity-60">Jasa Tambahan</span>
                          <span>+ Rp {(addonTotal * currentQty).toLocaleString("id-ID")}</span>
                        </div>
                      )}

                      {activePengerjaan.harga > 0 && (
                        <div className="flex justify-between items-center text-primary mt-2">
                          <span className="opacity-60">Biaya {activePengerjaan.pengerjaan}</span>
                          <span>+ Rp {activePengerjaan.harga.toLocaleString("id-ID")}</span>
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

              <button onClick={handleAddToCart} disabled={cartLoading || !sku} className="btn btn-primary mt-8 rounded-2xl font-black uppercase tracking-widest">
                {cartLoading ? <span className="loading loading-spinner"></span> : <><ShoppingBag size={18}/> Tambah Keranjang</>}
              </button>
            </div>
          </div>
          
          <ProductRow title="Produk Serupa" data={recommendations} activeRoleId={activeRoleId} />
        </div>

        {/* DESKTOP VIEW SUMMARY */}
        <div className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="card bg-base-100 p-6 rounded-2xl border border-base-content/10 shadow-sm">
             <h3 className="text-[10px] font-black uppercase opacity-40 mb-4 flex items-center gap-2"><CreditCard size={14}/> Ringkasan</h3>
             <div className="space-y-3 text-xs font-bold uppercase">
                <div className="flex justify-between items-center">
                  <span className="opacity-60">Harga ({currentQty} pcs)</span>
                  <div className="text-right">
                     {activeDiscount && (
                       <span className="line-through text-error opacity-70 text-[10px] mr-1.5">Rp {basePrice.toLocaleString("id-ID")}</span>
                     )}
                     <span>Rp {finalBasePrice.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {activeDiscount && (
                  <div className="flex justify-end">
                    <span className="text-[9px] font-black uppercase tracking-widest text-success bg-success/10 px-2 py-0.5 rounded">
                       ✨ Diskon Member {activeDiscount.tipe === 'persen' ? `${activeDiscount.nilai}%` : `Rp ${activeDiscount.nilai.toLocaleString("id-ID")}`}
                    </span>
                  </div>
                )}

                {addonTotal > 0 && (
                  <div className="flex justify-between items-center text-primary mt-2">
                    <span className="opacity-60">Jasa Tambahan</span>
                    <span>+ Rp {(addonTotal * currentQty).toLocaleString("id-ID")}</span>
                  </div>
                )}

                {/* UI BIAYA PENGERJAAN DESKTOP */}
                {activePengerjaan.harga > 0 && (
                  <div className="flex justify-between items-center text-primary mt-2">
                    <span className="opacity-60">Biaya {activePengerjaan.pengerjaan}</span>
                    <span>+ Rp {activePengerjaan.harga.toLocaleString("id-ID")}</span>
                  </div>
                )}
                
                <div className="divider my-1 opacity-10"></div>
                <div className="pt-1 flex flex-col items-end">
                   <p className="text-[10px] opacity-40 mb-1">Total Estimasi</p>
                   <p className="text-2xl font-black text-primary tracking-tighter">Rp {totalPrice.toLocaleString("id-ID")}</p>
                </div>
             </div>
            </div>
            
            {/* PERBAIKAN 4: Kirim onChange ke FileUpload agar state tersinkron (Desktop) */}
            <FileUpload onChange={setSelectedFiles} />
            
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