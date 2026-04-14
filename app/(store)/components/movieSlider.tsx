"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Swiper as SwiperClass } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

import { calenderIcon, clockIcon } from "@/public/icons";
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import MovieRentModal from "./movieRentModal";

import "swiper/css";

const TILE_W = 390;
const TILE_W_SM = 290;
const GAP_SM = 16;
const GAP_MD = 20;
const IMAGE_LIFT_PX = 55;

type SliderItem = {
  id: string;
  movieName?: string;
  movieDescription?: string;
  movieYear?: string;
  rating?: string;
  quality?: string;
  duration?: string;
  rentPrice?: string | number;
  rentDuration?: string;
  bannerImage?: string;
  coverImage?: string;
  link?: string;
  isRented?: boolean;
};

function getImagePath(path?: string) {
  if (!path) return "";
  return path.replace("../public", "");
}

function MovieTile({
  movie,
  reducedMotion,
  onActivate,
  onRentClick,
}: {
  movie: SliderItem;
  reducedMotion: boolean;
  onActivate?: () => void;
  onRentClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const img = getImagePath(movie.coverImage ?? movie.bannerImage);
  const instant = reducedMotion;

  return (
    <div
      className="relative shrink-0 cursor-pointer rounded-[18px] outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-primary w-[290px] md:w-[390px] aspect-video"
      role="group"
      tabIndex={0}
      aria-label={movie.movieName ? `${movie.movieName}` : "Movie"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate?.();
        }
      }}
    >
      <div
        className={`absolute inset-0 transition-transform duration-300 ease-out overflow-hidden rounded-[18px] border border-white/10 bg-black/20`}
        style={{
          transform: hovered
            ? `translateY(-${IMAGE_LIFT_PX}px)`
            : "translateY(0)",
        }}
      >
        {/* 16:9 image frame (banner/cover is always 16:9) */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out rounded-[18px]"
          style={{
            backgroundImage: `url(${img})`,
          }}
        />
      </div>

      <div
        className={`pointer-events-none absolute bg-linear-to-t from-background via-background to-transparent transition-opacity duration-300 z-20 w-full h-full ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4 pt-6 z-20"
        initial={false}
        animate={
          instant
            ? { opacity: hovered ? 1 : 0, y: hovered ? 0 : 24 }
            : { opacity: hovered ? 1 : 0, y: hovered ? 0 : 40 }
        }
        transition={
          instant
            ? { duration: 0 }
            : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
        }
        style={{ pointerEvents: hovered ? "auto" : "none" }}
      >
        <div>
          <div className="[font-family:var(--font-montserrat)] text-[16px] sm:text-[24px]  font-extrabold uppercase leading-none tracking-tight text-white drop-shadow md:text-[36px]">
            {movie.movieName ?? ""}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-medium text-white/90 md:text-xs">
            {movie.movieYear ? (
              <span className="flex items-center gap-1 text-[12px]">
                <Image src={calenderIcon} alt="" width={20} height={20} />
                {movie.movieYear}
              </span>
            ) : null}
            {movie.rating ? (
              <span className="rounded-xl bg-linear-to-b from-[#40454A] to-[#202329] px-2 py-1">
                {movie.rating}
              </span>
            ) : null}
            {movie.quality ? (
              <span className="rounded-md border border-primary px-1.5 py-0.5">
                {movie.quality}
              </span>
            ) : null}
            {movie.duration ? (
              <span className="flex items-center gap-1 text-[12px]">
                <Image src={clockIcon} alt="" width={20} height={20} />
                {movie.duration}
              </span>
            ) : null}
          </div>
        </div>

        {movie.rentPrice != null ? (
          <div className="flex w-full flex-col gap-3">
            <div className="rounded-[12px] sm:rounded-[16px] border border-gray-500 bg-black px-3 py-2.5 text-white flex items-end justify-evenly">
              <div className="text-[10px] sm:text-[11px] font-medium leading-snug text-white/70 md:text-xs">
                Rental Price :
              </div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
                <span className="text-[16px] sm:text-2xl font-extrabold leading-none tracking-tight md:text-[28px]">
                  ₹{movie.rentPrice}
                </span>
                {movie.rentDuration ? (
                  <span className="text-[11px] font-normal text-white/65 md:text-xs">
                    / {movie.rentDuration}
                  </span>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              className={
                movie.isRented
                  ? "[font-family:var(--font-montserrat)] flex w-full items-center justify-center gap-2 rounded-[12px] sm:rounded-[16px] bg-emerald-500/15 py-2 sm:py-4 text-sm font-bold text-emerald-400 border border-emerald-500/25 pointer-events-auto"
                  : "[font-family:var(--font-montserrat)] flex w-full items-center justify-center gap-2 rounded-[12px] sm:rounded-[16px] bg-linear-to-b from-primary to-secondary py-2 sm:py-4 text-sm font-bold text-white shadow-lg shadow-[#ff8c00]/25 pointer-events-auto hover:bg-[#ff9900] cursor-pointer"
              }
              onClick={(e) => {
                e.stopPropagation();
                onRentClick?.();
              }}
            >
              {movie.isRented ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Rented
                </>
              ) : (
                "Rent Now"
              )}
            </button>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

function useSliderGap() {
  const [gap, setGap] = useState(GAP_MD);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setGap(mq.matches ? GAP_SM : GAP_MD);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return gap;
}

function MovieSliderSkeleton({ title }: { title: string }) {
  return (
    <section className="flex w-full flex-col bg-background text-white">
      <div className="flex flex-1 flex-col justify-center px-5 py-8 md:px-10 lg:px-14 md:py-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="[font-family:var(--font-montserrat)] text-xl font-semibold tracking-tight text-white md:text-2xl">
            {title}
          </h2>
          <div className="flex items-center gap-8">
            <div className="h-12 w-12 rounded-full bg-white/10" />
            <div className="h-12 w-12 rounded-full bg-white/10" />
          </div>
        </div>
        <div className="w-full overflow-x-clip overflow-y-visible">
          <div className="mx-auto flex w-max items-end justify-center gap-4 px-1 pt-[55px] md:gap-5 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[290px] md:w-[390px] aspect-video rounded-[18px] bg-white/10"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MovieSlider({
  title,
  data,
  loading = false,
  onRentSuccess,
  linkBehavior = "modal",
  rentModalContentType = "Movies",
}: {
  title: string;
  data: SliderItem[];
  loading?: boolean;
  onRentSuccess?: (movieId: string) => void;
  /** When `navigate`, tile click follows `movie.link` instead of opening the rent modal. */
  linkBehavior?: "modal" | "navigate";
  rentModalContentType?: "Movies" | "Series";
}) {
  const router = useRouter();
  const [selectedMovie, setSelectedMovie] = useState<SliderItem | null>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const spaceBetween = useSliderGap();
  const swiperRef = useRef<SwiperClass | null>(null);

  const items = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const n = items.length;
  const canNavigate = n > 1;

  const swiperKey = useMemo(
    () => items.map((m) => m.id).join("|"),
    [items]
  );

  const goPrev = useCallback(() => {
    if (!canNavigate || !swiperRef.current) return;
    swiperRef.current.slidePrev();
  }, [canNavigate]);

  const goNext = useCallback(() => {
    if (!canNavigate || !swiperRef.current) return;
    swiperRef.current.slideNext();
  }, [canNavigate]);

  if (loading) return <MovieSliderSkeleton title={title} />;

  if (!n) return null;

  const activateTile = (movie: SliderItem) => {
    if (linkBehavior === "navigate" && movie.link) {
      router.push(movie.link);
      return;
    }
    setSelectedMovie(movie);
  };

  return (
    <section className="flex w-full flex-col bg-background text-white">
      <div className="flex flex-1 flex-col justify-center px-5 py-8 md:px-10 lg:px-14 md:py-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="[font-family:var(--font-montserrat)] text-xl font-semibold tracking-tight text-white md:text-2xl">
            {title}
          </h2>
          <div className="flex items-center gap-8">
            <motion.button
              type="button"
              onClick={goPrev}
              aria-label="Previous"
              aria-disabled={!canNavigate}
              whileTap={{ scale: 0.9 }}
              className={`grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/10 transition-colors ${
                canNavigate ? "hover:bg-white/15" : "opacity-40 cursor-not-allowed"
              }`}
            >
              <span className="text-lg leading-none text-white"><ChevronLeft size={24} /></span>
            </motion.button>
            <motion.button
              type="button"
              onClick={goNext}
              aria-label="Next"
              aria-disabled={!canNavigate}
              whileTap={{ scale: 0.9 }}
              className={`grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/10 transition-colors ${
                canNavigate ? "hover:bg-white/15" : "opacity-40 cursor-not-allowed"
              }`}
            >
              <span className="text-lg leading-none text-white"><ChevronRight size={24} /></span>
            </motion.button>
          </div>
        </div>

        {/* 55px reserves space so a hovered tile image can move up without stacking layout growth */}
        <div className="w-full overflow-x-clip overflow-y-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="px-1 pt-[55px]">
            <Swiper
              key={swiperKey}
              className="movie-slider-swiper overflow-visible!"
              onSwiper={(instance) => {
                swiperRef.current = instance;
              }}
              slidesPerView="auto"
              spaceBetween={spaceBetween}
              centeredSlides
              centeredSlidesBounds
              grabCursor
              speed={reducedMotion ? 0 : 450}
              // loop={n > 1}
              // loopAdditionalSlides={n > 1 ? Math.min(8, Math.max(3, n)) : 0}
              // loopAddBlankSlides={n > 1}
              // watchSlidesProgress={n > 1}
              resistanceRatio={0.65}
              slidesOffsetBefore={4}
              slidesOffsetAfter={4}
            >
              {items.map((movie) => (
                <SwiperSlide
                  key={movie.id}
                  className="flex! w-[290px]! max-w-[290px]! items-end justify-center md:w-[390px]! md:max-w-[390px]!"
                >
                  <MovieTile
                    movie={movie}
                    reducedMotion={reducedMotion}
                    onActivate={() => activateTile(movie)}
                    onRentClick={() => setSelectedMovie(movie)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      <MovieRentModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
        contentType={rentModalContentType}
        onRentSuccess={onRentSuccess}
      />
    </section>
  );
}

export default MovieSlider;
