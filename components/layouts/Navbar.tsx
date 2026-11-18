"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, LogOut, ShoppingBag, LogIn, Package, Search } from 'lucide-react';
import SwapTheme from '../ui/SwapTheme';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ItemData } from "@/services/itemService";
import { getUserProfile } from "@/services/userService";
import { logoutAction } from "@/services/authService";
import { getPengaturan, PengaturanData, getHalamanStatisList, HalamanStatisListData } from "@/services/pengaturanWebService";
import { slugify } from "@/lib/utils";

interface NavbarProps {
  items: ItemData[];
}

interface CategoryGroup {
  id: string;
  label: string;
  urutan: number;
  icon: string | null;
  submenu: Array<{ name: string }>;
}

const Navbar = ({ items = [] }: NavbarProps) => {
  // State User, Pengaturan & Halaman Statis
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("Pelanggan");
  const [pengaturan, setPengaturan] = useState<PengaturanData | null>(null);
  const [halamanStatis, setHalamanStatis] = useState<HalamanStatisListData[]>([]);

  // State Animasi Search Bar
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const pathname = usePathname();
  const router = useRouter();  

  const handleLogout = useCallback(async () => {
    await logoutAction();
    setIsLoggedIn(false);
    setUserName("Pelanggan");
    router.push("/login");
    router.refresh();
  }, [router]);

  // Fetching Paralel User, Pengaturan, dan Halaman Statis
  useEffect(() => {
    Promise.all([getUserProfile(), getPengaturan(), getHalamanStatisList()]).then(([resUser, resPengaturan, resHalaman]) => {
      if (resUser?.data) {
        setIsLoggedIn(true);
        setUserName(resUser.data.name || resUser.data.email || "User");
      }
      if (resPengaturan) {
        setPengaturan(resPengaturan);
      }
      if (resHalaman) {
        setHalamanStatis(resHalaman);
      }
    });
  }, []);

  // Fokuskan input saat search dibuka
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const closeDropdown = () => {
    const elem = document.activeElement as HTMLElement;
    if (elem) elem.blur();
  };

  const isHome = pathname === '/';

  // Data Dinamis Identitas Web
  const fallbackLogo = "https://admin.bikincetak.co.id/storage/img_web/logobikincetak.png";
  const logoUtama = pengaturan?.logo_utama || fallbackLogo;
  const namaWebsite = pengaturan?.nama_website 
    ? pengaturan.nama_website.split('-')[0].trim().toUpperCase() 
    : "BIKIN CETAK";

  // Logic Grouping Kategori (Di-memoize)
  const dynamicCategories = useMemo(() => {
    const grouped: Record<string, CategoryGroup> = {};

    items.forEach((item) => {
      if (item.is_active === 0 || item.id_produk === "PRD-0001") return;

      const catId = item.kategori?.id_kategori || "lainnya";
      const catName = item.kategori?.nama_kategori || "Lainnya";
      const catUrutan = item.kategori?.urutan ?? 999;
      const catIcon = item.kategori?.icon || null;

      if (!grouped[catId]) {
        grouped[catId] = {
          id: catId,
          label: catName,
          urutan: catUrutan,
          icon: catIcon,
          submenu: []
        };
      }
      grouped[catId].submenu.push({ name: item.nama_produk });
    });

    return Object.values(grouped).sort((a, b) => a.urutan - b.urutan);
  }, [items]);

  return (
    <>
      <div className="sticky top-0 z-50 gap-2 px-4 shadow-sm navbar bg-base-100 md:px-12 lg:px-20 md:gap-4">

        {/* KIRI: LOGO */}
        <div className="w-auto navbar-start">
          <Link href="/" className="p-0 px-2 flex items-center gap-1.5 btn btn-ghost hover:bg-transparent">
            <div className="relative w-5 h-5 md:w-6 md:h-6">
              <Image 
                src={logoUtama} 
                alt={`${namaWebsite} Logo`} 
                fill 
                unoptimized 
                className="object-contain" 
                priority 
              />
            </div>
            <span className="hidden text-xl font-black tracking-tighter text-primary md:block">
              <span className="text-base-content">{namaWebsite}</span>
            </span>
          </Link>
        </div>

        {/* TENGAH: HALAMAN STATIS & SEARCH BAR DENGAN ANIMASI HALUS */}
        <div className="flex-1 px-2 navbar-center md:px-8 flex items-center justify-end md:justify-center">
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Halaman Statis dengan Transisi Opacity & Lebar yang Mulus */}
            {halamanStatis && halamanStatis.length > 0 && (
              <div 
                className={`hidden lg:flex items-center gap-1 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                  isSearchOpen ? 'opacity-0 max-w-0 pointer-events-none' : 'opacity-100 max-w-md'
                }`}
              >
                {halamanStatis.map((halaman) => (
                  <Link 
                    key={halaman.id} 
                    href={`/${halaman.slug}`} 
                    className="text-[11px] font-semibold uppercase hover:text-primary transition-colors py-3 px-3 tracking-normal"
                  >
                    {halaman.judul}
                  </Link>
                ))}
              </div>
            )}

            {/* Search Bar dengan Transisi Max-Width & Absolute/Smooth Expand */}
            <form 
              action="/katalog" 
              method="GET" 
              className={`relative flex items-center transition-all duration-300 ease-in-out ${
                isSearchOpen ? 'w-65 sm:w-87.5 md:w-105' : 'w-10 md:w-12'
              }`}
            >
              <input
                ref={searchInputRef}
                type="text"
                name="q"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  if (!searchQuery.trim()) {
                    setIsSearchOpen(false);
                  }
                }}
                placeholder="Cari produk..."
                required
                className={`w-full text-sm transition-all rounded-full input input-sm md:input-md input-bordered focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 bg-base-200/50 focus:bg-base-100 duration-300 ${
                  isSearchOpen 
                    ? 'opacity-100 pl-4 pr-10 md:pr-12 cursor-text' 
                    : 'opacity-0 cursor-pointer px-0 pointer-events-none'
                }`}
              />
              <button 
                type="button" 
                onClick={() => {
                  if (!isSearchOpen) {
                    setIsSearchOpen(true);
                  } else if (!searchQuery.trim()) {
                    setIsSearchOpen(false);
                  }
                }}
                className={`absolute top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-300 flex items-center justify-center ${
                  isSearchOpen 
                    ? 'right-2 md:right-3 text-base-content/40 hover:text-primary bg-transparent' 
                    : 'right-0 w-10 h-10 md:w-12 md:h-12 bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                <Search className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
              </button>
            </form>

          </div>
        </div>

        {/* KANAN: AUTH & PROFILE */}
        <div className="w-auto gap-1 navbar-end md:gap-3">
          {!isLoggedIn ? (
            <>
              <Link href="/login" className="flex items-center px-2 border-none rounded-xl btn btn-ghost btn-sm md:btn-md hover:bg-primary/10 group md:px-4">
                <LogIn size={18} className="transition-transform text-primary group-hover:scale-110" />
                <span className="hidden ml-2 text-xs font-bold tracking-widest uppercase md:block text-primary">Sign In</span>
              </Link>
              <div className="hidden md:block">
                <SwapTheme />
              </div>
            </>
          ) : (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="transition-colors btn btn-ghost btn-circle btn-sm md:btn-md avatar bg-primary/10 hover:bg-primary/20">
                <div className="flex items-center justify-center rounded-full w-8 md:w-10 text-primary">
                  <User size={18} className="md:w-5 md:h-5" />
                </div>
              </div>

              <ul tabIndex={0} className="p-2 mt-4 border shadow-xl menu menu-sm dropdown-content bg-base-100 rounded-2xl z-50 w-64 md:w-72 border-base-content/5">
                <li className="w-full max-w-full mb-2 overflow-hidden pointer-events-none">
                  <div className="block w-full max-w-full px-3 py-2 overflow-hidden box-border bg-primary/5 rounded-xl">
                    <span className="font-bold text-[10px] truncate text-primary block w-full uppercase tracking-widest">
                      {userName}
                    </span>
                  </div>
                </li>

                <li><Link href="/profil" onClick={closeDropdown} className="flex items-center gap-3 py-2 font-bold"><User size={16} className="opacity-70" /> Profil Saya</Link></li>
                <li><Link href="/pesan" onClick={closeDropdown} className="flex items-center gap-3 py-2 font-bold"><Package size={16} className="opacity-70" /> Transaksi</Link></li>
                <li><Link href="/cart" onClick={closeDropdown} className="flex items-center gap-3 py-2 font-bold"><ShoppingBag size={16} className="opacity-70" /> Keranjang</Link></li>
                <div className="my-0 divider opacity-30"></div>
                <li>
                  <div className="flex items-center justify-between py-1 cursor-default hover:bg-transparent active:bg-transparent">
                    <span className="text-xs font-bold opacity-70">Ganti Tema</span>
                    <div className="-mr-2"><SwapTheme /></div>
                  </div>
                </li>
                <div className="my-0 divider opacity-30"></div>
                <li>
                  <button onClick={() => { closeDropdown(); handleLogout(); }} className="flex items-center gap-3 py-2 font-black text-error hover:bg-error/10">
                    <LogOut size={16} /> Keluar
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* MENU KATEGORI DESKTOP (Render Dinamis) */}
      {isHome && dynamicCategories.length > 0 && (
        <div className="justify-center hidden px-4 border-t navbar bg-base-100 lg:flex border-base-200 md:px-12 lg:px-20">
          <ul className="p-0 menu menu-horizontal scrollbar-hide">
            {dynamicCategories.map((menu) => {
              return (
                <li key={menu.id} className="dropdown dropdown-hover dropdown-center">
                  <div role="button" className="text-[11px] font-semibold uppercase hover:text-primary transition-colors py-3 px-4 flex items-center gap-2">
                    {menu.label}
                  </div>
                  <ul className="p-2 mt-0 border-t-4 shadow-2xl dropdown-content menu bg-base-100 rounded-box z-50 w-56 border-primary">
                    {menu.submenu.map((item, i) => (
                      <li key={i}>
                        <Link href={`/produk/${slugify(item.name)}`}>{item.name}</Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
};

export default Navbar;