"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchStore } from "@/store/useSearchStore";
import AnimatedList from "@/components/AnimatedList";
import { Loader2, SearchX } from "lucide-react";

export default function SearchResultsDropdown() {
  const { results, isLoading, error, isPopupOpen, query, selectMovie, closePopup } =
    useSearchStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        closePopup();
      }
    }

    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") closePopup();
    }

    if (isPopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isPopupOpen, closePopup]);

  const movieNames = results.map(
    (m: any) => m.movieName ?? "Untitled",
  );

  const handleItemSelect = (_name: string, index: number) => {
    if (results[index]) selectMovie(results[index]);
  };

  return (
    <AnimatePresence>
      {isPopupOpen && query.length > 0 && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-full z-50 mt-2 w-[90vw] max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-2xl backdrop-blur-xl sm:w-[420px]"
        >
          {isLoading && (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-white/60">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          )}

          {error && !isLoading && (
            <div className="px-4 py-6 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          {!isLoading && !error && results.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-white/50">
              <SearchX className="h-6 w-6" />
              <span className="text-sm">No rentable movies found</span>
            </div>
          )}

          {!isLoading && !error && results.length > 0 && (
            <AnimatedList
              items={movieNames}
              onItemSelect={handleItemSelect}
              showGradients
              enableArrowNavigation
              displayScrollbar={false}
              className="w-full!"
              itemClassName="bg transition-colors"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
