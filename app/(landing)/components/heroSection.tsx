"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import NavButton from "@/app/ui/buttons/navButton";
import { storeIcon } from "@/public/icons";
import { Apple } from "lucide-react";
import BlurText from "@/app/ui/BlurText";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  { src: "/slides/slider-1.jpg", alt: "Slide 1" },
  { src: "/slides/slider-2.jpg", alt: "Slide 2" },
  { src: "/slides/slider-3.jpg", alt: "Slide 3" },
  { src: "/slides/slider-4.jpg", alt: "Slide 4" },
];

const AUTOPLAY_INTERVAL = 5000;

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const startTimeRef = useRef<number>(0);

  const startProgress = useCallback(() => {
    startTimeRef.current = performance.now();
    setProgress(0);

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const pct = Math.min((elapsed / AUTOPLAY_INTERVAL) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        progressRef.current = requestAnimationFrame(animate);
      }
    };
    if (progressRef.current) cancelAnimationFrame(progressRef.current);
    progressRef.current = requestAnimationFrame(animate);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
      startProgress();
    },
    [current, startProgress]
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
    startProgress();
  }, [startProgress]);

  // Autoplay
  useEffect(() => {
    startProgress();
    timerRef.current = setInterval(() => {
      next();
    }, AUTOPLAY_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
    };
  }, [next, startProgress]);

  // Restart timer when user interacts
  const handleDotClick = (index: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    goTo(index);
    timerRef.current = setInterval(() => {
      next();
    }, AUTOPLAY_INTERVAL);
  };

  const slideVariants = {

    enter: (dir: number) => ({
      opacity: 0,
      scale: 1,
      x: dir > 0 ? 80 : -800,
    }),
    center: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 1,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
    exit: (dir: number) => ({
      opacity: 1,
      scale: 1,
      x: dir > 0 ? -800 : 80,
      transition: {
        duration: 0,
        // ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    }),
  };

  return (
    <section
      id="hero-slider"
      className="relative w-full overflow-hidden h-[350px] sm:h-[600px] md:h-[720px] lg:h-[90vh]"
      // style={{ height: "1080px", maxHeight: "100vh" }}
    >
      {/* ── Slide Images ────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <Image
              src={slides[current].src}
              alt={slides[current].alt}
              fill
              priority={current === 0}
              className="object-contain object-center"
              sizes=""
            />
          </motion.div>
        </AnimatePresence>

        {/* ── Dark overlays ───────────────────────────── */}
        
      </div>

      {/* ── Hero Content ────────────────────────────────── */}
      <div className="relative z-10 mx-auto flex h-full w-[calc(100%-50px)] sm:w-[calc(100%-150px)] flex-col justify-end pb-32 md:pb-40 lg:pb-44">
       
        {/* ── Slide Indicators ──────────────────────────── */}
        {/* <div className="mt-10 flex items-center gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="group relative flex items-center focus:outline-none cursor-pointer"
            >
             
              <div
                className={`relative overflow-hidden rounded-full transition-all duration-500 ${
                  i === current
                    ? "w-12 h-1.5 bg-white/20"
                    : "w-3 h-1.5 bg-white/20 hover:bg-white/40"
                }`}
              >
               
                {i === current && (
                  <motion.div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      background:
                        "linear-gradient(90deg, var(--primary), #ff8c00)",
                    }}
                    transition={{ duration: 0.05 }}
                  />
                )}
              </div>
            </button>
          ))}

         
          <span className="ml-3 text-xs font-medium tracking-wider text-white/40 tabular-nums">
            {String(current + 1).padStart(2, "0")} /{" "}
            {String(slides.length).padStart(2, "0")}
          </span>
        </div> */}
      </div>

      
    </section>
  );
}
