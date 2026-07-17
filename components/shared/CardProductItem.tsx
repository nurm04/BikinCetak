/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Image from "next/image";
import { Trash2, Plus, Minus, Clock, Paperclip, Link as LinkIcon, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { RincianDiskonAPI } from "@/services/cartService";

interface FinishingItem {
  id?: number;
  id_pilihan_finishing?: string;
  nama_pilihan?: string;
  nama_finishing?: string;
  harga_tambahan: number;
}

// Interface baru untuk parsing file_desain dari backend
export interface DataFileDesain {
  tipe: "upload" | "link" | "email";
  nilai: string;
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
  
  // Ubah tipe data file_desain agar bisa nerima Object, String JSON, atau Array lama
  file_desain?: DataFileDesain | string | string[] | null;

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

  isReadOnly = false,
  isSelected = false,
  onToggleSelect,
  onUpdateQty,
  onDelete,
  isLoading = false,
}: CartProductItemProps) {
  const totalJasa = finishing.reduce((acc, f) => acc + f.harga_tambahan, 0);
  const unitPriceTotal = harga_satuan + totalJasa;
  const rowTotal = (unitPriceTotal * jumlah) + harga_pengerjaan_snapshot;

  const productName = nama_sku;
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

  let parsedFileDesain: DataFileDesain | null = null;
  
  if (file_desain) {
    if (typeof file_desain === "string") {
      try {
        parsedFileDesain = JSON.parse(file_desain);
      } catch (e) {
      }
    } else if (Array.isArray(file_desain) && file_desain.length > 0) {
      parsedFileDesain = { tipe: "upload", nilai: file_desain[0] };
    } else if (typeof file_desain === "object" && !Array.isArray(file_desain)) {
      parsedFileDesain = file_desain as DataFileDesain;
    }
  }

  return (
    <div className={`py-6 flex flex-col sm:flex-row gap-6 items-start transition-all ${!isReadOnly && !isSelected ? "opacity-60" : "opacity-100"}`}>
      
      {/* 1. CHECKBOX */}
      {!isReadOnly && onToggleSelect && (
        <div className="pt-8 hidden sm:block shrink-0">
          <input 
            type="checkbox" 
            className="checkbox checkbox-primary checkbox-sm rounded-lg" 
            checked={isSelected} 
            onChange={() => onToggleSelect(id)} 
          />
        </div>
      )}

      {/* 2. IMAGE */}
      <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-base-200 border border-base-content/5 shrink-0">
        <Image 
          src="/favicon.ico"
          alt={productName} 
          fill 
          unoptimized
          sizes="96px" 
          className="object-cover" 
        />
      </div>

      {/* 3. INFO PRODUK */}
      <div className="flex-1 space-y-1 min-w-0 w-full">
        <h3 className="font-black uppercase text-sm tracking-tight leading-tight truncate">
          {productName}
        </h3>
        
        {/* HARGA SATUAN */}
        <div className="flex items-center gap-2">
           <p className="text-xs font-bold text-primary">
             Rp {unitPriceTotal.toLocaleString("id-ID")} / pcs
           </p>
        </div>

        {/* BADGES (Diskon & Pengerjaan) */}
        <div className="flex flex-wrap gap-2 mt-1">
           {rincian_diskon_snapshot.length > 0 && (
              <span className="text-[9px] font-black uppercase tracking-widest text-success bg-success/10 px-2 py-0.5 rounded">
                 ✨ {rincian_diskon_snapshot[0].nama}
              </span>
           )}
           {harga_pengerjaan_snapshot > 0 && (
              <span className="text-[9px] font-black uppercase tracking-widest text-warning bg-warning/10 px-2 py-0.5 rounded flex items-center gap-1">
                 <Clock size={10}/> {estimasi_pengerjaan} (+ Rp {harga_pengerjaan_snapshot.toLocaleString("id-ID")})
              </span>
           )}
        </div>
        
        <div className="mt-3">
          <div className="inline-block w-full bg-base-300/50 px-4 py-3 rounded-xl border border-base-content/5 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-tight leading-relaxed">
              {finishing.length > 0 ? (
                <span>
                  {finishing.map((f, idx) => (
                    <span key={idx}>
                      {idx > 0 && <span className="mx-2 opacity-20"> | </span>}
                      <span className="opacity-60">
                        {f.nama_pilihan || f.nama_finishing}
                      </span>
                    </span>
                  ))}
                </span>
              ) : (
                <span className="opacity-40">Tidak ada jasa tambahan</span>
              )}
            </p>

            {catatan && (
               <p className="text-[9px] font-bold opacity-60 lowercase first-letter:uppercase pt-2 border-t border-base-content/10">
                 Catatan: {catatan}
               </p>
            )}

            {/* BADGE TIPE FILE DESAIN */}
            {parsedFileDesain && (
              <div className="pt-2 border-t border-base-content/10">
                <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1.5">File Desain:</p>
                <div className="flex flex-wrap gap-1.5">
                  
                  {parsedFileDesain.tipe === "upload" && (
                    <a 
                      href={`http://127.0.0.1:8000/storage/${parsedFileDesain.nilai}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-base-100 hover:bg-base-200 transition-colors border border-base-content/10 hover:border-primary/50 px-2.5 py-1.5 rounded-lg text-[9px] font-bold shadow-sm cursor-pointer group"
                    >
                      <Paperclip size={12} className="text-primary group-hover:text-primary-focus"/>
                      <span className="truncate max-w-30 group-hover:underline">Lampiran File</span>
                    </a>
                  )}

                  {parsedFileDesain.tipe === "link" && (
                    <a 
                      href={parsedFileDesain.nilai.startsWith('http') ? parsedFileDesain.nilai : `https://${parsedFileDesain.nilai}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-base-100 hover:bg-base-200 transition-colors border border-base-content/10 hover:border-primary/50 px-2.5 py-1.5 rounded-lg text-[9px] font-bold shadow-sm cursor-pointer group"
                    >
                      <LinkIcon size={12} className="text-primary group-hover:text-primary-focus"/>
                      <span className="truncate max-w-30 group-hover:underline">Buka Link Drive</span>
                    </a>
                  )}

                  {parsedFileDesain.tipe === "email" && (
                    <div className="flex items-center gap-1.5 bg-base-100 border border-base-content/10 px-2.5 py-1.5 rounded-lg text-[9px] font-bold shadow-sm opacity-80 cursor-default">
                      <Mail size={12} className="text-primary"/>
                      <span className="truncate max-w-30">Dikirim via Email</span>
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto gap-4 shrink-0">
        {!isReadOnly ? (
          <div className="flex items-center bg-base-200 rounded-xl p-1 relative">
            <button 
              onClick={() => onUpdateQty?.(id, Math.max(1, jumlah - 1))} 
              disabled={isLoading || jumlah <= 1} 
              className="btn btn-ghost btn-xs btn-square"
            >
              <Minus size={12}/>
            </button>
            
            <div className="relative w-12 h-6 flex justify-center items-center">
              {isLoading ? (
                <span className="loading loading-spinner loading-xs absolute text-primary"></span>
              ) : (
                <input 
                  type="number"
                  value={localQty}
                  onChange={handleQtyChange}
                  onBlur={submitQty}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="w-full h-full text-xs font-black text-center bg-transparent outline-none focus:bg-base-100 focus:ring-1 focus:ring-primary rounded transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="1"
                />
              )}
            </div>

            <button 
              onClick={() => onUpdateQty?.(id, jumlah + 1)} 
              disabled={isLoading} 
              className="btn btn-ghost btn-xs btn-square"
            >
              <Plus size={12}/>
            </button>
          </div>
        ) : (
          <div className="bg-base-200 px-3 py-1.5 rounded-lg text-[10px] font-black opacity-60 uppercase tracking-widest border border-base-content/5">
            {jumlah} Pcs
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <p className="font-black text-sm text-primary">
              Rp {rowTotal.toLocaleString("id-ID")}
            </p>
            {harga_pengerjaan_snapshot > 0 && (
               <span className="text-[8px] opacity-40 uppercase font-bold tracking-widest mt-0.5">
                 *Termasuk Biaya {estimasi_pengerjaan}
               </span>
            )}
          </div>
          
          {!isReadOnly && onDelete && (
            <button 
              onClick={() => onDelete(id)} 
              disabled={isLoading} 
              className="btn btn-ghost btn-xs text-error btn-square hover:bg-error/20"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}