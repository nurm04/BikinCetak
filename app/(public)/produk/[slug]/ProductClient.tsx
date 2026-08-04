/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo, ReactNode, useEffect } from "react";
import FormPesan from "../../../../components/shared/FormPesan";
import { ItemDetailData, SkuDetail, OpsiFinishing } from "@/services/itemService"; 
import { addCart, RincianDiskonAPI, CustomAttributeValue } from "@/services/cartService";
import { useRouter } from "next/navigation";
import ProductCarousel from "@/components/shared/ProductCarousel";
import ProductRow from "@/components/shared/ProductRow";
import FileUpload, { FileDesainPayload } from "@/components/ui/FileUpload";
import { ShoppingBag, CreditCard, Award, CheckCircle, Truck, ShieldCheck, Info, Clock } from "lucide-react";
import AlertPopup from "@/components/ui/AlertPopup";
import { slugify } from "@/lib/utils";

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
  isLoggedIn?: boolean; 
}

export default function ProductClientLayout({ itemDetail, initialSku, recommendations, activeRoleId, idAlamatUtama, isLoggedIn }: ProductClientLayoutProps) {
  const router = useRouter();
  const [cartLoading, setCartLoading] = useState<boolean>(false);

  const targetSku = initialSku || (itemDetail?.skus?.[0] ?? null);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    return { 
      qty: "1", 
      catatan: "", 
      id_sku: targetSku?.id_sku || "",
      jumlah_halaman: "1",
      Panjang: "1",
      Lebar: "1"
    };
  });
  
  const [selectedFinishing, setSelectedFinishing] = useState<Record<string, OpsiFinishing | null>>({});
  const [selectedPengerjaanTitle, setSelectedPengerjaanTitle] = useState<string>("");

  const [fileDesain, setFileDesain] = useState<FileDesainPayload>({
    tipe_file: "upload",
    file: null,
    link_file: "",
  });
  
  const [popup, setPopup] = useState<{
    isOpen: boolean; title: string; message: string; type: "success" | "error" | "warning" | "info"; link?: string;
  }>({ isOpen: false, title: "", message: "", type: "info" });

  const currentQty = parseInt(selectedOptions.qty || "1", 10);

  const sku = useMemo<SkuDetail | null>(() => {
    if (!itemDetail || !itemDetail.skus) return null;
    return itemDetail.skus.find(s => s.id_sku === selectedOptions.id_sku) || itemDetail.skus[0] || null;
  }, [selectedOptions.id_sku, itemDetail]);

  useEffect(() => {
    if (sku?.nama_sku && typeof window !== "undefined") {
      const skuSlug = slugify(sku.nama_sku);
      const targetPath = `/produk/${skuSlug}`;
      
      if (window.location.pathname !== targetPath) {
        window.history.replaceState(null, "", targetPath);
      }
    }
  }, [sku?.nama_sku]);

  useEffect(() => {
    if (!sku) {
      setSelectedFinishing({});
      return;
    }

    const defaultFinishing: Record<string, OpsiFinishing | null> = {};
    const defaultOptions: Record<string, string> = {};

    if (sku.opsi_finishing) {
      const groups: Record<string, OpsiFinishing[]> = {};
      
      sku.opsi_finishing.forEach((fin) => {
        if (!groups[fin.kategori_finishing]) groups[fin.kategori_finishing] = [];
        groups[fin.kategori_finishing].push(fin);
      });

      Object.entries(groups).forEach(([kategori, options]) => {
        if (options.length > 0) {
          defaultFinishing[kategori] = null;
          defaultOptions[kategori] = ""; 
        }
      });
    }

    setSelectedFinishing(defaultFinishing);
    setSelectedOptions(prev => ({ ...prev, ...defaultOptions }));

  }, [sku?.id_sku]);

  const availablePengerjaan = useMemo(() => sku?.harga_pengerjaan || [], [sku]);
  
  useEffect(() => {
    if (availablePengerjaan.length > 0) {
        if (!availablePengerjaan.find(p => p.pengerjaan === selectedPengerjaanTitle)) {
            const freeSla = availablePengerjaan.find(p => Number(p.nilai) === 0);
            
            if (freeSla) {
              setSelectedPengerjaanTitle(freeSla.pengerjaan);
            } else {
              const lowestSla = [...availablePengerjaan].sort((a, b) => Number(a.nilai) - Number(b.nilai))[0];
              setSelectedPengerjaanTitle(lowestSla.pengerjaan);
            }
        }
    } else {
        setSelectedPengerjaanTitle("Reguler");
    }
  }, [availablePengerjaan, selectedPengerjaanTitle]);

  const valPanjang = selectedOptions['Panjang'];
  const valLebar = selectedOptions['Lebar'];

  useEffect(() => {
    if (sku?.tipe_kalkulasi === 'cetak_meteran') {
      const p = parseFloat(valPanjang) || 1;
      const l = parseFloat(valLebar) || 1;
      const luasMurni = p * l;

      const minDim = Math.min(p, l);
      const maxDim = Math.max(p, l);

      const rollSizes = [0.9, 1.2, 1.5, 1.6, 1.8, 2.0, 2.2, 2.5, 2.6, 2.8, 3.2];
      let lebarBahan = rollSizes.find(size => size >= minDim);
      
      if (!lebarBahan) {
          lebarBahan = Math.ceil(minDim);
      }

      const luasDihargai = lebarBahan * maxDim;

      if (
        selectedOptions['Luas Murni (m2)'] !== luasMurni.toFixed(2) ||
        selectedOptions['Lebar Bahan Dihitung'] !== lebarBahan.toFixed(2) ||
        selectedOptions['Luas Dihargai (m2)'] !== luasDihargai.toFixed(2)
      ) {
        setSelectedOptions(prev => ({
          ...prev,
          'Luas Murni (m2)': luasMurni.toFixed(2),
          'Lebar Bahan Dihitung': lebarBahan.toFixed(2),
          'Luas Dihargai (m2)': luasDihargai.toFixed(2)
        }));
      }
    }
  }, [valPanjang, valLebar, sku?.tipe_kalkulasi]);
  
  const sisiCetakMultiplier = useMemo(() => {
    if (sku?.tipe_kalkulasi === 'cetak_buku') {
      let sisi = 1;
      Object.values(selectedFinishing).forEach((fin) => {
        if (!fin) return;
        const label = fin.nama_pilihan.toLowerCase();
        if (label.includes('2 sisi') || label.includes('dua sisi') || label.includes('bolak')) {
          sisi = 2;
        }
      });
      return sisi;
    }
    return 1;
  }, [sku?.tipe_kalkulasi, selectedFinishing]);

  const jumlahHalaman = useMemo(() => {
    if (sku?.tipe_kalkulasi !== 'cetak_buku') return 1;
    const val = parseInt(selectedOptions.jumlah_halaman || "1", 10);
    return isNaN(val) || val < 1 ? 1 : val; 
  }, [sku?.tipe_kalkulasi, selectedOptions.jumlah_halaman]);

  const biayaHalamanPerBuku = useMemo(() => {
    if (sku?.tipe_kalkulasi === 'cetak_buku') {
      const halamanDicharge = Math.max(0, jumlahHalaman - 1);
      return halamanDicharge * sisiCetakMultiplier * 1500;
    }
    return 0;
  }, [sku?.tipe_kalkulasi, jumlahHalaman, sisiCetakMultiplier]);

  const hargaDasarAwal = useMemo(() => {
    return Number(sku?.harga_dasar) || 0;
  }, [sku]);

  const diskonGrosirPerPcs = useMemo(() => {
      if (!sku) return 0;
      const tier = [...(sku.harga_bertingkat || [])]
          .sort((a, b) => b.min - a.min)
          .find(t => currentQty >= t.min && (t.max === 0 || t.max === null || currentQty <= t.max));

      if (!tier) return 0;
      
      const nominalDiskon = Number(tier.nilai);
      return tier.tipe === "persen" ? hargaDasarAwal * (Number(tier.nilai) / 100) : nominalDiskon;
  }, [sku, currentQty, hargaDasarAwal]);

  const activeDiscount = useMemo(() => {
    if (!sku || !sku.diskon_customer || !activeRoleId) return null;
    return sku.diskon_customer.find(d => String(d.id_role_customer) === String(activeRoleId)) || null;
  }, [sku, activeRoleId]);

  const diskonMemberPerPcs = useMemo(() => {
      if (!activeDiscount) return 0;
      
      const nominalDiskon = Number(activeDiscount.nilai);
      return activeDiscount.tipe === "persen" ? hargaDasarAwal * (Number(activeDiscount.nilai) / 100) : nominalDiskon;
  }, [activeDiscount, hargaDasarAwal]);

  const totalDiskonSatuan = useMemo(() => diskonGrosirPerPcs + diskonMemberPerPcs, [diskonGrosirPerPcs, diskonMemberPerPcs]);
  
  const hargaSatuanNet = useMemo(() => Math.max(0, hargaDasarAwal - totalDiskonSatuan), [hargaDasarAwal, totalDiskonSatuan]);
  
  const hargaSatuProdukFull = useMemo(() => {
    let net = hargaSatuanNet + biayaHalamanPerBuku;
    
    if (sku?.tipe_kalkulasi === 'cetak_meteran') {
      let luas = parseFloat(selectedOptions['Luas Dihargai (m2)']);
      if (isNaN(luas) || luas < 1) luas = 1;
      net = net * luas;
    }
    
    return net;
  }, [hargaSatuanNet, biayaHalamanPerBuku, sku?.tipe_kalkulasi, selectedOptions]);

  const hargaDasarFullUI = useMemo(() => {
    let base = hargaDasarAwal;
    if (sku?.tipe_kalkulasi === 'cetak_meteran') {
      let luas = parseFloat(selectedOptions['Luas Dihargai (m2)']);
      if (isNaN(luas) || luas < 1) luas = 1;
      base = base * luas;
    }
    return base;
  }, [hargaDasarAwal, sku?.tipe_kalkulasi, selectedOptions]);
  
  const totalFinishing = useMemo(() => {
    let total = 0;
    Object.values(selectedFinishing).forEach((fin) => {
      if (!fin) return;
      
      let biaya = 0;
      const tipeFinishing = fin.tipe || 'nominal'; 
      
      if (tipeFinishing === 'persen') {
        const hargaFisikSatuBarang = sku?.tipe_kalkulasi === 'cetak_meteran' 
          ? hargaSatuProdukFull * (parseFloat(selectedOptions['Luas Dihargai (m2)']) || 1)
          : hargaSatuProdukFull;

        biaya = hargaFisikSatuBarang * (Number(fin.harga_tambahan) / 100);
      } else {
        biaya = Number(fin.harga_tambahan) || 0;
      }

      if (fin.kali_jumlah_pesan) {
        biaya = biaya * currentQty;
      }
      
      total += biaya;
    });
    return total;
  }, [selectedFinishing, hargaSatuProdukFull, currentQty, sku?.tipe_kalkulasi, selectedOptions]);

  const totalHargaProdukUtama = useMemo(() => hargaSatuProdukFull * currentQty, [hargaSatuProdukFull, currentQty]);
  const totalProduk = useMemo(() => totalHargaProdukUtama + totalFinishing, [totalHargaProdukUtama, totalFinishing]);

  const activePengerjaanObj = useMemo(() => {
    if (availablePengerjaan.length === 0) return null;
    return availablePengerjaan.find(p => p.pengerjaan === selectedPengerjaanTitle) || availablePengerjaan[0];
  }, [availablePengerjaan, selectedPengerjaanTitle]);

  const slaPrice = useMemo(() => {
      if (!activePengerjaanObj) return 0;
      const tipeSla = activePengerjaanObj.tipe || 'nominal'; 
      return tipeSla === 'persen' ? totalProduk * (Number(activePengerjaanObj.nilai) / 100) : Number(activePengerjaanObj.nilai);
  }, [activePengerjaanObj, totalProduk]);

  const totalPrice = totalProduk + slaPrice;

  const groupedAddons = useMemo(() => {
    const groups: Record<string, OpsiFinishing[]> = {};
    sku?.opsi_finishing?.forEach((fin) => {
      if (!groups[fin.kategori_finishing]) groups[fin.kategori_finishing] = [];
      groups[fin.kategori_finishing].push(fin);
    });
    return groups;
  }, [sku]);

  const minimumQty = useMemo(() => {
    let min = sku?.minimum_pesan || 1; 
    Object.values(selectedFinishing).forEach((fin) => {
      if (fin && fin.minimum_pesan > min) min = fin.minimum_pesan;
    });
    return min;
  }, [selectedFinishing, sku]);

  useEffect(() => {
    setSelectedOptions((prev) => {
      const qty = parseInt(prev.qty || "1", 10);
      if (qty >= minimumQty) return prev;
      return { ...prev, qty: String(minimumQty) };
    });
  }, [minimumQty]);

  const dynamicFields = useMemo(() => {
    if (!itemDetail?.skus || itemDetail.skus.length === 0) return [];
    return [
      {
        name: "id_sku",
        label: "Pilihan Varian",
        options: itemDetail.skus.map(s => {
          let varianBersih = s.nama_sku.replace(/^[A-Za-z]+-\d+-/, '');
          const escapedProductName = itemDetail.nama_produk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const productPrefixRegex = new RegExp(`^${escapedProductName}-?`, 'i');
          varianBersih = varianBersih.replace(productPrefixRegex, '').trim();
          if (!varianBersih) varianBersih = "Standar";
          return { label: varianBersih, value: s.id_sku };
        })
      }
    ];
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
    // ==========================================
    // 1. REVISI: Cek Login Dulu!
    // ==========================================
    // Jika isLoggedIn explicit `false` ATAU (isLoggedIn tidak di-pass/undefined DAN activeRoleId kosong)
    if (isLoggedIn === false || (isLoggedIn === undefined && !activeRoleId)) {
      setPopup({ 
        isOpen: true, 
        title: "Perlu Login", 
        message: "Silakan login terlebih dahulu untuk melanjutkan pesanan.", 
        type: "warning",
        link: '/login'
      });
      return;
    }

    // ==========================================
    // 2. Cek Alamat Pengiriman
    // ==========================================
    if (!idAlamatUtama) {
      setPopup({ 
        isOpen: true, 
        title: "Alamat Kosong", 
        message: "Silakan tambahkan alamat pengiriman di menu Profil terlebih dahulu sebelum memesan.", 
        type: "warning",
        link: '/profil/alamat/tambah'
      });
      return;
    }

    // 3. Cek SKU
    if (!sku) return;

    // 4. Cek Kelengkapan Data Buku
    if (sku.tipe_kalkulasi === 'cetak_buku' && (!selectedOptions.jumlah_halaman || jumlahHalaman < 1)) {
      setPopup({ 
        isOpen: true, title: "Data Tidak Lengkap", 
        message: "Harap isi Jumlah Halaman buku minimal 1 lembar.", type: "warning" 
      });
      return;
    }

    // 5. Cek Kelengkapan File
    if (fileDesain.tipe_file === "upload" && !fileDesain.file) {
      setPopup({ isOpen: true, title: "File Desain Wajib!", message: "Anda wajib mengunggah file desain untuk melanjutkan pesanan.", type: "warning" });
      return;
    }
    if (fileDesain.tipe_file === "link" && !fileDesain.link_file) {
      setPopup({ isOpen: true, title: "Link Desain Wajib!", message: "Anda wajib memasukkan link Google Drive/Cloud desain pesanan Anda.", type: "warning" });
      return;
    }
    if (fileDesain.tipe_file === "upload" && fileDesain.file) {
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'tif', 'tiff'];
      const fileName = fileDesain.file.name.toLowerCase();
      const fileExt = fileName.split('.').pop() || '';

      if (!allowedExtensions.includes(fileExt)) {
        setPopup({ 
          isOpen: true, 
          title: "Format File Ditolak!", 
          message: "Sistem upload langsung hanya untuk format JPG, JPEG, PNG, dan TIF. Untuk format lain (CDR, PSD, PDF, dsb) wajib dikirim melalui Opsi Link Drive atau Email.", 
          type: "warning" 
        });
        return;
      }

      const MAX_FILE_SIZE = 200 * 1024 * 1024;
      if (fileDesain.file.size > MAX_FILE_SIZE) {
        setPopup({ isOpen: true, title: "File Terlalu Besar!", message: "Maksimal ukuran file untuk di-upload langsung adalah 200MB. Silakan gunakan opsi pengiriman via Link Drive.", type: "warning" });
        return;
      }
    }

    setCartLoading(true);

    try {
      const finishings = Object.values(selectedFinishing)
        .filter((fin): fin is OpsiFinishing => fin !== null)
        .map((fin) => {
          return {
            id_sku_finishing: fin.id_sku_finishing,
            kategori_finishing: fin.kategori_finishing,
            nama_finishing_snapshot: fin.nama_pilihan,
            harga_finishing_snapshot: fin.harga_tambahan,
            tipe: fin.tipe || 'nominal',
            kali_jumlah_pesan: fin.kali_jumlah_pesan ? 1 : 0
          };
        });

      const rincianDiskon: RincianDiskonAPI[] = [];
      if (diskonGrosirPerPcs > 0) {
        const tier = [...(sku.harga_bertingkat || [])]
            .sort((a, b) => b.min - a.min)
            .find(t => currentQty >= t.min && (t.max === 0 || t.max === null || currentQty <= t.max));
        rincianDiskon.push({
            nama: tier?.tipe === 'persen' ? `Harga Grosir Qty ${currentQty} (${tier.nilai}%)` : `Harga Grosir Qty ${currentQty}`,
            nominal: diskonGrosirPerPcs
        });
      }
      if (diskonMemberPerPcs > 0 && activeDiscount) {
        rincianDiskon.push({
            nama: activeDiscount.tipe === 'persen' ? `Diskon Member (${activeDiscount.nilai}%)` : `Diskon Member (Nominal)`,
            nominal: diskonMemberPerPcs
        });
      }

      const atributCustom: Record<string, CustomAttributeValue> = {};
      
      if (sku.tipe_kalkulasi === 'cetak_buku') {
        atributCustom['Jumlah Halaman'] = jumlahHalaman;
      } else if (sku.tipe_kalkulasi === 'cetak_meteran') {
        ['Panjang', 'Lebar', 'Luas Murni (m2)', 'Lebar Bahan Dihitung', 'Luas Dihargai (m2)'].forEach(key => {
          if (selectedOptions[key] !== undefined) {
            atributCustom[key] = selectedOptions[key];
          }
        });
        if (!atributCustom['Luas Dihargai (m2)']) {
          atributCustom['Luas Dihargai (m2)'] = 1;
        }
      }

      const result = await addCart(
        idAlamatUtama, 
        [
          {
            id_sku: sku.id_sku,
            jumlah: currentQty,
            nama_produk_snapshot: sku.nama_sku,
            harga_satuan_snapshot: hargaSatuanNet,
            harga_dasar_awal_snapshot: hargaDasarAwal, 
            total_diskon_snapshot: totalDiskonSatuan,
            rincian_diskon_snapshot: rincianDiskon,
            estimasi_pengerjaan: activePengerjaanObj?.pengerjaan || "Reguler",
            harga_pengerjaan_snapshot: slaPrice,
            catatan: selectedOptions.catatan || "",
            atribut_custom_snapshot: Object.keys(atributCustom).length > 0 ? atributCustom : undefined,
            finishings,
            tipe_file: fileDesain.tipe_file,
            file_desain: fileDesain.file || undefined, 
            link_file: fileDesain.link_file,
          },
        ]
      );
      
      if (result.error) {
        if (result.error.toLowerCase().includes("login") || result.error.toLowerCase().includes("sesi")) {
          setPopup({ isOpen: true, title: "Perlu Login", message: "Silakan login terlebih dahulu.", type: "warning", link: "/login" });
          return;
        }
        throw new Error(result.error);
      }

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
        onConfirm={popup.link ? () => router.push(popup.link!) : undefined} 
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
                      <p className="opacity-80 text-justify whitespace-pre-wrap">
                        {sku?.deskripsi || "Percetakan modern dengan hasil tajam dan presisi tinggi untuk kebutuhan bisnis Anda. Pastikan desain Anda dalam resolusi tinggi untuk hasil maksimal."}
                      </p>
                    </div>
                  </div>
                </div>

                {sku && sku.harga_bertingkat && sku.harga_bertingkat.length > 0 && (
                  <>
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
                            {sku.harga_bertingkat.map((rule, idx) => {
                              const discount = rule.tipe === 'persen' 
                                ? hargaDasarAwal * (rule.nilai / 100) 
                                : rule.nilai;
                              
                              const pricePerPcs = Math.max(0, hargaDasarAwal - discount);

                              return (
                                <tr key={idx} className={currentQty >= rule.min && (rule.max === 0 || currentQty <= rule.max) ? "bg-primary/10 text-primary" : ""}>
                                  <td className="py-3">{rule.min} - {rule.max === 0 ? "Lebih" : rule.max} pcs</td>
                                  <td className="py-3 text-right">Rp {pricePerPcs.toLocaleString("id-ID")}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="divider opacity-5 my-0"></div>
                  </>
                )}

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Konfigurasi Pesanan</p>
                  <div className="bg-base-200/30 p-4 rounded-2xl border border-base-content/5 space-y-4">
                    <FormPesan 
                      fields={dynamicFields} 
                      values={selectedOptions} 
                      groupedAddons={groupedAddons} 
                      onValueChange={handleAttributeChange} 
                      minimumQty={minimumQty}
                      tipeKalkulasi={sku?.tipe_kalkulasi || "standard"} 
                    />
                  </div>
                </div>

                {availablePengerjaan.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Kecepatan Pengerjaan</p>
                    <div className="bg-base-200/30 p-4 rounded-2xl border border-base-content/5 flex flex-col gap-3">
                      {availablePengerjaan.map((p, idx) => {
                        const calcPrice = (p.tipe || 'nominal') === 'persen' ? totalProduk * (p.nilai / 100) : p.nilai;
                        
                        return (
                          <label
                            key={p.id || idx}
                            className={`flex items-center justify-between p-3 md:p-4 border rounded-xl cursor-pointer transition-all ${
                              activePengerjaanObj?.pengerjaan === p.pengerjaan
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-base-content/10 hover:border-base-content/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="pengerjaan"
                                className="radio radio-primary radio-sm"
                                checked={activePengerjaanObj?.pengerjaan === p.pengerjaan}
                                onChange={() => setSelectedPengerjaanTitle(p.pengerjaan)}
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-bold flex items-center gap-2">
                                  <Clock size={14} className={activePengerjaanObj?.pengerjaan === p.pengerjaan ? "text-primary" : "opacity-50"} />
                                  {p.pengerjaan}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-black text-primary">
                              {calcPrice > 0 ? `+ Rp ${calcPrice.toLocaleString("id-ID")}` : "Gratis"}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* MOBILE VIEW SUMMARY */}
                <div className="block lg:hidden space-y-6 pt-4 border-t border-base-content/10">
                  <div className="space-y-2">
                    <FileUpload variant="minimal" onChange={setFileDesain} />
                    <div className="flex items-start gap-1.5 text-warning/90 text-[10px] font-bold leading-tight px-1">
                      <Info size={14} className="shrink-0 mt-0.5" />
                      <p>
                        Lampiran file <b>wajib diisi</b>. Format upload langsung hanya <b>JPG, JPEG, PNG, TIF</b> (Max 200MB). 
                        Untuk format mentahan seperti PDF, CDR, PSD, AI, harap pilih opsi pengiriman via <b>Link Drive</b> atau <b>Email</b>.
                      </p>
                    </div>
                  </div>
                  <div className="bg-base-200/50 p-5 rounded-2xl border border-base-content/5">
                    <h3 className="text-[10px] font-black uppercase opacity-40 mb-4 flex items-center gap-2"><CreditCard size={14}/> Ringkasan</h3>
                    <div className="space-y-3 text-xs font-bold uppercase">
                      <div className="flex justify-between items-center">
                        <span className="opacity-60 flex flex-col">
                          Harga ({currentQty} {sku?.tipe_kalkulasi === 'cetak_buku' ? 'buku' : 'pcs'})
                          {sku?.tipe_kalkulasi === 'cetak_buku' && (
                              <span className="text-[9px] lowercase opacity-70">@ {jumlahHalaman} lbr x {sisiCetakMultiplier} sisi</span>
                          )}
                          {sku?.tipe_kalkulasi === 'cetak_meteran' && (
                              <span className="text-[9px] lowercase opacity-70">ukuran: {selectedOptions['Luas Dihargai (m2)'] || 1} m²</span>
                          )}
                        </span>
                        <div className="text-right flex items-center">
                           {(diskonMemberPerPcs > 0 || diskonGrosirPerPcs > 0) && (
                             <span className="line-through text-error opacity-70 text-[10px] mr-1.5">Rp {hargaDasarFullUI.toLocaleString("id-ID")}</span>
                           )}
                           <span>Rp {hargaSatuProdukFull.toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                      
                      {activeDiscount && (
                        <div className="flex justify-end">
                          <span className="text-[9px] font-black uppercase tracking-widest text-success bg-success/10 px-2 py-0.5 rounded">
                            ✨ Diskon Member {activeDiscount.tipe === 'persen' ? `${activeDiscount.nilai}%` : `Rp ${Number(activeDiscount.nilai).toLocaleString("id-ID")}`}
                          </span>
                        </div>
                      )}

                      {totalFinishing > 0 && (
                        <div className="flex justify-between items-center text-primary mt-2">
                          <span className="opacity-60">Jasa Tambahan</span>
                          <span>+ Rp {totalFinishing.toLocaleString("id-ID")}</span>
                        </div>
                      )}

                      {slaPrice > 0 && (
                        <div className="flex justify-between items-center text-primary mt-2">
                          <span className="opacity-60">Biaya {activePengerjaanObj?.pengerjaan}</span>
                          <span>+ Rp {slaPrice.toLocaleString("id-ID")}</span>
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
                  <span className="opacity-60 flex flex-col">
                    Harga ({currentQty} {sku?.tipe_kalkulasi === 'cetak_buku' ? 'buku' : 'pcs'})
                    {sku?.tipe_kalkulasi === 'cetak_buku' && (
                        <span className="text-[9px] lowercase opacity-70">@ {jumlahHalaman} lbr x {sisiCetakMultiplier} sisi</span>
                    )}
                    {sku?.tipe_kalkulasi === 'cetak_meteran' && (
                        <span className="text-[9px] lowercase opacity-70">ukuran: {selectedOptions['Luas Dihargai (m2)'] || 1} m²</span>
                    )}
                  </span>
                  <div className="text-right flex items-center">
                     {(diskonMemberPerPcs > 0 || diskonGrosirPerPcs > 0) && (
                       <span className="line-through text-error opacity-70 text-[10px] mr-1.5">Rp {hargaDasarFullUI.toLocaleString("id-ID")}</span>
                     )}
                     <span>Rp {hargaSatuProdukFull.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {activeDiscount && (
                  <div className="flex justify-end">
                    <span className="text-[9px] font-black uppercase tracking-widest text-success bg-success/10 px-2 py-0.5 rounded">
                        ✨ Diskon Member {activeDiscount.tipe === 'persen' ? `${activeDiscount.nilai}%` : `Rp ${Number(activeDiscount.nilai).toLocaleString("id-ID")}`}
                    </span>
                  </div>
                )}

                {totalFinishing > 0 && (
                  <div className="flex justify-between items-center text-primary mt-2">
                    <span className="opacity-60">Jasa Tambahan</span>
                    <span>+ Rp {totalFinishing.toLocaleString("id-ID")}</span>
                  </div>
                )}

                {slaPrice > 0 && (
                  <div className="flex justify-between items-center text-primary mt-2">
                    <span className="opacity-60">Biaya {activePengerjaanObj?.pengerjaan}</span>
                    <span>+ Rp {slaPrice.toLocaleString("id-ID")}</span>
                  </div>
                )}
                
                <div className="divider my-1 opacity-10"></div>
                <div className="pt-1 flex flex-col items-end">
                   <p className="text-[10px] opacity-40 mb-1">Total Estimasi</p>
                   <p className="text-2xl font-black text-primary tracking-tighter">Rp {totalPrice.toLocaleString("id-ID")}</p>
                </div>
             </div>
            </div>
            
            <div className="space-y-2">
              <FileUpload onChange={setFileDesain} />
              <div className="flex items-start gap-1.5 text-warning/90 text-[10px] font-bold leading-tight px-1">
                <Info size={14} className="shrink-0 mt-0.5" />
                <p>
                  Lampiran file <b>wajib diisi</b>. Format upload langsung hanya <b>JPG, JPEG, PNG, TIF</b> (Max 200MB). 
                  Untuk format mentahan seperti PDF, CDR, PSD, AI, harap pilih opsi pengiriman via <b>Link Drive</b> atau <b>Email</b>.
                </p>
              </div>
            </div>
            
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