/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useState, useEffect, useCallback } from 'react';
import { User, LogOut, ShoppingBag, LogIn, Package, Search } from 'lucide-react';
import SwapTheme from '../ui/SwapTheme';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ItemData } from "@/services/itemService";
import { getUserProfile } from "@/services/userService";
import { logoutAction } from "@/services/authService";
import { slugify } from "@/lib/utils";

interface NavbarProps {
  items: ItemData[];
}

const Navbar = ({ items = [] }: NavbarProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("Pelanggan");
  const [mounted, setMounted] = useState(false);
  
  // State untuk pencarian
  const [searchQuery, setSearchQuery] = useState(""); 
  
  const pathname = usePathname();
  const router = useRouter();  

  const handleLogout = useCallback(async () => {
    await logoutAction();

    setIsLoggedIn(false);
    setUserName("Pelanggan");
    
    router.push("/login");
    router.refresh();
  }, [router]);

  const checkAuth = useCallback(async () => {
    const res = await getUserProfile();
    
    if (res.data) {
      setIsLoggedIn(true);
      setUserName(res.data.name || res.data.email || "User");
    } else {
      setIsLoggedIn(false);
      setUserName("Pelanggan");
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  // Fungsi untuk eksekusi pencarian
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Hilangkan fokus dari input agar keyboard di HP turun
      const elem = document.activeElement as HTMLElement;
      if (elem) elem.blur();
      
      // Lempar ke halaman katalog dengan query parameter
      router.push(`/katalog?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Fungsi menutup dropdown profile saat diklik
  const closeDropdown = () => {
    const elem = document.activeElement as HTMLElement;
    if (elem) elem.blur();
  };

  if (!mounted) return <div className="h-10 w-20 bg-base-200 animate-pulse rounded-xl"></div>;

  const isHome = pathname === '/';

  // Olah data kategori untuk menu Desktop
  const groupedItems: Record<string, Array<{ name: string }>> = {};
  items.forEach((item) => {
    if (item.is_active === 0) return;
    const categoryName = item.kategori || "Lainnya";
    const lowerCat = categoryName.toLowerCase();
    if (lowerCat === "services" || lowerCat === "jasa") return;

    if (!groupedItems[categoryName]) {
      groupedItems[categoryName] = [];
    }
    groupedItems[categoryName].push({ name: item.nama_produk });
  });

  const dynamicCategories = Object.keys(groupedItems).map((categoryKey) => ({
    key: slugify(categoryKey),
    label: categoryKey,
    submenu: groupedItems[categoryKey],
  }));

  return (
    <>
      <div className="navbar bg-base-100 shadow-sm px-4 md:px-12 lg:px-20 sticky top-0 z-50 gap-2 md:gap-4">
        
        {/* KIRI: LOGO */}
        <div className="navbar-start w-auto">
          <Link href="/" className="btn btn-ghost p-0 px-2 flex items-center gap-2 hover:bg-transparent">
            <div className="relative w-8 h-8 md:w-10 md:h-10">
              <Image src="/favicon.ico" alt="BikinCetak Logo" fill className="object-contain" priority />
            </div>
            <span className="text-xl font-black text-primary tracking-tighter hidden md:block">
              BIKIN<span className="text-base-content">CETAK</span>
            </span>
          </Link>
        </div>

        {/* TENGAH: SEARCH BAR (Responsive Mobile & Desktop) */}
        <div className="navbar-center flex-1 px-2 md:px-8">
          <form onSubmit={handleSearch} className="w-full max-w-2xl relative mx-auto">
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-sm md:input-md input-bordered w-full pr-10 md:pr-12 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all bg-base-200/50 focus:bg-base-100 text-sm"
            />
            <button 
              type="submit" 
              className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 p-1.5 text-base-content/40 hover:text-primary transition-colors"
            >
              <Search className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </form>
        </div>

        {/* KANAN: AUTH & PROFILE */}
        <div className="navbar-end w-auto gap-1 md:gap-3">
          {!isLoggedIn ? (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm md:btn-md flex items-center border-none hover:bg-primary/10 group rounded-xl px-2 md:px-4">
                <LogIn size={18} className="text-primary group-hover:scale-110 transition-transform" />
                <span className="hidden md:block font-bold text-xs uppercase tracking-widest text-primary ml-2">Sign In</span>
              </Link>
              <div className="hidden md:block">
                <SwapTheme />
              </div>
            </>
          ) : (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm md:btn-md avatar bg-primary/10 hover:bg-primary/20 transition-colors">
                <div className="w-8 md:w-10 rounded-full flex items-center justify-center text-primary">
                  <User size={18} className="md:w-5 md:h-5" />
                </div>
              </div>
              
              <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-2xl z-50 mt-4 w-64 md:w-72 p-2 shadow-xl border border-base-content/5">
                <li className="pointer-events-none mb-2 w-full max-w-full overflow-hidden">
                  <div className="block px-3 py-2 bg-primary/5 rounded-xl w-full max-w-full overflow-hidden box-border">
                    <span className="font-bold text-[10px] truncate text-primary block w-full uppercase tracking-widest">
                      {userName}
                    </span>
                  </div>
                </li>
                
                <li><Link href="/profil" onClick={closeDropdown} className="py-2 font-bold flex items-center gap-3"><User size={16} className="opacity-70" /> Profil Saya</Link></li>
                <li><Link href="/pesan" onClick={closeDropdown} className="py-2 font-bold flex items-center gap-3"><Package size={16} className="opacity-70" /> Transaksi</Link></li>
                <li><Link href="/cart" onClick={closeDropdown} className="py-2 font-bold flex items-center gap-3"><ShoppingBag size={16} className="opacity-70" /> Keranjang</Link></li>
                <div className="divider my-0 opacity-30"></div>
                <li>
                  <div className="py-1 flex justify-between items-center hover:bg-transparent cursor-default active:bg-transparent">
                    <span className="font-bold text-xs opacity-70">Ganti Tema</span>
                    <div className="-mr-2"><SwapTheme /></div>
                  </div>
                </li>
                <div className="divider my-0 opacity-30"></div>
                <li>
                  <button onClick={() => { closeDropdown(); handleLogout(); }} className="py-2 text-error font-black flex items-center gap-3 hover:bg-error/10">
                    <LogOut size={16} /> Keluar
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* MENU KATEGORI DESKTOP (Hanya muncul di Layar Besar & Halaman Home) */}
      {isHome && (
        <div className="navbar bg-base-100 hidden lg:flex justify-center border-t border-base-200 px-4 md:px-12 lg:px-20">
          <ul className="menu menu-horizontal p-0 scrollbar-hide">
            {dynamicCategories.map((menu) => (
              <li key={menu.key} className="dropdown dropdown-hover dropdown-center">
                <div role="button" className="text-[11px] font-semibold uppercase hover:text-primary transition-colors py-3 px-4">
                  {menu.label}
                </div>
                <ul className="dropdown-content menu bg-base-100 rounded-box z-50 w-56 p-2 shadow-2xl border-t-4 border-primary mt-0">
                  {menu.submenu.map((item, i) => (
                    <li key={i}>
                      <Link href={`/produk/${slugify(item.name)}`}>{item.name}</Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default Navbar;