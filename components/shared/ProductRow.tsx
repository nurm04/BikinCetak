"use client";

import Image from "next/image";
import Link from "next/link";
import { slugify } from "@/lib/utils";

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
  return (
    <div className="mb-10">
      <p className="text-primary font-bold lg:text-xl border-b-2 border-primary w-fit pt-4 pb-2 mb-4 uppercase tracking-wider">
        {title}
      </p>

      <div className="flex gap-4 md:gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
        {data.map((item, i) => {
          const maxDiskon = activeRoleId && item.diskon_roles ? item.diskon_roles[activeRoleId] : 0;

          return (
            <div 
              key={i} 
              className="card min-w-40 md:min-w-60 bg-base-100 shadow-sm border border-primary/20 group overflow-hidden snap-start transition-all hover:shadow-md relative"
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
                  alt={item.name}
                  src={item.image?.[0] || "/favicon.ico"}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] z-20">
                  <Link 
                    href={`/produk/${slugify(item.name)}`}
                    className="btn btn-primary btn-sm text-white shadow-lg scale-90 group-hover:scale-100 transition-transform"
                  >
                    Detail
                  </Link>
                </div>
              </figure>

              <div className="card-body p-3 md:p-4">
                <h2 className="card-title text-sm md:text-base leading-tight h-10 line-clamp-2">
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductRow;