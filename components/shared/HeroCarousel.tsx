"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    src: "https://bikincetak.id/wp-content/uploads/2025/05/cetak-kalender-murah.jpg",
  },
  {
    id: 2,
    src: "https://bikincetak.id/wp-content/uploads/2025/05/cetak-foto-murah.jpg",
  },
  {
    id: 3,
    src: "https://bikincetak.id/wp-content/uploads/2026/04/PRINT-A3-CETAK-ART-PAPER-CARTON-STIKER.jpg",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent(current === slides.length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [current]);

  return (
    <div className="relative w-full px-4 md:px-10 lg:px-20 group">
      <div className="relative overflow-hidden rounded-3xl h-[200px] md:h-[300px] shadow-xl bg-base-300">
        <div 
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="min-w-full h-full relative">
              <Image
                src={slide.src}
                alt={slide.src}
                fill
                priority={slide.id === 1}
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2.5 transition-all duration-300 rounded-full bg-white ${
                current === i ? "w-10" : "w-2.5 opacity-50 hover:opacity-80"
              }`}
            />
          ))}
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute top-1/2 -left-1 md:left-4 lg:left-14 -translate-y-1/2 btn btn-circle btn-primary shadow-2xl border-none text-white z-5 hover:scale-110 transition-transform active:scale-95"
      >
        <ChevronLeft size={32} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute top-1/2 -right-1 md:right-4 lg:right-14 -translate-y-1/2 btn btn-circle btn-primary shadow-2xl border-none text-white z-5 hover:scale-110 transition-transform active:scale-95"
      >
        <ChevronRight size={32} />
      </button>
    </div>
  );
}