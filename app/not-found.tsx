"use client";
import Link from "next/link";
import Image from "next/image";
import FuzzyText from "@/components/FuzzyText";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="mx-auto flex w-[calc(100%-50px)] max-w-7xl items-center justify-between py-4 sm:w-[calc(100%-150px)]">
          <Link
            href="/"
            className="flex items-center opacity-90 transition-opacity hover:opacity-100"
          >
            <Image
              src="/logo/logo.svg"
              alt="Popil"
              width={112}
              height={56}
              priority
            />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center text-center">
        <FuzzyText baseIntensity={0.2} hoverIntensity={0.5} enableHover  fontSize={100}>
          404
        </FuzzyText>
        <FuzzyText baseIntensity={0.2} hoverIntensity={0.5} enableHover fontSize={50}>
        not found
        </FuzzyText>

        <p className="mt-3 max-w-md text-base text-white/55 md:text-lg">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="rounded-full bg-linear-to-b from-primary to-secondary px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-95"
          >
            Back to home
          </Link>
          <Link
            href="/store"
            className="rounded-full border border-white/20 bg-white/5 px-8 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
          >
            Visit store
          </Link>
        </div>
      </main>
    </div>
  );
}
