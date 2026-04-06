"use client";

import Image from "next/image";
import Header from "./header";
import NavButton from "@/app/ui/buttons/navButton";
import { storeIcon } from "@/public/icons";
import { Apple } from "lucide-react";
import BlurText from "@/app/ui/BlurText";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] md:min-h-[70vh] w-full flex justify-center items-center">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/background/HeroSection.png"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
        {/* Bottom gradient fade into next section */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
      </div>

      {/* Header on top */}
      {/* <div className="relative z-20">
        <Header />
      </div> */}

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex  w-[calc(100%-50px)]  sm:w-[calc(100%-150px)]  flex-col-reverse items-center justify-between gap-8  md:flex-row">
        {/* Left side - Text */}
        <div className="flex flex-1 flex-col gap-6 pb-20 md:pb-0">
          <h1 className="">
            
            <BlurText
              text="Discover, Create, Share"
              delay={200}
              animateBy="words"
              direction="top"
              // onAnimationComplete={handleAnimationComplete}
              className="font-heading text-4xl font-bold uppercase leading-tight tracking-tight text-white md:text-5xl lg:text-6xl"
            />
            {/* Discover, Create, Share */}
          </h1>
          <p className="max-w-md text-base leading-relaxed text-white/60 md:text-lg">
            Discover music and hire new songs. Sing! In the foundation, you can
            create vibrant clips and create stuff with your music in a creative,
            social app called{" "}
            <span className="text-primary font-semibold">Popil</span>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <NavButton
              href="/store"
              text="Store"
              icon={
                <Image
                  src={storeIcon}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
              }
              colorClassName="text-white"
              className="rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-6 py-2.5 text-sm font-medium transition-all duration-300 hover:bg-white/10"
            />

            <NavButton
              onClick={() => {}}
              text="Get App"
              icon={<Apple className="h-5 w-5" />}
              colorClassName="text-white"
              className="rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-6 py-2.5 text-sm font-medium transition-all duration-300 hover:bg-white/10"
            />
          </div>
        </div>

        {/* Right side - Phone mockup image */}
        <div className="relative flex flex-1 items-center justify-center md:justify-end">
          <Image
            src="/background/heroImage.png"
            alt="Popil App Preview"
            width={600}
            height={600}
            priority
            className="h-auto w-[320px] drop-shadow-2xl sm:w-[400px] md:w-[500px] lg:w-[600px]"
          />
        </div>
      </div>
    </section>
  );
}
