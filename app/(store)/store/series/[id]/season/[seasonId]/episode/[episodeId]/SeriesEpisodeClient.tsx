"use client";

import Link from "next/link";
import React, { useMemo } from "react";

import { useFetch } from "@/hooks/useFetch";

type SeriesEpisode = {
  episodeNo: number;
  episodeName: string;
  episodeDescription?: string;
  episodeDuration?: string;
  image?: string;
  _id: string;
};

type SeriesSeason = {
  _id: string;
  seasonNumber: number;
  description?: string;
  releaseDate?: string;
  episodes?: SeriesEpisode[];
};

type SeriesDoc = {
  _id: string;
  seriesName: string;
  description?: string;
  bannerImage?: string;
  image?: string;
  hasBannerImage?: boolean;
  seasons?: SeriesSeason[];
};

type SeriesByIdResponse = {
  status: string;
  message?: string;
  data: SeriesDoc;
};

function formatEpisodeDuration(hms?: string): string {
  if (!hms) return "";
  const parts = hms.split(":").map((p) => Number(p));
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    const m = Math.round((parts[0] * 3600 + parts[1] * 60 + parts[2]) / 60);
    return `${m} min`;
  }
  return hms;
}

export default function SeriesEpisodeClient({
  seriesId,
  seasonId,
  episodeId,
}: {
  seriesId: string;
  seasonId: string;
  episodeId: string;
}) {
  const {
    data: seriesRes,
    loading,
    error,
    refetch,
  } = useFetch<SeriesByIdResponse>("/user/getSeriesById", "GET", {
    params: { id: seriesId },
  });

  const series = seriesRes?.data;
  const { season, episode } = useMemo(() => {
    const seasons = series?.seasons ?? [];
    const s = seasons.find((x) => x._id === seasonId);
    const ep = s?.episodes?.find((e) => e._id === episodeId);
    return { season: s, episode: ep };
  }, [series?.seasons, seasonId, episodeId]);

  const bannerUrl =
    episode?.image ||
    series?.bannerImage ||
    series?.image ||
    "";

  if (loading && !seriesRes && !error) {
    return (
      <div className="w-full animate-pulse bg-background px-5 py-12 text-white md:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="aspect-video w-full rounded-2xl bg-white/10" />
          <div className="mt-8 h-8 w-2/3 rounded bg-white/10" />
          <div className="mt-4 h-4 w-full rounded bg-white/10" />
        </div>
      </div>
    );
  }

  if (error || !series || !season || !episode) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-white md:px-10">
        <p className="text-lg text-white/80">
          {error ?? "Episode not found."}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-6 rounded-full border border-white/15 bg-white/10 px-6 py-2 text-sm font-semibold hover:bg-white/15"
        >
          Retry
        </button>
        <Link
          href={`/store/series/${seriesId}`}
          className="mt-4 block text-sm text-primary hover:underline"
        >
          Back to series
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-background text-white">
      <div className="relative aspect-video w-full max-h-[70vh] overflow-hidden bg-black/60">
        {bannerUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bannerUrl})` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-10">
          <Link
            href={`/store/series/${seriesId}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Back to {series.seriesName}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-5 py-10 md:px-10 md:py-14">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
          Season {season.seasonNumber} · Episode {episode.episodeNo}
        </p>
        <h1 className="[font-family:var(--font-montserrat)] mt-2 text-2xl font-extrabold uppercase tracking-tight text-white md:text-3xl">
          {episode.episodeName}
        </h1>
        {episode.episodeDuration ? (
          <p className="mt-2 text-sm text-white/60">
            {formatEpisodeDuration(episode.episodeDuration)}
          </p>
        ) : null}
        {episode.episodeDescription ? (
          <p className="mt-6 text-sm leading-relaxed text-white/75 md:text-base">
            {episode.episodeDescription}
          </p>
        ) : null}
      </div>
    </div>
  );
}
