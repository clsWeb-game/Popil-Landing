"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { calenderIcon, clockIcon, containerIcon } from "@/public/icons";
import MovieRentModal from "./movieRentModal";

type MovieData = {
  id?: string;
  _id?: string;
  movieName?: string;
  movieDescription?: string;
  movieYear?: string | number;
  rating?: string;
  duration?: string;
  quality?: string;
  rentPrice?: string | number;
  rentDuration?: string;
  bannerImage?: string;
  coverImage?: string;
  image?: string;
};

function StoreSliderSkeleton() {
  return (
    <div className="relative w-full h-[80vh] min-h-[600px] md:h-[90vh] bg-[#0a0a0a] text-white overflow-hidden font-sans animate-pulse">
      <div className="relative mx-auto w-[calc(100%-50px)] sm:w-[calc(100%-150px)] h-full flex flex-col justify-center lg:justify-end">
        <div className="max-w-xl md:max-w-3xl z-1 w-full mt-26 sm:mt-0 sm:mb-[53px]">
          <div className="h-[62px] w-[70%] rounded-lg bg-white/10 mb-5" />
          <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6">
            <div className="h-8 w-20 rounded-xl bg-white/10" />
            <div className="h-8 w-14 rounded-xl bg-white/10" />
            <div className="h-8 w-14 rounded-xl bg-white/10" />
            <div className="h-8 w-24 rounded-xl bg-white/10" />
          </div>
          <div className="space-y-2 mb-8">
            <div className="h-4 w-full rounded bg-white/10" />
            <div className="h-4 w-[85%] rounded bg-white/10" />
            <div className="h-4 w-[60%] rounded bg-white/10" />
          </div>
          <div className="flex gap-4">
            <div className="h-12 w-48 rounded-full bg-white/10" />
            <div className="h-12 w-40 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-[10px] sm:bottom-[22px] -right-10 md:right-16 flex items-end gap-2.5 md:gap-3 pb-4 z-20">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-28 h-[72px] md:w-[176.6px] md:h-[101.85px] rounded-3xl bg-white/10"
          />
        ))}
      </div>
    </div>
  );
}

function StoreSlider({ data, loading = false }: { data: MovieData[]; loading?: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState<MovieData | null>(null);

  const items = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  // Auto-slide effect (optional, but good for sliders)
  // useEffect(() => {
  //   if (!storeSliderData || storeSliderData.length === 0) return;
  //   const interval = setInterval(() => {
  //     setCurrentIndex((prevIndex) => (prevIndex + 1) % storeSliderData.length);
  //   }, 10000);
  //   return () => clearInterval(interval);
  // }, [items.length]);

  useEffect(() => {
    if (currentIndex > 0 && currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, items.length]);

  if (loading) {
    return <StoreSliderSkeleton />;
  }

  if (!items || items.length === 0) {
    return null;
  }

  const activeMovie = items[currentIndex];

  // Helper to format path
  const getImagePath = (path: string) => {
    return path.replace("../public", "");
  };

  return (
    <div className=" relative w-full h-[80vh] min-h-[600px] md:h-[90vh] bg-[#0a0a0a] text-white overflow-hidden font-sans">
      {/* Background Images with Crossfade */}
      {items.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* 16:9 frame for banner image */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-0 right-0 top-0 aspect-video w-full">
              <div
                className="absolute inset-0 bg-cover bg-bottom md:bg-top bg-no-repeat"
                style={{
                  backgroundImage: `url(${getImagePath(movie.bannerImage ?? "")})`,
                }}
              />
            </div>
          </div>
          {/* Gradients to match the design */}
          <div className="absolute inset-0 bg-linear-to-r from-background/70 to-transparent"></div>
          <div className="absolute inset-0 bg-linear-to-t from-background to-transparent"></div>
        </div>
      ))}

      {/* Main Content */}
      <div className="relative mx-auto w-[calc(100%-50px)]  sm:w-[calc(100%-150px)] h-full flex flex-col justify-center lg:justify-end pb-0 md:pb-0 lg:pb-36 xl:pb-5"  >
        <div className="max-w-xl md:max-w-3xl z-10 w-full mt-26 sm:mt-0 sm:mb-[53px]">
          <h1 className="[font-family:var(--font-montserrat)] text-[30px] sm:text-[40px] md:text-[62px] leading-[0.95] md:leading-[0.9] font-extrabold uppercase tracking-[-0.03em] mb-5 drop-shadow-lg">
            {activeMovie.movieName}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm md:text-base text-white/85 font-medium mb-6">
            <span className="flex items-center gap-2 leading-none">
              <Image src={calenderIcon} alt="calender" width={24} height={24} />
              <span className="text-[16px] font-semibold leading-none text-white uppercase tracking-[0.08em]">
                {activeMovie.movieYear}
              </span>
            </span>
            <span className="rounded-xl bg-linear-to-b from-[#40454A] to-[#202329] px-3 py-2 text-[12px] md:text-[16px] font-semibold leading-none text-white uppercase tracking-[0.08em]">
              {activeMovie.rating}
            </span>
            <span className="rounded-xl border border-primary px-2.5 py-2 text-[12px] md:text-[16px] font-light leading-none text-white uppercase tracking-widest text-center">
              {activeMovie.quality}
            </span>
            <span className="flex items-center gap-2 leading-none">
              <Image src={clockIcon} alt="clock" width={24} height={24} />
              <span className="text-[16px] font-semibold leading-none text-white uppercase tracking-[0.08em]">
                {activeMovie.duration}
              </span>
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6 md:mb-8 line-clamp-3">
            {activeMovie.movieDescription}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              type="button"
              onClick={() => setSelectedMovie(activeMovie)}
              className="bg-linear-to-b from-primary to-secondary hover:bg-[#ff9900] transition-colors text-white font-bold py-3 px-8 rounded-full flex items-center justify-center gap-2 w-full sm:w-auto shadow-lg shadow-[#ff8c00]/20"
            >
              <Image src={containerIcon} alt="container" width={24} height={24} />
              Rent for ₹{activeMovie.rentPrice}
            </button>
            {/* <button className="bg-linear-to-b from-[#40454A]/80 to-[#202329] hover:bg-[#3f4045] backdrop-blur-sm transition-colors text-white font-bold py-3 px-8 rounded-full w-full sm:w-auto">
              Watch Trailer
            </button> */}
          </div>
        </div>
      </div>

      {/* Thumbnails (Right aligned per screenshot) */}
      <div 
        className="absolute bottom-[10px] sm:bottom-[22px] -right-10 md:right-16 flex items-end gap-2.5 md:gap-3 overflow-x-auto max-w-full pb-4 z-1 mr-10 sm:mr-0 "
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((movie, index) => (
          <button
            key={movie.id}
            onClick={() => setCurrentIndex(index)}
            className={`shrink-0 relative rounded-3xl overflow-hidden transition-all duration-300 ease-in-out cursor-pointer group ${
              index === currentIndex
                ? "w-28 md:w-[176.6px] aspect-video border border-white/90 shadow-2xl shadow-black/50 opacity-100"
                : "w-28 md:w-[176.6px] aspect-video border border-white/20 opacity-100 hover:opacity-100 hover:border-white/50"
            }`}
          >
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-500 ${
                index === currentIndex ? "scale-100" : "group-hover:scale-105"
              }`}
              style={{
                backgroundImage: `url(${getImagePath(movie.coverImage ?? movie.bannerImage ?? "")})`,
              }}
            />
            <div className={`absolute inset-0  ${index === currentIndex ? "opacity-100" : "opacity-50 bg-black"} group-hover:opacity-0 `} />
          </button>
        ))}
      </div>
      
      <MovieRentModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />

      {/* Hide scrollbar for webkit (Chrome, Safari, etc.) */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}} />
    </div>
  );
}

export default StoreSlider;