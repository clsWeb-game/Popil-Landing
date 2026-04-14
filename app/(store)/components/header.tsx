"use client";

import Image from "next/image";
import NavButton from "@/app/ui/buttons/navButton";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { LogOut } from "lucide-react";
import ResizeSearchBar from "@/app/ui/searchBar/resizeSearchBar";
import SearchResultsDropdown from "./searchResultsDropdown";
import MovieRentModal from "./movieRentModal";
import { useSearchStore } from "@/store/useSearchStore";
import { useFetch } from "@/hooks/useFetch";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const navIconOnlySm = "sr-only md:not-sr-only";
  const [searchCollapsed, setSearchCollapsed] = useState(true);

  const {
    query,
    setQuery,
    setResults,
    setLoading,
    setError,
    closePopup,
    openPopup,
    selectedMovie,
    clearSelectedMovie,
  } = useSearchStore();

  const { run: searchMovies } = useFetch(
    "/user/searchRentableMovies",
    "GET",
    { manual: true },
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!value.trim()) {
        setResults([]);
        setLoading(false);
        closePopup();
        return;
      }

      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        const res = await searchMovies(undefined, { q: value.trim() });
        if (res.ok) {
          const payload = res.data as any;
          setResults(payload?.data ?? []);
          setError(null);
        } else {
          setResults([]);
          setError(res.error);
        }
        setLoading(false);
      }, 400);
    },
    [setQuery, setResults, setLoading, setError, closePopup, searchMovies],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
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
          className={`mx-auto flex w-[calc(100%-50px)] sm:w-[calc(100%-150px)] items-center justify-between transition-all duration-500 ${
            isScrolled ? "py-[5px] md:py-[14px]" : "py-[5px] md:py-[22px]"
          }`}
        >
          <Link href="/store" className="flex items-center">
            <Image
              src="/logo/logo.svg"
              alt="Popil"
              width={112}
              height={56}
              priority
              className="hidden md:block h-auto w-[100px] md:w-[112px]"
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

          <nav className="relative flex items-center gap-3">
            <ResizeSearchBar
              collapsed={searchCollapsed}
              onCollapsedChange={setSearchCollapsed}
              value={query}
              onChange={handleSearchChange}
              onOpen={() => {
                // When opening the popup: clear text and ensure expanded
                setQuery("");
                setResults([]);
                setError(null);
                setLoading(false);
                openPopup();
                setSearchCollapsed(false);
              }}
              onFocus={() => {
                if (query.trim().length > 0) openPopup();
              }}
            />
            <NavButton
              onClick={handleLogout}
              text="Logout"
              textClassName={navIconOnlySm}
              icon={
                <LogOut className="h-[16px] w-[16px] md:h-[24px] md:w-[24px]" />
              }
              colorClassName=""
              className="rounded-full bg-linear-to-b from-primary to-secondary border border-transparent px-4 md:px-4 py-4 md:py-2.5 font-[16px] md:font-medium text-white! text-base cursor-pointer"
            />

            <SearchResultsDropdown />
          </nav>
        </div>
      </header>

      <MovieRentModal movie={selectedMovie} onClose={clearSelectedMovie} />
    </>
  );
}
