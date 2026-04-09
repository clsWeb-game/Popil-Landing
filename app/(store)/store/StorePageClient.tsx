"use client";

import StoreSlider from "../components/storeSlider";
import MovieSlider from "../components/movieSlider";
import Subscription from "../components/subscription";

import { useFetch } from "@/hooks/useFetch";
import { rentableMoviesData } from "../../../dummyData/dummyData";

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
  const { data: storeSliderRes, loading: storeSliderLoading } =
    useFetch<PaginatedResponse<StoreMovieCard>>("/user/getRentableMovies", "GET", {
      params: { page: 1, limit: 5 },
    });

  const { data: rentableMoviesRes, loading: rentableMoviesLoading } =
    useFetch<PaginatedResponse<StoreMovieCard>>("/user/getRentableMovies", "GET", {
      params: { page: 1, limit: 20 },
    });

  const storeSliderMovies = storeSliderRes?.data ?? [];
  const rentableMovies = rentableMoviesRes?.data ?? [];

  const normalize = (m: StoreMovieCard): StoreMovieCard => ({
    ...m,
    rentPrice: m.rentPrice ?? undefined,
  });

  

  return (
    <>
      <StoreSlider
        data={storeSliderMovies.map(normalize)}
        loading={storeSliderLoading}
      />

      <MovieSlider
        title="Rentable Movies"
        data={rentableMovies.map(normalize)}
        loading={rentableMoviesLoading}
      />

      <MovieSlider title="Rentable Web Series" data={rentableMoviesData} />
      <MovieSlider title="Popil Trending Movies" data={rentableMoviesData} />
      <Subscription />
    </>
  );
}

