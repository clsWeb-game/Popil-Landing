"use client";

import Image from "next/image";
import NavButton from "@/app/ui/buttons/navButton";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    // Clear all local storage
    localStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Refresh and redirect backward to root to completely clear state
    window.location.href = "/";
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 w-full transition-all duration-500 ${
        isScrolled
          ? "bg-black/40 backdrop-blur-lg   shadow-lg"
          : "bg-linear-to-b from-black/70 to-transparent"
      }`}
    >
      <div
        className={`mx-auto flex w-[calc(100%-50px)] sm:w-[calc(100%-150px)] items-center justify-between transition-all duration-500 ${
          isScrolled ? "py-[5px] md:py-[14px]" : "py-[5px] md:py-[22px]"
        }`}
      >
        <Link href="/" className="flex items-center">
          <Image
            src="/logo/logo.svg"
            alt="Popil"
            width={112}
            height={56}
            priority
            className="h-auto w-[100px] md:w-[112px]"
          />
        </Link>

        <nav className="flex items-center gap-3">
          <NavButton
            onClick={handleLogout}
            text="Logout"
            icon={<LogOut className="h-[16px] w-[16px] md:h-[24px] md:w-[24px]" />}
            colorClassName=""
            className="rounded-full bg-linear-to-b from-primary to-secondary border border-transparent px-2 md:px-4 py-1 md:py-2 font-[16px] md:font-medium text-white! text-base cursor-pointer"
          />
        </nav>
      </div>
    </header>
  );
}