/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo } from "react";
import FormInput from "@/components/ui/FormInput";
import FormSelect from "@/components/ui/FormSelect";
import FormTextarea from "@/components/ui/FormTextarea";
import { OpsiFinishing } from "@/services/itemService";

interface FormFieldOption {
  label: string;
  value: string;
}

interface FormField {
  name: string;
  label: string;
  options?: FormFieldOption[];
}

interface FormPesanProps {
  fields: FormField[];
  values?: Record<string, string>;
  onValueChange?: (name: string, value: string) => void;
  groupedAddons?: Record<string, OpsiFinishing[]>;
  minimumQty?: number;
  tipeKalkulasi?: string;
}

export default function FormPesan({ fields, values, onValueChange, groupedAddons, minimumQty = 1, tipeKalkulasi = "standard" }: FormPesanProps) {
  
  useEffect(() => {
    if (!groupedAddons || !onValueChange) return;

    Object.entries(groupedAddons).forEach(([groupName, addons]) => {
      if (values?.[groupName] === undefined) {
        
        const zeroAddon = addons.find((a) => Number(a.harga_tambahan) === 0);
        
        if (zeroAddon) {
          onValueChange(groupName, zeroAddon.id_pilihan_finishing);
        } else {
          onValueChange(groupName, "");
        }
      }
    });
  }, [groupedAddons]); 

  // Daftar roll standar (bisa lu sesuaikan)
  const availableRolls = useMemo(() => [0.9, 1.2, 1.6, 1.8, 2.0], []);
  
  const currentRoll = parseFloat(values?.['Lebar Bahan Dihitung'] || "1.20");
  const currentPanjang = parseFloat(values?.Panjang || "1");
  const currentLebar = parseFloat(values?.Lebar || "1");
  
  // Mencari sisi terpanjang buat pengali
  const maxDim = Math.max(currentPanjang, currentLebar);
  const qtyInput = parseInt(values?.qty || String(minimumQty), 10);

  return (
    <div className="grid grid-cols-1 gap-4">

      {/* 1. LOOPING VARIAN UTAMA */}
      {fields.map((field, index) => {
        const selectOptions = field.options || [];

        return (
          <div key={index} className="pt-2">
            <FormSelect 
              label={field.label} 
              name={field.name} 
              options={selectOptions}
              value={values?.[field.name] || ""} 
              onChange={(name, val) => {
                if (onValueChange) onValueChange(name, val);
              }}
            />
          </div>
        );
      })}

      {/* ========================================================= */}
      {/* KHUSUS CETAK METERAN: PINDAH KE BAWAH VARIAN */}
      {/* ========================================================= */}
      {tipeKalkulasi === "cetak_meteran" && (
        <div className="space-y-4 pt-4 border-t border-base-content/5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormInput
                label="Panjang (Meter)"
                name="Panjang"
                type="number"
                min="0.1"
                step="0.1"
                value={values?.Panjang || ""}
                onChange={onValueChange}
              />
            </div>
            <div>
              <FormInput
                label="Lebar (Meter)"
                name="Lebar"
                type="number"
                min="0.1"
                step="0.1"
                value={values?.Lebar || ""}
                onChange={onValueChange}
              />
            </div>
          </div>
          
          <div className="pt-2 space-y-3">
            <div>
              <label className="text-[10px] font-black uppercase opacity-60 mb-2 block tracking-widest px-1">Lebar Bahan Terpilih</label>
              <div className="flex flex-wrap gap-2 px-1">
                {availableRolls.map(roll => (
                  <div 
                    key={roll} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      currentRoll === roll 
                        ? 'bg-primary text-primary-content border-primary shadow-sm' 
                        : 'bg-base-200/50 text-base-content/50 border-base-content/10'
                    }`}
                  >
                    {roll}
                  </div>
                ))}
                {/* Tampilan kalau minDim ngelewatin roll 2.0 (fallback ke Math.ceil) */}
                {!availableRolls.includes(currentRoll) && (
                   <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-content border-primary shadow-sm border">
                     {currentRoll}
                   </div>
                )}
              </div>
            </div>
            
            <div className="bg-base-200/50 border border-base-content/10 p-3 rounded-xl text-xs font-bold text-base-content/70">
               Perhitungan: {qtyInput} x {currentRoll} x {maxDim} = <span className="text-primary font-black ml-1">{((qtyInput * currentRoll * maxDim)).toFixed(1).replace(/\.0$/, '')} m²</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* KHUSUS CETAK BUKU: UI JUMLAH HALAMAN */}
      {/* ========================================================= */}
      {tipeKalkulasi === "cetak_buku" && (
        <div className="pt-4 border-t border-base-content/5 grid grid-cols-1">
          <FormInput
            label="Jumlah Halaman"
            name="jumlah_halaman"
            type="number"
            min="1"
            value={values?.jumlah_halaman || ""}
            onChange={onValueChange}
          />
        </div>
      )}

      {/* 2. LOOPING ADDONS / FINISHING */}
      {groupedAddons && Object.entries(groupedAddons).map(([groupName, addons]) => {
        const hasZero = addons.some((a) => Number(a.harga_tambahan) === 0);
        const addonOptions: FormFieldOption[] = [];

        if (!hasZero) {
          addonOptions.push({
            value: "",
            label: `Tanpa ${groupName} (+ Rp 0)`
          });
        }

        addons.forEach(a => {
          addonOptions.push({
            value: a.id_pilihan_finishing,
            label: `${a.nama_pilihan} (+ Rp ${Number(a.harga_tambahan).toLocaleString("id-ID")})`
          });
        });

        const selectedAddonId = values?.[groupName] !== undefined 
          ? values[groupName] 
          : (hasZero ? addons.find(a => Number(a.harga_tambahan) === 0)?.id_pilihan_finishing || "" : "");

        const selectedAddonInfo = addons.find(a => a.id_pilihan_finishing === selectedAddonId);

        return (
          <div key={groupName} className="pt-2 border-t border-base-content/5">
            <FormSelect 
              label={groupName} 
              name={groupName} 
              options={addonOptions}
              value={selectedAddonId}
              onChange={(name, val) => {
                if (onValueChange) onValueChange(groupName, val);
              }}
            />
            
            {/* Teks Info Minimum Pesan khusus Finishing */}
            {selectedAddonInfo && selectedAddonInfo.minimum_pesan > 1 && (
              <p className="text-[11px] text-warning font-bold mt-1 px-1">
                * Minimum pesan {selectedAddonInfo.minimum_pesan} pcs untuk finishing ini
              </p>
            )}
          </div>
        );
      })}
      
      {/* 4. INPUT QTY & CATATAN */}
      <div className="pt-4 space-y-4 border-t border-base-content/5">
        <div>
          <FormInput
            label="Jumlah Pesanan (Qty)"
            name="qty"
            type="number"
            min={String(minimumQty)}
            value={String(values?.qty || "1")}
            onChange={onValueChange}
          />
          {minimumQty > 1 && (
            <p className="text-[11px] text-warning font-bold mt-1 leading-tight px-1">
              * Konfigurasi produk ini mewajibkan minimum pesanan {minimumQty} pcs
            </p>
          )}
        </div>

        <FormTextarea
          label="Catatan Cetak"
          name="catatan"
          placeholder="Contoh: Potong pola, laminasi doff..."
          className="bg-base-100"
          value={values?.catatan || ""}
          onChange={onValueChange}
        />
      </div>
    </div>
  );
}