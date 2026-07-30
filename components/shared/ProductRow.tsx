"use client";

import { useRef, useState, MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductItem {
  name: string;
  image?: string[];
  harga_mulai_dari?: number;
  diskon_roles?: Record<string, number>;
}

interface ProductRowProps {
  title: string;
  data: ProductItem[];
  activeRoleId?: string | null;
}

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka);
};

const ProductRow = ({ title, data, activeRoleId }: ProductRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasDragged(false); 
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; 
    
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
    
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (!data || data.length === 0) return null;

  return (
    <div className="mb-10">
      <p className="text-primary font-bold lg:text-xl border-b-2 border-primary w-fit pt-4 pb-2 mb-4 uppercase tracking-wider">
        {title}
      </p>

      {/* NEW WRAPPER: Spesifik untuk area carousel agar tombol presisi di tengah vertikal kartu */}
      <div className="relative group/carousel">
        
        {/* Tombol Panah Kiri */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-1 md:-left-5 top-[calc(50%-8px)] -translate-y-1/2 z-20 w-8 h-8 md:w-11 md:h-11 flex items-center justify-center bg-base-100/80 backdrop-blur-md text-primary rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-base-200/50 opacity-100 md:opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white hover:scale-110 active:scale-95"
          aria-label="Scroll Kiri"
        >
          {/* Ikon membesar di desktop, mengecil di mobile */}
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Container Scroll */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex gap-4 md:gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory ${
            isDragging ? "cursor-grabbing snap-none select-none" : "cursor-grab"
          }`}
        >
          {data.map((item, i) => {
            const maxDiskon = activeRoleId && item.diskon_roles ? item.diskon_roles[activeRoleId] : 0;

            return (
              <Link
                key={i}
                href={`/produk/${slugify(item.name)}`}
                onClick={(e) => { if (hasDragged) e.preventDefault(); }}
                className="card block min-w-40 md:min-w-60 bg-base-100 shadow-sm border border-primary/20 group overflow-hidden snap-start transition-all duration-300 hover:shadow-md hover:border-primary/50 relative select-none"
              >
                {maxDiskon > 0 && (
                  <div className="absolute top-2 right-2 z-10 bg-primary text-primary-content text-[9px] md:text-[10px] font-black px-2 py-1 rounded shadow-sm">
                    Diskon s/d {maxDiskon}%
                  </div>
                )}

                <figure className="relative h-28 md:h-44 w-full overflow-hidden bg-base-300">
                  <Image
                    fill
                    unoptimized
                    draggable={false}
                    alt={item.name}
                    src={item.image?.[0] || "/favicon.ico"}
                    className="object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                  />
                </figure>

                <div className="card-body p-3 md:p-4">
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

        {/* Tombol Panah Kanan */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-1 md:-right-5 top-[calc(50%-8px)] -translate-y-1/2 z-20 w-8 h-8 md:w-11 md:h-11 flex items-center justify-center bg-base-100/80 backdrop-blur-md text-primary rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-base-200/50 opacity-100 md:opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white hover:scale-110 active:scale-95"
          aria-label="Scroll Kanan"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>

      </div>
    </div>
  );
};

export default ProductRow;