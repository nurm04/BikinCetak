/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getPengaturan, PengaturanData } from "@/services/pengaturanWebService"; // 👈 IMPORT SERVICE
import { 
  Home, 
  LayoutGrid, 
  ScrollText, 
  MessageCircle, 
  X,
  Phone,
  Mail,
  Printer, Book, BookOpen, FileText, Image as ImageIcon, Monitor, 
  Shirt, ShoppingBag, Package, Box, PenTool, Scissors, Camera, 
  Layers, Grid, Tag, Gift, Briefcase, Calendar, Megaphone, Sticker, Palette, Folder,
  LucideIcon 
} from 'lucide-react';

const IconMap: Record<string, LucideIcon> = {
  Printer, Book, BookOpen, FileText, Image: ImageIcon, Monitor,
  Shirt, ShoppingBag, Package, Box, PenTool, Scissors, Camera,
  Layers, Grid, Tag, Gift, Briefcase, Calendar, Megaphone, Sticker, Palette, Folder
};

type SubmenuItem = {
  name: string;
};

type CategoryItem = {
  key: string;
  label: string;
  urutan: number;
  icon: string | null;
  submenu: SubmenuItem[];
};

interface MobileBottomNavProps {
  categories: CategoryItem[];
}

export default function MobileBottomNav({ categories = [] }: MobileBottomNavProps) {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [pengaturan, setPengaturan] = useState<PengaturanData | null>(null);

  const pathname = usePathname();
  
  useEffect(() => {
    setIsMounted(true);
    
    // 👇 FECTH DATA PENGATURAN SECARA ASINKRON 👇
    getPengaturan().then((res) => {
      if (res) setPengaturan(res);
    });
    
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      setIsKeyboardOpen(false);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  useEffect(() => {
    if (isCatOpen || isChatOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isCatOpen, isChatOpen]);

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Kategori', action: () => { setIsCatOpen(true); setIsChatOpen(false); }, icon: LayoutGrid },
    { name: 'Transaksi', href: '/pesan', icon: ScrollText },
    { name: 'Chat', action: () => { setIsChatOpen(true); setIsCatOpen(false); }, icon: MessageCircle },
  ];

  // Ekstrak list WhatsApp dan Email
  const daftarWhatsapp = pengaturan?.daftar_whatsapp || [];
  const emailPerusahaan = pengaturan?.informasi_lokasi?.email || "info@bikincetak.co.id";

  // Fungsi helper buat bikin Link WA
  const makeWaLink = (nomor: string, pesan: string = "") => {
    // Bersihkan karakter non-angka
    let cleanNum = nomor.replace(/\D/g, '');
    // Ganti 0 awalan dengan 62
    if (cleanNum.startsWith('0')) cleanNum = '62' + cleanNum.substring(1);
    
    const encodedMessage = pesan ? `?text=${encodeURIComponent(pesan)}` : "";
    return `https://wa.me/${cleanNum}${encodedMessage}`;
  };

  return (
    <>
      {/* 1. OVERLAY GELAP */}
      <div 
        className={`fixed inset-0 bg-black/60 z-60 md:hidden transition-opacity duration-300 ${(isCatOpen || isChatOpen) ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => { setIsCatOpen(false); setIsChatOpen(false); }}
      ></div>

      {/* 2. BOTTOM SHEET - KATEGORI */}
      <div className={`fixed bottom-0 left-0 right-0 bg-base-100 z-70 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:hidden transition-transform duration-300 ease-in-out transform ${isCatOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-base-200">
          <div className="flex items-center gap-2">
            <LayoutGrid size={20} className="text-base-content/70" />
            <h3 className="text-lg font-bold">Kategori</h3>
          </div>
          <button onClick={() => setIsCatOpen(false)} className="p-1 rounded-full bg-base-200 text-base-content/60 hover:text-base-content">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-3 gap-x-2 gap-y-6">
            {categories.map((cat) => {
              const IconComponent = cat.icon ? IconMap[cat.icon] : LayoutGrid;
              return (
                <Link 
                  href={`/katalog?kategori=${cat.key}`} 
                  key={cat.key}
                  onClick={() => setIsCatOpen(false)}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="flex flex-col items-center justify-center w-16 h-16 transition-colors rounded-2xl bg-base-200/50 group-hover:bg-primary/10">
                    <IconComponent size={28} className="mb-2 text-primary" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-medium mt-2 leading-tight text-base-content/80 group-hover:text-primary px-1">
                    {cat.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SHEET - CHAT KONTAK */}
      <div className={`fixed bottom-0 left-0 right-0 bg-base-100 z-70 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:hidden transition-transform duration-300 ease-in-out transform ${isChatOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-base-200">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-base-content/70" />
            <h3 className="text-lg font-bold">Hubungi Kami</h3>
          </div>
          <button onClick={() => setIsChatOpen(false)} className="p-1 rounded-full bg-base-200 text-base-content/60 hover:text-base-content">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto pb-8">
          <div className="flex flex-col gap-3">
            
            {/* RENDER LIST WA DARI DATABASE */}
            {daftarWhatsapp.map((wa, index) => {
              // Abaikan jika tidak aktif
              if (wa.is_active === false) return null;
              
              return (
                <a 
                  key={wa.id || index}
                  href={makeWaLink(wa.nomor, wa.pesan_default)} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-4 p-4 transition-colors border rounded-2xl bg-green-500/5 border-green-500/20 hover:bg-green-500/10"
                >
                  <div className="flex items-center justify-center w-12 h-12 text-green-600 rounded-full bg-green-500/20">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-base-content">{wa.nama}</h4>
                    <p className="text-xs text-base-content/60">Fast response (08.00 - 17.00)</p>
                  </div>
                </a>
              );
            })}

            {/* RENDER EMAIL */}
            <a href={`mailto:${emailPerusahaan}`} className="flex items-center gap-4 p-4 transition-colors border rounded-2xl bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10">
              <div className="flex items-center justify-center w-12 h-12 text-blue-600 rounded-full bg-blue-500/20">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-base-content">Email Support</h4>
                <p className="text-xs text-base-content/60">{emailPerusahaan}</p>
              </div>
            </a>

          </div>
        </div>
      </div>

      {/* 4. BOTTOM NAVIGATION BAR UTAMA */}
      <div className={`
          fixed bottom-0 left-0 right-0 h-16 bg-base-100 border-t border-base-200 flex justify-between items-center px-2 z-50 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]
          ${isKeyboardOpen ? "hidden" : "flex"}
      `}>
        {navItems.map((item, index) => {
          const isActive = isMounted 
            ? (item.href 
                ? pathname === item.href 
                : (item.name === 'Kategori' ? isCatOpen : (item.name === 'Chat' ? isChatOpen : false)))
            : false;
            
          const Icon = item.icon;

          return item.href ? (
            <Link key={index} href={item.href} className="relative flex flex-col items-center flex-1 py-2">
              <Icon size={22} className={`mb-1 transition-colors ${isActive ? 'text-primary' : 'text-base-content/40'}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-base-content/50'}`}>
                {item.name}
              </span>
            </Link>
          ) : (
            <button key={index} onClick={item.action} className="relative flex flex-col items-center flex-1 py-2">
              <Icon size={22} className={`mb-1 transition-colors ${isActive ? 'text-primary' : 'text-base-content/40'}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-base-content/50'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}