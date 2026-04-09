"use client";

import StoreSlider from "../components/storeSlider";
import MovieSlider from "../components/movieSlider";
import Subscription from "../components/subscription";

import { useFetch } from "@/hooks/useFetch";
import { rentableMoviesData } from "../../../dummyData/dummyData";
import { useEffect, useMemo, useState } from "react";

type StoreMovieCard = {
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

type PaginatedResponse<T> = {
  status: string;
  message?: string;
  data: T[];
  page?: number;
  limit?: number;
  totalCount?: number;
};

export default function StorePageClient() {
  const {
    data: storeSliderRes,
    loading: storeSliderLoading,
    refetch: refetchStoreSlider,
  } =
    useFetch<PaginatedResponse<StoreMovieCard>>("/user/getRentableMovies", "GET", {
      params: { page: 1, limit: 5 },
    });

  const {
    data: rentableMoviesRes,
    loading: rentableMoviesLoading,
    refetch: refetchRentableMovies,
  } =
    useFetch<PaginatedResponse<StoreMovieCard>>("/user/getRentableMovies", "GET", {
      params: { page: 1, limit: 20 },
    });

  const storeSliderMovies = storeSliderRes?.data ?? [];
  const rentableMovies = rentableMoviesRes?.data ?? [];

  const normalize = (m: StoreMovieCard): StoreMovieCard => ({
    ...m,
    rentPrice: m.rentPrice ?? undefined,
  });

  const normalizedSlider = useMemo(
    () => storeSliderMovies.map(normalize),
    [storeSliderMovies]
  );
  const normalizedRentable = useMemo(
    () => rentableMovies.map(normalize),
    [rentableMovies]
  );

  const [sliderUI, setSliderUI] = useState<StoreMovieCard[]>([]);
  const [rentableUI, setRentableUI] = useState<StoreMovieCard[]>([]);
  const [sliderHydrated, setSliderHydrated] = useState(false);
  const [rentableHydrated, setRentableHydrated] = useState(false);

  useEffect(() => {
    if (normalizedSlider.length) {
      setSliderUI(normalizedSlider);
      setSliderHydrated(true);
    }
  }, [normalizedSlider]);

  useEffect(() => {
    if (normalizedRentable.length) {
      setRentableUI(normalizedRentable);
      setRentableHydrated(true);
    }
  }, [normalizedRentable]);

  const optimisticMarkRented = (movieId: string) => {
    setSliderUI((prev) =>
      prev.map((m) => (m.id === movieId ? { ...m, isRented: true } : m))
    );
    setRentableUI((prev) =>
      prev.map((m) => (m.id === movieId ? { ...m, isRented: true } : m))
    );
  };

  const handleRentSuccess = (movieId: string) => {
    optimisticMarkRented(movieId);
    // Background refetch; UI stays (no skeleton) after first hydration.
    refetchStoreSlider();
    refetchRentableMovies();
  };
  

  return (
    <>
      <StoreSlider
        data={sliderUI}
        loading={!sliderHydrated && storeSliderLoading}
        onRentSuccess={handleRentSuccess}
      />

      <MovieSlider
        title="Rentable Movies"
        data={rentableUI}
        loading={!rentableHydrated && rentableMoviesLoading}
        onRentSuccess={handleRentSuccess}
      />

      <MovieSlider title="Rentable Web Series" data={rentableMoviesData} />
      <MovieSlider title="Popil Trending Movies" data={rentableMoviesData} />
      <Subscription />
    </>
  );
}

