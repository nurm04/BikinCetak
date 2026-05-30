/* eslint-disable @typescript-eslint/no-unused-vars */
// @/services/itemService.ts
"use server";

export interface PricingRule {
  min_qty: number;
  max_qty: number;
  rate: number;
}

export interface VariantLainnya {
  item_code: string;
  name_variant: string;
  price: number;
}

export interface VariantDetail {
  variant_name: string;
  item_code: string;
  uom: string;
  description: string;
  pricing_rules: PricingRule[];
  variant_lainnya?: VariantLainnya[];
}

export interface ItemTemplate {
  name: string;
  item_name: string;
  image_url: string;
}

export interface ItemData {
  item_group_name: string;
  templates: ItemTemplate[];
}

export interface ApiResponse {
  data: ItemData[];
}

export interface ApiVariantResponse {
  data: VariantDetail[];
}

const API_URL = "https://bikincetak-api.up.railway.app/v1/items";

export async function getItems(): Promise<ItemData[]> {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      next: { revalidate: 60 }, 
    });

    if (!response.ok) {
      const textRes = await response.text();
      console.error(`[getItems] Error ${response.status}:`, textRes);
      return [];
    }

    const result: ApiResponse = await response.json();
    return result.data || [];
  } catch (error) {
    if (error instanceof Error) console.error("[getItems] Catch Error:", error.message);
    return [];
  }
}

export async function getVariantDetail(itemName: string, attributes: Record<string, string>): Promise<VariantDetail | null> {
  try {
    const url = `${API_URL}/${encodeURIComponent(itemName)}`;
    const response = await fetch(url, { method: "GET", cache: "no-store" });

    if (!response.ok) {
       console.error(`[getVariantDetail] Error ${response.status}`);
       return null;
    }

    const result: ApiVariantResponse = await response.json();
    const suffix = Object.entries(attributes)
      .filter(([key, val]) => key !== "qty" && val !== "") 
      .map(([_, val]) => val.toLowerCase())
      .join("-");
  
    const targetVariantName = suffix ? `${itemName}-${suffix}` : itemName;
    const found = result.data?.find(v => v.variant_name.toLowerCase() === targetVariantName.toLowerCase()) || null;
    
    return found;
  } catch (error: unknown) {
    if (error instanceof Error) console.error("[getVariantDetail] Catch Error:", error.message);
    return null;
  }
}