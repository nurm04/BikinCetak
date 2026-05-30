"use client";
import Image from "next/image";

interface ProductCarouselProps {
  image: string;
  name: string;
}

const ProductCarousel = ({ image, name }: ProductCarouselProps) => {
  return (
    <div className="space-y-4">
      <div className="sticky top-24">
        <div className="carousel w-full rounded-2xl shadow-inner bg-base-200 aspect-square">
          <div id="item1" className="carousel-item w-full relative">
            <Image
              alt={name}
              fill
              src={image}
              priority
              unoptimized
              className="object-cover"
            />
          </div>
        </div>
        
        <div className="flex justify-start gap-3 pt-4 overflow-x-auto scrollbar-hide">
          <a href="#item1" className="shrink-0 transition hover:scale-105 active:scale-95">
            <div className="w-16 h-16 relative border-2 rounded-xl border-base-300 hover:border-primary overflow-hidden">
              <Image alt="thumb 1" fill src={image} className="object-cover" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCarousel;