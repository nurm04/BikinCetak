/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Filter, ChevronDown, ChevronUp, SearchX } from 'lucide-react';
import { slugify } from '@/lib/utils';

interface SidebarProduct {
  id: string;
  name: string;
  slug: string;
}

interface SkuGridItem {
  id_sku: string;
  nama_sku_bersih: string;
  slug: string;
  kategori: string;
  parent_slug: string;
  harga: number;
  image: string;
  diskon_roles: Record<string, number>;
  // Tambahan untuk membantu parsing jika ada nama asli SKU
  nama_sku_asli?: string; 
  nama_produk?: string;
}

interface KatalogClientProps {
  sidebarData: Record<string, SidebarProduct[]>;
  skuItems: SkuGridItem[];
  activeRoleId: string | null;
}

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka);
};

// ==============================================================================
// 🌟 HELPER: Fungsi Sakti Pemotong Nama SKU untuk Katalog 🌟
// ==============================================================================
const getCleanKatalogLabel = (skuName: string, productName: string = "") => {
    let labelBersih = skuName;
    
    // 1. Buang Prefix (Kode Produk & Nama Produk)
    // Coba buang PRD-XXX-NamaProduk-
    const prefix1Match = labelBersih.match(/^[A-Z0-9]+-\d+-/i);
    if (prefix1Match) {
      labelBersih = labelBersih.replace(prefix1Match[0], '');
    }

    if (productName) {
       const escProd = productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
       const regexProd = new RegExp(`^${escProd}-?`, 'i');
       labelBersih = labelBersih.replace(regexProd, '').trim();
    }

    // 2. Potong Varian Tambahan (Asumsi: Selalu setelah strip terakhir JIKA nama sangat panjang)
    // Karena di Katalog kita tidak punya relasi 'varians', kita buat tebakan aman:
    // Jika string masih mengandung '-' dan panjang, kemungkinan itu varian tambahan.
    if (labelBersih.includes('-')) {
        const lastDashIndex = labelBersih.lastIndexOf('-');
        // Kita hanya memotong jika bagian setelah '-' cukup pendek (misal: "1 Sisi", "2 Lembar")
        // Ini menghindari pemotongan nama varian utama yang kebetulan ada strip-nya.
        labelBersih = labelBersih.substring(0, lastDashIndex).trim();
    }

    return labelBersih || "Standar";
};


function KatalogContent({ sidebarData, skuItems, activeRoleId }: KatalogClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('kategori') || '';
  const productParam = searchParams.get('produk') || '';

  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<string>('terkait');

  useEffect(() => {
    if (productParam) {
      const foundCat = Object.keys(sidebarData).find(cat => 
        sidebarData[cat].some(p => p.slug === productParam)
      );
      if (foundCat) setExpandedCats({ [slugify(foundCat)]: true });
    } else if (categoryParam) {
      setExpandedCats({ [categoryParam]: true });
    } else {
      setExpandedCats({});
    }
  }, [productParam, categoryParam, sidebarData]);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...skuItems];

    if (queryParam) {
      const q = queryParam.toLowerCase();
      // Pencarian tetap menggunakan nama asli/kotor agar lebih akurat jika user mengetik "1 sisi"
      result = result.filter(item => 
          (item.nama_sku_asli || item.nama_sku_bersih).toLowerCase().includes(q)
      );
    }

    // Filter by Kategori atau by Produk (dari klik Sidebar)
    if (productParam) {
      result = result.filter(item => item.parent_slug === productParam);
    } else if (categoryParam) {
      result = result.filter(item => slugify(item.kategori) === categoryParam);
    }

    // Filter Duplikat Label Bersih
    // Karena satu produk bisa punya banyak varian tambahan, kita hanya perlu nampilin 1 card
    // per Kombinasi Utama.
    const uniqueItems = new Map<string, SkuGridItem>();
    
    result.forEach(item => {
        // Generate label bersih saat on-the-fly
        const displayLabel = getCleanKatalogLabel(item.nama_sku_asli || item.nama_sku_bersih, item.nama_produk);
        
        // Simpan hanya jika belum ada label tersebut, ATAU jika yang baru harganya lebih murah
        if (!uniqueItems.has(displayLabel)) {
            uniqueItems.set(displayLabel, { ...item, nama_sku_bersih: displayLabel });
        } else {
            const existing = uniqueItems.get(displayLabel)!;
            if (item.harga < existing.harga) {
                uniqueItems.set(displayLabel, { ...item, nama_sku_bersih: displayLabel });
            }
        }
    });
    
    let finalResult = Array.from(uniqueItems.values());


    switch (sortBy) {
      case 'terbaru':
        finalResult = finalResult.reverse(); 
        break;
      case 'harga-rendah':
        finalResult.sort((a, b) => a.harga - b.harga);
        break;
      case 'harga-tinggi':
        finalResult.sort((a, b) => b.harga - a.harga);
        break;
      default:
        break; 
    }

    return finalResult;
  }, [skuItems, queryParam, categoryParam, productParam, sortBy]);

  const handleToggleCategory = (catKey: string) => {
    setExpandedCats(prev => prev[catKey] ? {} : { [catKey]: true });
  };

  const selectCategory = (catKey: string) => {
    if (categoryParam === catKey && !productParam) {
      router.push('/katalog');
    } else {
      router.push(`/katalog?kategori=${catKey}`);
    }
  };

  // Dinamis label breadcrumbs
  const getBreadcrumbLabel = () => {
    if (queryParam) return `Pencarian: "${queryParam}"`;
    if (productParam) {
      for (const cat in sidebarData) {
        const p = sidebarData[cat].find(x => x.slug === productParam);
        if (p) return p.name;
      }
    }
    if (categoryParam) {
      const catName = Object.keys(sidebarData).find(k => slugify(k) === categoryParam);
      if (catName) return catName;
    }
    return "Semua Produk";
  };

  return (
    <div className="bg-base-200 min-h-screen py-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6">
        
        {/* SIDEBAR FILTER (KATEGORI -> PRODUK) */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="bg-base-100 p-5 rounded-2xl shadow-sm border border-base-300 sticky top-24">
            <div className="flex items-center gap-2 mb-4 text-base-content pb-3 border-b border-base-200">
              <Filter size={18} className="text-primary" />
              <h2 className="font-bold uppercase tracking-wide text-sm">Filter Produk</h2>
            </div>
            
            <h3 className="font-bold text-xs uppercase opacity-75 mb-3 tracking-wider">Berdasarkan Kategori</h3>
            
            <div className="flex flex-col gap-1">
              {Object.entries(sidebarData).map(([catName, products]) => {
                const catKey = slugify(catName);
                const isActiveCat = categoryParam === catKey && !productParam;
                const isExpanded = expandedCats[catKey];

                return (
                  <div key={catKey} className="border-b border-base-200/60 last:border-0 pb-1">
                    <button 
                      onClick={() => { handleToggleCategory(catKey); selectCategory(catKey); }}
                      className={`flex items-center justify-between w-full py-2.5 px-2 rounded-xl text-left text-sm transition-colors ${isActiveCat ? 'bg-primary/10 text-primary font-bold' : 'text-base-content/80 hover:bg-base-200/50 hover:text-primary'}`}
                    >
                      <span className="truncate">{catName}</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    
                    {isExpanded && (
                      <div className="pl-4 py-1 flex flex-col gap-1.5 border-l-2 border-primary/20 ml-2 mb-2 my-1">
                        {products.map((product) => {
                          const isActiveProduct = productParam === product.slug;
                          return (
                            <Link 
                              href={`/katalog?produk=${product.slug}`} 
                              key={product.id}
                              className={`text-[13px] transition-colors block truncate py-0.5 ${isActiveProduct ? 'text-primary font-bold' : 'text-base-content/60 hover:text-primary'}`}
                            >
                              {product.name}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1">
          {/* Breadcrumbs */}
          <div className="text-sm breadcrumbs text-base-content/60 mb-4 px-1">
            <ul>
              <li><Link href="/">Home</Link></li>
              <li className="font-semibold text-base-content">{getBreadcrumbLabel()}</li>
            </ul>
          </div>

          {/* Sorting Bar */}
          <div className="bg-base-100 border border-base-300 p-3 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 shadow-sm">
            <span className="text-sm font-medium px-2 text-base-content/70">Urutkan</span>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setSortBy('terkait')} className={`btn btn-sm border-none rounded-xl font-normal ${sortBy === 'terkait' ? 'bg-primary text-primary-content hover:bg-primary/90' : 'bg-base-200 hover:bg-base-300'}`}>Terkait</button>
              <button onClick={() => setSortBy('terbaru')} className={`btn btn-sm border-none rounded-xl font-normal ${sortBy === 'terbaru' ? 'bg-primary text-primary-content hover:bg-primary/90' : 'bg-base-200 hover:bg-base-300'}`}>Terbaru</button>
              
              <select 
                className="select select-sm select-bordered rounded-xl bg-base-200 border-none font-normal focus:outline-none"
                value={sortBy.includes('harga') ? sortBy : 'harga-default'}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="harga-default" disabled>Harga</option>
                <option value="harga-rendah">Harga: Rendah ke Tinggi</option>
                <option value="harga-tinggi">Harga: Tinggi ke Rendah</option>
              </select>
            </div>
          </div>

          {/* PRODUCT GRID (SKU) */}
          {filteredAndSortedItems.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {filteredAndSortedItems.map((item) => {
                const maxDiskon = activeRoleId && item.diskon_roles ? item.diskon_roles[activeRoleId] : 0;

                return (
                  <Link
                    key={item.id_sku}
                    href={`/produk/${item.slug}`}
                    className="card bg-base-100 shadow-sm border border-base-300 group overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/50 relative cursor-pointer flex flex-col h-full rounded-2xl"
                  >
                    {/* Badge Diskon */}
                    {maxDiskon > 0 && (
                      <div className="absolute top-2 right-2 z-10 bg-primary text-primary-content text-[9px] md:text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
                        Diskon s/d {maxDiskon}%
                      </div>
                    )}

                    {/* Gambar (Menggunakan Gambar Induk/Produk) */}
                    <figure className="relative h-32 md:h-44 w-full overflow-hidden bg-base-200">
                      <Image
                        fill
                        unoptimized
                        alt={item.nama_sku_bersih}
                        src={item.image}
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </figure>

                    {/* Info */}
                    <div className="card-body p-3 md:p-4 mt-auto">
                      <h2 className="card-title text-sm md:text-base leading-tight h-10 line-clamp-2 transition-colors group-hover:text-primary">
                        {item.nama_sku_bersih}
                      </h2>

                      <div className="flex flex-col mt-1 md:mt-2">
                        <span className="text-[9px] md:text-[10px] opacity-60 font-bold uppercase tracking-wider">
                          Mulai dari
                        </span>
                        <span className="text-sm md:text-base font-black text-primary">
                          {formatRupiah(item.harga)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-base-100 rounded-2xl border border-base-300 flex flex-col items-center justify-center py-20 text-center opacity-60 shadow-sm">
              <SearchX size={48} className="mb-4 text-base-content/40" />
              <h3 className="text-xl font-bold mb-2">Produk Tidak Ditemukan</h3>
              <p className="text-sm">Coba cari dengan kata kunci lain atau pilih kategori yang berbeda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KatalogClient(props: KatalogClientProps) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner text-primary loading-lg"></span></div>}>
      <KatalogContent {...props} />
    </Suspense>
  );
}