"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, Loader2, LogIn, X } from "lucide-react";

import { useFetch } from "@/hooks/useFetch";
import { calenderIcon, clockIcon, containerIcon } from "@/public/icons";
import MovieSlider from "../../../components/movieSlider";

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

type RentalPlan = {
  _id?: string;
  label?: string;
  durationHours: number;
  price: number;
  isActive?: boolean;
  sortOrder?: number;
};

type SeriesDoc = {
  _id: string;
  seriesName: string;
  description?: string;
  bannerImage?: string;
  image?: string;
  hasBannerImage?: boolean;
  year?: string;
  certificate?: string;
  languageName?: string;
  genreName?: string;
  rental?: { durationHours?: number; price?: number; isActive?: boolean };
  rentalPlans?: RentalPlan[];
  isRented?: boolean;
  seasons?: SeriesSeason[];
};

type SeriesByIdResponse = {
  status: string;
  message?: string;
  data: SeriesDoc;
};

type PaginatedSeriesCards = {
  status: string;
  data: StoreSeriesCard[];
  page?: number;
  limit?: number;
  totalCount?: number;
};

type StoreSeriesCard = {
  id?: string;
  _id?: string;
  movieName?: string;
  movieDescription?: string;
  movieYear?: string;
  rating?: string;
  quality?: string;
  duration?: string;
  rentPrice?: string | number | null;
  rentDuration?: string;
  bannerImage?: string;
  coverImage?: string;
  link?: string;
  isRented?: boolean;
};

type CreateRentalOrderResponse = {
  status: "success" | "fail";
  checkoutType: "order";
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  content: {
    id: string;
    name: string;
    rentalPrice: number;
    durationHours: number;
    planLabel?: string;
  };
  userPrefill: {
    name: string;
    email: string;
    contact: string;
  };
};

type VerifyRentalResponse = {
  status: "success" | "fail";
  message: string;
  data: Record<string, unknown>;
};

type RazorpayPaymentResult = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature: string;
};

function isLoggedIn(): boolean {
  return typeof window !== "undefined" && !!localStorage.getItem("token");
}

function parseHmsToSeconds(hms: string): number {
  const parts = hms.split(":").map((p) => Number(p));
  if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2 && parts.every((n) => !Number.isNaN(n))) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

function formatTotalDuration(seconds: number): string {
  if (seconds <= 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m} min`;
  return `${m} min`;
}

function formatEpisodeDuration(hms?: string): string {
  if (!hms) return "";
  const s = parseHmsToSeconds(hms);
  if (s <= 0) return hms;
  const m = Math.round(s / 60);
  return `${m} min`;
}

function formatDisplayDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function sortSeasons(seasons: SeriesSeason[]): SeriesSeason[] {
  return [...seasons].sort((a, b) => a.seasonNumber - b.seasonNumber);
}

const LEGACY_PLAN_ID = "legacy";

function formatPlanDuration(hours: number): string {
  if (hours >= 24 && hours % 24 === 0) {
    const d = hours / 24;
    return `${d} day${d > 1 ? "s" : ""}`;
  }
  return `${hours} hours`;
}

function totalSecondsAllEpisodes(seasons: SeriesSeason[] | undefined): number {
  if (!seasons?.length) return 0;
  let t = 0;
  for (const s of seasons) {
    for (const ep of s.episodes ?? []) {
      t += parseHmsToSeconds(ep.episodeDuration ?? "");
    }
  }
  return t;
}

function toSliderItem(card: StoreSeriesCard): {
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
} {
  const id = String(card.id ?? card._id ?? "");
  return {
    id,
    movieName: card.movieName,
    movieDescription: card.movieDescription,
    movieYear: card.movieYear,
    rating: card.rating,
    quality: card.quality ?? "HD",
    duration: card.duration,
    rentPrice: card.rentPrice ?? undefined,
    rentDuration: card.rentDuration ?? "",
    bannerImage: card.bannerImage,
    coverImage: card.coverImage ?? card.bannerImage,
    link: card.link ?? (id ? `/store/series/${id}` : ""),
    isRented: Boolean(card.isRented),
  };
}

function SeriesDetailSkeleton() {
  return (
    <div className="w-full animate-pulse bg-background text-white">
      <div className="relative h-[min(70vh,720px)] w-full bg-white/5">
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-5 pb-16 pt-24 md:px-10 lg:px-14">
          <div className="h-14 w-2/3 max-w-xl rounded-lg bg-white/10" />
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="h-9 w-24 rounded-xl bg-white/10" />
            <div className="h-9 w-16 rounded-xl bg-white/10" />
            <div className="h-9 w-28 rounded-xl bg-white/10" />
          </div>
          <div className="mt-6 space-y-2 max-w-3xl">
            <div className="h-4 w-full rounded bg-white/10" />
            <div className="h-4 w-[90%] rounded bg-white/10" />
            <div className="h-4 w-[70%] rounded bg-white/10" />
          </div>
          <div className="mt-8 h-12 w-52 rounded-full bg-white/10" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-10 lg:px-14">
        <div className="h-8 w-40 rounded bg-white/10" />
        <div className="mt-6 flex gap-4">
          <div className="h-10 w-28 rounded-full bg-white/10" />
          <div className="h-10 w-28 rounded-full bg-white/10" />
        </div>
        <div className="mt-8 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="h-24 w-40 shrink-0 rounded-xl bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-2/3 rounded bg-white/10" />
                <div className="h-4 w-1/3 rounded bg-white/10" />
                <div className="h-3 w-full rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SeriesDetailClient({ seriesId }: { seriesId: string }) {
  const router = useRouter();
  const [renting, setRenting] = useState(false);
  const [rentSuccess, setRentSuccess] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);

  const {
    data: seriesRes,
    loading: seriesLoading,
    error: seriesError,
    refetch: refetchSeries,
  } = useFetch<SeriesByIdResponse>("/user/getSeriesById", "GET", {
    params: { id: seriesId },
  });

  const {
    data: rentableRes,
    loading: rentableLoading,
    error: rentableError,
    refetch: refetchRentable,
  } = useFetch<PaginatedSeriesCards>("/user/getRentableSeries", "GET", {
    params: { page: 1, limit: 20 },
  });

  const { run: runCreateOrder } = useFetch<CreateRentalOrderResponse>(
    "/user/rental/createOrder",
    "POST",
    { manual: true }
  );

  const { run: runVerifyPayment } = useFetch<VerifyRentalResponse>(
    "/user/rental/verifyPayment",
    "POST",
    { manual: true }
  );

  const series = seriesRes?.data;
  const seasons = useMemo(
    () => sortSeasons(series?.seasons ?? []),
    [series?.seasons]
  );
  const [activeSeasonIndex, setActiveSeasonIndex] = useState(0);

  const activeSeason = seasons[activeSeasonIndex] ?? seasons[0];
  const episodes = activeSeason?.episodes ?? [];

  const totalRuntimeLabel = useMemo(
    () => formatTotalDuration(totalSecondsAllEpisodes(seasons)),
    [seasons]
  );

  const moreLikeData = useMemo(() => {
    const raw = rentableRes?.data ?? [];
    return raw
      .filter((c) => String(c.id ?? c._id ?? "") !== String(seriesId))
      .map(toSliderItem)
      .filter((m) => m.id);
  }, [rentableRes?.data, seriesId]);

  const bannerUrl =
    series?.hasBannerImage && series.bannerImage
      ? series.bannerImage
      : series?.bannerImage || series?.image || "";

  const activePlans = useMemo(() => {
    const raw = series?.rentalPlans ?? [];
    return [...raw]
      .filter((p) => p.isActive !== false && p.price > 0 && p.durationHours > 0)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [series?.rentalPlans]);

  const displayPrice = useMemo(() => {
    if (activePlans.length > 0) {
      return Math.min(...activePlans.map((p) => p.price));
    }
    return series?.rental?.price;
  }, [activePlans, series?.rental?.price]);

  const isRented = Boolean(series?.isRented || rentSuccess);
  const legacyRentalOk =
    Boolean(series?.rental?.isActive) &&
    (series?.rental?.price ?? 0) > 0 &&
    (series?.rental?.durationHours ?? 0) > 0;
  const rentalActive = activePlans.length > 0 || legacyRentalOk;

  const planRows = useMemo(() => {
    if (activePlans.length > 0) {
      return activePlans.map((p) => ({
        id: String(p._id),
        title: p.label?.trim() || formatPlanDuration(p.durationHours),
        sublabel: formatPlanDuration(p.durationHours),
        price: p.price,
      }));
    }
    if (legacyRentalOk && series?.rental) {
      return [
        {
          id: LEGACY_PLAN_ID,
          title: "Standard",
          sublabel: formatPlanDuration(series.rental.durationHours ?? 48),
          price: series.rental.price ?? 0,
        },
      ];
    }
    return [];
  }, [activePlans, legacyRentalOk, series?.rental]);

  const handleRent = useCallback(
    async (planId: string) => {
    if (!seriesId) return;
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    if (renting) return;

    if (typeof window.Razorpay === "undefined") {
      toast.error("Payment SDK not loaded. Please refresh and try again.");
      return;
    }

    setRenting(true);
    setPlansOpen(false);
    const created = await runCreateOrder({
      contentId: seriesId,
      contentType: "Series",
      planId,
    });

    if (!created.ok || !created.data) {
      toast.error(created.ok ? "Failed to create order." : created.error);
      setRenting(false);
      return;
    }

    const createRes = created.data;
    if (createRes.status !== "success") {
      toast.error("Failed to create rental order.");
      setRenting(false);
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const planLabel = createRes.content.planLabel
        ? ` — ${createRes.content.planLabel}`
        : "";
      const options: Record<string, unknown> = {
        key: createRes.keyId,
        order_id: createRes.orderId,
        amount: createRes.amount,
        currency: createRes.currency,
        name: "Popil",
        description: `Rent: ${createRes.content.name}${planLabel} (${createRes.content.durationHours}h)`,
        prefill: {
          name: createRes.userPrefill.name,
          email: createRes.userPrefill.email,
          contact: createRes.userPrefill.contact,
        },
        theme: { color: "#FEA500" },
        handler: async (response: RazorpayPaymentResult) => {
          const verified = await runVerifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (!verified.ok || !verified.data) {
            toast.error(verified.ok ? "Verification failed." : verified.error);
            setRenting(false);
            reject(new Error("verify"));
            return;
          }
          toast.success(verified.data.message || "Rental successful");
          setRentSuccess(true);
          setRenting(false);
          void refetchSeries();
          void refetchRentable();
          resolve();
        },
        modal: {
          ondismiss: () => {
            setRenting(false);
            reject(new Error("dismissed"));
          },
        },
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch {
        setRenting(false);
        reject(new Error("rzp"));
      }
    }).catch((e: unknown) => {
      const err = e as { message?: string };
      if (err?.message === "dismissed") return;
      if (err?.message === "verify") return;
      toast.error("Could not open payment.");
    });
  },
  [
    seriesId,
    renting,
    router,
    runCreateOrder,
    runVerifyPayment,
    refetchSeries,
    refetchRentable,
  ]
);

  if (seriesLoading && !seriesRes && !seriesError) {
    return <SeriesDetailSkeleton />;
  }

  if (seriesError || !series) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-white md:px-10">
        <p className="text-lg text-white/80">
          {seriesError ?? "Could not load this series."}
        </p>
        <button
          type="button"
          onClick={() => void refetchSeries()}
          className="mt-6 rounded-full border border-white/15 bg-white/10 px-6 py-2 text-sm font-semibold hover:bg-white/15"
        >
          Retry
        </button>
        <Link
          href="/store"
          className="mt-4 block text-sm text-primary hover:underline"
        >
          Back to store
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-background text-white">
      {/* Hero */}
      <div className="relative min-h-[min(70vh,720px)] w-full overflow-hidden">
        {bannerUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bannerUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-[#0a0a0a]" />
        )}
        <div className="absolute inset-0 bg-linear-to-r from-background/90 via-background/55 to-background/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />

          <div className="relative mx-auto flex min-h-[min(70vh,720px)] max-w-[calc(100%-50px)] sm:w-[calc(100%-150px)] flex-col justify-end pb-12 pt-28 md:pb-16">
          <h1 className="[font-family:var(--font-montserrat)] text-3xl font-extrabold uppercase leading-[0.95] tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl">
            {series.seriesName}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/90 md:text-base">
            {series.year ? (
              <span className="flex items-center gap-2 font-semibold uppercase tracking-[0.08em]">
                <Image src={calenderIcon} alt="" width={22} height={22} />
                {series.year}
              </span>
            ) : null}
            {series.certificate ? (
              <span className="rounded-xl bg-linear-to-b from-[#40454A] to-[#202329] px-3 py-2 text-xs font-semibold uppercase tracking-wide md:text-sm">
                {series.certificate}
              </span>
            ) : null}
            {activeSeason ? (
              <span className="rounded-xl border border-primary px-2.5 py-2 text-xs font-light uppercase tracking-widest md:text-sm">
                Season {activeSeason.seasonNumber}
              </span>
            ) : null}
            {totalRuntimeLabel ? (
              <span className="flex items-center gap-2 font-semibold uppercase tracking-[0.08em]">
                <Image src={clockIcon} alt="" width={22} height={22} />
                {totalRuntimeLabel}
              </span>
            ) : null}
          </div>

          {series.description ? (
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-white/80 md:text-base line-clamp-4">
              {series.description}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {rentalActive ? (
              !isLoggedIn() ? (
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-white/15"
                >
                  <LogIn className="h-5 w-5" />
                  Login to Rent
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  {isRented ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-6 py-3 text-sm font-bold text-emerald-400">
                      <CheckCircle className="h-5 w-5" />
                      Rented
                    </div>
                  ) : null}
                  <button
                    type="button"
                    disabled={renting || planRows.length === 0}
                    onClick={() => setPlansOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-b from-primary to-secondary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-[#ff8c00]/20 transition-opacity hover:opacity-95 disabled:opacity-50"
                  >
                    {renting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Image src={containerIcon} alt="" width={22} height={22} />
                    )}
                    {isRented ? "Extend access" : "More ways to watch"}
                  </button>
                  {displayPrice != null ? (
                    <span className="text-sm text-white/65">
                      From ₹{displayPrice}
                    </span>
                  ) : null}
                </div>
              )
            ) : null}
          </div>
        </div>
      </div>

      {plansOpen && planRows.length > 0 ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="plans-title"
          onClick={() => setPlansOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full p-1 text-white/70 hover:bg-white/10"
              onClick={() => setPlansOpen(false)}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h2
              id="plans-title"
              className="[font-family:var(--font-montserrat)] pr-8 text-lg font-semibold text-white"
            >
              More ways to watch
            </h2>
            <p className="mt-1 text-sm text-white/55">
              Choose a plan to rent or extend your access.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {planRows.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    disabled={renting}
                    onClick={() => void handleRent(row.id)}
                    className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-colors hover:bg-white/10 disabled:opacity-50"
                  >
                    <div>
                      <p className="font-semibold text-white">{row.title}</p>
                      <p className="text-xs text-white/55">{row.sublabel}</p>
                    </div>
                    <span className="shrink-0 font-bold text-primary">
                      ₹{row.price}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {/* Episodes */}
      <section className="mx-auto w-[calc(100%-50px)] sm:w-[calc(100%-150px)]  py-10  md:py-14 ">
        <h2 className="[font-family:var(--font-montserrat)] text-xl font-semibold tracking-tight md:text-2xl">
          Episodes
        </h2>

        {seasons.length === 0 ? (
          <p className="mt-4 text-white/60">No seasons available yet.</p>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap gap-6 border-b border-white/10 pb-1">
              {seasons.map((s, idx) => {
                const active = idx === activeSeasonIndex;
                return (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => setActiveSeasonIndex(idx)}
                    className={`relative pb-3 text-sm font-semibold transition-colors md:text-base ${
                      active ? "text-primary" : "text-white/70 hover:text-white"
                    }`}
                  >
                    Season {s.seasonNumber}
                    {active ? (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <ul className="mt-8 flex flex-col gap-4">
              {episodes.length === 0 ? (
                <li className="text-white/60">No episodes in this season.</li>
              ) : (
                episodes.map((ep) => {
                  const thumb = ep.image || bannerUrl;
                  const sub =
                    [formatDisplayDate(activeSeason?.releaseDate), formatEpisodeDuration(ep.episodeDuration)]
                      .filter(Boolean)
                      .join(" · ") || "";
                  const href = `/store/series/${seriesId}/season/${activeSeason._id}/episode/${ep._id}`;
                  return (
                    <li key={ep._id}>
                      <Link
                        href={href}
                        className="flex gap-4 rounded-2xl p-4 transition-colors md:gap-6"
                      >
                        <div
                          className="relative h-24 w-40 shrink-0 overflow-hidden rounded-xl bg-black/40 md:h-28 md:w-44"
                          style={
                            thumb
                              ? { backgroundImage: `url(${thumb})`, backgroundSize: "cover", backgroundPosition: "center" }
                              : undefined
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <p className="[font-family:var(--font-montserrat)] text-sm font-bold text-white md:text-base">
                            S{activeSeason.seasonNumber} E{ep.episodeNo} — {ep.episodeName}
                          </p>
                          {sub ? (
                            <p className="mt-1 text-xs text-white/55 md:text-sm">{sub}</p>
                          ) : null}
                          {ep.episodeDescription ? (
                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/60 md:text-sm">
                              {ep.episodeDescription}
                            </p>
                          ) : null}
                        </div>
                      </Link>
                    </li>
                  );
                })
              )}
            </ul>
          </>
        )}
      </section>

      {/* More like this */}
      {rentableError ? (
        <div className="mx-auto max-w-6xl px-5 pb-12 md:px-10 lg:px-14">
          <p className="text-sm text-white/70">{rentableError}</p>
          <button
            type="button"
            onClick={() => void refetchRentable()}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Retry
          </button>
        </div>
      ) : (
        <MovieSlider
          title="More Like This"
          data={moreLikeData}
          loading={rentableLoading && rentableRes == null && !rentableError}
          linkBehavior="navigate"
          rentModalContentType="Series"
          onRentSuccess={() => {
            void refetchSeries();
            void refetchRentable();
          }}
        />
      )}
    </div>
  );
}
