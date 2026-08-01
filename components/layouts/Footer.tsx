"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Mail, Phone, Search, MapPin } from 'lucide-react';
import { ItemData } from "@/services/itemService";
import { slugify } from "@/lib/utils";

interface FooterProps {
  items: ItemData[];
}

const Footer = ({ items = [] }: FooterProps) => {

  // --- LOGIC BARU: Grouping data flat dari Laravel ---
  const groupedItems: Record<string, Array<{ name: string }>> = {};

  items.forEach((item) => {
    // Lewati jika produk tidak aktif
    if (item.is_active === 0) return;

    // Ambil kategori, beri default "Lainnya" jika kosong
    const categoryName = item.kategori || "Lainnya";
    const lowerCat = categoryName.toLowerCase();

    // Saring kategori "services" atau "jasa" seperti logic lama
    if (lowerCat === "services" || lowerCat === "jasa") return;

    // Buat array baru jika kategori belum ada
    if (!groupedItems[categoryName]) {
      groupedItems[categoryName] = [];
    }

    // Masukkan nama produk ke dalam kategori yang sesuai
    groupedItems[categoryName].push({ name: item.nama_produk });
  });

  // Ubah object hasil grouping menjadi format array untuk ditampilkan
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
  // --------------------------------------------------

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
              Percetakan online terpercaya yang melayani berbagai kebutuhan cetak mesin offset, digital offset, indoor, outdoor, sablon hingga merchandise. Kami mengedepankan kemudahan pemesanan, kecepatan produksi, 
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

              <p className="text-xs opacity-70 mt-2">
                Masukkan kode transaksi untuk melihat status pesanan.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black/10 py-6">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
          <p>© {new Date().getFullYear()} bikincetak.co.id - Percetakan Layanan Online Modern</p>
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