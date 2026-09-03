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
  fieldsUtama?: FormField[];     
  fieldsTambahan?: FormField[];  
  fields?: FormField[];          
  values?: Record<string, string>;
  selectedFinishing?: Record<string, OpsiFinishing | null>;
  onValueChange?: (name: string, value: string) => void;
  groupedAddons?: Record<string, OpsiFinishing[]>;
  minimumQty?: number;
  kelipatanQty?: number; 
  tipeKalkulasi?: string;
  sisiCetakMultiplier?: number;
  hargaTambahanDimensi?: number; // 👈 TAMBAHAN PROPS BARU
}

export default function FormPesan({ 
  fieldsUtama, 
  fieldsTambahan, 
  fields, 
  values,
  selectedFinishing, 
  onValueChange, 
  groupedAddons, 
  minimumQty = 1, 
  kelipatanQty = 1,
  tipeKalkulasi = "standard", 
  sisiCetakMultiplier = 1,
  hargaTambahanDimensi = 0 // 👈 DESTRUCTURING DEFAULT VALUE
}: FormPesanProps) {
  
  useEffect(() => {
    if (!groupedAddons || !onValueChange || !selectedFinishing) return;

    Object.entries(groupedAddons).forEach(([groupName, addons]) => {
      const currentFinishingObj = selectedFinishing[groupName];
      const hasZero = addons.some((a) => Number(a.harga_tambahan) === 0);

      if (currentFinishingObj === undefined) {
        if (hasZero) {
          const zeroAddon = addons.find((a) => Number(a.harga_tambahan) === 0);
          if (zeroAddon) {
            onValueChange(groupName, String(zeroAddon.id_sku_finishing));
          }
        } else {
          onValueChange(groupName, "");
        }
      }
    });
  }, [groupedAddons]); 

  useEffect(() => {
    if (!onValueChange) return;

    let currentQty = parseInt(values?.qty || "0", 10);
    if (isNaN(currentQty) || currentQty < minimumQty) {
        currentQty = minimumQty;
    }

    if (kelipatanQty > 1 && currentQty % kelipatanQty !== 0) {
        currentQty = Math.ceil(currentQty / kelipatanQty) * kelipatanQty;
    }

    if (String(currentQty) !== values?.qty) {
        onValueChange("qty", String(currentQty));
    }
  }, [minimumQty, kelipatanQty]); 

  const availableRolls = useMemo(() => [0.9, 1.2, 1.6, 1.8, 2.0], []);
  
  const currentRoll = parseFloat(values?.['Lebar Bahan Dihitung'] || "1.20");
  const currentPanjang = parseFloat(values?.Panjang || "1");
  const currentLebar = parseFloat(values?.Lebar || "1");
  
  const maxDim = Math.max(currentPanjang, currentLebar);
  const qtyInput = parseInt(values?.qty || String(minimumQty), 10);

  const renderUtama = fieldsUtama?.length ? fieldsUtama : (fields || []);

  return (
    <div className="grid grid-cols-1 gap-4">

      {renderUtama.map((field, index) => {
        const selectOptions = field.options || [];

        return (
          <div key={`utama-${index}`} className="pt-2">
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

      {tipeKalkulasi === "cetak_meteran" && (
        <div className="space-y-4 pt-4 border-t border-base-content/5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormInput label="Panjang (Meter)" name="Panjang" type="number" min="0.1" step="0.1" value={values?.Panjang ?? ""} onChange={onValueChange} />
            </div>
            <div>
              <FormInput label="Lebar (Meter)" name="Lebar" type="number" min="0.1" step="0.1" value={values?.Lebar ?? ""} onChange={onValueChange} />
            </div>
          </div>
          
          <div className="pt-2 space-y-3">
            <div>
              <label className="text-[10px] font-black uppercase opacity-60 mb-2 block tracking-widest px-1">Lebar Bahan Terpilih</label>
              <div className="flex flex-wrap gap-2 px-1">
                {availableRolls.map(roll => (
                  <div key={roll} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${currentRoll === roll ? 'bg-primary text-primary-content border-primary shadow-sm' : 'bg-base-200/50 text-base-content/50 border-base-content/10'}`}>
                    {roll}
                  </div>
                ))}
                {!availableRolls.includes(currentRoll) && (
                   <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-content border-primary shadow-sm border">
                     {currentRoll}
                   </div>
                )}
              </div>
            </div>
            
            <div className="bg-base-200/50 border border-base-content/10 p-3 rounded-xl text-xs font-bold text-base-content/70">
               Perhitungan: {qtyInput} x {currentRoll} x {maxDim} = <span className="text-primary font-black ml-1">{((qtyInput * currentRoll * maxDim)).toFixed(1).replace(/\.0$/, '')} m²</span>
               {((qtyInput * currentRoll * maxDim)) < 1 && (
                  <div className="text-[9px] font-bold text-error italic mt-1 block">
                      *Minimal order dihitung 1 m²
                  </div>
               )}
            </div>
          </div>
        </div>
      )}

      {tipeKalkulasi === "cetak_buku" && (
        <div className="pt-4 border-t border-base-content/5 grid grid-cols-1">
          <FormInput label="Jumlah Halaman" name="jumlah_halaman" type="number" min="1" value={values?.jumlah_halaman ?? ""} onChange={onValueChange} />
          {(() => {
             const inputHal = parseInt(values?.jumlah_halaman || "1", 10);
             const halValid = isNaN(inputHal) || inputHal < 1 ? 1 : inputHal;
             const tambahanHalaman = Math.max(0, halValid - 1);
             // 👇 PERBAIKAN: MENGGUNAKAN HARGA DINAMIS DARI DATABASE 👇
             const biayaHalaman = tambahanHalaman * sisiCetakMultiplier * hargaTambahanDimensi; 
             if (biayaHalaman > 0) {
                 return (
                    <div className="mt-2 text-[10px] font-bold text-info px-1">
                        * Kalkulasi: Tambahan {tambahanHalaman} Halaman ({sisiCetakMultiplier} Sisi) = + Rp {biayaHalaman.toLocaleString('id-ID')} / pcs
                    </div>
                 );
             }
             return null;
          })()}
        </div>
      )}

      {(fieldsTambahan && fieldsTambahan.length > 0 || (groupedAddons && Object.keys(groupedAddons).length > 0)) && (
        <div className="pt-4 border-t border-base-content/5 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Spesifikasi Tambahan</p>
          
          {fieldsTambahan && fieldsTambahan.map((field, index) => {
            const selectOptions = field.options || [];
            return (
              <div key={`tambahan-${index}`}>
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
              const labelBiaya = a.tipe === 'persen' 
                ? `${a.harga_tambahan}%` 
                : `Rp ${Number(a.harga_tambahan).toLocaleString("id-ID")}`;

              addonOptions.push({
                value: String(a.id_sku_finishing), 
                label: `${a.nama_pilihan} (+ ${labelBiaya})`
              });
            });

            const currentFinishingObj = selectedFinishing ? selectedFinishing[groupName] : undefined;
            let selectedAddonId = "";

            if (currentFinishingObj !== undefined && currentFinishingObj !== null) {
                selectedAddonId = String(currentFinishingObj.id_sku_finishing);
            } else if (currentFinishingObj === null) {
                selectedAddonId = ""; 
            } else {
                selectedAddonId = hasZero ? String(addons.find(a => Number(a.harga_tambahan) === 0)?.id_sku_finishing || "") : "";
            }

            const selectedAddonInfo = addons.find(a => String(a.id_sku_finishing) === selectedAddonId);

            return (
              <div key={groupName}>
                <FormSelect 
                  label={groupName} 
                  name={groupName} 
                  options={addonOptions}
                  value={selectedAddonId}
                  onChange={(name, val) => {
                    if (onValueChange) onValueChange(groupName, val);
                  }}
                />
                
                {selectedAddonInfo && selectedAddonInfo.minimum_pesan > 1 && (
                  <p className="text-[11px] text-warning font-bold mt-1 px-1">
                    * Minimum pesan {selectedAddonInfo.minimum_pesan} pcs untuk finishing ini
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      <div className="pt-4 space-y-4 border-t border-base-content/5">
        <div className="form-control">
          <FormInput
            label="Jumlah Pesanan (Qty)"
            name="qty"
            type="number"
            min={String(minimumQty)}
            step={String(kelipatanQty)} 
            value={values?.qty ?? String(minimumQty)} 
            onChange={onValueChange}
          />
          {minimumQty > 1 && kelipatanQty === 1 && (
            <p className="text-[11px] text-warning font-bold mt-1 leading-tight px-1">
              * Konfigurasi pesanan ini mewajibkan minimum {minimumQty} pcs
            </p>
          )}
          {kelipatanQty > 1 && (
            <p className="text-[11px] text-warning font-bold mt-1 leading-tight px-1">
              * Minimum order {minimumQty} pcs dan harus kelipatan {kelipatanQty} pcs
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