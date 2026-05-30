import Image from "next/image";
import Link from "next/link";
import { slugify } from "@/lib/utils";

interface ProductItem {
  name: string;
  image?: string;
}

interface ProductRowProps {
  title: string;
  data: ProductItem[];
}

const ProductRow = ({ title, data }: ProductRowProps) => {
  return (
    <div className="mb-10">
      <p className="text-primary font-bold lg:text-xl border-b-2 border-primary w-fit pt-4 pb-2 mb-4">
        {title}
      </p>

      <div className="flex gap-4 md:gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
        {data.map((item, i) => (
          <div 
            key={i} 
            className="card min-w-[160px] md:min-w-[240px] bg-base-100 shadow-sm border border-primary/20 group overflow-hidden snap-start transition-all hover:shadow-md"
          >
            <figure className="relative h-28 md:h-44 w-full overflow-hidden bg-base-300">
              <Image
                fill
                unoptimized
                alt={item.name}
                src={item.image || "/favicon.ico"}
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
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
              {/* <p className="text-sm md:text-base text-primary font-bold">{item.price}</p> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRow;