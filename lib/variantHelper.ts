// @/lib/variantHelper.ts
import { VariantDetail } from "@/services/itemService";

export interface DynamicFormField {
  name: string;
  label: string;
  options: string[];
}

export function parseVariantsToFields(variants: VariantDetail[], itemName: string): DynamicFormField[] {
  if (!variants || variants.length === 0) return [];

  const attributeMap: Record<number, Set<string>> = {};

  variants.forEach((v) => {
    const cleanName = v.variant_name.replace(`${itemName}-`, "");
    const parts = cleanName.split("-");
    
    parts.forEach((part, index) => {
      if (!attributeMap[index]) attributeMap[index] = new Set();
      attributeMap[index].add(part.trim());
    });
  });

  return Object.keys(attributeMap).map((key) => {
    const index = parseInt(key);
    const label = index === 0 ? "Bahan" : index === 1 ? "Ukuran / Detail" : `Opsi ${index + 1}`;
    return {
      name: label.toLowerCase().replace(/\s/g, "_"),
      label: label,
      options: Array.from(attributeMap[index]),
    };
  });
}