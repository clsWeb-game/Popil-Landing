"use client";
import React, { useState, useEffect } from "react";
import { storeSliderData } from "../../../dummyData/dummyData";
import Image from "next/image";
import { calenderIcon, clockIcon, containerIcon } from "@/public/icons";

function StoreSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide effect (optional, but good for sliders)
  // useEffect(() => {
  //   if (!storeSliderData || storeSliderData.length === 0) return;
  //   const interval = setInterval(() => {
  //     setCurrentIndex((prevIndex) => (prevIndex + 1) % storeSliderData.length);
  //   }, 10000);
  //   return () => clearInterval(interval);
  // }, []);

  if (!storeSliderData || storeSliderData.length === 0) {
    return null;
  }

  const activeMovie = storeSliderData[currentIndex];

  // Helper to format path
  const getImagePath = (path: string) => {
    return path.replace("../public", "");
  };

  return (
    <div className=" relative w-full h-[80vh] min-h-[600px] md:h-[90vh] bg-[#0a0a0a] text-white overflow-hidden font-sans">
      {/* Background Images with Crossfade */}
      {storeSliderData.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-bottom md:bg-top bg-no-repeat"
            style={{ backgroundImage: `url(${getImagePath(movie.bannerImage)})` }}
          />
          {/* Gradients to match the design */}
          <div className="absolute inset-0 bg-linear-to-r from-background/70 to-transparent"></div>
          <div className="absolute inset-0 bg-linear-to-t from-background to-transparent"></div>
        </div>
      ))}

      {/* Main Content */}
      <div className="relative mx-auto w-[calc(100%-50px)]  sm:w-[calc(100%-150px)] h-full flex flex-col justify-center lg:justify-end"  >
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
            <button className="bg-linear-to-b from-primary to-secondary hover:bg-[#ff9900] transition-colors text-white font-bold py-3 px-8 rounded-full flex items-center justify-center gap-2 w-full sm:w-auto shadow-lg shadow-[#ff8c00]/20">
              <Image src={containerIcon} alt="container" width={24} height={24} />
              Rent for ₹{activeMovie.rentPrice}
            </button>
            <button className="bg-linear-to-b from-[#40454A]/80 to-[#202329] hover:bg-[#3f4045] backdrop-blur-sm transition-colors text-white font-bold py-3 px-8 rounded-full w-full sm:w-auto">
              Watch Trailer
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnails (Right aligned per screenshot) */}
      <div 
        className="absolute bottom-[10px] sm:bottom-[22px] -right-10 md:right-16 flex items-end gap-2.5 md:gap-3 overflow-x-auto max-w-full pb-4 z-20"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {storeSliderData.map((movie, index) => (
          <button
            key={movie.id}
            onClick={() => setCurrentIndex(index)}
            className={`shrink-0 relative rounded-3xl overflow-hidden transition-all duration-300 ease-in-out cursor-pointer group ${
              index === currentIndex
                ? "w-28 h-[72px] md:w-[176.6px] md:h-[101.85px] border border-white/90 shadow-2xl shadow-black/50 opacity-100"
                : "w-28 h-[72px] md:w-[176.6px] md:h-[101.85px] border border-white/20 opacity-100 hover:opacity-100 hover:border-white/50"
            }`}
          >
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-500 ${
                index === currentIndex ? "scale-100" : "group-hover:scale-105"
              }`}
              style={{ backgroundImage: `url(${getImagePath(movie.coverImage)})` }}
            />
            <div className={`absolute inset-0  ${index === currentIndex ? "opacity-100" : "opacity-50 bg-black"} group-hover:opacity-0 `} />
          </button>
        ))}
      </div>
      
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