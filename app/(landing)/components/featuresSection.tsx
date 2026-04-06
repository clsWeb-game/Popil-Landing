"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  videoIcon,
  songIcon,
  karaokeIcon,
  scalingIcon,
  clipIcon,
  popilspaceIcon,
  paxIcon,
  popilAIIcon,
  ecosystemIcon,
} from "@/public/icons";

import SpotlightCard from "@/components/SpotlightCard";

const easeOut = [0.22, 1, 0.36, 1] as const;

const viewport = { once: true as const, amount: 0.35 as const, margin: "-40px" as const };

const titleVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: easeOut },
  },
};

const cardInnerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.06 },
  },
};

const iconVariants = {
  hidden: { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: easeOut },
  },
};

const labelVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut },
  },
};

const features = [
  {
    icon: videoIcon,
    label: "VIDEO",
    description: "Stream and share high-quality videos with seamless playback across all devices.",
  },
  {
    icon: songIcon,
    label: "SONG",
    description: "Discover and enjoy millions of songs with crystal-clear audio streaming.",
  },
  {
    icon: karaokeIcon,
    label: "KARAOKE",
    description: "Sing along to your favorite tracks with real-time lyrics and voice effects.",
  },
  {
    icon: scalingIcon,
    label: "SCALING",
    description: "Effortlessly scale your content and reach a growing global audience.",
  },
  {
    icon: clipIcon,
    label: "CLIP",
    description: "Create and share bite-sized clips that capture the best moments instantly.",
  },
  {
    icon: popilspaceIcon,
    label: "POPILSPACE",
    description: "Your personal creative hub to connect, collaborate, and build community.",
  },
  {
    icon: paxIcon,
    label: "PAX",
    description: "Secure and instant payments for creators with transparent earnings tracking.",
  },
  {
    icon: popilAIIcon,
    label: "POPILAI",
    description: "AI-powered tools that enhance your creative workflow and content quality.",
  },
  {
    icon: ecosystemIcon,
    label: "POPIL ECOSYSTEM",
    description: "A unified platform connecting all Popil services into one seamless experience.",
  },
];

export default function FeaturesSection() {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const handleCardTap = (index: number) => {
    setActiveCard((prev) => (prev === index ? null : index));
  };
  return (
    <section className="relative w-full py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-6">
        <motion.h2
          className="mb-16 text-center font-heading text-3xl font-bold text-white md:text-4xl lg:text-5xl"
          initial="hidden"
          whileInView="visible"
          viewport={viewport}
          variants={titleVariants}
        >
          What Makes Popil Pop
        </motion.h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{
                duration: 0.5,
                delay: index * 0.04,
                ease: easeOut,
              }}
            >
              <SpotlightCard
                className="custom-spotlight-card"
                spotlightColor="rgba(255, 140, 0, 0.2)"
              >
                <motion.div
                  className={`group relative flex flex-col items-center justify-center overflow-hidden p-8 min-h-[200px] ${activeCard === index ? "active" : ""}`}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewport}
                  variants={cardInnerVariants}
                  onClick={() => handleCardTap(index)}
                >
                  {/* Icon – lifts up & scales down on hover */}
                  <motion.div
                    className="z-30 flex h-16 w-16 items-center justify-center md:h-20 md:w-20 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[70px] group-hover:scale-90 group-[.active]:-translate-y-[70px] group-[.active]:scale-90"
                    variants={iconVariants}
                  >
                    <Image
                      src={feature.icon}
                      alt={feature.label}
                      width={80}
                      height={80}
                      className="h-14 w-14 md:h-[72px] md:w-[72px]"
                    />
                  </motion.div>

                  {/* Label – visible in default state */}
                  <motion.span
                    className="mt-4 text-xs font-semibold uppercase tracking-widest text-white/70 md:text-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:hidden group-[.active]:hidden"
                    variants={labelVariants}
                  >
                    {feature.label}
                  </motion.span>

                  {/* Hover overlay – covers entire card, slides up */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end px-5 pb-5 pt-4 translate-y-full opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 group-[.active]:translate-y-0 group-[.active]:opacity-100">
                    <span className="mb-2 text-xs font-bold uppercase tracking-widest text-primary md:text-sm">
                      {feature.label}
                    </span>
                    <p className="text-center text-xs leading-relaxed text-white/90 md:text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
