/* eslint-disable @typescript-eslint/no-unused-vars */
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getItems, ItemData } from "@/services/itemService";
import { getPengaturan, PengaturanData } from "@/services/pengaturanWebService";
import { slugify } from "@/lib/utils";
import ProductRow from "@/components/shared/ProductRow";

export interface CityResult {
  city_id: string;
  province_id: string;
  province: string;
  type: string;
  city_name: string;
  postal_code: string;
}

// Fungsi helper untuk mengubah teks menjadi Title Case (huruf depan setiap kata besar)
function toTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeApiResponse(responsePayload: unknown): Record<string, unknown>[] {
  let results: Record<string, unknown>[] = [];
  if (Array.isArray(responsePayload)) {
    results = responsePayload as Record<string, unknown>[];
  } else if (responsePayload && typeof responsePayload === "object") {
    const payload = responsePayload as Record<string, unknown>;
    if (Array.isArray(payload.data)) {
      results = payload.data as Record<string, unknown>[];
    } else if (payload.rajaongkir && typeof payload.rajaongkir === "object" && Array.isArray((payload.rajaongkir as Record<string, unknown>).results)) {
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
    if (!res.ok) throw new Error("Failed");
    const provinceJson = unknownToRecord(await res.json());
    const provinces = normalizeApiResponse(provinceJson);
    let allCities: CityResult[] = [];

    if (provinces.length > 0) {
      const cityPromises = provinces.map(async (prov: Record<string, unknown>) => {
        const provId = String(prov.province_id || prov.id || "");
        if (!provId) return [];
        const cityRes = await fetch(`${API_URL}/api/shipping/cities/${provId}`, { cache: "force-cache" });
        if (!cityRes.ok) return [];
        const cityJson = await cityRes.json();
        const citiesData = normalizeApiResponse(cityJson);
        return citiesData.map((c: Record<string, unknown>) => ({
          city_id: String(c.city_id || c.id || ""),
          province_id: String(c.province_id || provId),
          province: String(c.province || prov.province || prov.name || "Jawa Timur"),
          type: String(c.type || "Kabupaten"),
          city_name: String(c.city_name || c.name || ""),
          postal_code: String(c.postal_code || "")
        }));
      });
      const citiesArrays = await Promise.all(cityPromises);
      allCities = citiesArrays.flat();
    }

    if (allCities.length === 0) {
      return [{ city_id: "419", province_id: "11", province: "Jawa Timur", type: "Kabupaten", city_name: "Sumenep", postal_code: "69411" }];
    }
    return allCities;
  } catch (error) {
    return [{ city_id: "419", province_id: "11", province: "Jawa Timur", type: "Kabupaten", city_name: "Sumenep", postal_code: "69411" }];
  }
}

function unknownToRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object") return value as Record<string, unknown>;
  return {};
}

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka);
};

const getCleanKatalogLabel = (skuName: string, productName: string = "") => {
    let labelBersih = skuName;
    const prefix1Match = labelBersih.match(/^[A-Z0-9]+-\d+-/i);
    if (prefix1Match) labelBersih = labelBersih.replace(prefix1Match[0], '');
    if (productName) {
       const escProd = productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
       const regexProd = new RegExp(`^${escProd}-?`, 'i');
       labelBersih = labelBersih.replace(regexProd, '').trim();
    }
    if (labelBersih.includes('-')) {
        const lastDashIndex = labelBersih.lastIndexOf('-');
        labelBersih = labelBersih.substring(0, lastDashIndex).trim();
    }
    return labelBersih || "Standar";
};

export async function generateMetadata({ params }: { params: Promise<{ city?: string; slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const cityParam = resolvedParams?.city || "kediri";
  const productSlug = resolvedParams?.slug || "";

  const cities = await getAllCities();
  
  const cleanCityQuery = cityParam
    .replace(/-/g, " ")
    .replace(/^kabupaten\s+/i, "")
    .replace(/^kota\s+/i, "")
    .trim();

  const matchedCity = cities.find(c => {
    const dbCity = c.city_name.toLowerCase();
    return dbCity === cleanCityQuery || 
           dbCity.includes(cleanCityQuery) || 
           cleanCityQuery.includes(dbCity);
  }) || { type: "Kabupaten", city_name: cleanCityQuery, province: "Jawa Timur" };

  const formattedType = toTitleCase(matchedCity.type);
  const formattedCityName = toTitleCase(matchedCity.city_name);
  const formattedProvince = toTitleCase(matchedCity.province);

  const products: ItemData[] = await getItems();
  
  const cleanedProductQuery = productSlug
    .replace(/-di-.*/, "")
    .replace(/^cetak-/, "");

  const matchedProduct = products.find(p => 
    slugify(p.nama_produk) === cleanedProductQuery || 
    slugify(p.nama_produk).includes(cleanedProductQuery) ||
    cleanedProductQuery.includes(slugify(p.nama_produk))
  ) || products[0];

  if (!matchedProduct) {
    return { title: "Layanan Cetak | BikinCetak" };
  }

  const kotaAja = `${formattedType} ${formattedCityName}`;
  const wilayahLengkap = `${formattedType} ${formattedCityName}, ${formattedProvince}`;
  
  const pengaturan: PengaturanData | null = await getPengaturan();
  
  const titleTemplate = pengaturan?.seo_title_template || `Jasa Cetak {{ produk }} Murah di {{ kota }} - Print Custom`;
  const descTemplate = pengaturan?.seo_desc_template || `Melayani cetak {{ produk }} di {{ kota }} melalui pesan online. Kebutuhan percetakan Anda lebih murah, cepat, dan terjangkau dengan kualitas terbaik.`;

  const finalTitle = titleTemplate
    .replace(/\{\{\s*produk\s*\}\}/gi, matchedProduct.nama_produk)
    .replace(/\{\{\s*kota\s*\}\}/gi, kotaAja);

  const finalDesc = descTemplate
    .replace(/\{\{\s*produk\s*\}\}/gi, matchedProduct.nama_produk)
    .replace(/\{\{\s*kota\s*\}\}/gi, wilayahLengkap);

  return {
    title: finalTitle,
    description: finalDesc,
  };
}

export default async function CityProductPage({ params }: { params: Promise<{ city?: string; slug: string }> }) {
  const resolvedParams = await params;
  const cityParam = resolvedParams?.city || "kediri";
  const productSlug = resolvedParams?.slug || "";

  const cities = await getAllCities();
  const matchedCity = cities.find(c => slugify(c.city_name) === cityParam) || {
    city_id: "999", province_id: "11", province: "Jawa Timur", type: "Kabupaten", city_name: cityParam, postal_code: "69411"
  };

  const formattedType = toTitleCase(matchedCity.type);
  const formattedCityName = toTitleCase(matchedCity.city_name);
  const formattedProvince = toTitleCase(matchedCity.province);

  const products: ItemData[] = await getItems();
  
  const cleanedProductQuery = productSlug
    .replace(/-di-.*/, "")
    .replace(/^cetak-/, "");

  const matchedProduct = products.find(p => 
    slugify(p.nama_produk) === cleanedProductQuery || 
    slugify(p.nama_produk).includes(cleanedProductQuery) ||
    cleanedProductQuery.includes(slugify(p.nama_produk))
  ) || products[0];

  if (!matchedProduct) notFound();

  const kotaAja = `${formattedType} ${formattedCityName}`;
  const wilayahLengkap = `${formattedType} ${formattedCityName}, ${formattedProvince}`;
  const gambarProduk = matchedProduct.gambar_urls?.[0] || null;

  const produkSerupa = products
    .filter(p => p.kategori?.id_kategori === matchedProduct.kategori?.id_kategori && p.id_produk !== matchedProduct.id_produk)
    .map(p => ({ name: p.nama_produk, image: p.gambar_urls, harga_mulai_dari: p.harga_mulai_dari, diskon_roles: p.diskon_roles }));

  const kotaSeProvinsi = cities.filter(c => c.province_id === matchedCity.province_id && c.city_name.toLowerCase() !== matchedCity.city_name.toLowerCase());

  return (
    <main className="min-h-screen bg-base-100 py-6 px-4 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        
        {/* Breadcrumbs */}
        <div className="text-xs breadcrumbs opacity-60 overflow-x-auto whitespace-nowrap">
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href={`/digital-printing/percetakan-${slugify(matchedCity.city_name)}`}>Percetakan {formattedCityName}</Link></li>
            <li className="capitalize">{matchedProduct.nama_produk}</li>
          </ul>
        </div>

        {/* Hero Section */}
        <div className="bg-primary text-primary-content p-6 md:p-12 rounded-3xl shadow-xl flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="flex-1 space-y-4 w-full">
            <span className="inline-block badge badge-neutral font-bold uppercase tracking-wider text-[10px] md:text-xs py-2 px-3 whitespace-normal h-auto leading-normal">
              Wilayah Pengiriman: {kotaAja}
            </span>
            <h1 className="text-2xl md:text-5xl font-black tracking-tight leading-snug md:leading-tight">
              Cetak {matchedProduct.nama_produk} Berkualitas di {kotaAja}
            </h1>
            <p className="opacity-90 text-sm md:text-base leading-relaxed">
              Melayani cetak <strong>{matchedProduct.nama_produk}</strong> di <strong>{wilayahLengkap}</strong> melalui pesan online, jadi kebutuhan percetakan Anda lebih murah, dengan harga terjangkau.
            </p>
            <div className="pt-2">
              <Link 
                href={`/produk/${slugify(matchedProduct.nama_produk)}`} 
                className="btn btn-neutral btn-sm md:btn-md font-black uppercase tracking-wider shadow-lg w-full md:w-auto"
              >
                Pesan {matchedProduct.nama_produk} Sekarang
              </Link>
            </div>
          </div>
          
          {gambarProduk && (
            <div className="w-full md:w-80 h-48 md:h-64 relative rounded-2xl overflow-hidden shadow-lg bg-white p-4 shrink-0">
              <Image 
                src={gambarProduk} 
                alt={`${matchedProduct.nama_produk} di ${formattedCityName}`}
                fill
                unoptimized
                className="object-contain p-2"
              />
            </div>
          )}
        </div>

        {/* Artikel Narasi SEO Informatif */}
        <section className="space-y-4 text-base-content/80 text-sm md:text-base leading-relaxed bg-base-200/50 p-5 md:p-8 rounded-3xl border border-base-200">
          <h2 className="text-lg md:text-2xl font-black text-primary uppercase tracking-tight">
            Pusat Jasa Cetak {matchedProduct.nama_produk} Terlengkap & Terjangkau di {kotaAja}
          </h2>
          <p>
            Menjelang berbagai kebutuhan promosi maupun personal, banyak perusahaan, instansi kantor, lembaga, sekolah, yayasan, pondok pesantren, hingga keperluan bisnis dan perorangan di <strong>{wilayahLengkap}</strong> mulai mencari vendor percetakan profesional. Tentunya saat ini Anda sedang mencari informasi produsen cetak terpercaya yang mampu melayani pemesanan praktis tanpa harus keluar rumah.
          </p>
          <p>
            Kami hadir untuk memudahkan Anda warga <strong>{wilayahLengkap}</strong> dan sekitarnya. Produk <strong>{matchedProduct.nama_produk}</strong> ini dirancang dengan standar produksi terbaik, menggunakan mesin cetak berteknologi tinggi untuk menghasilkan cetakan yang tajam, presisi, serta material pilihan yang awet.
          </p>
          <p>
            Semua proses produksi dan pengiriman pesanan langsung dikirimkan dari workshop utama kami di <strong>Surabaya</strong>, memastikan kualitas kontrol terjaga ketat sebelum dikirim ke lokasi Anda. Dengan sistem pemesanan online yang efisien, kami siap melayani pengiriman pesanan Anda dengan aman dan cepat menjangkau seluruh kecamatan di wilayah <strong>{formattedProvince}</strong>.
          </p>
          <p>
            Tunggu apalagi? Segera tentukan pilihan spesifikasi dan desain terbaik Anda, lalu <Link href="/login" className="text-primary font-bold underline hover:text-primary-focus">daftarkan</Link> diri Anda dan dapatkan penawaran harga terbaik bersama BikinCetak.
          </p>
        </section>

        {/* TABEL SKU / VARIAN PRODUK */}
        {matchedProduct.dataSkus && matchedProduct.dataSkus.length > 0 && (
          <div className="space-y-4 md:space-y-6 pt-4">
            <div className="border-b-2 border-primary pb-2 w-full md:w-fit">
              <h2 className="font-bold tracking-wider uppercase text-primary text-sm md:text-xl">
                Daftar Harga & Spesifikasi Cetak {matchedProduct.nama_produk} di {formattedCityName}
              </h2>
            </div>

            <div className="overflow-x-auto bg-base-100 border border-base-300 rounded-2xl shadow-sm">
              <table className="table table-sm md:table-md w-full">
                <thead>
                  <tr className="bg-base-200/60 text-base-content">
                    <th className="font-bold">No</th>
                    <th className="font-bold">Nama Varian / Spesifikasi</th>
                    <th className="font-bold">Estimasi Harga</th>
                    <th className="font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {matchedProduct.dataSkus.map((sku, index) => {
                    const namaSkuBersih = getCleanKatalogLabel(sku.nama_sku, matchedProduct.nama_produk);

                    return (
                      <tr key={sku.nama_sku} className="hover:bg-base-200/30 transition-colors">
                        <th className="w-12">{index + 1}</th>
                        <td className="font-semibold text-base-content">{namaSkuBersih}</td>
                        <td className="font-black text-primary">{formatRupiah(sku.harga || 0)}</td>
                        <td className="text-right">
                          <Link
                            href={`/produk/${slugify(matchedProduct.nama_produk)}`}
                            className="btn btn-xs md:btn-sm btn-primary uppercase font-bold tracking-wider text-[10px] md:text-xs"
                          >
                            Pesan
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TEKS PEMISAH */}
        <div className="pt-6 pb-2 text-center border-t border-base-200">
          <h3 className="text-sm md:text-lg font-bold text-base-content/80">
            Mencari Jenis Percetakan Lainnya?
          </h3>
          <p className="text-xs md:text-sm opacity-60 mt-1">
            Jelajahi berbagai pilihan produk printing penunjang promosi dan kebutuhan kantor terbaik kami di bawah ini.
          </p>
        </div>

        {/* PRODUK SERUPA */}
        {produkSerupa.length > 0 && (
          <div>
            <ProductRow title={`Produk ${matchedProduct.kategori?.nama_kategori || 'Serupa'} Lainnya`} data={produkSerupa} />
          </div>
        )}

        {/* INTERNAL LINKING: KOTA LAIN DALAM 1 PROVINSI */}
        {kotaSeProvinsi.length > 0 && (
          <div className="pt-8 border-t border-base-200 space-y-4">
            <div className="space-y-1">
              <span className="badge badge-outline text-[10px] md:text-xs font-bold uppercase tracking-wider text-primary border-primary/30">
                Area Layanan {formattedProvince}
              </span>
              <h3 className="text-lg md:text-2xl font-black text-base-content tracking-tight">
                Cetak {matchedProduct.nama_produk} di Kota Lain
              </h3>
              <p className="text-xs md:text-sm opacity-70">
                Layanan cetak {matchedProduct.nama_produk} online siap kirim aman dan cepat ke seluruh kota dan kabupaten di {formattedProvince}.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 md:gap-2 pt-2">
              {kotaSeProvinsi.map((kota) => {
                const citySlug = slugify(kota.city_name);
                const routeUrl = `/print/${slugify(matchedProduct.nama_produk)}-di-${citySlug}`;
                const namaKotaLengkap = `${toTitleCase(kota.type)} ${toTitleCase(kota.city_name)}`;

                return (
                  <Link
                    key={kota.city_id}
                    href={routeUrl}
                    className="px-3 py-1.5 md:px-4 md:py-2 text-[11px] md:text-xs font-semibold bg-base-100 hover:bg-primary hover:text-primary-content border border-base-300 rounded-full shadow-xs transition-all duration-200"
                  >
                    {namaKotaLengkap}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}