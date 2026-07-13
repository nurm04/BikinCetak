"use client";

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
}

export default function FormPesan({ fields, values, onValueChange, groupedAddons }: FormPesanProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {/* 1. LOOPING VARIAN UTAMA */}
      {fields.map((field, index) => {
        // Data 'field.options' dari itemService kebetulan udah berbentuk { label, value }, jadi tinggal lempar!
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
        // Ambil ID Finishing yang sedang aktif dari state values
        const selectedAddonId = values?.[groupName] || "";
        // Cari detail data addon yang terpilih untuk ngecek minimum pesan
        const selectedAddonInfo = addons.find(a => a.id_pilihan_finishing === selectedAddonId);

        // Format ulang data addons menjadi object { value, label } sesuai permintaan FormSelect
        const addonOptions = addons.map(a => ({
            value: a.id_pilihan_finishing,
            label: `${a.nama_pilihan} (+ Rp ${a.harga_tambahan.toLocaleString("id-ID")})`
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
            
            {/* Teks Info Minimum Pesan */}
            {selectedAddonInfo && selectedAddonInfo.minimum_pesan > 1 && (
              <p className="text-[11px] text-warning font-bold mt-1">
                * Minimum pesan {selectedAddonInfo.minimum_pesan} pcs untuk finishing ini
              </p>
            )}
          </div>
        );
      })}
      
      {/* 3. INPUT QTY & CATATAN */}
      <div className="pt-4 space-y-4 border-t border-base-content/5">
        <FormInput
          label="Jumlah Pesanan"
          name="qty"
          type="number"
          min="1"
          value={String(values?.qty || "1")}
          onChange={onValueChange}
        />

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