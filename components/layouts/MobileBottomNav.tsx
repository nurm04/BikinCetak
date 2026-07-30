/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  LayoutGrid, 
  ScrollText, 
  MessageCircle, 
  X,
  StickyNote,
  Printer,
  Book,
  Shirt,
  Box,
  MonitorPlay,
  Camera,
  Image as ImageIcon,
  Phone,
  Mail
} from 'lucide-react';

const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('sticker') || name.includes('stiker')) return <StickyNote size={28} className="text-primary mb-2" strokeWidth={1.5} />;
  if (name.includes('print') || name.includes('cetak')) return <Printer size={28} className="text-primary mb-2" strokeWidth={1.5} />;
  if (name.includes('buku')) return <Book size={28} className="text-primary mb-2" strokeWidth={1.5} />;
  if (name.includes('kaos') || name.includes('jersey') || name.includes('garment')) return <Shirt size={28} className="text-primary mb-2" strokeWidth={1.5} />;
  if (name.includes('kemasan') || name.includes('box')) return <Box size={28} className="text-primary mb-2" strokeWidth={1.5} />;
  if (name.includes('media') || name.includes('promosi')) return <MonitorPlay size={28} className="text-primary mb-2" strokeWidth={1.5} />;
  if (name.includes('foto') || name.includes('dekorasi')) return <ImageIcon size={28} className="text-primary mb-2" strokeWidth={1.5} />;
  if (name.includes('undangan')) return <Camera size={28} className="text-primary mb-2" strokeWidth={1.5} />;
  
  return <LayoutGrid size={28} className="text-primary mb-2" strokeWidth={1.5} />;
};

type SubmenuItem = {
  name: string;
};

type CategoryItem = {
  key: string;
  label: string;
  submenu: SubmenuItem[];
};

interface MobileBottomNavProps {
  categories: CategoryItem[];
}

export default function MobileBottomNav({ categories = [] }: MobileBottomNavProps) {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const pathname = usePathname();
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
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
            <h3 className="font-bold text-lg">Kategori</h3>
          </div>
          <button onClick={() => setIsCatOpen(false)} className="p-1 bg-base-200 rounded-full text-base-content/60 hover:text-base-content">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-3 gap-y-6 gap-x-2">
            {categories.map((cat) => (
              <Link 
                href={`/katalog?kategori=${cat.key}`} 
                key={cat.key}
                onClick={() => setIsCatOpen(false)}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-base-200/50 flex flex-col items-center justify-center group-hover:bg-primary/10 transition-colors">
                  {getCategoryIcon(cat.label)}
                </div>
                <span className="text-[10px] font-medium mt-2 leading-tight text-base-content/80 group-hover:text-primary px-1">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SHEET - CHAT KONTAK */}
      <div className={`fixed bottom-0 left-0 right-0 bg-base-100 z-70 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:hidden transition-transform duration-300 ease-in-out transform ${isChatOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-base-200">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-base-content/70" />
            <h3 className="font-bold text-lg">Hubungi Kami</h3>
          </div>
          <button onClick={() => setIsChatOpen(false)} className="p-1 bg-base-200 rounded-full text-base-content/60 hover:text-base-content">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto pb-8">
          <div className="flex flex-col gap-3">
            <a href="https://wa.me/6283831862770" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-green-500/5 border border-green-500/20 hover:bg-green-500/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-600">
                <Phone size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-base-content">WhatsApp CS 1</h4>
                <p className="text-xs text-base-content/60">Fast response (08.00 - 17.00)</p>
              </div>
            </a>
            <a href="mailto:bikincetak@gmail.com" className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-base-content">Email Support</h4>
                <p className="text-xs text-base-content/60">bikincetak@gmail.com</p>
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
          // 3. PAKAI isMounted UNTUK MENCEGAH HYDRATION MISMATCH
          const isActive = isMounted 
            ? (item.href 
                ? pathname === item.href 
                : (item.name === 'Kategori' ? isCatOpen : (item.name === 'Chat' ? isChatOpen : false)))
            : false; // Paksa jadi false (default render) saat pertama kali load dari Server
            
          const Icon = item.icon;

          return item.href ? (
            <Link key={index} href={item.href} className="flex-1 flex flex-col items-center py-2 relative">
              <Icon size={22} className={`mb-1 transition-colors ${isActive ? 'text-primary' : 'text-base-content/40'}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-base-content/50'}`}>
                {item.name}
              </span>
            </Link>
          ) : (
            <button key={index} onClick={item.action} className="flex-1 flex flex-col items-center py-2 relative">
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