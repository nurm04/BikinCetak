/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BannerData } from "@/services/pengaturanWebService";

interface HeroCarouselProps {
  banners?: BannerData[];
}

export default function HeroCarousel({ banners = [] }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent(current === banners.length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? banners.length - 1 : current - 1);
  };

  useEffect(() => {
    if (banners.length <= 1) return; // Jangan auto-slide kalau cuma 1 gambar
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [current, banners.length]);

  if (!banners || banners.length === 0) {
    return (
      <div className="relative w-full px-4 md:px-10 lg:px-20">
        <div className="relative overflow-hidden rounded-3xl h-50 md:h-75 bg-base-300 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full px-4 md:px-10 lg:px-20 group">
      <div className="relative overflow-hidden rounded-3xl h-50 md:h-75 shadow-xl bg-base-300">
        <div 
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((slide, index) => {
            const ImgComponent = slide.gambar_url ? (
              <Image
                src={slide.gambar_url}
                alt={slide.judul || `Banner Promo ${index + 1}`}
                fill
                unoptimized
                priority={index === 0} 
                className="object-cover"
              />
            ) : null;

            // 👇 KONTEN TEKS & TOMBOL DI ATAS BANNER 👇
            const hasTextOrLink = slide.judul || slide.link_tujuan;
            const OverlayContent = hasTextOrLink ? (
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 lg:p-16 bg-linear-to-t from-black/80 via-black/20 to-transparent">
                {slide.judul && (
                  <h2 className="text-white text-xl md:text-3xl lg:text-4xl font-black drop-shadow-lg mb-3 md:mb-5 max-w-2xl leading-tight">
                    {slide.judul}
                  </h2>
                )}
                {slide.link_tujuan && (
                  <span className="shadow-xl btn btn-primary btn-sm md:btn-md w-fit rounded-full border-none transition-transform group-hover/banner:scale-105 group-active/banner:scale-95">
                    Lihat Detail
                  </span>
                )}
              </div>
            ) : null;

            // Jika ada link_tujuan, bungkus gambar pakai Next Link
            return slide.link_tujuan ? (
              <Link 
                href={slide.link_tujuan} 
                key={slide.id} 
                className="min-w-full h-full relative block group/banner cursor-pointer"
              >
                {ImgComponent}
                {OverlayContent}
              </Link>
            ) : (
              <div key={slide.id} className="min-w-full h-full relative block group/banner">
                {ImgComponent}
                {OverlayContent}
              </div>
            );
          })}
        </div>

        {/* Navigation Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2.5 transition-all duration-300 rounded-full bg-white ${
                  current === i ? "w-10 shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "w-2.5 opacity-50 hover:opacity-80"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute top-1/2 -left-1 md:left-4 lg:left-14 -translate-y-1/2 btn btn-circle btn-primary shadow-2xl border-none text-white z-10 hover:scale-110 transition-transform active:scale-95"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute top-1/2 -right-1 md:right-4 lg:right-14 -translate-y-1/2 btn btn-circle btn-primary shadow-2xl border-none text-white z-10 hover:scale-110 transition-transform active:scale-95"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}
    </div>
  );
}