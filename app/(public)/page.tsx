import HeroCarousel from "@/components/shared/HeroCarousel";
import ProductRow from "@/components/shared/ProductRow";
import { getItems } from "@/services/itemService";

export default async function Home() {
  const items = await getItems();
  const dynamicCategories = items
    .filter((group) => group.item_group_name.toLowerCase() !== "services")
    .map((group) => ({
      key: group.item_group_name,
      label: group.item_group_name,
      submenu: group.templates.map((t) => ({
        name: t.item_name,
        image: t.image_url || "/images/placeholder-product.jpg"
      }))
    }));

  return (
    <main className="min-h-screen bg-base-200">
      <div className="py-4 md:py-8">
        <HeroCarousel />
      </div>

      <div className="container mx-auto px-4 md:px-12 pb-20">
        {dynamicCategories.map((category) => (
          <ProductRow 
            key={category.key} 
            title={category.label} 
            data={category.submenu} 
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