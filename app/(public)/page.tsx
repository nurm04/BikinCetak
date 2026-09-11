import HeroCarousel from "@/components/shared/HeroCarousel";
import ProductRow from "@/components/shared/ProductRow";
import { getItems } from "@/services/itemService";
import { getUserProfile } from "@/services/userService"; 
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Percetakan Online Terlengkap & Termurah",
  description: "Bikin Cetak melayani berbagai kebutuhan promosi bisnis Anda mulai dari Sticker, Banner, Merchandise hingga kebutuhan kantor dengan proses cepat dan harga kompetitif.",
};

// 👇 TAMBAHAN: Interface untuk Grup Kategori biar rapi
interface CategoryGroup {
  id: string;
  label: string;
  urutan: number;
  submenu: Array<{
    id: string;
    name: string;
    image: string[];
    harga_mulai_dari?: number;
    diskon_roles?: Record<string, number>;
  }>;
}

export default async function Home() {
  const items = await getItems();
  const { data: userProfile } = await getUserProfile();
  const activeRoleId = userProfile?.customer?.id_role_customer || null;

  // ==========================================
  // LOGIC GROUPING KATEGORI BARU
  // Menggunakan Object Kategori dari DB
  // ==========================================
  const groupedCategories: Record<string, CategoryGroup> = {};

  items.forEach((item) => {
    if (item.is_active === 0) return;
    if (item.id_produk === "PRD-0001") return;

    // Tarik metadata kategori, fallback ke "Lainnya" jika kosong
    const catId = item.kategori?.id_kategori || "lainnya";
    const catName = item.kategori?.nama_kategori || "Lainnya";
    const catUrutan = item.kategori?.urutan ?? 999;

    if (!groupedCategories[catId]) {
      groupedCategories[catId] = {
        id: catId,
        label: catName,
        urutan: catUrutan,
        submenu: [],
      };
    }

    // Pastikan default image berupa Array of String
    const defaultImage = ["https://admin.bikincetak.co.id/storage/img_web/logobikincetak.ico"];

    groupedCategories[catId].submenu.push({
      id: item.id_produk,
      name: item.nama_produk,
      image: (item.gambar_urls && item.gambar_urls.length > 0) ? item.gambar_urls : defaultImage,
      harga_mulai_dari: item.harga_mulai_dari,
      diskon_roles: item.diskon_roles,
    });
  });

  // Convert map ke Array lalu urutkan sesuai settingan 'urutan' dari Admin
  const dynamicCategories = Object.values(groupedCategories).sort((a, b) => a.urutan - b.urutan);

  return (
    <main className="min-h-screen bg-base-200">
      <div className="py-4 md:py-8">
        <HeroCarousel />
      </div>

      <div className="container mx-auto px-4 md:px-12 pb-20">
        {dynamicCategories.map((category) => (
          <ProductRow 
            key={category.id} 
            title={category.label} 
            data={category.submenu} 
            activeRoleId={activeRoleId}
          />
        ))}
      </div>

      <section className="bg-base-100 py-10 border-t border-base-300">
        <div className="container mx-auto px-4 md:px-12 text-center max-w-3xl">
          <h3 className="text-2xl font-bold mb-4">Percetakan Online Terlengkap</h3>
          <p className="text-sm opacity-70">
            Bikin Cetak melayani berbagai kebutuhan promosi bisnis Anda mulai dari Sticker, 
            Banner, Merchandise hingga kebutuhan kantor dengan proses cepat dan harga kompetitif.
          </p>
        </div>
      </section>
    </main>
  );
}