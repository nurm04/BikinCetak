"use client";
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { ItemData } from "@/services/itemService";
import { slugify } from "@/lib/utils";

interface FooterProps {
  items: ItemData[];
}

const Footer = ({ items = [] }: FooterProps) => {
  const dynamicCategories = items
  .filter((group) => group.item_group_name.toLowerCase() !== "services") // Saring di sini
  .map((group) => ({
    key: slugify(group.item_group_name),
    label: group.item_group_name,
    submenu: group.templates.map((t) => ({ name: t.item_name }))
  }));

  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 md:px-8 py-12">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 py-12">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">
              BIKIN<span className="text-black">CETAK</span>
            </h2>
            <p className="text-sm leading-relaxed opacity-90 max-w-2xl">
              Percetakan online terpercaya yang melayani berbagai kebutuhan cetak mesin offset, digital offset, 
              hingga merchandise. Kami mengedepankan kemudahan pemesanan, kecepatan produksi, 
              dan harga yang tetap terjangkau untuk bisnis Anda.
            </p>
            <div className="flex gap-4 mt-6">
               <a className="btn btn-circle btn-sm btn-ghost bg-white/10 hover:bg-white/20"></a>
               <a className="btn btn-circle btn-sm btn-ghost bg-white/10 hover:bg-white/20"></a>
               <a className="btn btn-circle btn-sm btn-ghost bg-white/10 hover:bg-white/20"></a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h6 className="footer-title opacity-100 text-white font-bold">Hubungi Kami</h6>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-3">
                <Phone size={16} /> <span>0838-3186-2770</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} /> <span>bikincetak@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} /> <span>Layanan Online - Seluruh Indonesia</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black/10 py-6">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
          <p>© {new Date().getFullYear()} bikincetak.id - Percetakan Layanan Online Modern</p>
          <div className="flex gap-6 uppercase tracking-wider">
            <Link href="/profil" className="hover:text-black transition-colors">Profil</Link>
            <Link href="/cara-order" className="hover:text-black transition-colors">Cara Order</Link>
            <Link href="/faq" className="hover:text-black transition-colors">FAQ</Link>
            <Link href="/syarat-ketentuan" className="hover:text-black transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;