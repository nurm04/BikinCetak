"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, Search, MapPin } from 'lucide-react';
import { ItemData } from "@/services/itemService";
import { slugify } from "@/lib/utils";

interface FooterProps {
  items: ItemData[];
}

const Footer = ({ items = [] }: FooterProps) => {

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

  const router = useRouter();
  const [kodeTransaksi, setKodeTransaksi] = useState("");

  const handleCheckOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const kode = kodeTransaksi.trim();
    if (!kode) return;
    router.push(`/pesan/status/${encodeURIComponent(kode)}`);
  };

  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 md:px-8 py-12">
        
        {/* Kategori Menu */}
        <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-white/20 pb-12">
          {dynamicCategories.map((menu) => (
            <nav key={menu.key} className="flex flex-col gap-2">
              <h6 className="footer-title opacity-100 font-bold text-white mb-2 border-b border-white/30 w-fit">
                {menu.label}
              </h6>
              {menu.submenu.slice(0, 6).map((item, i) => (
                <Link 
                  key={i} 
                  href={`/produk/${slugify(item.name)}`}
                  className="link link-hover text-xs opacity-80 hover:opacity-100 transition-opacity"
                >
                  {item.name}
                </Link>
              ))}
              {menu.submenu.length > 6 && (
                <span className="text-[10px] italic opacity-50">dan lainnya...</span>
              )}
            </nav>
          ))}
        </div>

        {/* Informasi Footer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 py-12">
          <div className="lg:col-span-2">
            
            {/* Logo BikinCetak */}
            <div className="flex items-center gap-0.5 mb-4">
              <div className="relative w-7 h-7 md:w-9 md:h-9 bg-white rounded-full p-1 shadow-sm flex items-center justify-center overflow-hidden">
                <Image src="https://admin.bikincetak.co.id/storage/img_web/logobikincetak.ico" alt="BikinCetak Logo" fill className="object-contain p-1" priority />
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                <span className="text-black">BIKIN CETAK</span>
              </h2>
            </div>

            <p className="text-sm leading-relaxed opacity-90 max-w-2xl">
              Percetakan online terpercaya yang melayani berbagai kebutuhan cetak mesin offset, digital offset, indoor, outdoor, sablon hingga merchandise. Kami mengedepankan kemudahan pemesanan, kecepatan produksi, 
              dan harga yang tetap terjangkau untuk bisnis Anda.
            </p>
            
            <div className="flex gap-4 mt-6">
               <a className="btn btn-circle btn-sm btn-ghost bg-white/10 hover:bg-white/20"></a>
               <a className="btn btn-circle btn-sm btn-ghost bg-white/10 hover:bg-white/20"></a>
               <a className="btn btn-circle btn-sm btn-ghost bg-white/10 hover:bg-white/20"></a>
            </div>

            {/* 👇 METODE PEMBAYARAN (FIX PADDING) 👇 */}
            <div className="mt-8 pt-6 border-t border-white/20 max-w-2xl">
              <h6 className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-3">Metode Pembayaran</h6>
              <div className="flex items-center gap-3">
                
                {/* Logo BCA - Box tetep h-10 w-16, hapus p-1 di div, sisain p-1 di Image */}
                <div className="bg-white rounded-lg h-10 w-16 relative shadow-sm overflow-hidden">
                  <Image src="/bca.png" alt="BCA" fill className="object-contain p-1" />
                </div>
                
                {/* Logo QRIS - Box tetep h-10 w-20, hapus p-1 di div, sisain p-1 di Image */}
                <div className="bg-white rounded-lg h-10 w-20 relative shadow-sm overflow-hidden">
                  <Image src="/qris.png" alt="QRIS" fill className="object-contain p-1" />
                </div>
                
              </div>
              <p className="text-[10px] mt-3 opacity-70 font-medium">
                Menerima pembayaran melalui transfer Bank BCA dan seluruh E-Wallet / M-Banking via QRIS.
              </p>
            </div>
            
          </div>

          <div className="flex flex-col gap-4">
            <h6 className="footer-title opacity-100 text-white font-bold">Hubungi Kami</h6>
            <div className="flex flex-col gap-3 text-sm">
              <a
                href="https://wa.me/6283831862770?text=Halo%20Admin%20BikinCetak,%20saya%20ingin%20bertanya."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-black transition-colors"
              >
                <Phone size={16} />
                <span>0812-1313-9490</span>
              </a>
              <div className="flex items-center gap-3">
                <Mail size={16} /> <span>bikinkancetak@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} /> <span>Layanan Online - Seluruh Indonesia</span>
              </div>
            </div>
            
            <div className="mt-8">
              <h6 className="footer-title opacity-100 text-white font-bold mb-3">
                Cek Status Pesanan
              </h6>

              <form onSubmit={handleCheckOrder} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kode Transaksi"
                  value={kodeTransaksi}
                  onChange={(e) => setKodeTransaksi(e.target.value)}
                  className="input input-bordered input-sm w-full text-base-content"
                />

                <button
                  type="submit"
                  className="btn btn-sm bg-black text-white border-black hover:bg-black/80"
                >
                  <Search size={16} />
                </button>
              </form>

              <p className="text-[10px] opacity-70 mt-2">
                Masukkan kode transaksi untuk melihat status pesanan.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black/15 py-6">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold tracking-wider uppercase">
          <p className="opacity-80">© {new Date().getFullYear()} BikinCetak - Layanan Percetakan Online</p>
          <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
            <Link href="/profil" className="opacity-80 hover:opacity-100 hover:text-black transition-colors">Profil</Link>
            <Link href="/cara-order" className="opacity-80 hover:opacity-100 hover:text-black transition-colors">Cara Order</Link>
            <Link href="/faq" className="opacity-80 hover:opacity-100 hover:text-black transition-colors">FAQ</Link>
            <Link href="/syarat-ketentuan" className="opacity-80 hover:opacity-100 hover:text-black transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;