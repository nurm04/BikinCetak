/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Filter, ChevronDown, ChevronUp, SearchX } from 'lucide-react';
import { slugify } from '@/lib/utils';

interface ProductItem {
  id: string;
  name: string;
  kategori: string;
  image: string[];
  harga_mulai_dari: number;
  diskon_roles: Record<string, number>;
}

interface KatalogClientProps {
  initialItems: ProductItem[];
  activeRoleId: string | null;
}

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka);
};

function KatalogContent({ initialItems, activeRoleId }: KatalogClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('kategori') || '';

  const [activeCategory, setActiveCategory] = useState<string>(categoryParam);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<string>('terkait');

  useEffect(() => {
    if (categoryParam) {
      setExpandedCats({ [categoryParam]: true });
      setActiveCategory(categoryParam);
    } else {
      setExpandedCats({});
      setActiveCategory('');
    }
  }, [categoryParam]);

  // Kelompokkan data untuk Sidebar
  const groupedItems = useMemo(() => {
    const groups: Record<string, ProductItem[]> = {};
    initialItems.forEach(item => {
      const cat = item.kategori;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [initialItems]);

  // Logika Filter & Sorting
  const filteredAndSortedItems = useMemo(() => {
    let result = [...initialItems];

    if (queryParam) {
      const q = queryParam.toLowerCase();
      result = result.filter(item => item.name.toLowerCase().includes(q));
    }

    if (activeCategory) {
      result = result.filter(item => slugify(item.kategori) === activeCategory);
    }

    switch (sortBy) {
      case 'terbaru':
        result = result.reverse(); 
        break;
      case 'harga-rendah':
        result.sort((a, b) => a.harga_mulai_dari - b.harga_mulai_dari);
        break;
      case 'harga-tinggi':
        result.sort((a, b) => b.harga_mulai_dari - a.harga_mulai_dari);
        break;
      default:
        break; 
    }

    return result;
  }, [initialItems, queryParam, activeCategory, sortBy]);

  const toggleCategory = (catKey: string) => {
    setExpandedCats((prev: Record<string, boolean>) => {
      // FIX: Jika sudah terbuka, tutup (return object kosong)
      // Jika belum terbuka, buka HANYA kategori ini (timpa yg lain)
      return prev[catKey] ? {} : { [catKey]: true };
    });
  };

  const selectCategory = (catKey: string) => {
    setActiveCategory(activeCategory === catKey ? '' : catKey);
    if (queryParam) {
      router.push(`/katalog?kategori=${catKey}`);
    } else {
      window.history.replaceState(null, '', `/katalog${activeCategory === catKey ? '' : `?kategori=${catKey}`}`);
    }
  };

  const currentCategoryLabel = Object.keys(groupedItems).find(k => slugify(k) === activeCategory) || "Semua Produk";

  return (
    <div className="bg-base-200 min-h-screen py-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6">
        
        {/* SIDEBAR FILTER - HANYA TAMPIL DI DEKSTOP */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="bg-base-100 p-5 rounded-2xl shadow-sm border border-base-300 sticky top-24">
            <div className="flex items-center gap-2 mb-4 text-base-content pb-3 border-b border-base-200">
              <Filter size={18} className="text-primary" />
              <h2 className="font-bold uppercase tracking-wide text-sm">Filter Produk</h2>
            </div>
            
            <h3 className="font-bold text-xs uppercase opacity-75 mb-3 tracking-wider">Berdasarkan Kategori</h3>
            
            <div className="flex flex-col gap-1">
              {Object.entries(groupedItems).map(([catName, catItems]) => {
                const catKey = slugify(catName);
                const isActiveCat = activeCategory === catKey;
                const isExpanded = expandedCats[catKey] || isActiveCat;

                return (
                  <div key={catKey} className="border-b border-base-200/60 last:border-0 pb-1">
                    <button 
                      onClick={() => { toggleCategory(catKey); selectCategory(catKey); }}
                      className={`flex items-center justify-between w-full py-2.5 px-2 rounded-xl text-left text-sm transition-colors ${isActiveCat ? 'bg-primary/10 text-primary font-bold' : 'text-base-content/80 hover:bg-base-200/50 hover:text-primary'}`}
                    >
                      <span className="truncate">{catName}</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    
                    {isExpanded && (
                      <div className="pl-4 py-1 flex flex-col gap-1.5 border-l-2 border-primary/20 ml-2 mb-2 my-1">
                        {catItems.map((item) => (
                          <Link 
                            href={`/produk/${slugify(item.name)}`} 
                            key={item.id}
                            className="text-[13px] text-base-content/60 hover:text-primary transition-colors block truncate py-0.5"
                          >
                            {item.name}
                          </Link>
                        ))}
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
              {queryParam ? (
                <li>Pencarian: <span className="font-semibold text-base-content ml-1">&quot;{queryParam}&quot;</span></li>
              ) : (
                <li className="font-semibold text-base-content">{currentCategoryLabel}</li>
              )}
            </ul>
          </div>

          {/* Sorting Bar */}
          <div className="bg-base-100 border border-base-300 p-3 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 shadow-sm">
            <span className="text-sm font-medium px-2 text-base-content/70">Urutkan</span>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setSortBy('terkait')} className={`btn btn-sm border-none rounded-xl font-normal ${sortBy === 'terkait' ? 'bg-primary text-primary-content hover:bg-primary/90' : 'bg-base-200 hover:bg-base-300'}`}>Terkait</button>
              <button onClick={() => setSortBy('terbaru')} className={`btn btn-sm border-none rounded-xl font-normal ${sortBy === 'terbaru' ? 'bg-primary text-primary-content hover:bg-primary/90' : 'bg-base-200 hover:bg-base-300'}`}>Terbaru</button>
              <button onClick={() => setSortBy('terlaris')} className={`btn btn-sm border-none rounded-xl font-normal ${sortBy === 'terlaris' ? 'bg-primary text-primary-content hover:bg-primary/90' : 'bg-base-200 hover:bg-base-300'}`}>Terlaris</button>
              
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

          {/* PRODUCT GRID */}
          {filteredAndSortedItems.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {filteredAndSortedItems.map((item) => {
                const maxDiskon = activeRoleId && item.diskon_roles ? item.diskon_roles[activeRoleId] : 0;

                return (
                  <Link
                    key={item.id}
                    href={`/produk/${slugify(item.name)}`}
                    className="card bg-base-100 shadow-sm border border-base-300 group overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/50 relative cursor-pointer flex flex-col h-full rounded-2xl"
                  >
                    {/* Badge Diskon */}
                    {maxDiskon > 0 && (
                      <div className="absolute top-2 right-2 z-10 bg-primary text-primary-content text-[9px] md:text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
                        Diskon s/d {maxDiskon}%
                      </div>
                    )}

                    {/* Gambar */}
                    <figure className="relative h-32 md:h-44 w-full overflow-hidden bg-base-200">
                      <Image
                        fill
                        unoptimized
                        alt={item.name}
                        src={item.image?.[0] || "/favicon.ico"}
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </figure>

                    {/* Info */}
                    <div className="card-body p-3 md:p-4 mt-auto">
                      <h2 className="card-title text-sm md:text-base leading-tight h-10 line-clamp-2 transition-colors group-hover:text-primary">
                        {item.name}
                      </h2>

                      <div className="flex flex-col mt-1 md:mt-2">
                        <span className="text-[9px] md:text-[10px] opacity-60 font-bold uppercase tracking-wider">
                          Mulai dari
                        </span>
                        <span className="text-sm md:text-base font-black text-primary">
                          {item.harga_mulai_dari ? formatRupiah(item.harga_mulai_dari) : "Rp 0"}
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