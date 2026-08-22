/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Image from "next/image";
import { Trash2, Plus, Minus, Clock, Paperclip, Link as LinkIcon, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { RincianDiskonAPI, CustomAttributeValue, FileDesainAPI } from "@/services/cartService";

interface FinishingItem {
  id?: number;
  id_pilihan_finishing?: string;
  nama_pilihan?: string;
  nama_finishing?: string;
  harga_tambahan: number;
  kali_jumlah_pesan?: number | boolean; // Tambahkan ini untuk sinkronisasi harga
}

interface CartProductItemProps {
  id: number;
  nama_sku: string;
  harga_satuan: number;
  jumlah: number;
  finishing?: FinishingItem[];
  
  harga_dasar_awal_snapshot?: number;
  total_diskon_snapshot?: number;
  rincian_diskon_snapshot?: RincianDiskonAPI[];
  estimasi_pengerjaan?: string;
  harga_pengerjaan_snapshot?: number;
  catatan?: string | null;
  
  // Ambil tipe langsung dari API agar strict
  file_desain?: FileDesainAPI | string | string[] | null;
  atribut_custom_snapshot?: Record<string, CustomAttributeValue> | string | null;

  isReadOnly?: boolean; 
  isSelected?: boolean;
  onToggleSelect?: (id: number) => void;
  onUpdateQty?: (id: number, newQty: number) => void;
  onDelete?: (id: number) => void;
  isLoading?: boolean;
}

export default function CartProductItem({
  id,
  nama_sku,
  harga_satuan,
  jumlah,
  finishing = [],
  rincian_diskon_snapshot = [],
  estimasi_pengerjaan,
  harga_pengerjaan_snapshot = 0,
  catatan,
  file_desain = null,
  atribut_custom_snapshot = null,
  isReadOnly = false,
  isSelected = false,
  onToggleSelect,
  onUpdateQty,
  onDelete,
  isLoading = false,
}: CartProductItemProps) {

  // ==========================================
  // PARSING & FILTERING ATRIBUT CUSTOM
  // ==========================================
  let rawAtribut: Record<string, CustomAttributeValue> | null = null;
  if (typeof atribut_custom_snapshot === "string") {
    try {
      rawAtribut = JSON.parse(atribut_custom_snapshot);
    } catch (e) {
      console.error("Gagal parse atribut_custom_snapshot", e);
    }
  } else {
    rawAtribut = atribut_custom_snapshot as Record<string, CustomAttributeValue> | null;
  }

  // Buang atribut yang nilainya null, undefined, atau string kosong ""
  let parsedAtribut: Record<string, CustomAttributeValue> | null = null;
  if (rawAtribut && typeof rawAtribut === 'object') {
    const filtered = Object.entries(rawAtribut).filter(
      ([_, val]) => val !== null && val !== undefined && val !== ""
    );
    if (filtered.length > 0) {
      parsedAtribut = Object.fromEntries(filtered);
    }
  }
  
  // ==========================================
  // LOGIKA KALKULASI HARGA (SINKRON DENGAN CART)
  // ==========================================
  
  // 1. Cari Sisi Cetak
  let sisi = 1; 
  finishing.forEach(f => {
      const namaFin = (f.nama_finishing || f.nama_pilihan || "").toLowerCase();
      if (namaFin.includes('dua sisi') || namaFin.includes('2 sisi') || namaFin.includes('bolak')) {
          sisi = 2;
      }
  });

  // 2. Hitung Biaya Halaman Kertas (Jika Ada)
  let paperCost = 0;
  if (parsedAtribut && parsedAtribut['Jumlah Halaman'] !== undefined) {
      let hal = parseInt(String(parsedAtribut['Jumlah Halaman']), 10);
      if (isNaN(hal) || hal < 1) hal = 1;
      paperCost = (Math.max(0, hal - 1) * sisi * 1500);
  }

  // 3. REVISI: Ambil Multiplier Luas Dihargai
  let multiplierLuas = 1;
  let isMeteran = false;
  if (parsedAtribut && parsedAtribut['Luas Dihargai (m2)'] !== undefined) {
      isMeteran = true;
      multiplierLuas = parseFloat(String(parsedAtribut['Luas Dihargai (m2)']));
      if (isNaN(multiplierLuas) || multiplierLuas < 1) multiplierLuas = 1;
  }

  // Harga dasar murni per item/meter (Harga SKU awal + Harga Kertas Tambahan)
  const basePrice = harga_satuan + paperCost;
  
  // REVISI: Subtotal produk utama sekarang dikali Luas Dihargai (kalau ada)
  let subtotalItem = (basePrice * multiplierLuas) * jumlah;

  // 4. Hitung Biaya Finishing
  finishing.forEach((f) => {
    const isKaliQty = f.kali_jumlah_pesan === true || f.kali_jumlah_pesan === 1;
    const val = f.harga_tambahan || 0;
    subtotalItem += isKaliQty ? (val * jumlah) : val;
  });

  // Total Keseluruhan Baris (Termasuk SLA/Pengerjaan)
  const rowTotal = subtotalItem + harga_pengerjaan_snapshot;
  // ==========================================

  // ==========================================
  // BERSIHKAN NAMA PRODUK DARI KODE SKU
  // ==========================================
  const productName = (nama_sku || "")
    .replace(/^[A-Za-z]+-\d+-/, "")
    .replace(/-/g, " ");

  const [localQty, setLocalQty] = useState<string>(jumlah.toString());

  useEffect(() => {
    setLocalQty(jumlah.toString());
  }, [jumlah]);

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQty(e.target.value);
  };

  const submitQty = () => {
    const newQty = parseInt(localQty, 10);
  
    if (isNaN(newQty) || newQty < 1) {
      setLocalQty(jumlah.toString());
      return;
    }
  
    if (newQty !== jumlah) {
      onUpdateQty?.(id, newQty);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  // Parsing File Desain
  let parsedFileDesain: FileDesainAPI | null = null;
  if (file_desain) {
    if (typeof file_desain === "string") {
      try {
        parsedFileDesain = JSON.parse(file_desain);
      } catch (e) {}
    } else if (Array.isArray(file_desain) && file_desain.length > 0) {
      parsedFileDesain = { tipe: "upload", nilai: file_desain[0] };
    } else if (typeof file_desain === "object" && !Array.isArray(file_desain)) {
      parsedFileDesain = file_desain as FileDesainAPI;
    }
  }

  return (
    <div className={`py-4 sm:py-5 flex flex-row gap-2.5 sm:gap-4 items-start transition-all ${!isReadOnly && !isSelected ? "opacity-60" : "opacity-100"}`}>
      
      {/* 1. BAGIAN KIRI */}
      <div className="flex items-center gap-2.5 shrink-0 pt-1 sm:pt-0">
        {!isReadOnly && onToggleSelect && (
          <input 
            type="checkbox" 
            className="checkbox checkbox-primary checkbox-sm rounded" 
            checked={isSelected} 
            onChange={() => onToggleSelect(id)} 
          />
        )}

        <div className="relative w-17 h-17 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-base-200 border border-base-content/10 shrink-0">
          <Image 
            src="/favicon.ico"
            alt={productName} 
            fill 
            unoptimized
            sizes="(max-width: 640px) 68px, 80px" 
            className="object-cover" 
          />
        </div>
      </div>

      {/* 2. BAGIAN KANAN */}
      <div className="flex flex-col flex-1 min-w-0">
        
        {/* Info Header */}
        <h3 className="font-black capitalize text-[11px] sm:text-sm tracking-tight leading-snug line-clamp-2 mb-1 pr-1">
          {productName}
        </h3>
        
        {/* Harga Satuan Dasar */}
        <p className="text-[10px] sm:text-xs font-bold text-primary mb-1.5 flex items-center gap-1">
          Rp {basePrice.toLocaleString("id-ID")} 
          <span className="opacity-60 text-base-content font-medium">
            {isMeteran ? '/ m²' : '/ pcs'}
          </span>
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {rincian_diskon_snapshot.length > 0 && (
            <span className="text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider text-success bg-success/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              ✨ {rincian_diskon_snapshot[0].nama}
            </span>
          )}
          {/* 👇 PERBAIKAN: Syarat Muncul Badge Berubah */}
          {estimasi_pengerjaan && (
            <span className="text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider text-warning bg-warning/10 px-1.5 py-0.5 rounded flex items-center gap-1">
              <Clock size={9}/> {estimasi_pengerjaan} 
              {harga_pengerjaan_snapshot > 0 && ` (+ Rp ${harga_pengerjaan_snapshot.toLocaleString("id-ID")})`}
            </span>
          )}
        </div>
        
        {/* Detail Varian */}
        <div className="w-full bg-base-200/50 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-lg border border-base-content/5 space-y-1.5 mt-0.5">
          
          <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight leading-relaxed text-base-content/80">
            {/* Atribut Custom (cth: Jumlah Halaman, Luas Murni, dll) */}
            {parsedAtribut && Object.keys(parsedAtribut).length > 0 && (
              <div className="mb-1 text-primary flex flex-wrap gap-1">
                {Object.entries(parsedAtribut).map(([key, val], idx) => (
                  <span key={key}>
                    {idx > 0 && <span className="mx-1 opacity-40 text-base-content">|</span>}
                    <span className="opacity-70">{key}:</span> {String(val)}
                  </span>
                ))}
              </div>
            )}

            {/* List Finishing */}
            {finishing.length > 0 ? (
              <span>
                {finishing.map((f, idx) => (
                  <span key={idx}>
                    {idx > 0 && <span className="mx-1.5 opacity-30">|</span>}
                    <span>
                      {f.nama_pilihan || f.nama_finishing}
                    </span>
                  </span>
                ))}
              </span>
            ) : (
              !parsedAtribut && <span className="opacity-40">Tidak ada jasa tambahan</span>
            )}
          </div>

          {catatan && (
            <p className="text-[9px] font-bold opacity-60 lowercase first-letter:uppercase pt-1.5 border-t border-base-content/5">
              Catatan: {catatan}
            </p>
          )}

          {/* Badge File Desain */}
          {parsedFileDesain && (
            <div className="pt-1.5 border-t border-base-content/5">
              <div className="flex flex-wrap gap-1.5">
                {parsedFileDesain.tipe === "upload" && (
                  <a href={`http://127.0.0.1:8000/storage/${parsedFileDesain.nilai}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-base-100 border border-base-content/10 px-2 py-1 rounded text-[8.5px] font-bold shadow-sm cursor-pointer group hover:border-primary">
                    <Paperclip size={10} className="text-primary"/>
                    <span className="truncate max-w-25">Lampiran File</span>
                  </a>
                )}
                {parsedFileDesain.tipe === "link" && (
                  <a href={parsedFileDesain.nilai.startsWith('http') ? parsedFileDesain.nilai : `https://${parsedFileDesain.nilai}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-base-100 border border-base-content/10 px-2 py-1 rounded text-[8.5px] font-bold shadow-sm cursor-pointer group hover:border-primary">
                    <LinkIcon size={10} className="text-primary"/>
                    <span className="truncate max-w-25">Buka Link Drive</span>
                  </a>
                )}
                {parsedFileDesain.tipe === "email" && (
                  <div className="flex items-center gap-1 bg-base-100 border border-base-content/10 px-2 py-1 rounded text-[8.5px] font-bold shadow-sm opacity-80">
                    <Mail size={10} className="text-primary"/>
                    <span>Dikirim via Email</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. ROW BAWAH */}
        <div className="flex flex-row justify-between items-end w-full mt-3 gap-2">
          
          {/* Qty Controls */}
          {!isReadOnly ? (
            <div className="flex items-center bg-base-200/80 rounded border border-base-content/5 p-0.5">
              <button onClick={() => onUpdateQty?.(id, Math.max(1, jumlah - 1))} disabled={isLoading || jumlah <= 1} className="btn btn-ghost btn-square min-h-0 h-6 w-6 sm:h-7 sm:w-7 p-0">
                <Minus size={12}/>
              </button>
              
              <div className="relative w-8 sm:w-10 h-6 sm:h-7 flex justify-center items-center">
                {isLoading ? (
                  <span className="loading loading-spinner loading-xs absolute text-primary"></span>
                ) : (
                  <input 
                    type="number" value={localQty} onChange={handleQtyChange} onBlur={submitQty} onKeyDown={handleKeyDown} disabled={isLoading}
                    className="w-full h-full text-[11px] sm:text-xs font-black text-center bg-transparent outline-none focus:bg-base-100 rounded transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="1"
                  />
                )}
              </div>

              <button onClick={() => onUpdateQty?.(id, jumlah + 1)} disabled={isLoading} className="btn btn-ghost btn-square min-h-0 h-6 w-6 sm:h-7 sm:w-7 p-0">
                <Plus size={12}/>
              </button>
            </div>
          ) : (
            <div className="bg-base-200 px-3 py-1 rounded text-[9px] font-black opacity-60 uppercase tracking-widest border border-base-content/5">
              {jumlah} Pcs
            </div>
          )}
          
          {/* Total & Hapus */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            <div className="flex flex-col items-end">
              <p className="font-black text-[13px] sm:text-base text-primary leading-none">
                Rp {rowTotal.toLocaleString("id-ID")}
              </p>
              {/* Tanda Bintang Jika Ada Biaya Tambahan Finishing Fix Atau Pengerjaan */}
              {(harga_pengerjaan_snapshot > 0 || rowTotal > (basePrice * jumlah * multiplierLuas)) && (
                <span className="text-[7.5px] opacity-40 uppercase font-black tracking-wider mt-1">
                  *Termasuk Biaya Jasa
                </span>
              )}
            </div>
            
            {!isReadOnly && onDelete && (
              <button onClick={() => onDelete(id)} disabled={isLoading} className="text-base-content/30 hover:text-error transition-colors p-1">
                <Trash2 size={16} />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}