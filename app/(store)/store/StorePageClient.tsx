"use client";

import StoreSlider from "../components/storeSlider";
import MovieSlider from "../components/movieSlider";
import Subscription from "../components/subscription";

import { useFetch } from "@/hooks/useFetch";
import { useCallback, useMemo, useState } from "react";

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

type NonPaginatedResponse<T> = {
  status: string;
  message?: string;
  data: T[];
};

type MovieApiDoc = Partial<StoreMovieCard> & {
  _id?: string;
  movieDuration?: string;
  year?: string;
  certificate?: string;
  description?: string;
  rental?: { durationHours?: number; price?: number };
};

function SeriesSectionFallback({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <section className="flex w-full flex-col bg-background text-white">
      <div className="flex flex-1 flex-col justify-center px-5 py-8 md:px-10 lg:px-14 md:py-10">
        <h2 className="[font-family:var(--font-montserrat)] text-xl font-semibold tracking-tight text-white md:text-2xl mb-3">
          {title}
        </h2>
        <p className="text-white/70 text-sm md:text-base mb-4 max-w-2xl">
          {message}
        </p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="w-fit rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
          >
            Retry
          </button>
        ) : null}
      </div>
    </section>
  );
}

export default function StorePageClient() {
  const {
    data: storeSliderRes,
    loading: storeSliderLoading,
    error: storeSliderError,
    refetch: refetchStoreSlider,
  } =
    useFetch<PaginatedResponse<StoreMovieCard>>("/user/getRentableMovies", "GET", {
      params: { page: 1, limit: 5 },
    });

  const {
    data: rentableMoviesRes,
    loading: rentableMoviesLoading,
    error: rentableMoviesError,
    refetch: refetchRentableMovies,
  } =
    useFetch<PaginatedResponse<StoreMovieCard>>("/user/getRentableMovies", "GET", {
      params: { page: 1, limit: 20 },
    });

  const {
    data: rentableSeriesRes,
    loading: rentableSeriesLoading,
    error: rentableSeriesError,
    refetch: refetchRentableSeries,
  } =
    useFetch<PaginatedResponse<StoreMovieCard>>("/user/getRentableSeries", "GET", {
      params: { page: 1, limit: 20 },
    });

  const {
    data: trendingMoviesRes,
    loading: trendingMoviesLoading,
    error: trendingMoviesError,
    refetch: refetchTrendingMovies,
  } = useFetch<NonPaginatedResponse<MovieApiDoc>>("/user/getPopilTrendingMovies", "GET");

  const normalize = useCallback(
    (m: StoreMovieCard): StoreMovieCard => ({
      ...m,
      rentPrice: m.rentPrice ?? undefined,
    }),
    []
  );

  const toCard = useCallback((movie: MovieApiDoc): StoreMovieCard => {
    const id = movie?.id ?? movie?._id ?? "";
    const durationHours =
      typeof movie?.rental?.durationHours === "number"
        ? movie.rental.durationHours
        : null;

    return normalize({
      id: id ? String(id) : "",
      movieName: movie?.movieName ?? "",
      movieDescription: movie?.movieDescription ?? movie?.description ?? "",
      movieYear: movie?.movieYear ?? movie?.year ?? "",
      rating: movie?.rating ?? movie?.certificate ?? "",
      quality: movie?.quality ?? "HD",
      duration: movie?.duration ?? movie?.movieDuration ?? "",
      rentPrice: movie?.rentPrice ?? movie?.rental?.price ?? undefined,
      rentDuration:
        movie?.rentDuration ??
        (durationHours != null ? `${durationHours} hours` : ""),
      bannerImage: movie?.bannerImage ?? "",
      coverImage: movie?.coverImage ?? movie?.bannerImage ?? "",
      link: movie?.link ?? (id ? `/store/movies/${String(id)}` : ""),
      isRented: Boolean(movie?.isRented),
    });
  }, [normalize]);

  const [rentedOverrides, setRentedOverrides] = useState<Record<string, boolean>>(
    {}
  );

  const sliderUI = useMemo(() => {
    const raw = storeSliderRes?.data ?? [];
    return raw.map(normalize).map((m) => ({
      ...m,
      isRented: Boolean(m.isRented || rentedOverrides[m.id]),
    }));
  }, [storeSliderRes, normalize, rentedOverrides]);

  const rentableUI = useMemo(() => {
    const raw = rentableMoviesRes?.data ?? [];
    return raw.map(normalize).map((m) => ({
      ...m,
      isRented: Boolean(m.isRented || rentedOverrides[m.id]),
    }));
  }, [rentableMoviesRes, normalize, rentedOverrides]);

  const seriesUI = useMemo(() => {
    const raw = rentableSeriesRes?.data ?? [];
    return raw.map(normalize).map((m) => ({
      ...m,
      isRented: Boolean(m.isRented || rentedOverrides[m.id]),
    }));
  }, [rentableSeriesRes, normalize, rentedOverrides]);

  const trendingUI = useMemo(() => {
    const raw = trendingMoviesRes?.data ?? [];
    return raw.map(toCard).map((m) => ({
      ...m,
      isRented: Boolean(m.isRented || rentedOverrides[m.id]),
    }));
  }, [trendingMoviesRes, toCard, rentedOverrides]);

  const optimisticMarkRented = (id: string) => {
    setRentedOverrides((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  };

  const handleRentSuccess = (movieId: string) => {
    optimisticMarkRented(movieId);
    refetchStoreSlider();
    refetchRentableMovies();
    refetchRentableSeries();
    refetchTrendingMovies();
  };

  const showStoreSkeleton =
    storeSliderLoading && storeSliderRes == null && !storeSliderError;
  const showMoviesSkeleton =
    rentableMoviesLoading &&
    rentableMoviesRes == null &&
    !rentableMoviesError;

  const showSeriesError =
    Boolean(rentableSeriesError) && rentableSeriesRes == null;
  const showSeriesSkeleton =
    rentableSeriesLoading &&
    rentableSeriesRes == null &&
    !rentableSeriesError;
  const showSeriesEmpty =
    rentableSeriesRes != null &&
    seriesUI.length === 0 &&
    !rentableSeriesLoading &&
    !rentableSeriesError;

  const showTrendingError = Boolean(trendingMoviesError) && trendingMoviesRes == null;
  const showTrendingSkeleton =
    trendingMoviesLoading && trendingMoviesRes == null && !trendingMoviesError;
  const showTrendingEmpty =
    trendingMoviesRes != null &&
    trendingUI.length === 0 &&
    !trendingMoviesLoading &&
    !trendingMoviesError;

  return (
    <>
      <StoreSlider
        data={sliderUI}
        loading={showStoreSkeleton}
        onRentSuccess={handleRentSuccess}
      />

      <MovieSlider
        title="Rentable Movies"
        data={rentableUI}
        loading={showMoviesSkeleton}
        onRentSuccess={handleRentSuccess}
      />

      {showSeriesError ? (
        <SeriesSectionFallback
          title="Rentable Web Series"
          message={rentableSeriesError ?? "Could not load rentable series."}
          onRetry={() => void refetchRentableSeries()}
        />
      ) : showSeriesEmpty ? (
        <SeriesSectionFallback
          title="Rentable Web Series"
          message="No rentable series found."
        />
      ) : (
        <MovieSlider
          title="Rentable Web Series"
          data={seriesUI}
          loading={showSeriesSkeleton}
          linkBehavior="navigate"
          rentModalContentType="Series"
          onRentSuccess={handleRentSuccess}
        />
      )}

      {showTrendingError ? (
        <SeriesSectionFallback
          title="Popil Trending Movies"
          message={trendingMoviesError ?? "Could not load trending movies."}
          onRetry={() => void refetchTrendingMovies()}
        />
      ) : showTrendingEmpty ? (
        <SeriesSectionFallback
          title="Popil Trending Movies"
          message="No trending movies found."
        />
      ) : (
        <MovieSlider
          title="Popil Trending Movies"
          data={trendingUI}
          loading={showTrendingSkeleton}
          onRentSuccess={handleRentSuccess}
        />
      )}
      <Subscription />
    </>
  );
}
