"use client";

import FormInput from "@/components/ui/FormInput";
import FormSelect from "@/components/ui/FormSelect";
import FormTextarea from "@/components/ui/FormTextarea";
import { VariantLainnya } from "@/services/itemService";

interface FormField {
  name: string;
  label: string;
  options?: string[];
}

interface FormPesanProps {
  fields: FormField[];
  values?: Record<string, string>;
  onValueChange?: (name: string, value: string) => void;
  groupedAddons?: Record<string, VariantLainnya[]>;
}

export default function FormPesan({ fields, values, onValueChange, groupedAddons }: FormPesanProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {fields.map((field, index) => (
        <div key={index}>
          <FormSelect 
            label={field.label} 
            name={field.name} 
            options={field.options || []}
            value={values?.[field.name] || ""} 
            onChange={onValueChange}
          />
        </div>
      ))}

      {groupedAddons && Object.entries(groupedAddons).map(([groupName, addons]) => (
        <div key={groupName} className="pt-2 border-t border-base-content/5">
          <FormSelect 
            label={groupName} 
            name={groupName} 
            options={[
              `Pilih ${groupName} (Opsional)`, 
              ...addons.map(a => `${a.item_code.split('-').pop()} (+ Rp ${a.price.toLocaleString("id-ID")})`)
            ]}
            value={(() => {
                const selectedAddon = addons.find(a => a.item_code === values?.[groupName]);
                if (selectedAddon) {
                    return `${selectedAddon.item_code.split('-').pop()} (+ Rp ${selectedAddon.price.toLocaleString("id-ID")})`;
                }
                return `Pilih ${groupName} (Opsional)`;
            })()}
            onChange={(name, val) => {
              if (val === `Pilih ${groupName} (Opsional)` || val === "") {
                if (onValueChange) onValueChange(groupName, "");
                return;
              }

              const selected = addons.find(a => 
                `${a.item_code.split('-').pop()} (+ Rp ${a.price.toLocaleString("id-ID")})` === val
              );
              if (onValueChange) onValueChange(groupName, selected?.item_code || "");
            }}
          />
        </div>
      ))}
      
      <div className="pt-4 border-t border-base-content/5 space-y-4">
        <FormInput 
          label="Jumlah Pesanan" 
          name="qty" 
          type="number" 
          min="1"
          defaultValue={String(values?.qty || "1")} 
          onChange={onValueChange}
        />

        <FormTextarea 
          label="Catatan Cetak" 
          name="catatan" 
          placeholder="Contoh: Potong pola, laminasi doff..." 
          className="bg-base-100"
          onChange={onValueChange}
        />
      </div>
    </div>
  );
}