// @/app/(public)/produk/[slug]/page.tsx
import { slugify } from "@/lib/utils";
import { notFound } from "next/navigation";
import { getItems, ApiVariantResponse } from "@/services/itemService";
import ProductClientLayout from "./ProductClient"; // Pastikan path import bener

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Produk({ params }: PageProps) {
  const { slug } = await params;
  const itemGroups = await getItems();

  // Debugging: Cek apakah data dari API beneran masuk
  if (!itemGroups || itemGroups.length === 0) {
    console.error("[Page] itemGroups kosong atau fetch gagal");
    return notFound();
  }

  // 1. Cari Item Template dengan logic yang lebih aman (trim & lowercase)
  let foundItem = null;
  let currentGroup = null;

  for (const group of itemGroups) {
    const match = group.templates.find(
      (t) => slugify(t.item_name.trim()) === slug.trim()
    );
    if (match) {
      foundItem = match;
      currentGroup = group;
      break;
    }
  }

  // Jika tetap tidak ketemu, coba cari berdasarkan template name (PRD-xxx)
  if (!foundItem) {
    foundItem = itemGroups
      .flatMap((g) => g.templates)
      .find((t) => t.name === slug);
  }

  if (!foundItem || !currentGroup) {
    console.warn(`[Page] Produk dengan slug "${slug}" beneran gak ada.`);
    return notFound();
  }

  // 2. Ambil semua list variant mentah dari API Railway
  const variantUrl = `https://bikincetak-api.up.railway.app/v1/items/${encodeURIComponent(foundItem.item_name.trim())}`;
  
  try {
    const variantRes = await fetch(variantUrl, { cache: "no-store" });
    
    if (!variantRes.ok) {
       throw new Error(`API Railway error: ${variantRes.status}`);
    }

    const variantData: ApiVariantResponse = await variantRes.json();
    const allVariants = variantData.data || [];

    // 3. Set variant pertama sebagai initial
    const initialVariant = allVariants.length > 0 ? allVariants[0] : null;

    // 4. Rekomendasi
    const recommendations = currentGroup.templates
      .filter((item) => item.item_name !== foundItem?.item_name)
      .slice(0, 4)
      .map((item) => ({
        name: item.item_name,
        image: item.image_url || "/images/placeholder-product.jpg"
      }));

    return (
      <ProductClientLayout 
        foundItem={foundItem}
        allVariants={allVariants}
        initialVariant={initialVariant}
        recommendations={recommendations}
      />
    );
  } catch (error) {
    console.error("[Page] Gagal fetch variant:", error);
    return notFound(); // Atau tampilkan error page khusus
  }
}