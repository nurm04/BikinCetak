/* eslint-disable @typescript-eslint/no-unused-vars */
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ProductRow from "@/components/shared/ProductRow";
import { getItems, ItemData } from "@/services/itemService";
import { getUserProfile } from "@/services/userService";
import { getPengaturan, PengaturanData } from "@/services/pengaturanWebService";
import { slugify } from "@/lib/utils";

export interface CityResult {
  city_id: string;
  province_id: string;
  province: string;
  type: string;
  city_name: string;
  postal_code: string;
}

function normalizeApiResponse(responsePayload: unknown): Record<string, unknown>[] {
  let results: Record<string, unknown>[] = [];
  
  if (Array.isArray(responsePayload)) {
    results = responsePayload as Record<string, unknown>[];
  } else if (responsePayload && typeof responsePayload === "object") {
    const payload = responsePayload as Record<string, unknown>;
    if (Array.isArray(payload.data)) {
      results = payload.data as Record<string, unknown>[];
    } else if (
      payload.rajaongkir &&
      typeof payload.rajaongkir === "object" &&
      Array.isArray((payload.rajaongkir as Record<string, unknown>).results)
    ) {
      results = (payload.rajaongkir as Record<string, unknown>).results as Record<string, unknown>[];
    } else if (Array.isArray(payload.results)) {
      results = payload.results as Record<string, unknown>[];
    }
  }
  return results;
}

async function getAllCities(): Promise<CityResult[]> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    
    const res = await fetch(`${API_URL}/api/shipping/provinces`, { cache: "force-cache" });
    const provinceJson = unknownToRecord(await res.json());
    
    const provinces = normalizeApiResponse(provinceJson);
    let allCities: CityResult[] = [];

    if (provinces.length > 0) {
      const cityPromises = provinces.map(async (prov: Record<string, unknown>) => {
        const provId = String(prov.province_id || prov.id || "");
        if (!provId) return [];

        const cityRes = await fetch(`${API_URL}/api/shipping/cities/${provId}`, { cache: "force-cache" });
        const cityJson = await cityRes.json();
        
        const citiesData = normalizeApiResponse(cityJson);
        return citiesData.map((c: Record<string, unknown>) => ({
          city_id: String(c.city_id || c.id || ""),
          province_id: String(c.province_id || provId),
          province: String(c.province || prov.province || prov.name || ""),
          type: String(c.type || ""),
          city_name: String(c.city_name || c.name || ""),
          postal_code: String(c.postal_code || "")
        }));
      });
      
      const citiesArrays = await Promise.all(cityPromises);
      allCities = citiesArrays.flat();
    }

    if (allCities.length === 0) {
      return [
        { city_id: "1", province_id: "11", province: "Jawa Timur", type: "Kabupaten", city_name: "Kediri", postal_code: "64111" }
      ];
    }

    return allCities;
  } catch (error) {
    return [
      { city_id: "1", province_id: "11", province: "Jawa Timur", type: "Kabupaten", city_name: "Kediri", postal_code: "64111" }
    ];
  }
}

function unknownToRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }
  return {};
}

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
    urutan: number;
  }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || ""; 

  if (!rawSlug.startsWith("percetakan-")) {
    return { title: "Halaman Tidak Ditemukan | BikinCetak" };
  }

  const citySlug = rawSlug.replace(/^percetakan-/, "");

  const cities = await getAllCities();
  const cleanCityQuery = citySlug
    .replace(/-/g, " ")
    .replace(/^kabupaten\s+/i, "")
    .replace(/^kota\s+/i, "")
    .trim();

  const matchedCity = cities.find(c => {
    const dbCity = c.city_name.toLowerCase();
    return dbCity === cleanCityQuery || 
           dbCity.includes(cleanCityQuery) || 
           cleanCityQuery.includes(dbCity);
  }) || { type: "Kabupaten", city_name: cleanCityQuery.charAt(0).toUpperCase() + cleanCityQuery.slice(1), province: "Jawa Timur" };

  const kotaAja = `${matchedCity.type} ${matchedCity.city_name}`;
  const wilayahLengkap = `${matchedCity.type} ${matchedCity.city_name}, ${matchedCity.province}`;

  const pengaturan: PengaturanData | null = await getPengaturan();
  
  const titleTemplate = pengaturan?.seo_city_title_template || `Jasa Percetakan Online Terlengkap & Termurah di {{ kota }} - BikinCetak`;
  const descTemplate = pengaturan?.seo_city_desc_template || `Melayani jasa percetakan online di {{ kota }} dan sekitarnya. Produksi sticker, banner, merchandise, dan kebutuhan kantor berkualitas langsung dikirim dari Surabaya.`;

  const finalTitle = titleTemplate.replace(/\{\{\s*kota\s*\}\}/gi, kotaAja);
  const finalDesc = descTemplate.replace(/\{\{\s*kota\s*\}\}/gi, wilayahLengkap);

  return {
    title: finalTitle,
    description: finalDesc,
  };
}

export default async function DigitalPrintingCityPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || "";

  if (!rawSlug.startsWith("percetakan-")) {
    notFound();
  }

  const citySlug = rawSlug.replace(/^percetakan-/, "");

  const cities = await getAllCities();
  const cleanCityQuery = citySlug
    .replace(/-/g, " ")
    .replace(/^kabupaten\s+/i, "")
    .replace(/^kota\s+/i, "")
    .trim();

  const matchedCity = cities.find(c => {
    const dbCity = c.city_name.toLowerCase();
    return dbCity === cleanCityQuery || 
           dbCity.includes(cleanCityQuery) || 
           cleanCityQuery.includes(dbCity);
  }) || {
    city_id: "999",
    province_id: "11",
    province: "Jawa Timur",
    type: "Kabupaten",
    city_name: cleanCityQuery.charAt(0).toUpperCase() + cleanCityQuery.slice(1),
    postal_code: "64111"
  };

  const kotaAja = `${matchedCity.type} ${matchedCity.city_name}`;
  const wilayahLengkap = `${matchedCity.type} ${matchedCity.city_name}, ${matchedCity.province}`;

  const items = await getItems();
  const { data: userProfile } = await getUserProfile(); 
  
  const activeRoleId = userProfile?.customer?.id_role_customer || null;
  const groupedCategories: Record<string, CategoryGroup> = {};

  items.forEach((item) => {
    if (item.is_active === 0) return;
    if (item.id_produk === "PRD-0001") return;

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

    const defaultImage = ["https://admin.bikincetak.co.id/storage/img_web/logobikincetak.ico"];

    groupedCategories[catId].submenu.push({
      id: item.id_produk,
      name: item.nama_produk,
      image: (item.gambar_urls && item.gambar_urls.length > 0) ? item.gambar_urls : defaultImage,
      harga_mulai_dari: item.harga_mulai_dari,
      diskon_roles: item.diskon_roles,
      urutan: item.urutan ?? 999,
    });
  });

  const dynamicCategories = Object.values(groupedCategories).sort((a, b) => a.urutan - b.urutan);
  dynamicCategories.forEach(category => {
    category.submenu.sort((a, b) => a.urutan - b.urutan);
  });

  const kotaSeProvinsi = cities.filter(
    c => c.province_id === matchedCity.province_id && c.city_name.toLowerCase() !== matchedCity.city_name.toLowerCase()
  );

  return (
    <main className="min-h-screen bg-base-200">

      {/* Informasi / Heading SEO Wilayah */}
      <div className="py-4 md:py-8 container mx-auto px-4 md:px-12 mb-8">
        <div className="bg-primary text-primary-content p-6 md:p-10 rounded-3xl shadow-md space-y-3">
          <span className="badge badge-neutral font-bold uppercase tracking-wider text-xs">
            Area Layanan Percetakan: {kotaAja}
          </span>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
            Pusat Jasa Percetakan Online Terlengkap & Termurah di {kotaAja}
          </h1>
          <p className="opacity-90 text-sm md:text-base leading-relaxed max-w-4xl">
            Selamat datang bagi Anda warga <strong>{wilayahLengkap}</strong> dan sekitarnya. BikinCetak hadir melayani berbagai kebutuhan cetak promosi bisnis, kantor, instansi, hingga keperluan personal dengan proses praktis secara online. Seluruh pesanan diproduksi dengan standar kualitas tinggi dan dikirimkan langsung dari workshop utama kami di <strong>Surabaya</strong>.
          </p>
        </div>
      </div>

      {/* Daftar Produk Berdasarkan Kategori */}
      <div className="container mx-auto px-4 md:px-12 pb-16">
        {dynamicCategories.map((category) => (
          <ProductRow 
            key={category.id} 
            title={category.label} 
            data={category.submenu} 
            activeRoleId={activeRoleId}
          />
        ))}
      </div>

      {/* INTERNAL LINKING: KOTA LAIN DALAM 1 PROVINSI */}
      {kotaSeProvinsi.length > 0 && (
        <div className="container mx-auto px-4 md:px-12 pb-16">
          <div className="bg-base-100 border border-base-300 p-6 md:p-8 rounded-3xl space-y-4 shadow-sm">
            <div className="space-y-1">
              <span className="badge badge-outline text-xs font-bold uppercase tracking-wider text-primary border-primary/30">
                Area Layanan {matchedCity.province}
              </span>
              <h3 className="text-xl md:text-2xl font-black text-base-content tracking-tight">
                Jasa Percetakan di Kota Lainnya
              </h3>
              <p className="text-sm opacity-70">
                Layanan percetakan online siap kirim aman dan cepat ke seluruh kota dan kabupaten di wilayah {matchedCity.province}.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {kotaSeProvinsi.map((kota) => {
                const cSlug = slugify(kota.city_name);
                const routeUrl = `/digital-printing/percetakan-${cSlug}`;
                const namaKotaLengkap = `${kota.type} ${kota.city_name}`;

                return (
                  <Link
                    key={kota.city_id}
                    href={routeUrl}
                    className="px-4 py-2 text-xs font-semibold bg-base-200/60 hover:bg-primary hover:text-primary-content border border-base-300 rounded-full shadow-xs transition-all duration-200"
                  >
                    {namaKotaLengkap}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer SEO Section */}
      <section className="bg-base-100 py-10 border-t border-base-300">
        <div className="container mx-auto px-4 md:px-12 text-center max-w-3xl space-y-3">
          <h3 className="text-xl md:text-2xl font-bold">Layanan Percetakan Terpercaya untuk Warga {kotaAja}</h3>
          <p className="text-sm opacity-70 leading-relaxed">
            Percayakan kebutuhan cetak Sticker, Banner, Merchandise, Buku, hingga Atribut Kantor Anda di BikinCetak. Pengiriman aman, cepat, dan terjangkau menjangkau seluruh wilayah {matchedCity.province}.
          </p>
        </div>
      </section>

    </main>
  );
}