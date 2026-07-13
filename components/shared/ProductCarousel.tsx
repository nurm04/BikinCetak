"use client";
import Image from "next/image";
import { useRef } from "react";

interface ProductCarouselProps {
  images: string[];
  name: string;
}

const ProductCarousel = ({ images, name }: ProductCarouselProps) => {
  const finalImages = images && images.length > 0 ? images : ["/images/placeholder-product.jpg"];
  
  // Membuat referensi untuk mengakses elemen DOM secara langsung
  const carouselRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk menggeser gambar tanpa merubah URL
  const scrollToImage = (index: number) => {
    if (carouselRef.current) {
      const targetElement = carouselRef.current.children[index] as HTMLElement;
      if (targetElement) {
        // Menggeser kontainer carousel utama ke gambar yang diklik
        carouselRef.current.scrollTo({
          left: targetElement.offsetLeft,
          behavior: "smooth"
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-24">
        {/* CAROUSEL UTAMA */}
        {/* Tambahkan ref ke elemen ini */}
        <div 
          ref={carouselRef} 
          className="w-full shadow-inner carousel rounded-2xl bg-base-200 aspect-square scroll-smooth"
        >
          {finalImages.map((src, index) => (
            // Hapus atribut id="itemX" karena kita tidak pakai href anchor lagi
            <div key={index} className="relative w-full carousel-item">
              <Image
                alt={`${name} - Gambar ${index + 1}`}
                fill
                src={src}
                priority={index === 0} 
                unoptimized
                className="object-cover"
              />
            </div>
          ))}
        </div>
        
        {/* THUMBNAIL BAWAH */}
        {finalImages.length > 1 && (
          <div className="flex justify-start gap-3 pt-4 overflow-x-auto scrollbar-hide">
            {finalImages.map((src, index) => (
              // Ubah tag <a> menjadi <button>
              <button 
                key={index} 
                type="button"
                onClick={() => scrollToImage(index)}
                className="transition shrink-0 hover:scale-105 active:scale-95"
              >
                <div className="relative overflow-hidden border-2 w-16 h-16 rounded-xl border-base-300 hover:border-primary">
                  <Image 
                    alt={`Thumb ${index + 1}`} 
                    fill 
                    src={src} 
                    unoptimized
                    className="object-cover" 
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCarousel;