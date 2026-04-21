"use client";

import Image from "next/image";
import NavButton from "@/app/ui/buttons/navButton";
import { storeIcon } from "@/public/icons";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { clearAuth, getAuth } from "@/utils/auth";

/** Store / Logout: label hidden below md; icons only on mobile (labels still available to screen readers). */
const navIconOnlySm = "sr-only md:not-sr-only";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const syncAuth = useCallback(() => {
    setIsLoggedIn(!!getAuth().token);
  }, []);

  useEffect(() => {
    syncAuth();
  }, [syncAuth]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user") syncAuth();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [syncAuth]);

  const handleLogout = () => {
    clearAuth();
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 w-full transition-all duration-500 ${
          isScrolled
            ? "bg-black/40 backdrop-blur-lg shadow-lg"
            : "bg-linear-to-b from-black/70 to-transparent"
        }`}
      >
        <div
          className={`mx-auto flex  relative sm:w-[calc(100%-150px)] w-[calc(100%-50px)] items-center justify-between  transition-all duration-500 ${
            isScrolled ? "py-2 md:py-3" : "py-4"
          }`}
        >
          <Link href="/" className="flex items-center">
            <Image
              src="/logo/logo.svg"
              alt="Popil"
              width={112}
              height={56}
              priority
              className="hidden md:block"
            />

            <Image
              src="/logo/logoSmall.svg"
              alt="Popil"
              width={112}
              height={56}
              priority
              className="w-[55px] block md:hidden"
            />
          </Link>

          <nav className="flex items-center gap-3" aria-label="Main">
            {!isLoggedIn && (
              <NavButton
                href="/register"
                text="Register"
                className="rounded-full bg-linear-to-b from-[#3c3c3c] to-[#1e1e1e] border border-[#6b6b6b] px-4 py-2 font-medium text-white! text-base md:px-6 hover:brightness-110 transition-all shadow-sm"
              />
            )}

            <NavButton
              href="/store"
              text="Store"
              textClassName={navIconOnlySm}
              icon={
                <Image
                  src={storeIcon}
                  alt=""
                  width={24}
                  height={24}
                  className="h-[24px] w-[24px]"
                />
              }
              colorClassName=""
              className="rounded-full bg-linear-to-b from-primary to-secondary border border-transparent px-3 py-2 font-medium text-white! text-base md:px-4"
            />

            {isLoggedIn ? (
              <NavButton
                onClick={handleLogout}
                text="Logout"
                textClassName={navIconOnlySm}
                icon={<LogOut className="h-[24px] w-[24px]" aria-hidden />}
                colorClassName=""
                className="rounded-full bg-linear-to-b from-primary to-secondary border border-transparent px-3 py-2 font-medium text-white! text-base cursor-pointer md:px-4"
              />
            ) : (
              <div className="flex items-center gap-3">
                <NavButton
                  href="/login"
                  text="Login"
                  textClassName={navIconOnlySm}
                  icon={<LogIn className="h-[24px] w-[24px]" aria-hidden />}
                  colorClassName=""
                  className="rounded-full bg-linear-to-b from-primary to-secondary border border-transparent px-3 py-2 font-medium text-white! text-base md:px-4"
                />
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
    </>
  );
}
