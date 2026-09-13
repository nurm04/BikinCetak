"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, Search, MapPin, Globe } from 'lucide-react';
import { ItemData } from "@/services/itemService";
import { getPengaturan, PengaturanData } from "@/services/pengaturanWebService";
import { slugify } from "@/lib/utils";

// Custom Icon untuk TikTok (Karena Lucide belum ada icon TikTok resmi)
const TikTokIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const InstagramIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

const TwitterIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

interface FooterProps {
  items: ItemData[];
}

interface CategoryGroup {
  id: string;
  label: string;
  urutan: number;
  submenu: Array<{ name: string }>;
}

const Footer = ({ items = [] }: FooterProps) => {
  const [pengaturan, setPengaturan] = useState<PengaturanData | null>(null);

  // Tarik data dinamis dari Redis/API saat komponen di-load
  useEffect(() => {
    getPengaturan().then((res) => {
      if (res) setPengaturan(res);
    });
  }, []);

  // ==========================================
  // LOGIC GROUPING KATEGORI (Tanpa Icon)
  // ==========================================
  const groupedCategories: Record<string, CategoryGroup> = {};

  items.forEach((item) => {
    if (item.is_active === 0) return;

    const catId = item.kategori?.id_kategori || "lainnya";
    const catName = item.kategori?.nama_kategori || "Lainnya";
    const catUrutan = item.kategori?.urutan ?? 999;
    const lowerCat = catName.toLowerCase();

    if (lowerCat === "services" || lowerCat === "jasa") return;

    if (!groupedCategories[catId]) {
      groupedCategories[catId] = {
        id: catId,
        label: catName,
        urutan: catUrutan,
        submenu: []
      };
    }

    groupedCategories[catId].submenu.push({ name: item.nama_produk });
  });

  const dynamicCategories = Object.values(groupedCategories)
    .sort((a, b) => a.urutan - b.urutan)
    .map((category) => ({
      key: slugify(category.label),
      label: category.label,
      submenu: category.submenu,
    }));

  const router = useRouter();
  const [kodeTransaksi, setKodeTransaksi] = useState("");

  const handleCheckOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const kode = kodeTransaksi.trim();
    if (!kode) return;
    router.push(`/pesan/status/${encodeURIComponent(kode)}`);
  };

  // ==========================================
  // DATA DINAMIS DARI PENGATURAN (Dengan Fallback)
  // ==========================================
  const logoUtama = pengaturan?.logo_utama || "https://admin.bikincetak.co.id/storage/img_web/logobikincetak.png";
  const namaWebsite = pengaturan?.nama_website ? pengaturan.nama_website.split('-')[0].trim().toUpperCase() : "BIKIN CETAK";
  const deskripsi = pengaturan?.deskripsi_singkat || "Percetakan online terpercaya yang melayani berbagai kebutuhan cetak mesin offset, digital offset, indoor, outdoor, sablon hingga merchandise.";
  const alamatLengkap = pengaturan?.informasi_lokasi?.alamat_lengkap || "Layanan Online - Seluruh Indonesia";
  const linkGmaps = pengaturan?.informasi_lokasi?.link_gmaps || "https://maps.app.goo.gl/VwC6C6tzCZ8CwPSK8";
  const emailPerusahaan = pengaturan?.informasi_lokasi?.email || "info@bikincetak.co.id";
  
  // Ambil WA pertama untuk dicantumkan di kontak Footer
  const waUtama = pengaturan?.daftar_whatsapp?.find(wa => wa.is_active) || { nomor: "081213139490", nama: "CS" };
  const waUtamaLink = `https://wa.me/${waUtama.nomor.replace(/\D/g, '').startsWith('0') ? '62' + waUtama.nomor.replace(/\D/g, '').substring(1) : waUtama.nomor.replace(/\D/g, '')}`;

  const sosmedList = pengaturan?.daftar_sosmed?.filter(s => s.is_active) || [];
  const metodePembayaran = pengaturan?.metode_pembayaran?.filter(m => m.is_active) || [];
  const teksPembayaran = pengaturan?.teks_info_pembayaran || "Menerima pembayaran melalui transfer Bank BCA dan seluruh E-Wallet / M-Banking via QRIS.";

  // Helper untuk merender icon sosmed yang dinamis berdasarkan nama yang diinput Admin
  const renderSosmedIcon = (iconName: string) => {
    const name = iconName.toLowerCase();
    if (name.includes('instagram') || name.includes('ig')) return <InstagramIcon size={18} />;
    if (name.includes('facebook') || name.includes('fb')) return <FacebookIcon size={18} />;  
    if (name.includes('youtube') || name.includes('yt')) return <YoutubeIcon size={18} />;    
    if (name.includes('twitter') || name.includes('x')) return <TwitterIcon size={18} />;      
    if (name.includes('tiktok')) return <TikTokIcon size={18} />;
    return <Globe size={18} />; 
  };

  return (
    <footer className="text-white bg-primary">
      <div className="container px-4 mx-auto py-12 md:px-8">
        
        {/* Kategori Menu */}
        <div className="hidden pb-12 border-b md:grid grid-cols-2 md:grid-cols-4 gap-8 border-white/20">
          {dynamicCategories.map((menu) => (
            <nav key={menu.key} className="flex flex-col gap-2">
              <h6 className="mb-2 font-bold text-white border-b footer-title opacity-100 border-white/30 w-fit">
                {menu.label}
              </h6>
              {menu.submenu.slice(0, 6).map((item, i) => (
                <Link 
                  key={i} 
                  href={`/produk/${slugify(item.name)}`}
                  className="text-xs transition-opacity opacity-80 link link-hover hover:opacity-100"
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
        <div className="grid grid-cols-1 gap-12 py-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            
            {/* Logo BikinCetak */}
            <div className="flex items-center gap-1.5 mb-4">
              <div className="relative flex items-center justify-center p-1 overflow-hidden bg-white rounded-full shadow-sm w-7 h-7 md:w-9 md:h-9">
                <Image src={logoUtama} alt="Logo" fill unoptimized className="object-contain p-1" priority />
              </div>
              <h2 className="text-3xl font-black tracking-tighter text-white md:text-4xl">
                <span className="text-black">{namaWebsite}</span>
              </h2>
            </div>

            {/* Deskripsi */}
            <p className="max-w-2xl text-sm leading-relaxed opacity-90">
              {deskripsi}
            </p>
            
            {/* Tombol Sosial Media Dinamis */}
            {sosmedList.length > 0 && (
              <div className="flex gap-4 mt-6">
                {sosmedList.map((sosmed, idx) => (
                  <a 
                    key={idx} 
                    href={sosmed.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label={sosmed.platform}
                    className="btn btn-circle btn-sm btn-ghost bg-white/10 hover:bg-white/20 text-white"
                  >
                    {renderSosmedIcon(sosmed.icon)}
                  </a>
                ))}
              </div>
            )}

            {/* METODE PEMBAYARAN DINAMIS */}
            <div className="max-w-2xl pt-6 mt-8 border-t border-white/20">
              <h6 className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-3">Metode Pembayaran</h6>
              <div className="flex flex-wrap items-center gap-3">
                
                {metodePembayaran.map((bank, index) => (
                  <div key={index} className="relative overflow-hidden bg-white rounded-lg shadow-sm h-10 w-16 group" title={`${bank.nama_metode} - ${bank.no_rekening}`}>
                    <Image 
                      src={bank.icon_url} 
                      alt={bank.nama_metode} 
                      fill 
                      unoptimized // Biar nggak pusing sama next.config.js kalau pakai URL lokal Admin
                      className="object-contain p-1.5" 
                    />
                  </div>
                ))}
                
              </div>
              <p className="text-[10px] mt-3 opacity-70 font-medium max-w-xl">
                {teksPembayaran}
              </p>
            </div>
            
          </div>

          {/* Kolom Kanan: Hubungi Kami & Cek Status */}
          <div className="flex flex-col gap-4">
            <h6 className="font-bold text-white footer-title opacity-100">Hubungi Kami</h6>
            <div className="flex flex-col gap-3 text-sm">
              <a
                href={waUtamaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-colors hover:text-black"
              >
                <Phone size={16} />
                <span>{waUtama.nomor}</span>
              </a>
              <div className="flex items-center gap-3">
                <Mail size={16} /> <span>{emailPerusahaan}</span>
              </div>
              <a
                href={linkGmaps}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 transition-colors hover:text-black group"
              >
                <MapPin size={16} className="mt-0.5 shrink-0 transition-transform group-hover:scale-110" /> 
                <span className="leading-snug line-clamp-2">{alamatLengkap}</span>
              </a>
            </div>
            
            <div className="mt-8">
              <h6 className="mb-3 font-bold text-white footer-title opacity-100">
                Cek Status Pesanan
              </h6>

              <form onSubmit={handleCheckOrder} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kode Transaksi"
                  value={kodeTransaksi}
                  onChange={(e) => setKodeTransaksi(e.target.value)}
                  className="w-full input input-bordered input-sm text-base-content"
                />
                <button
                  type="submit"
                  className="text-white bg-black border-black btn btn-sm hover:bg-black/80"
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

      {/* Baris Bawah / Copyright */}
      <div className="py-6 bg-black/15">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 mx-auto text-[10px] font-bold tracking-wider uppercase md:px-8 md:flex-row">
          <p className="opacity-80">© {new Date().getFullYear()} {namaWebsite} - Layanan Percetakan Online</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link href="/profil" className="transition-colors opacity-80 hover:opacity-100 hover:text-black">Profil</Link>
            <Link href="/cara-order" className="transition-colors opacity-80 hover:opacity-100 hover:text-black">Cara Order</Link>
            <Link href="/faq" className="transition-colors opacity-80 hover:opacity-100 hover:text-black">FAQ</Link>
            <Link href="/syarat-ketentuan" className="transition-colors opacity-80 hover:opacity-100 hover:text-black">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;