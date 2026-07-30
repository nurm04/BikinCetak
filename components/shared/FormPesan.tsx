"use client";

import { useEffect } from "react";
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
  
  // Efek untuk auto-select addon/finishing yang harga_tambahannya 0
  useEffect(() => {
    if (!groupedAddons || !onValueChange) return;

    Object.entries(groupedAddons).forEach(([groupName, addons]) => {
      if (!values?.[groupName]) {
        const isAllZero = addons.every((a) => Number(a.harga_tambahan) === 0);
        if (!isAllZero) {
          const defaultAddon = addons.find((a) => Number(a.harga_tambahan) === 0);
          if (defaultAddon) {
            onValueChange(groupName, defaultAddon.id_pilihan_finishing);
          }
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupedAddons]); 

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* 1. LOOPING VARIAN UTAMA */}
      {fields.map((field, index) => {
        const selectOptions = field.options || [];

        return (
          <div key={index}>
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

      {/* 2. LOOPING ADDONS / FINISHING */}
      {groupedAddons && Object.entries(groupedAddons).map(([groupName, addons]) => {
        const isAllZero = addons.every((a) => Number(a.harga_tambahan) === 0);
        const defaultAddon = !isAllZero ? addons.find((a) => Number(a.harga_tambahan) === 0) : undefined;
        const fallbackValue = defaultAddon ? defaultAddon.id_pilihan_finishing : "";

        const selectedAddonId = values?.[groupName] || fallbackValue;
        const selectedAddonInfo = addons.find(a => a.id_pilihan_finishing === selectedAddonId);

        const addonOptions = addons.map(a => ({
            value: a.id_pilihan_finishing,
            label: `${a.nama_pilihan} (+ Rp ${Number(a.harga_tambahan).toLocaleString("id-ID")})`
        }));

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
              <p className="text-[11px] text-warning font-bold mt-1">
                * Minimum pesan {selectedAddonInfo.minimum_pesan} pcs untuk finishing ini
              </p>
            )}
          </div>
        );
      })}

      {/* 3. DYNAMIC FORM (BERDASARKAN TIPE KALKULASI) */}
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
            <p className="text-[11px] text-warning font-bold mt-1 leading-tight">
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